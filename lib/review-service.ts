/**
 * BizNestUSA — Reviews & Claims service (UX #1: make reviews and claims real)
 *
 * Reviews and claims persist to Firestore with a moderation queue:
 *   status 'pending' -> admin approves -> 'approved' (public) / 'rejected'.
 *
 * Rules (firestore.rules sections 11-13):
 * - business_reviews / professional_reviews: public read ONLY where
 *   status == 'approved'; the author (or admin) may read their own pending
 *   review. Create requires a signed-in user with a VERIFIED email, the
 *   doc carries the caller's own uid/email, status is 'pending', rating 1-5.
 * - business_claims: readable by admin + the claimant ONLY (never public —
 *   claims carry EIN / license numbers + proof documents). Same create
 *   gating as reviews.
 *
 * Every submit function THROWS on failure — callers must only toast success
 * after the returned promise resolves. Never report success on a failed write.
 * There is no anonymous / signed-out review or claim path.
 */

import { db, auth } from './firebase'
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { sanitizeText, sanitizePersonName } from './sanitizer'

export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface StoredBusinessReview {
  id: string
  businessSlug: string
  businessId?: string
  businessName: string
  userId: string
  email: string
  userName: string
  rating: number
  comment: string
  status: ModerationStatus
  createdAt: string
}

export interface StoredProfessionalReview {
  id: string
  professionalUsername: string
  professionalSlug: string
  professionalName: string
  userId: string
  email: string
  userName: string
  rating: number
  comment: string
  status: ModerationStatus
  createdAt: string
}

export interface StoredBusinessClaim {
  id: string
  businessSlug: string
  businessId?: string
  businessName: string
  userId: string
  email: string
  claimantName: string
  claimantPhone: string
  taxIdOrLicense: string
  proofDataUrl?: string
  proofFileName?: string
  proofMimeType?: string
  status: ModerationStatus
  createdAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  rejectionReason?: string | null
}

export interface VerifiedUser {
  uid: string
  email: string
}

/** Signed-in user with a verified email, or null. */
export function getVerifiedUser(): VerifiedUser | null {
  const user = auth.currentUser
  if (!user || !user.email || !user.emailVerified) return null
  return { uid: user.uid, email: user.email }
}

/**
 * Signed-in user with a verified email, or throws with a message safe to
 * show the user. Callers surface this instead of submitting.
 */
export function requireVerifiedUser(action: string): VerifiedUser {
  const user = auth.currentUser
  if (!user || !user.email) {
    throw new Error(`Please sign in to ${action}. Reviews and claims require an account.`)
  }
  if (!user.emailVerified) {
    throw new Error(
      `Please verify your email address before you ${action}. Check your inbox for the verification email, then try again.`
    )
  }
  return { uid: user.uid, email: user.email }
}

function validateReviewInput(userName: string, rating: number, comment: string): void {
  if (!userName || !userName.trim()) throw new Error('Please enter your name.')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Please choose a rating from 1 to 5 stars.')
  }
  if (!comment || !comment.trim()) throw new Error('Please write your review comment.')
  if (comment.trim().length > 2000) {
    throw new Error('Your review must be 2000 characters or less.')
  }
}

function byCreatedAtDesc<T extends { createdAt: string }>(a: T, b: T): number {
  return b.createdAt.localeCompare(a.createdAt)
}

function byCreatedAtAsc<T extends { createdAt: string }>(a: T, b: T): number {
  return a.createdAt.localeCompare(b.createdAt)
}

/**
 * Submit a business review. Persists as status 'pending' — it is NOT public
 * until an admin approves it. Throws on any persistence failure.
 */
export async function submitBusinessReview(params: {
  businessSlug: string
  businessId?: string
  businessName: string
  userName: string
  rating: number
  comment: string
}): Promise<StoredBusinessReview> {
  const caller = requireVerifiedUser('submit a review')
  validateReviewInput(params.userName, params.rating, params.comment)
  const slug = (params.businessSlug || '').trim()
  if (!slug) throw new Error('Could not determine which business this review is for.')

  const nowIso = new Date().toISOString()
  const payload = {
    businessSlug: slug,
    businessId: params.businessId || '',
    businessName: sanitizeText(params.businessName, 200),
    userId: caller.uid,
    email: caller.email,
    userName: sanitizePersonName(params.userName),
    rating: params.rating,
    comment: sanitizeText(params.comment, 2000),
    status: 'pending' as const,
    createdAt: nowIso,
  }

  let ref
  try {
    ref = await addDoc(collection(db, 'business_reviews'), payload)
  } catch (err) {
    console.error('Failed to save business review:', err)
    throw new Error('Could not save your review. Please check your connection and try again.')
  }
  return { id: ref.id, ...payload }
}

/**
 * Submit a professional review. Same moderation-queue pattern as businesses.
 * Throws on any persistence failure.
 */
export async function submitProfessionalReview(params: {
  professionalUsername: string
  professionalName: string
  userName: string
  rating: number
  comment: string
}): Promise<StoredProfessionalReview> {
  const caller = requireVerifiedUser('submit a review')
  validateReviewInput(params.userName, params.rating, params.comment)
  const username = (params.professionalUsername || '').trim()
  if (!username) throw new Error('Could not determine which professional this review is for.')

  const nowIso = new Date().toISOString()
  const payload = {
    professionalUsername: username,
    professionalSlug: username,
    professionalName: sanitizeText(params.professionalName, 200),
    userId: caller.uid,
    email: caller.email,
    userName: sanitizePersonName(params.userName),
    rating: params.rating,
    comment: sanitizeText(params.comment, 2000),
    status: 'pending' as const,
    createdAt: nowIso,
  }

  let ref
  try {
    ref = await addDoc(collection(db, 'professional_reviews'), payload)
  } catch (err) {
    console.error('Failed to save professional review:', err)
    throw new Error('Could not save your review. Please check your connection and try again.')
  }
  return { id: ref.id, ...payload }
}

/**
 * Convert a claim proof file to a data URL, following the payment-proof
 * pattern in app/add-business (canvas-compressed JPEG for images so the
 * Firestore document stays well under the 1 MB limit; PDFs are stored as
 * read, capped at 950 KB). No new storage backend — same as payment proofs.
 * Throws when the file type is unsupported or the result is too large.
 */
export async function fileToProofDataUrl(
  file: File
): Promise<{ dataUrl: string; fileName: string; mimeType: string }> {
  const MAX_DATA_URL_CHARS = 950 * 1024

  if (file.type.startsWith('image/')) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Proof image must be less than 10MB.')
    }
    const rawBase64: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Could not read the proof file.'))
      reader.readAsDataURL(file)
    })
    const compressed: string = await new Promise((resolve) => {
      try {
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height
            const maxDim = 800
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width)
                width = maxDim
              } else {
                width = Math.round((width * maxDim) / height)
                height = maxDim
              }
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height)
              resolve(canvas.toDataURL('image/jpeg', 0.65))
              return
            }
            resolve(rawBase64.slice(0, MAX_DATA_URL_CHARS))
          } catch (_) {
            resolve(rawBase64.slice(0, MAX_DATA_URL_CHARS))
          }
        }
        img.onerror = () => resolve(rawBase64.slice(0, MAX_DATA_URL_CHARS))
        img.src = rawBase64
      } catch (_) {
        resolve(rawBase64.slice(0, MAX_DATA_URL_CHARS))
      }
    })
    if (compressed.length > MAX_DATA_URL_CHARS) {
      throw new Error('Proof image is too large after compression. Please use a smaller image.')
    }
    return { dataUrl: compressed, fileName: file.name, mimeType: 'image/jpeg' }
  }

  if (file.type === 'application/pdf') {
    if (file.size > MAX_DATA_URL_CHARS) {
      throw new Error('Proof PDF must be smaller than 950KB.')
    }
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Could not read the proof file.'))
      reader.readAsDataURL(file)
    })
    return { dataUrl, fileName: file.name, mimeType: file.type }
  }

  throw new Error('Proof must be an image (PNG, JPG, WEBP) or a PDF.')
}

/**
 * Submit an ownership claim. Persists as status 'pending', readable by the
 * admin and the claimant only. Collects EIN / license + proof document, so
 * it must never be rendered publicly. Throws on any persistence failure.
 * NOTE: approving a claim here only flips the claim's status — setting
 * isClaimed / claim_status on the business itself is the separate UX #2 fix
 * (approveBusiness), not done here.
 */
export async function submitBusinessClaim(params: {
  businessSlug: string
  businessId?: string
  businessName: string
  claimantName: string
  claimantPhone: string
  taxIdOrLicense: string
  proofFile?: File | null
}): Promise<StoredBusinessClaim> {
  const caller = requireVerifiedUser('submit an ownership claim')
  const slug = (params.businessSlug || '').trim()
  if (!slug) throw new Error('Could not determine which business this claim is for.')
  if (!params.claimantName || !params.claimantName.trim()) {
    throw new Error('Please enter the owner / authorized manager name.')
  }
  if (!params.taxIdOrLicense || !params.taxIdOrLicense.trim()) {
    throw new Error('Please provide State Filing / EIN / License number.')
  }
  if (!params.claimantPhone || !params.claimantPhone.trim()) {
    throw new Error('Please enter a valid US phone number.')
  }

  let proof: { dataUrl: string; fileName: string; mimeType: string } | null = null
  if (params.proofFile) {
    proof = await fileToProofDataUrl(params.proofFile)
  }

  const nowIso = new Date().toISOString()
  const payload = {
    businessSlug: slug,
    businessId: params.businessId || '',
    businessName: sanitizeText(params.businessName, 200),
    userId: caller.uid,
    email: caller.email,
    claimantName: sanitizePersonName(params.claimantName),
    claimantPhone: sanitizeText(params.claimantPhone, 30),
    taxIdOrLicense: sanitizeText(params.taxIdOrLicense, 100),
    proofDataUrl: proof?.dataUrl || '',
    proofFileName: proof?.fileName || '',
    proofMimeType: proof?.mimeType || '',
    status: 'pending' as const,
    createdAt: nowIso,
  }

  let ref
  try {
    ref = await addDoc(collection(db, 'business_claims'), payload)
  } catch (err) {
    console.error('Failed to save business claim:', err)
    throw new Error('Could not save your ownership claim. Please check your connection and try again.')
  }
  return { id: ref.id, ...payload }
}

/** Approved-only reviews for a business, newest first. Never returns pending. */
export async function getApprovedReviewsForBusiness(
  businessSlug: string
): Promise<StoredBusinessReview[]> {
  const slug = (businessSlug || '').trim()
  if (!slug) return []
  try {
    // Equality-only filters (no orderBy) so no composite index is needed;
    // sorting happens in memory.
    const snap = await getDocs(
      query(
        collection(db, 'business_reviews'),
        where('businessSlug', '==', slug),
        where('status', '==', 'approved'),
        limit(100)
      )
    )
    const list: StoredBusinessReview[] = []
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoredBusinessReview, 'id'>) }))
    return list.sort(byCreatedAtDesc)
  } catch (err) {
    console.warn('Failed to load approved business reviews:', err)
    return []
  }
}

/** Approved-only reviews for a professional, newest first. Never returns pending. */
export async function getApprovedReviewsForProfessional(
  professionalUsername: string
): Promise<StoredProfessionalReview[]> {
  const username = (professionalUsername || '').trim()
  if (!username) return []
  try {
    const snap = await getDocs(
      query(
        collection(db, 'professional_reviews'),
        where('professionalUsername', '==', username),
        where('status', '==', 'approved'),
        limit(100)
      )
    )
    const list: StoredProfessionalReview[] = []
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoredProfessionalReview, 'id'>) }))
    return list.sort(byCreatedAtDesc)
  } catch (err) {
    console.warn('Failed to load approved professional reviews:', err)
    return []
  }
}

/**
 * The signed-in user's own pending reviews for a business (shown to the
 * author as "pending review" only — never rendered publicly). Returns []
 * when signed out or on any load failure.
 */
export async function getMyPendingReviewsForBusiness(
  businessSlug: string
): Promise<StoredBusinessReview[]> {
  const caller = getVerifiedUser()
  const slug = (businessSlug || '').trim()
  if (!caller || !slug) return []
  try {
    const snap = await getDocs(
      query(
        collection(db, 'business_reviews'),
        where('businessSlug', '==', slug),
        where('status', '==', 'pending'),
        where('userId', '==', caller.uid),
        limit(20)
      )
    )
    const list: StoredBusinessReview[] = []
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoredBusinessReview, 'id'>) }))
    return list.sort(byCreatedAtDesc)
  } catch (err) {
    console.warn('Failed to load own pending business reviews:', err)
    return []
  }
}

/** The signed-in user's own pending reviews for a professional (author-only). */
export async function getMyPendingReviewsForProfessional(
  professionalUsername: string
): Promise<StoredProfessionalReview[]> {
  const caller = getVerifiedUser()
  const username = (professionalUsername || '').trim()
  if (!caller || !username) return []
  try {
    const snap = await getDocs(
      query(
        collection(db, 'professional_reviews'),
        where('professionalUsername', '==', username),
        where('status', '==', 'pending'),
        where('userId', '==', caller.uid),
        limit(20)
      )
    )
    const list: StoredProfessionalReview[] = []
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoredProfessionalReview, 'id'>) }))
    return list.sort(byCreatedAtDesc)
  } catch (err) {
    console.warn('Failed to load own pending professional reviews:', err)
    return []
  }
}

// --- Admin moderation (admin must be signed in; rules enforce isAdmin()) ---

/** All pending business reviews, oldest first (moderation queue). */
export async function getPendingBusinessReviews(): Promise<StoredBusinessReview[]> {
  const snap = await getDocs(
    query(collection(db, 'business_reviews'), where('status', '==', 'pending'), limit(100))
  )
  const list: StoredBusinessReview[] = []
  snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoredBusinessReview, 'id'>) }))
  return list.sort(byCreatedAtAsc)
}

/** All pending professional reviews, oldest first (moderation queue). */
export async function getPendingProfessionalReviews(): Promise<StoredProfessionalReview[]> {
  const snap = await getDocs(
    query(collection(db, 'professional_reviews'), where('status', '==', 'pending'), limit(100))
  )
  const list: StoredProfessionalReview[] = []
  snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoredProfessionalReview, 'id'>) }))
  return list.sort(byCreatedAtAsc)
}

/** All pending business claims, oldest first (moderation queue). */
export async function getPendingBusinessClaims(): Promise<StoredBusinessClaim[]> {
  const snap = await getDocs(
    query(collection(db, 'business_claims'), where('status', '==', 'pending'), limit(100))
  )
  const list: StoredBusinessClaim[] = []
  snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoredBusinessClaim, 'id'>) }))
  return list.sort(byCreatedAtAsc)
}

export async function moderateBusinessReview(
  reviewId: string,
  decision: 'approved' | 'rejected',
  adminUid: string,
  rejectionReason?: string
): Promise<void> {
  const nowIso = new Date().toISOString()
  await updateDoc(doc(db, 'business_reviews', reviewId), {
    status: decision,
    reviewedAt: nowIso,
    reviewedBy: adminUid,
    ...(decision === 'rejected' && rejectionReason
      ? { rejectionReason: sanitizeText(rejectionReason, 500) }
      : {}),
  })
}

export async function moderateProfessionalReview(
  reviewId: string,
  decision: 'approved' | 'rejected',
  adminUid: string,
  rejectionReason?: string
): Promise<void> {
  const nowIso = new Date().toISOString()
  await updateDoc(doc(db, 'professional_reviews', reviewId), {
    status: decision,
    reviewedAt: nowIso,
    reviewedBy: adminUid,
    ...(decision === 'rejected' && rejectionReason
      ? { rejectionReason: sanitizeText(rejectionReason, 500) }
      : {}),
  })
}

export async function moderateBusinessClaim(
  claimId: string,
  decision: 'approved' | 'rejected',
  adminUid: string,
  rejectionReason?: string
): Promise<void> {
  const nowIso = new Date().toISOString()
  await updateDoc(doc(db, 'business_claims', claimId), {
    status: decision,
    reviewedAt: nowIso,
    reviewedBy: adminUid,
    ...(decision === 'rejected' && rejectionReason
      ? { rejectionReason: sanitizeText(rejectionReason, 500) }
      : {}),
  })
  // Approving a claim must claim the business itself, otherwise the listing
  // renders "Unclaimed" forever. Look the claim up to find its business.
  if (decision === 'approved') {
    try {
      const claimSnap = await getDoc(doc(db, 'business_claims', claimId))
      const businessId = (claimSnap.data() as any)?.businessId as string | undefined
      if (businessId) {
        await updateDoc(doc(db, 'businesses', businessId), {
          isClaimed: true,
          claim_status: 'claimed'
        })
      }
    } catch (err) {
      console.error('moderateBusinessClaim: failed to mark business claimed:', err)
      throw err
    }
  }
}

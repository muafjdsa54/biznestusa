import { cache } from 'react'
import { MOCK_COMPANIES, CompanyItem } from './data'
import { db } from './firebase'
import { collection, getDocs, query, where, limit, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { normalizeSlug } from './db-service'

let memoryCompaniesCache: CompanyItem[] = [...MOCK_COMPANIES]

export const getAllCompanies = cache(async function getAllCompanies(includePending: boolean = false): Promise<CompanyItem[]> {
  try {
    // P1-2: public reads fetch APPROVED listings only. includePending=true
    // is the separate owner/admin read path and keeps the unfiltered query.
    const snap = await getDocs(includePending
      ? collection(db, 'companies')
      : query(collection(db, 'companies'), where('status', '==', 'approved')))
    if (!snap.empty) {
      const items: CompanyItem[] = []
      snap.forEach((docSnap) => {
        items.push(normalizeCompanyDoc(docSnap.id, docSnap.data()))
      })

      const existingSlugs = new Set(items.map(c => c.slug.toLowerCase()))
      const combined = [
        ...items,
        ...memoryCompaniesCache.filter(c => !existingSlugs.has(c.slug.toLowerCase()))
      ]
      memoryCompaniesCache = combined
    }
  } catch (err) {
    console.warn('Firestore getAllCompanies fallback to memory cache:', err)
  }

  if (includePending) {
    return memoryCompaniesCache
  }

  return memoryCompaniesCache.filter(c => (c.status || 'pending') === 'approved')
})

export function normalizeCompanyDoc(docId: string, data: any): CompanyItem {
  const cName = data.name || 'Verified Company'
  const cSlug = data.slug || normalizeSlug(cName)
  // P0-3: a doc with NO status must NEVER render as approved.
  const itemStatus = data.status || 'pending'

  return {
    id: docId || data.id || 'comp-' + Date.now(),
    // Caller identity, preserved so the hardened rules' owner-match
    // (userId / email) can be satisfied on create and update.
    userId: data.userId || '',
    slug: cSlug,
    name: cName,
    logo: data.logo || '',
    coverImage: data.coverImage || '',
    description: data.description || 'Verified hiring company profile on BizNestUSA.',
    industry: data.industry || 'Technology & IT',
    category: data.category || 'Hiring Company / HR',
    companySize: data.companySize || '10 - 50 Employees',
    employeeCount: String(data.employeeCount || '25'),
    establishedYear: String(data.establishedYear || '2020'),
    registrationNumber: data.registrationNumber || '',
    companyType: data.companyType || 'Private',
    headquarters: data.headquarters || `${data.city || 'New York'}, United States`,
    branchLocations: data.branchLocations || [],
    website: data.website || '',
    careersUrl: data.careersUrl || '',
    googleMapUrl: data.googleMapUrl || '',
    hrName: data.hrName || 'HR Department',
    hrDesignation: data.hrDesignation || 'HR Manager',
    hrEmail: data.hrEmail || '',
    companyEmail: data.companyEmail || '',
    phone: data.phone || '',
    whatsapp: data.whatsapp || '',
    email: data.companyEmail || data.email || 'contact@company.com',
    // ownerEmail is a rules identity anchor alongside userId/email —
    // preserve it when the caller supplies it (the add-company form
    // passes the authed user's email as ownerEmail).
    ownerEmail: data.ownerEmail || data.companyEmail || data.email || '',
    address: data.address || '',
    city: data.city || 'New York',
    province: data.province || 'New York',
    country: data.country || 'United States',
    linkedin: data.linkedin || '',
    facebook: data.facebook || '',
    instagram: data.instagram || '',
    twitter: data.twitter || '',
    youtube: data.youtube || '',
    github: data.github || '',
    customSocialLinks: data.customSocialLinks || [],
    rating: Number.isFinite(data.rating) ? data.rating : 5.0,
    reviewCount: data.reviewCount || (data.reviews ? data.reviews.length : 0),
    // UX #9: companies must NOT default to verified — verification comes
    // only from the real verification path, never from a missing field.
    verified: data.verified === true,
    isClaimed: data.isClaimed === true,
    isFeatured: data.isFeatured ?? false,
    status: itemStatus,
    submittedAt: data.submittedAt || new Date().toISOString(),
    approvedAt: data.approvedAt,
    approvedBy: data.approvedBy,
    rejectionReason: data.rejectionReason,
    services: data.services || [],
    operatingHours: data.operatingHours || undefined,
    features: data.features || [],
    reviews: data.reviews || [],
    faqs: data.faqs || [],
    activeJobsCount: data.activeJobsCount || 1
  }
}

export const getCompanyBySlug = cache(async function getCompanyBySlug(slug: string): Promise<CompanyItem | null> {
  const raw = decodeURIComponent(slug || '').trim()
  const normalized = raw.toLowerCase()
  if (!normalized) return null

  // 1. Live Firestore check (public read: approved only — P1-2)
  try {
    const q = query(collection(db, 'companies'), where('slug', '==', normalized), where('status', '==', 'approved'), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      const item = normalizeCompanyDoc(docSnap.id, docSnap.data())
      memoryCompaniesCache = [
        item,
        ...memoryCompaniesCache.filter(c => c.slug.toLowerCase() !== normalized && c.id !== item.id)
      ]
      if (item.status === 'approved') return item
      return null
    }

    try {
      const direct = await getDocs(query(collection(db, 'companies'), where('id', '==', raw), where('status', '==', 'approved'), limit(1)))
      if (!direct.empty) {
        const item = normalizeCompanyDoc(direct.docs[0].id, direct.docs[0].data())
        if (item.status === 'approved') return item
      }
    } catch (_) {}
  } catch (err) {
    console.warn('Firestore getCompanyBySlug error:', err)
  }

  // 2. Memory cache check
  const cached = memoryCompaniesCache.find(c => c.slug.toLowerCase() === normalized || c.id === normalized)
  if (cached && (cached.status || 'pending') === 'approved') {
    return cached
  }

  return null
})

export async function saveCompanyToDatabase(compData: Partial<CompanyItem>): Promise<CompanyItem> {
  const name = compData.name || 'New Hiring Company'
  const slug = compData.slug || normalizeSlug(name) + '-' + Math.floor(Math.random() * 1000)

  const newComp: CompanyItem = normalizeCompanyDoc('comp-' + Date.now(), {
    ...compData,
    name,
    slug,
    status: 'pending',
    submittedAt: new Date().toISOString()
  })

  memoryCompaniesCache = [newComp, ...memoryCompaniesCache.filter(c => c.slug !== slug)]

  // P0-3 / hardened rules: the create may not carry privileged fields
  // (verified, isFeatured, isClaimed). Strip them from the Firestore
  // payload — they are set only by the admin approve/verify flow.
  const firestorePayload: Record<string, any> = { ...newComp }
  delete firestorePayload.verified
  delete firestorePayload.isClaimed
  delete firestorePayload.isFeatured

  try {
    await addDoc(collection(db, 'companies'), firestorePayload)
  } catch (err) {
    // P1-5: surface the persistence failure instead of returning
    // success while nothing was saved server-side.
    console.warn('Firestore saveCompanyToDatabase error:', err)
    throw new Error('Company profile could not be saved. Please try again.')
  }

  return newComp
}

async function updateCompanyInFirestore(idOrSlug: string, fieldsToUpdate: Record<string, any>): Promise<void> {
  try {
    const docRef = doc(db, 'companies', idOrSlug)
    await updateDoc(docRef, fieldsToUpdate)
    return
  } catch (err) {
    try {
      const q = query(collection(db, 'companies'), where('slug', '==', idOrSlug), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, fieldsToUpdate)
        return
      }
      const qId = query(collection(db, 'companies'), where('id', '==', idOrSlug), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await updateDoc(snapId.docs[0].ref, fieldsToUpdate)
        return
      }
    } catch (innerErr) {
      console.warn('Firestore updateCompanyInFirestore error:', innerErr)
    }
  }
}

export async function approveCompany(id: string, adminUid: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryCompaniesCache.findIndex(c => c.id === id || c.slug.toLowerCase() === norm)
  const cached = idx !== -1 ? memoryCompaniesCache[idx] : undefined
  // UX #2: an approved OWNER submission is claimed, so it stops rendering
  // as unclaimed. verified is NOT set here — verification comes only from
  // the real verification path.
  const ownerEmails = [cached?.email, cached?.companyEmail, cached?.hrEmail]
    .map(e => (e || '').trim().toLowerCase())
    .filter(e => e && e !== 'contact@company.com')
  const hasOwnerIdentity = Boolean(
    ((cached as any)?.userId && String((cached as any).userId).trim()) ||
    ownerEmails.length > 0
  )
  const claimedFields = hasOwnerIdentity ? { isClaimed: true, claim_status: 'claimed' as const } : {}
  // PRICING (b) — NO free listings: admin approves ONLY submissions with
  // verified payment. Block while a recorded payment is unverified
  // ('awaiting_payment' / 'payment_rejected' and this repo's equivalents:
  // PENDING, PENDING_PAYMENT, PAYMENT_VERIFICATION_PENDING, SUBMITTED,
  // UNDER_REVIEW, UNPAID, REJECTED). Companies have no payment step, so
  // no paymentStatus normally exists and the guard is dormant; it bites
  // only if a paymentStatus is ever recorded on the company.
  const paymentStatus = String((cached as any)?.paymentStatus || '').trim().toLowerCase()
  if (paymentStatus && paymentStatus !== 'verified' && paymentStatus !== 'paid') {
    console.warn(`Approve blocked for company ${id}: payment not verified (paymentStatus: '${(cached as any)?.paymentStatus || ''}').`)
    return false
  }
  if (idx !== -1) {
    memoryCompaniesCache[idx].status = 'approved'
    memoryCompaniesCache[idx].approvedAt = new Date().toISOString()
    memoryCompaniesCache[idx].approvedBy = adminUid
    if (hasOwnerIdentity) {
      memoryCompaniesCache[idx].isClaimed = true
      ;(memoryCompaniesCache[idx] as any).claim_status = 'claimed'
    }
  }

  await updateCompanyInFirestore(id, {
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: adminUid,
    ...claimedFields
  })

  return true
}

export async function rejectCompany(id: string, reason?: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryCompaniesCache.findIndex(c => c.id === id || c.slug.toLowerCase() === norm)
  if (idx !== -1) {
    memoryCompaniesCache[idx].status = 'rejected'
    memoryCompaniesCache[idx].rejectionReason = reason
  }

  await updateCompanyInFirestore(id, {
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason
  })

  return true
}

export async function updateCompanyProfile(idOrSlug: string, updates: Partial<CompanyItem>): Promise<boolean> {
  const idx = memoryCompaniesCache.findIndex(c => c.id === idOrSlug || c.slug === idOrSlug)
  const previous = idx !== -1 ? { ...memoryCompaniesCache[idx] } : undefined
  if (idx !== -1) {
    memoryCompaniesCache[idx] = { ...memoryCompaniesCache[idx], ...updates }
  }

  try {
    const docRef = doc(db, 'companies', idOrSlug)
    await updateDoc(docRef, updates)
  } catch (err) {
    // P1-5: surface the persistence failure instead of reporting success.
    if (idx !== -1 && previous) memoryCompaniesCache[idx] = previous
    console.warn('Firestore updateCompanyProfile error:', err)
    return false
  }
  return true
}

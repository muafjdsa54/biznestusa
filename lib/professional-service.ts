import { cache } from 'react'
import { MOCK_PROFESSIONALS, MOCK_VERIFICATION_REQUESTS, ProfessionalItem, ProfessionalVerificationRequest, ProfessionalVerificationPaymentDetails, ProfessionalInquiry } from './data'
import { db } from './firebase'
import { collection, getDocs, query, where, limit, addDoc, doc, updateDoc, deleteDoc, setDoc, orderBy } from 'firebase/firestore'
import { normalizeSlug } from './db-service'
import { sanitizeText, sanitizeUrl, sanitizePhone, sanitizePersonName } from './sanitizer'
import { isPakistaniEntity } from './directory-helpers'

/**
 * Generate clean SEO friendly slug for professionals.
 * - ONLY the professional / business name.
 * - If exactly 1 unique city is selected: appends the city name (e.g. "web-developer-austin" or "turner-engineering-dallas")
 * - If 2 or more cities are selected: NO city name in route link, ONLY the name (e.g. "web-developer" or "summit-realty-builders")
 * - Avoids repetitive keywords and duplicate city tokens in the URL.
 */
export function generateProfessionalSlug(
  name: string,
  titleOrCities?: string | string[],
  professionOrCities?: string | string[],
  citiesParam?: string[] | string
): string {
  const cleanName = (name || '').trim()

  // Collect cities from whichever parameter position was provided
  let rawCities: string[] | string | undefined = citiesParam
  if (!rawCities && Array.isArray(professionOrCities)) {
    rawCities = professionOrCities
  } else if (!rawCities && Array.isArray(titleOrCities)) {
    rawCities = titleOrCities
  } else if (!rawCities && typeof professionOrCities === 'string' && professionOrCities.includes(',')) {
    rawCities = professionOrCities.split(',')
  } else if (!rawCities && typeof titleOrCities === 'string' && titleOrCities.includes(',')) {
    rawCities = titleOrCities.split(',')
  }

  const cityList = Array.isArray(rawCities)
    ? Array.from(new Set(rawCities.map(c => (c || '').trim()).filter(Boolean)))
    : (rawCities ? [rawCities.trim()] : [])

  const validCities = cityList.filter(c => {
    const lc = c.toLowerCase()
    return lc !== 'all cities' && lc !== 'nationwide' && lc !== 'united states' && lc !== 'usa'
  })

  let nameNorm = normalizeSlug(cleanName)

  // If exactly 1 unique city is selected: append that single city
  if (validCities.length === 1) {
    const cityNorm = normalizeSlug(validCities[0])
    if (cityNorm) {
      if (nameNorm.endsWith(`-in-${cityNorm}`)) {
        nameNorm = nameNorm.slice(0, -(4 + cityNorm.length)).replace(/-+$/, '')
      } else if (nameNorm.endsWith(`-${cityNorm}`)) {
        nameNorm = nameNorm.slice(0, -(1 + cityNorm.length)).replace(/-+$/, '')
      }
      return `${nameNorm || normalizeSlug(cleanName)}-${cityNorm}`
    }
  }

  // If 2 or more cities (or 0 valid cities): NO city in route slug, ONLY the name
  for (const c of validCities) {
    const cNorm = normalizeSlug(c)
    if (cNorm) {
      if (nameNorm.endsWith(`-in-${cNorm}`)) {
        nameNorm = nameNorm.slice(0, -(4 + cNorm.length)).replace(/-+$/, '')
      } else if (nameNorm.endsWith(`-${cNorm}`)) {
        nameNorm = nameNorm.slice(0, -(1 + cNorm.length)).replace(/-+$/, '')
      }
    }
  }

  return nameNorm || normalizeSlug(cleanName) || 'professional'
}

// In-memory cache for fast reads & server rendering
let memoryProfessionalsCache: ProfessionalItem[] = [...MOCK_PROFESSIONALS]
let memoryVerificationRequestsCache: ProfessionalVerificationRequest[] = [...MOCK_VERIFICATION_REQUESTS]
let memoryInquiriesCache: ProfessionalInquiry[] = []

/**
 * Deprecated review helper: returns empty array to strictly comply with Google AdSense
 * policy prohibiting fake or automated user testimonials.
 */
export const GENERATE_STARTER_PROFESSIONAL_REVIEWS = (_proName: string): any[] => []

export function normalizeProfessionalDoc(docId: string, data: Partial<ProfessionalItem>): ProfessionalItem {
  const proName = data.fullName || data.name || 'Verified Professional'
  const proCities = (data as any).cities || (data.city ? [data.city] : [])
  const proUsername = data.username || data.slug || generateProfessionalSlug(proName, data.title, data.profession, proCities)
  const itemStatus = data.status || 'approved'
  const itemVerified = data.verified ?? (data.verificationStatus === 'VERIFIED' ? true : false)
  const itemVerificationStatus = data.verificationStatus || (itemVerified ? 'VERIFIED' : 'UNVERIFIED')
  const itemProfileStatus = data.profileStatus || (itemStatus === 'approved' ? 'APPROVED' : itemStatus === 'rejected' ? 'REJECTED' : 'PENDING')

  return {
    id: docId || data.id || 'pro-' + Date.now(),
    userId: data.userId || '',
    username: proUsername,
    slug: proUsername,
    name: proName,
    fullName: proName,
    title: data.title || 'Professional Specialist',
    profession: data.profession || 'Specialist',
    category: data.category || 'Professional / Job Seeker',
    specialization: data.specialization || 'General',
    city: data.city || 'New York',
    state: (data as any).state || data.province || 'New York',
    province: data.province || 'New York',
    country: data.country || 'United States',
    address: data.address || '',
    googleMapUrl: data.googleMapUrl || '',
    rating: data.rating !== undefined ? Number(data.rating) : 0,
    reviewCount: data.reviewCount !== undefined ? Number(data.reviewCount) : (data.reviews ? data.reviews.length : 0),
    hourlyRate: data.hourlyRate || 'Contact for Pricing',
    availability: data.availability || 'Available',
    gender: data.gender || '',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    bio: data.bio || data.about || 'Verified professional profile on BizNestUSA.',
    about: data.about || data.bio || '',
    skills: data.skills && data.skills.length > 0 ? data.skills : ['Professional Services'],
    experienceYears: data.experienceYears ?? 3,
    verified: itemVerified,
    isFeatured: data.isFeatured ?? false,
    status: itemStatus,
    profileStatus: itemProfileStatus,
    verificationStatus: itemVerificationStatus,
    verificationRequestStatus: data.verificationRequestStatus || 'NOT_REQUESTED',
    verificationPaymentDetails: data.verificationPaymentDetails,
    submittedAt: data.submittedAt || new Date().toISOString(),
    approvedAt: data.approvedAt,
    approvedBy: data.approvedBy,
    verifiedAt: data.verifiedAt,
    verifiedBy: data.verifiedBy,
    rejectionReason: data.rejectionReason,

    phone: data.phone || '',
    email: data.email || '',
    whatsapp: data.whatsapp || '',
    website: data.website || '',
    portfolio: data.portfolio || '',
    resumeUrl: data.resumeUrl || '',
    currentCompany: data.currentCompany || '',

    education: data.education || [],
    certifications: data.certifications || [],
    languages: data.languages || ['Urdu', 'English'],
    previousExperience: data.previousExperience || [],
    servicesOffered: data.servicesOffered || [],
    reviews: data.reviews && data.reviews.length > 0 ? data.reviews : [],
    faqs: data.faqs || [],

    linkedin: data.linkedin,
    github: data.github,
    facebook: data.facebook,
    instagram: data.instagram,
    twitter: data.twitter,
    youtube: data.youtube,
    behance: data.behance,
    dribbble: data.dribbble,
    stackoverflow: data.stackoverflow,
    medium: data.medium,
    fiverr: data.fiverr,
    upwork: data.upwork,
    freelancer: data.freelancer,
    kaggle: data.kaggle,
    researchgate: data.researchgate,
    orcid: data.orcid,
    googleScholar: data.googleScholar,
    customSocialLinks: data.customSocialLinks || [],
    dynamicFields: data.dynamicFields || {}
  }
}

/**
 * Fetch all professionals. If includePending is false, returns ONLY approved profiles.
 */
export const getAllProfessionals = cache(async function getAllProfessionals(includePending: boolean = false): Promise<ProfessionalItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'professionals'))
    if (!querySnapshot.empty) {
      const firestoreItems: ProfessionalItem[] = []
      querySnapshot.forEach((docSnap) => {
        firestoreItems.push(normalizeProfessionalDoc(docSnap.id, docSnap.data()))
      })

      // Merge avoiding duplicate usernames and sort newest registrations first
      const existingUsernames = new Set(firestoreItems.map(p => p.username.toLowerCase()))
      const combined = [
        ...firestoreItems,
        ...memoryProfessionalsCache.filter(p => !existingUsernames.has(p.username.toLowerCase()))
      ].sort((a, b) => {
        // 1. Pending reviews top priority
        const aPending = (a.status === 'pending' || a.profileStatus === 'PENDING') ? 1 : 0
        const bPending = (b.status === 'pending' || b.profileStatus === 'PENDING') ? 1 : 0
        if (bPending !== aPending) return bPending - aPending

        // 2. Newest registered profiles top
        const bTime = new Date(b.submittedAt || 0).getTime() || (b.id ? parseInt(b.id.replace(/\D/g, '')) || 0 : 0)
        const aTime = new Date(a.submittedAt || 0).getTime() || (a.id ? parseInt(a.id.replace(/\D/g, '')) || 0 : 0)
        return bTime - aTime
      })
      memoryProfessionalsCache = combined
    }
  } catch (err) {
    console.warn('Firestore getAllProfessionals fallback to memory cache:', err)
  }

  const validPros = memoryProfessionalsCache.filter(p => !isPakistaniEntity(p))

  if (includePending) {
    return validPros
  }

  return validPros.filter(p => (p.status || 'approved') === 'approved' && (p.profileStatus || 'APPROVED') === 'APPROVED')
})

export async function getPendingProfessionals(): Promise<ProfessionalItem[]> {
  const all = await getAllProfessionals(true)
  return all.filter(p => p.status === 'pending' || p.profileStatus === 'PENDING')
}

export const getProfessionalByUsername = cache(async function getProfessionalByUsername(username: string): Promise<ProfessionalItem | null> {
  const rawInput = decodeURIComponent(username || '').trim()
  const normalized = rawInput.toLowerCase()
  if (!normalized) return null

  // 1. First check Firestore live to ensure latest approval state is reflected immediately
  try {
    // Try where username == normalized or original
    const q = query(collection(db, 'professionals'), where('username', '==', normalized), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      const item = normalizeProfessionalDoc(docSnap.id, docSnap.data())
      // Update memory cache
      memoryProfessionalsCache = [
        item,
        ...memoryProfessionalsCache.filter(p => p.username.toLowerCase() !== normalized && p.slug?.toLowerCase() !== normalized && p.id !== item.id)
      ]
      if ((item.status === 'approved' || item.profileStatus === 'APPROVED') && !isPakistaniEntity(item)) {
        return item
      }
      return null
    }

    // Secondary fallback: query by 'slug' field
    const qSlug = query(collection(db, 'professionals'), where('slug', '==', normalized), limit(1))
    const snapSlug = await getDocs(qSlug)
    if (!snapSlug.empty) {
      const docSnap = snapSlug.docs[0]
      const item = normalizeProfessionalDoc(docSnap.id, snapSlug.docs[0].data())
      memoryProfessionalsCache = [
        item,
        ...memoryProfessionalsCache.filter(p => p.username.toLowerCase() !== normalized && p.slug?.toLowerCase() !== normalized && p.id !== item.id)
      ]
      if ((item.status === 'approved' || item.profileStatus === 'APPROVED') && !isPakistaniEntity(item)) {
        return item
      }
      return null
    }

    // Tertiary fallback: query direct by doc ID
    try {
      const directDoc = await getDocs(query(collection(db, 'professionals'), where('id', '==', rawInput), limit(1)))
      if (!directDoc.empty) {
        const item = normalizeProfessionalDoc(directDoc.docs[0].id, directDoc.docs[0].data())
        if ((item.status === 'approved' || item.profileStatus === 'APPROVED') && !isPakistaniEntity(item)) {
          return item
        }
      }
    } catch (_) { }
  } catch (err) {
    console.warn('Firestore getProfessionalByUsername query error, falling back to memory:', err)
  }

  // 2. Memory cache fallback
  const cached = memoryProfessionalsCache.find(p => {
    if (isPakistaniEntity(p)) return false
    const pUser = (p.username || '').toLowerCase()
    const pSlug = (p.slug || '').toLowerCase()
    const pId = (p.id || '').toLowerCase()
    const pNameNorm = normalizeSlug(p.fullName || p.name || '')
    const pCityNorm = normalizeSlug(p.city || '')
    const pNameCity = pCityNorm ? `${pNameNorm}-${pCityNorm}` : pNameNorm
    const pGenSlug = generateProfessionalSlug(p.fullName || p.name || '', undefined, undefined, (p as any).cities || (p.city ? [p.city] : [])).toLowerCase()

    return (
      pUser === normalized ||
      pSlug === normalized ||
      pId === normalized ||
      pNameNorm === normalized ||
      pNameCity === normalized ||
      pGenSlug === normalized ||
      (pUser && normalized.startsWith(pUser)) ||
      (pSlug && normalized.startsWith(pSlug)) ||
      (pNameNorm && normalized.startsWith(pNameNorm)) ||
      (pGenSlug && normalized.startsWith(pGenSlug)) ||
      (normalized && pUser.startsWith(normalized)) ||
      (normalized && pSlug.startsWith(normalized))
    )
  })

  if (cached && (cached.status || 'approved') === 'approved' && (cached.profileStatus || 'APPROVED') === 'APPROVED') {
    return cached
  }

  return null
})

export async function getProfessionalForDashboard(idOrUsernameOrEmail?: string): Promise<ProfessionalItem | null> {
  const all = await getAllProfessionals(true)
  if (!idOrUsernameOrEmail) {
    return null
  }
  const normalized = idOrUsernameOrEmail.toLowerCase().trim()
  const found = all.find(p =>
    (p.id && p.id.toLowerCase() === normalized) ||
    (p.username && p.username.toLowerCase() === normalized) ||
    (p.slug && p.slug.toLowerCase() === normalized) ||
    (p.email && p.email.toLowerCase().trim() === normalized) ||
    (p.userId && p.userId.toLowerCase().trim() === normalized)
  )
  return found || null
}

export async function saveProfessionalToDatabase(proData: Partial<ProfessionalItem>): Promise<ProfessionalItem> {
  const name = proData.fullName || proData.name || 'New Professional'
  const title = proData.title || ''
  const profession = proData.profession || ''
  const proCities = (proData as any).cities || (proData.city ? [proData.city] : [])

  // Generate unique SEO username/slug combining Name and Professional Title with 1-city vs multi-city rules
  let baseSlug = proData.slug || proData.username || ''
  if (!baseSlug) {
    baseSlug = generateProfessionalSlug(name, title, profession, proCities)
  }

  // Ensure unique username/slug: use baseSlug directly, or append number suffix if identical slug exists
  let username = baseSlug
  let counter = 1
  while (memoryProfessionalsCache.some(p => (p.username.toLowerCase() === username.toLowerCase() || p.slug?.toLowerCase() === username.toLowerCase()) && p.id !== proData.id)) {
    username = `${baseSlug}-${counter}`
    counter++
  }

  const newProId = proData.id || ('pro-' + Date.now())
  const nowIso = new Date().toISOString()

  const newPro: ProfessionalItem = {
    id: newProId,
    userId: proData.userId || '',
    username,
    slug: username,
    name: sanitizePersonName(name) || 'New Professional',
    fullName: sanitizePersonName(name) || 'New Professional',
    title: sanitizeText(title || 'Professional Specialist', 120),
    profession: sanitizeText(profession || 'Specialist', 80),
    category: sanitizeText(proData.category || 'Professional / Job Seeker', 80),
    specialization: sanitizeText(proData.specialization || profession, 120),
    city: sanitizeText(proData.city || 'New York', 60),
    state: sanitizeText((proData as any).state || proData.province || 'New York', 60),
    province: sanitizeText(proData.province || 'New York', 60),
    country: 'United States',
    address: sanitizeText(proData.address || '', 250),
    googleMapUrl: sanitizeUrl(proData.googleMapUrl || ''),
    rating: 0,
    reviewCount: 0,
    hourlyRate: sanitizeText(proData.hourlyRate || 'Negotiable', 60),
    availability: sanitizeText(proData.availability || 'Open to Work', 60),
    gender: sanitizeText(proData.gender || '', 20),
    avatar: sanitizeUrl(proData.avatar || ''),
    coverImage: sanitizeUrl(proData.coverImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80'),
    bio: sanitizeText(proData.bio || `Professional profile on BizNestUSA.`, 5000),
    about: sanitizeText(proData.about || proData.bio || '', 5000),
    skills: Array.isArray(proData.skills) ? proData.skills.map(s => sanitizeText(s, 50)) : [sanitizeText(profession, 50)],
    experienceYears: Number(proData.experienceYears) || 0,
    verified: false, // Verification managed via admin approval
    isFeatured: false,
    status: 'approved', // Auto-approved upon creation so public profile is immediately live
    profileStatus: 'APPROVED',
    approvedAt: nowIso,
    approvedBy: 'system_auto_approved',
    verificationStatus: 'UNVERIFIED',
    verificationRequestStatus: 'NOT_REQUESTED',
    submittedAt: nowIso,

    phone: sanitizePhone(proData.phone || ''),
    email: sanitizeText(proData.email || '', 120),
    whatsapp: sanitizePhone(proData.whatsapp || ''),
    website: sanitizeUrl(proData.website || ''),
    portfolio: sanitizeUrl(proData.portfolio || ''),
    resumeUrl: sanitizeUrl(proData.resumeUrl || ''),
    currentCompany: sanitizeText(proData.currentCompany || '', 120),

    education: Array.isArray(proData.education) ? proData.education.map((e: any) => ({
      degree: sanitizeText(e.degree, 100),
      institution: sanitizeText(e.institution, 120),
      year: sanitizeText(e.year, 20),
    })) : [],
    certifications: Array.isArray(proData.certifications) ? proData.certifications.map((c: any) => sanitizeText(c, 150)) : [],
    languages: Array.isArray(proData.languages) ? proData.languages.map((l: any) => sanitizeText(l, 40)) : ['English'],
    previousExperience: Array.isArray(proData.previousExperience) ? proData.previousExperience.map((pe: any) => ({
      role: sanitizeText(pe.role, 100),
      company: sanitizeText(pe.company, 120),
      duration: sanitizeText(pe.duration, 40),
      description: sanitizeText(pe.description, 1000),
    })) : [],
    servicesOffered: Array.isArray(proData.servicesOffered) ? proData.servicesOffered.map(s => sanitizeText(s, 100)) : [],
    reviews: [],
    faqs: [],

    linkedin: sanitizeUrl(proData.linkedin || ''),
    github: sanitizeUrl(proData.github || ''),
    facebook: sanitizeUrl(proData.facebook || ''),
    instagram: sanitizeUrl(proData.instagram || ''),
    twitter: sanitizeUrl(proData.twitter || ''),
    youtube: sanitizeUrl(proData.youtube || ''),
    behance: sanitizeUrl(proData.behance || ''),
    dribbble: sanitizeUrl(proData.dribbble || ''),
    stackoverflow: sanitizeUrl(proData.stackoverflow || ''),
    medium: sanitizeUrl(proData.medium || ''),
    fiverr: sanitizeUrl(proData.fiverr || ''),
    upwork: sanitizeUrl(proData.upwork || ''),
    freelancer: sanitizeUrl(proData.freelancer || ''),
    kaggle: sanitizeUrl(proData.kaggle || ''),
    researchgate: sanitizeUrl(proData.researchgate || ''),
    orcid: sanitizeUrl(proData.orcid || ''),
    googleScholar: sanitizeUrl(proData.googleScholar || ''),
    customSocialLinks: Array.isArray(proData.customSocialLinks) ? proData.customSocialLinks.map((sl: any) => ({
      platform: sanitizeText(sl.platform, 40),
      url: sanitizeUrl(sl.url),
    })) : [],
    dynamicFields: proData.dynamicFields || {}
  }

  // Update memory cache
  memoryProfessionalsCache = [newPro, ...memoryProfessionalsCache.filter(p => p.username !== username && p.id !== newProId)]

  // Persist to Firestore with explicit document ID using setDoc
  try {
    const docRef = doc(db, 'professionals', newProId)
    await setDoc(docRef, {
      ...newPro,
      createdAt: nowIso
    })
  } catch (err) {
    console.warn('Firestore saveProfessionalToDatabase error, attempting addDoc fallback:', err)
    try {
      await addDoc(collection(db, 'professionals'), {
        ...newPro,
        createdAt: nowIso
      })
    } catch (innerErr) {
      console.warn('Firestore fallback addDoc failed:', innerErr)
    }
  }

  return newPro
}

async function updateProfessionalInFirestore(idOrUsername: string, fieldsToUpdate: Record<string, any>): Promise<void> {
  try {
    const docRef = doc(db, 'professionals', idOrUsername)
    await updateDoc(docRef, fieldsToUpdate)
    return
  } catch (err) {
    // If direct doc update failed, search by username, slug, or id field
    try {
      const q = query(collection(db, 'professionals'), where('username', '==', idOrUsername), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, fieldsToUpdate)
        return
      }
      const qSlug = query(collection(db, 'professionals'), where('slug', '==', idOrUsername), limit(1))
      const snapSlug = await getDocs(qSlug)
      if (!snapSlug.empty) {
        await updateDoc(snapSlug.docs[0].ref, fieldsToUpdate)
        return
      }
      const qId = query(collection(db, 'professionals'), where('id', '==', idOrUsername), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await updateDoc(snapId.docs[0].ref, fieldsToUpdate)
        return
      }
    } catch (innerErr) {
      console.warn('Firestore updateProfessionalInFirestore query error:', innerErr)
    }
  }
}

/**
 * Approve a pending professional profile to make it publicly visible.
 * Note: Keeps verificationStatus as UNVERIFIED unless separate verification approval happens.
 */
export async function approveProfessional(id: string, adminUid: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryProfessionalsCache.findIndex(p => p.id === id || p.username.toLowerCase() === norm || p.slug?.toLowerCase() === norm)
  if (idx !== -1) {
    memoryProfessionalsCache[idx].status = 'approved'
    memoryProfessionalsCache[idx].profileStatus = 'APPROVED'
    memoryProfessionalsCache[idx].approvedAt = new Date().toISOString()
    memoryProfessionalsCache[idx].approvedBy = adminUid
  }

  await updateProfessionalInFirestore(id, {
    status: 'approved',
    profileStatus: 'APPROVED',
    approvedAt: new Date().toISOString(),
    approvedBy: adminUid
  })

  return true
}

export async function rejectProfessional(id: string, reason?: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryProfessionalsCache.findIndex(p => p.id === id || p.username.toLowerCase() === norm || p.slug?.toLowerCase() === norm)
  if (idx !== -1) {
    memoryProfessionalsCache[idx].status = 'rejected'
    memoryProfessionalsCache[idx].profileStatus = 'REJECTED'
    memoryProfessionalsCache[idx].rejectionReason = reason || 'Professional details could not be validated.'
  }

  await updateProfessionalInFirestore(id, {
    status: 'rejected',
    profileStatus: 'REJECTED',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason || 'Professional details could not be validated.'
  })

  return true
}

export async function deleteProfessional(idOrUsername: string): Promise<boolean> {
  const norm = (idOrUsername || '').trim().toLowerCase()
  if (!norm) return false

  // 1. Remove from memory cache
  memoryProfessionalsCache = memoryProfessionalsCache.filter(p => p.id.toLowerCase() !== norm && p.username.toLowerCase() !== norm && p.slug?.toLowerCase() !== norm)

  // 2. Delete from Firestore
  try {
    const docRef = doc(db, 'professionals', idOrUsername)
    await deleteDoc(docRef)
    return true
  } catch (err) {
    try {
      const q = query(collection(db, 'professionals'), where('username', '==', norm), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await deleteDoc(snap.docs[0].ref)
        return true
      }
      const qId = query(collection(db, 'professionals'), where('id', '==', idOrUsername), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await deleteDoc(snapId.docs[0].ref)
        return true
      }
    } catch (innerErr) {
      console.warn('Firestore deleteProfessional error:', innerErr)
    }
  }
  return true
}

/**
 * Directly mark a professional as Verified (giving green check and unlocking edit access)
 */
export async function verifyProfessional(idOrUsername: string, adminUid: string): Promise<boolean> {
  const norm = idOrUsername.toLowerCase().trim()
  const pro = memoryProfessionalsCache.find(p => p.id === idOrUsername || p.username.toLowerCase() === norm || p.slug?.toLowerCase() === norm)
  const now = new Date().toISOString()
  if (pro) {
    pro.verified = true
    pro.verificationStatus = 'VERIFIED'
    pro.verifiedAt = now
    pro.verifiedBy = adminUid
  }

  const docId = pro?.id || idOrUsername
  await updateProfessionalInFirestore(docId, {
    verified: true,
    verificationStatus: 'VERIFIED',
    verifiedAt: now,
    verifiedBy: adminUid
  })

  return true
}

/**
 * Remove verification from a professional (reverting to unverified status and locking editing)
 */
export async function unverifyProfessional(idOrUsername: string, adminUid: string): Promise<boolean> {
  const norm = idOrUsername.toLowerCase().trim()
  const pro = memoryProfessionalsCache.find(p => p.id === idOrUsername || p.username.toLowerCase() === norm || p.slug?.toLowerCase() === norm)
  if (pro) {
    pro.verified = false
    pro.verificationStatus = 'UNVERIFIED'
  }

  const docId = pro?.id || idOrUsername
  await updateProfessionalInFirestore(docId, {
    verified: false,
    verificationStatus: 'UNVERIFIED'
  })

  return true
}

/**
 * Fetch all verification requests (from Firestore or in-memory)
 */
export async function getVerificationRequests(): Promise<ProfessionalVerificationRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'professional_verifications'))
    if (!querySnapshot.empty) {
      const items: ProfessionalVerificationRequest[] = []
      querySnapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as ProfessionalVerificationRequest)
      })
      const ids = new Set(items.map(i => i.id))
      memoryVerificationRequestsCache = [
        ...items,
        ...memoryVerificationRequestsCache.filter(m => !ids.has(m.id))
      ]
    }
  } catch (err) {
    console.warn('Firestore getVerificationRequests fallback:', err)
  }
  return memoryVerificationRequestsCache
}

/**
 * User submits verification payment request with payment screenshot and transaction ref
 */
export async function submitVerificationRequest(
  idOrUsername: string,
  paymentDetails: ProfessionalVerificationPaymentDetails
): Promise<{ success: boolean; request: ProfessionalVerificationRequest }> {
  const pro = memoryProfessionalsCache.find(p => p.id === idOrUsername || p.username === idOrUsername)
  const now = new Date().toISOString()
  const reqId = 'ver-req-' + Date.now()

  const newRequest: ProfessionalVerificationRequest = {
    id: reqId,
    professionalProfileId: pro?.id || idOrUsername,
    username: pro?.username || idOrUsername,
    proName: pro?.name || 'Professional Candidate',
    profession: pro?.profession || 'Specialist',
    city: pro?.city || 'New York',
    avatar: pro?.avatar || '',
    amount: paymentDetails.amount || 25,
    paymentMethod: paymentDetails.paymentMethod || 'Credit Card / Online Verification',
    paymentReference: paymentDetails.transactionRef || 'N/A',
    paymentScreenshot: paymentDetails.paymentScreenshot || '',
    status: 'PENDING',
    submittedAt: now
  }

  // Update memory cache
  memoryVerificationRequestsCache = [newRequest, ...memoryVerificationRequestsCache.filter(r => r.id !== reqId)]

  if (pro) {
    pro.verificationRequestStatus = 'PENDING'
    pro.verificationPaymentDetails = paymentDetails
  }

  try {
    await setDoc(doc(db, 'professional_verifications', reqId), newRequest)
    const proDocId = pro?.id || idOrUsername
    if (proDocId) {
      const docRef = doc(db, 'professionals', proDocId)
      await updateDoc(docRef, {
        verificationRequestStatus: 'PENDING',
        verificationPaymentDetails: paymentDetails
      })
    }
  } catch (err) {
    console.warn('Firestore submitVerificationRequest error:', err)
  }

  return { success: true, request: newRequest }
}

/**
 * Admin approves verification request: sets verificationStatus = 'VERIFIED', verified = true
 */
export async function approveVerificationRequest(requestId: string, adminUid: string): Promise<boolean> {
  const now = new Date().toISOString()
  const req = memoryVerificationRequestsCache.find(r => r.id === requestId)
  if (req) {
    req.status = 'APPROVED'
    req.reviewedAt = now
    req.reviewedBy = adminUid

    // Update corresponding professional
    const pro = memoryProfessionalsCache.find(p => p.id === req.professionalProfileId || p.username === req.username)
    if (pro) {
      pro.verified = true
      pro.verificationStatus = 'VERIFIED'
      pro.verificationRequestStatus = 'APPROVED'
      pro.verifiedAt = now
      pro.verifiedBy = adminUid
    }
  }

  try {
    const reqRef = doc(db, 'professional_verifications', requestId)
    await updateDoc(reqRef, {
      status: 'APPROVED',
      reviewedAt: now,
      reviewedBy: adminUid
    })

    const pro = memoryProfessionalsCache.find(p => p.id === req?.professionalProfileId || p.username === req?.username)
    const proDocId = pro?.id || req?.professionalProfileId || req?.username
    if (proDocId) {
      const proRef = doc(db, 'professionals', proDocId)
      await updateDoc(proRef, {
        verified: true,
        verificationStatus: 'VERIFIED',
        verificationRequestStatus: 'APPROVED',
        verifiedAt: now,
        verifiedBy: adminUid
      })
    }
  } catch (err) {
    console.warn('Firestore approveVerificationRequest error:', err)
  }

  return true
}

/**
 * Admin rejects verification request: keeps verificationStatus = 'UNVERIFIED', verified = false
 */
export async function rejectVerificationRequest(requestId: string, reason: string, adminUid: string): Promise<boolean> {
  const now = new Date().toISOString()
  const req = memoryVerificationRequestsCache.find(r => r.id === requestId)
  if (req) {
    req.status = 'REJECTED'
    req.rejectionReason = reason
    req.reviewedAt = now
    req.reviewedBy = adminUid

    // Update corresponding professional
    const pro = memoryProfessionalsCache.find(p => p.id === req.professionalProfileId || p.username === req.username)
    if (pro) {
      pro.verified = false
      pro.verificationStatus = 'UNVERIFIED'
      pro.verificationRequestStatus = 'REJECTED'
    }
  }

  try {
    const reqRef = doc(db, 'professional_verifications', requestId)
    await updateDoc(reqRef, {
      status: 'REJECTED',
      rejectionReason: reason,
      reviewedAt: now,
      reviewedBy: adminUid
    })

    if (req?.professionalProfileId) {
      const proRef = doc(db, 'professionals', req.professionalProfileId)
      await updateDoc(proRef, {
        verificationRequestStatus: 'REJECTED'
      })
    }
  } catch (err) {
    console.warn('Firestore rejectVerificationRequest error:', err)
  }

  return true
}

/**
 * SECURE PROFILE UPDATE:
 * Enforces server-side rule: If profile is approved and NOT verified, deny edits!
 */
export async function updateProfessionalProfileSecure(
  idOrUsername: string,
  updates: Partial<ProfessionalItem>,
  isAdmin: boolean = false
): Promise<{ success: boolean; message: string; data?: ProfessionalItem }> {
  const pro = memoryProfessionalsCache.find(p => p.id === idOrUsername || p.username === idOrUsername)

  if (!pro) {
    return { success: false, message: 'Professional profile not found.' }
  }

  // Security Check: An approved unverified user CANNOT edit their public profile!
  const isApproved = (pro.status || 'approved') === 'approved'
  const isVerified = pro.verified === true || pro.verificationStatus === 'VERIFIED'

  if (isApproved && !isVerified && !isAdmin) {
    return {
      success: false,
      message: 'Profile editing is available only to verified professionals. Please complete verification to unlock profile editing.'
    }
  }

  // Never allow non-admins to tamper with verificationStatus, profileStatus, or verified fields
  if (!isAdmin) {
    delete updates.verified
    delete updates.verificationStatus
    delete updates.status
    delete updates.profileStatus
    delete updates.approvedAt
    delete updates.approvedBy
    delete updates.verifiedAt
    delete updates.verifiedBy
  }

  const updatedPro = { ...pro, ...updates }
  const idx = memoryProfessionalsCache.findIndex(p => p.id === idOrUsername || p.username === idOrUsername)
  if (idx !== -1) {
    memoryProfessionalsCache[idx] = updatedPro
  }

  try {
    const docRef = doc(db, 'professionals', pro.id || idOrUsername)
    await updateDoc(docRef, updates)
  } catch (err) {
    console.warn('Firestore updateProfessionalProfileSecure error:', err)
  }

  return { success: true, message: 'Profile updated successfully.', data: updatedPro }
}

export async function updateProfessionalProfile(idOrUsername: string, updates: Partial<ProfessionalItem>): Promise<boolean> {
  const res = await updateProfessionalProfileSecure(idOrUsername, updates, false)
  return res.success
}

export async function deleteProfessionalProfile(idOrUsername: string): Promise<boolean> {
  memoryProfessionalsCache = memoryProfessionalsCache.filter(p => p.id !== idOrUsername && p.username !== idOrUsername)
  try {
    const docRef = doc(db, 'professionals', idOrUsername)
    await deleteDoc(docRef)
  } catch (err) {
    console.warn('Firestore deleteProfessionalProfile error:', err)
  }
  return true
}

export async function saveProfessionalInquiry(data: {
  proUsername: string
  proName: string
  senderName: string
  senderEmail: string
  senderWhatsApp: string
  message: string
}): Promise<{ success: boolean; inquiry?: ProfessionalInquiry; error?: string }> {
  const newInquiry: ProfessionalInquiry = {
    id: 'inq-' + Date.now(),
    proUsername: data.proUsername,
    proName: data.proName,
    senderName: data.senderName,
    senderEmail: data.senderEmail,
    senderWhatsApp: data.senderWhatsApp,
    message: data.message,
    createdAt: new Date().toISOString(),
    status: 'new'
  }

  memoryInquiriesCache = [newInquiry, ...memoryInquiriesCache]

  try {
    const docRef = doc(db, 'professional_inquiries', newInquiry.id)
    await setDoc(docRef, newInquiry)
  } catch (err) {
    console.warn('Firestore saveProfessionalInquiry error:', err)
  }

  return { success: true, inquiry: newInquiry }
}

export async function getProfessionalInquiries(proUsernameOrId?: string): Promise<ProfessionalInquiry[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'professional_inquiries'))
    const items: ProfessionalInquiry[] = []
    querySnapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...(docSnap.data() as any) })
    })
    if (items.length > 0) {
      items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      memoryInquiriesCache = items
    }
  } catch (err) {
    console.warn('Firestore getProfessionalInquiries error:', err)
  }

  if (!proUsernameOrId || proUsernameOrId === 'all') {
    return memoryInquiriesCache
  }
  const cleanTarget = proUsernameOrId.toLowerCase().trim()
  return memoryInquiriesCache.filter(inq => {
    const pU = (inq.proUsername || '').toLowerCase().trim()
    const pN = (inq.proName || '').toLowerCase().trim()
    return pU === cleanTarget || pU.includes(cleanTarget) || cleanTarget.includes(pU) || (pN && pN === cleanTarget)
  })
}



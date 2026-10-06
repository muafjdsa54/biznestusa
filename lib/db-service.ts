import { cache } from 'react'
import { MOCK_BUSINESSES, BusinessItem, ContactMessage, BusinessPlan } from './data'
import { db } from './firebase'
import { collection, getDocs, query, where, limit, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { sanitizeText, sanitizeUrl, sanitizeImageUrl, sanitizePhone, sanitizePersonName } from './sanitizer'
import { isPakistaniEntity } from './directory-helpers'
import { generatePaymentReference, createOrGetPaymentRecord, submitPaymentProof } from './payment-service'

// Memory cache store for super fast reads and SSG generation
let memoryBusinessesCache: BusinessItem[] = [...MOCK_BUSINESSES]
let memoryContactMessagesCache: ContactMessage[] = []

export function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Generate clean SEO friendly business slug.
 * - ONLY the business name.
 * - If exactly 1 unique city is selected: appends the city name (e.g. "summit-realty-builders-austin")
 * - If 2 or more cities are selected: NO city in slug, only business name (e.g. "summit-realty-builders")
 * - Prevents repetitive keywords and prevents duplicate city tokens.
 */
export function generateBusinessSlug(name: string, cities?: string[] | string): string {
  const cleanName = (name || '').trim()
  const cityList = Array.isArray(cities)
    ? Array.from(new Set(cities.map(c => (c || '').trim()).filter(Boolean)))
    : (cities ? [cities.trim()] : [])

  const validCities = cityList.filter(c => {
    const lc = c.toLowerCase()
    return lc !== 'usa' && lc !== 'united states' && lc !== 'all cities' && lc !== 'nationwide'
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

  return nameNorm || normalizeSlug(cleanName) || 'business'
}

/**
 * Deprecated review helper: returns empty array to strictly comply with Google AdSense
 * policy prohibiting fabricated customer reviews or artificial ratings.
 */
export const GENERATE_STARTER_REVIEWS = (_businessName: string): any[] => []

export function normalizeBusinessDoc(docId: string, data: any): BusinessItem {
  const bName = data.businessName || data.name || 'Verified Business'
  const rawStatus = (data.status || '').toString().toLowerCase().trim()
  const rawPaymentStatus = (data.paymentStatus || '').toString().toUpperCase().trim()
  
  // Extract payment screenshot from all possible fields
  const screenshot = data.paymentScreenshot || 
    data.paymentProof || 
    data.screenshotUrl || 
    data.proofDoc || 
    data.paymentDetails?.paymentScreenshot || 
    data.paymentDetails?.screenshot || 
    data.paymentDetails?.paymentProof || 
    ''

  const paymentMethod = data.paymentMethod || 
    data.paymentDetails?.paymentMethod || 
    'Direct Payment'

  const refNumber = data.paymentReference || 
    data.referenceNumber || 
    data.transactionRef || 
    data.transactionId || 
    data.paymentDetails?.referenceNumber || 
    data.paymentDetails?.transactionRef || 
    ''

  const paymentDetails = data.paymentDetails || (screenshot ? {
    paymentMethod,
    referenceNumber: refNumber,
    paymentScreenshot: screenshot,
    amount: Number(data.amount || data.paymentDetails?.amount || 50),
    paymentDate: data.paymentDate || data.submittedAt || data.createdAt || new Date().toISOString()
  } : undefined)

  const isSeed = data.source_type === 'seed_research' || data.ownership_status === 'directory_seed'

  // Determine normalized status:
  // Seed listings and admin-approved listings are approved.
  // User-submitted listings (with userId or submittedAt/createdAt) are pending unless explicitly approved
  let itemStatus: 'pending' | 'approved' | 'rejected' = 'approved'
  if (rawStatus === 'rejected') {
    itemStatus = 'rejected'
  } else if (isSeed || rawStatus === 'approved' || (data.approvedAt && rawStatus !== 'pending')) {
    itemStatus = 'approved'
  } else if (rawStatus === 'pending' || rawStatus === 'pending_approval' || data.submittedAt || data.userId || (data.createdAt && !data.approvedAt) || screenshot || rawPaymentStatus === 'PENDING') {
    itemStatus = 'pending'
  }

  const paymentStatus = rawPaymentStatus || (screenshot || paymentDetails ? 'PENDING' : (itemStatus === 'approved' ? 'VERIFIED' : 'UNPAID'))

  const itemSlug = data.slug || data.business_slug || normalizeSlug(bName)
  
  const docLocations = data.locations && data.locations.length > 0
    ? data.locations
    : [{ city: data.city || '', address: data.street_address || data.address || '', isPrimary: true }]
  const docCities = data.cities && data.cities.length > 0
    ? data.cities
    : Array.from(new Set(docLocations.map((l: { city: string }) => l.city)))
  const primaryLoc = docLocations.find((l: { isPrimary?: boolean }) => l.isPrimary) || docLocations[0]

  return {
    id: docId || data.id || data.record_id || 'biz-' + Date.now(),
    userId: data.userId || '',
    slug: itemSlug,
    name: bName,
    business_name: bName,
    business_slug: itemSlug,
    category: data.main_category || data.category || 'Services',
    categoryId: data.main_category_slug || data.categoryId || data.category || 'services',
    main_category: data.main_category || data.category,
    main_category_slug: data.main_category_slug || data.categoryId,
    subcategory: data.subcategory || data.subCategory,
    subcategory_slug: data.subcategory_slug || (data.subCategory ? normalizeSlug(data.subCategory) : (data.subcategory ? normalizeSlug(data.subcategory) : undefined)),
    subCategory: data.subcategory || data.subCategory,
    city: primaryLoc.city || data.city || '',
    cities: docCities,
    state: data.state || data.province || 'USA',
    state_code: data.state_code,
    province: data.state || data.province || 'USA',
    zipCode: data.zip || data.zipCode,
    country: data.country || 'US',
    rating: isSeed ? (Number.isFinite(data.rating) ? data.rating : 0) : (Number.isFinite(data.rating) ? data.rating : 0),
    reviewCount: isSeed ? (data.reviewCount || 0) : (data.reviewCount || (data.reviews ? data.reviews.length : 0)),
    verified: isSeed ? Boolean(data.verified === true) : (data.verified === true),
    isClaimed: isSeed ? false : (data.isClaimed === true),
    isFeatured: data.isFeatured === true,
    status: itemStatus,
    submittedAt: data.submittedAt || data.created_at || data.createdAt || new Date().toISOString(),
    approvedAt: data.approvedAt || (isSeed ? (data.source_checked_date ? `${data.source_checked_date}T00:00:00.000Z` : new Date().toISOString()) : undefined),
    approvedBy: data.approvedBy || (isSeed ? 'biznestusa_seed_import' : undefined),
    ownerName: isSeed ? (data.professional_title ? `${bName} (${data.professional_title})` : 'Unclaimed Directory Listing') : (sanitizePersonName(data.ownerName || data.fullName) || 'Business Representative'),
    phone: sanitizePhone(data.phone || ''),
    whatsapp: sanitizePhone(data.whatsapp || ''),
    email: data.email || '',
    website: data.website || data.website_url || data.websiteUrl || '',
    googleBusinessProfile: sanitizeUrl(data.googleBusinessProfile || ''),
    facebookUrl: sanitizeUrl(data.facebookUrl || ''),
    instagramUrl: sanitizeUrl(data.instagramUrl || ''),
    linkedinUrl: sanitizeUrl(data.linkedinUrl || ''),
    address: primaryLoc.address || data.street_address || data.address || '',
    locations: docLocations,
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    logo: (data.logo || data.logo_url || data.logoUrl || '').trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    description: data.longer_factual_description || data.description || data.short_description || data.aboutText || 'Verified local business listing on BizNestUSA.',
    short_description: data.short_description,
    longer_factual_description: data.longer_factual_description,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    canonical: data.canonical,
    introduction: data.short_description || data.introduction || data.shortIntro,
    secondaryCategories: data.secondaryCategories,
    schemaType: data.schemaType,
    services: Array.isArray(data.services) && data.services.length > 0 ? data.services : ['General Services', 'Customer Support'],
    detailedServices: data.detailedServices,
    sections: data.sections,
    operatingHours: data.operatingHours || (data.hours ? { 'General Hours': data.hours } : { 'Monday - Saturday': '09:00 AM - 06:00 PM', 'Sunday': 'Closed' }),
    features: data.features || (isSeed ? ['Public Directory Listing', 'Unclaimed Profile'] : ['Verified Profile']),
    // Seed Directory & Provenance Details
    source_type: data.source_type || (isSeed ? 'seed_research' : undefined),
    claim_status: data.claim_status || (isSeed ? 'unclaimed' : (data.isClaimed ? 'claimed' : 'unclaimed')),
    ownership_status: data.ownership_status || (isSeed ? 'directory_seed' : (data.isClaimed ? 'claimed_owner' : 'unclaimed')),
    account_id: data.account_id !== undefined ? data.account_id : null,
    created_by: data.created_by || (isSeed ? 'biznestusa_seed_import' : undefined),
    source_urls: data.source_urls || [data.official_source_url, ...(data.secondary_source_urls || [])].filter(Boolean),
    official_source_url: data.official_source_url,
    secondary_source_urls: data.secondary_source_urls,
    source_checked_date: data.source_checked_date,
    source_notes: data.source_notes,
    data_quality_notes: data.data_quality_notes,
    verification_confidence: data.verification_confidence,
    professional_title: data.professional_title,
    organization: data.organization,
    year_established: data.year_established,
    service_area: data.service_area,
    social_profiles: data.social_profiles,
    created_at: data.created_at || data.createdAt || data.submittedAt,
    updated_at: data.updated_at || data.updatedAt,
    // Plan, Payment & Entitlements
    plan: isSeed ? 'priority_5' : (data.plan || (data.amount === 10 || data.planPrice === 10 ? 'authoritative_10' : (data.amount === 5 || data.planPrice === 5 ? 'priority_5' : 'review_1'))),
    planName: isSeed ? 'Directory Seed Listing' : (data.planName || (data.plan === 'authoritative_10' ? '$10 Authoritative Plan' : (data.plan === 'priority_5' ? '$5 Standard Plan' : '$1 Basic Plan'))),
    planPrice: isSeed ? 0 : (data.planPrice || (data.plan === 'authoritative_10' ? 10 : (data.plan === 'priority_5' ? 5 : 1))),
    hasSinglePage: true,
    canEditProfile: isSeed ? false : (data.canEditProfile !== undefined ? Boolean(data.canEditProfile) : (data.plan === 'priority_5' || data.plan === 'authoritative_10')),
    editRequests: Array.isArray(data.editRequests) ? data.editRequests : [],
    lastEditedAt: data.lastEditedAt,
    paymentDetails,
    paymentScreenshot: screenshot,
    transactionRef: refNumber,
    paymentStatus: (isSeed ? 'VERIFIED' : (data.paymentStatus || rawPaymentStatus || (screenshot ? 'SUBMITTED' : (itemStatus === 'approved' ? 'VERIFIED' : 'PENDING')))) as any,
    paymentSubmittedAt: data.paymentSubmittedAt || data.submittedAt || data.createdAt,
    paymentVerifiedAt: data.paymentVerifiedAt,
    paymentVerifiedBy: data.paymentVerifiedBy,
    adminNotes: data.adminNotes || '',
    blog_post_entitled: Boolean(data.blog_post_entitled || ((data.plan === 'priority_5' || data.plan === 'authoritative_10') && (data.paymentStatus === 'VERIFIED' || data.blog_post_feature_enabled))),
    blog_posts_allowed: data.blog_posts_allowed !== undefined 
      ? data.blog_posts_allowed 
      : (data.plan === 'authoritative_10' ? 10 : (data.plan === 'priority_5' ? 5 : 0)),
    blog_posts_used: data.blog_posts_used || 0,
    blog_post_feature_enabled: Boolean(data.blog_post_feature_enabled),
    blog_post_feature_enabled_at: data.blog_post_feature_enabled_at,
    enabled_by_admin_id: data.enabled_by_admin_id,
    reviews: isSeed ? [] : (data.reviews && data.reviews.length > 0 ? data.reviews : []),
    faqs: data.faqs || []
  }
}

// Local storage keys for browser client persistence
const LOCAL_CUSTOM_BIZ_KEY = 'biznestusa_custom_businesses'
const LOCAL_USER_BIZ_IDS_KEY = 'biznestusa_user_business_ids'

function getStoredCustomBusinesses(): BusinessItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_BIZ_KEY) || localStorage.getItem('listpak_custom_businesses')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (_) {
    return []
  }
}

function saveStoredCustomBusiness(biz: BusinessItem) {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredCustomBusinesses()
    const updated = [biz, ...current.filter(b => b.id !== biz.id && b.slug.toLowerCase() !== biz.slug.toLowerCase())]
    localStorage.setItem(LOCAL_CUSTOM_BIZ_KEY, JSON.stringify(updated))

    // Also register to user's local business ID list if applicable
    if (biz.userId || biz.email) {
      const rawIds = localStorage.getItem(LOCAL_USER_BIZ_IDS_KEY)
      const ids: string[] = rawIds ? JSON.parse(rawIds) : []
      if (!ids.includes(biz.id)) {
        ids.push(biz.id)
        localStorage.setItem(LOCAL_USER_BIZ_IDS_KEY, JSON.stringify(ids))
      }
    }
  } catch (_) {}
}

function updateStoredCustomBusiness(idOrSlug: string, updates: Partial<BusinessItem>) {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredCustomBusinesses()
    const norm = idOrSlug.toLowerCase().trim()
    const updated = current.map(b => {
      if (b.id === idOrSlug || b.slug.toLowerCase() === norm || b.name.toLowerCase() === norm) {
        return { ...b, ...updates }
      }
      return b
    })
    localStorage.setItem(LOCAL_CUSTOM_BIZ_KEY, JSON.stringify(updated))
  } catch (_) {}
}

/**
 * Fetch all businesses. If includePending is false (default), returns ONLY approved businesses.
 */
export async function getAllBusinesses(includePending: boolean = false): Promise<BusinessItem[]> {
  const localItems = getStoredCustomBusinesses()

  try {
    const querySnapshot = await getDocs(collection(db, 'businesses'))
    if (!querySnapshot.empty) {
      const firestoreItems: BusinessItem[] = []
      querySnapshot.forEach((docSnap) => {
        firestoreItems.push(normalizeBusinessDoc(docSnap.id, docSnap.data()))
      })

      // Merge avoiding duplicate slugs/ids: Firestore items have priority, then local custom items, then mock data
      const firestoreSlugs = new Set(firestoreItems.map(b => b.slug.toLowerCase()))
      const firestoreIds = new Set(firestoreItems.map(b => b.id.toLowerCase()))
      
      const nonDuplicateLocal = localItems.filter(
        b => !firestoreSlugs.has(b.slug.toLowerCase()) && !firestoreIds.has(b.id.toLowerCase())
      )

      const usedSlugs = new Set([...firestoreSlugs, ...nonDuplicateLocal.map(b => b.slug.toLowerCase())])
      const usedIds = new Set([...firestoreIds, ...nonDuplicateLocal.map(b => b.id.toLowerCase())])

      const nonDuplicateMocks = memoryBusinessesCache.filter(
        b => !usedSlugs.has(b.slug.toLowerCase()) && !usedIds.has(b.id.toLowerCase())
      )

      memoryBusinessesCache = [...firestoreItems, ...nonDuplicateLocal, ...nonDuplicateMocks]
    } else if (localItems.length > 0) {
      const localSlugs = new Set(localItems.map(b => b.slug.toLowerCase()))
      const localIds = new Set(localItems.map(b => b.id.toLowerCase()))
      const nonDuplicateMocks = memoryBusinessesCache.filter(
        b => !localSlugs.has(b.slug.toLowerCase()) && !localIds.has(b.id.toLowerCase())
      )
      memoryBusinessesCache = [...localItems, ...nonDuplicateMocks]
    }
  } catch (err) {
    console.warn('Firestore getAllBusinesses fallback to memory cache & local items:', err)
    if (localItems.length > 0) {
      const localSlugs = new Set(localItems.map(b => b.slug.toLowerCase()))
      const localIds = new Set(localItems.map(b => b.id.toLowerCase()))
      const nonDuplicateMocks = memoryBusinessesCache.filter(
        b => !localSlugs.has(b.slug.toLowerCase()) && !localIds.has(b.id.toLowerCase())
      )
      memoryBusinessesCache = [...localItems, ...nonDuplicateMocks]
    }
  }

  const validBusinesses = memoryBusinessesCache.filter(b => !isPakistaniEntity(b))

  if (includePending) {
    return validBusinesses
  }
  
  // Public filter: only return approved items
  return validBusinesses.filter(b => b.status === 'approved')
}

export async function getPendingBusinesses(): Promise<BusinessItem[]> {
  const all = await getAllBusinesses(true)
  return all.filter(b => b.status === 'pending' || b.paymentStatus === 'PENDING')
}

async function updateBusinessInFirestore(idOrSlug: string, fieldsToUpdate: Record<string, any>): Promise<void> {
  const norm = (idOrSlug || '').trim()
  if (!norm) return

  // Strip all undefined fields to prevent Firestore serialization errors
  const cleanFields = JSON.parse(JSON.stringify(fieldsToUpdate))

  try {
    const docRef = doc(db, 'businesses', norm)
    await updateDoc(docRef, cleanFields)
    return
  } catch (err) {
    try {
      const q = query(collection(db, 'businesses'), where('slug', '==', norm.toLowerCase()), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, cleanFields)
        return
      }
      const qId = query(collection(db, 'businesses'), where('id', '==', norm), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await updateDoc(snapId.docs[0].ref, cleanFields)
        return
      }
    } catch (innerErr) {
      console.warn('Firestore updateBusinessInFirestore error:', innerErr)
    }
  }
}

export async function approveBusiness(id: string, adminUid: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryBusinessesCache.findIndex(b => b.id === id || b.slug.toLowerCase() === norm)
  if (idx !== -1) {
    memoryBusinessesCache[idx].status = 'approved'
    memoryBusinessesCache[idx].paymentStatus = 'VERIFIED'
    memoryBusinessesCache[idx].approvedAt = new Date().toISOString()
    memoryBusinessesCache[idx].approvedBy = adminUid
  }

  updateStoredCustomBusiness(id, {
    status: 'approved',
    paymentStatus: 'VERIFIED',
    approvedAt: new Date().toISOString(),
    approvedBy: adminUid
  })

  await updateBusinessInFirestore(id, {
    status: 'approved',
    paymentStatus: 'VERIFIED',
    approvedAt: new Date().toISOString(),
    approvedBy: adminUid
  })

  return true
}

export async function rejectBusiness(id: string, reason?: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryBusinessesCache.findIndex(b => b.id === id || b.slug.toLowerCase() === norm)
  if (idx !== -1) {
    memoryBusinessesCache[idx].status = 'rejected'
    memoryBusinessesCache[idx].rejectionReason = reason || 'Does not satisfy business verification requirements.'
  }

  updateStoredCustomBusiness(id, {
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason || 'Does not satisfy business verification requirements.'
  })

  await updateBusinessInFirestore(id, {
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason || 'Does not satisfy business verification requirements.'
  })

  return true
}

export async function deleteBusiness(idOrSlug: string): Promise<boolean> {
  const norm = (idOrSlug || '').trim().toLowerCase()
  if (!norm) return false

  // 1. Remove from memory cache
  memoryBusinessesCache = memoryBusinessesCache.filter(b => b.id.toLowerCase() !== norm && b.slug.toLowerCase() !== norm)

  // 2. Remove from local storage
  if (typeof window !== 'undefined') {
    try {
      const current = getStoredCustomBusinesses()
      const updated = current.filter(b => b.id.toLowerCase() !== norm && b.slug.toLowerCase() !== norm)
      localStorage.setItem(LOCAL_CUSTOM_BIZ_KEY, JSON.stringify(updated))
    } catch (_) {}
  }

  // 3. Delete from Firestore
  try {
    const docRef = doc(db, 'businesses', idOrSlug)
    await deleteDoc(docRef)
    return true
  } catch (err) {
    try {
      const q = query(collection(db, 'businesses'), where('slug', '==', norm), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await deleteDoc(snap.docs[0].ref)
        return true
      }
      const qId = query(collection(db, 'businesses'), where('id', '==', idOrSlug), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await deleteDoc(snapId.docs[0].ref)
        return true
      }
    } catch (innerErr) {
      console.warn('Firestore deleteBusiness error:', innerErr)
    }
  }
  return true
}

export async function getFeaturedBusinesses(limitCount: number = 9): Promise<BusinessItem[]> {
  const approvedOnly = await getAllBusinesses(false)
  const featured = approvedOnly.filter(b => b.isFeatured || b.verified)
  return featured.slice(0, limitCount)
}

export const getBusinessBySlug = cache(async function getBusinessBySlug(slug: string): Promise<BusinessItem | null> {
  const raw = decodeURIComponent(slug || '').trim()
  const normalized = raw.toLowerCase()
  if (!normalized) return null

  // 1. Live Firestore check for real-time approved status
  try {
    const q = query(collection(db, 'businesses'), where('slug', '==', normalized), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      const item = normalizeBusinessDoc(docSnap.id, docSnap.data())
      memoryBusinessesCache = [
        item,
        ...memoryBusinessesCache.filter(b => b.slug.toLowerCase() !== normalized && b.id !== item.id)
      ]
      // $1 Basic Plan does not have a single page, but seed directory listings and paid plans do
      if (item.status === 'approved' && !isPakistaniEntity(item) && item.hasSinglePage !== false && (item.plan !== 'review_1' || item.source_type === 'seed_research')) {
        return item
      }
      return null
    }

    // Direct doc lookup by ID
    try {
      const direct = await getDocs(query(collection(db, 'businesses'), where('id', '==', raw), limit(1)))
      if (!direct.empty) {
        const item = normalizeBusinessDoc(direct.docs[0].id, direct.docs[0].data())
        if (item.status === 'approved' && !isPakistaniEntity(item) && item.hasSinglePage !== false && (item.plan !== 'review_1' || item.source_type === 'seed_research')) {
          return item
        }
      }
    } catch (_) {}
  } catch (err) {
    console.warn('Firestore getBusinessBySlug fallback:', err)
  }

  // 2. Local storage check
  const localItems = getStoredCustomBusinesses()
  const localFound = localItems.find(b => 
    b.slug.toLowerCase() === normalized || 
    b.id.toLowerCase() === normalized ||
    normalizeSlug(b.name) === normalized ||
    (b.city && `${normalizeSlug(b.name)}-${normalizeSlug(b.city)}` === normalized)
  )
  if (localFound && (localFound.status || 'approved') === 'approved' && !isPakistaniEntity(localFound) && localFound.hasSinglePage !== false && (localFound.plan !== 'review_1' || localFound.source_type === 'seed_research')) {
    return localFound
  }

  // 3. Memory cache check (with city suffix fallback matching)
  const cached = memoryBusinessesCache.find(b => 
    b.slug.toLowerCase() === normalized || 
    b.id.toLowerCase() === normalized ||
    normalizeSlug(b.name) === normalized ||
    (b.city && `${normalizeSlug(b.name)}-${normalizeSlug(b.city)}` === normalized)
  )
  if (cached && (cached.status || 'approved') === 'approved' && !isPakistaniEntity(cached) && cached.hasSinglePage !== false && (cached.plan !== 'review_1' || cached.source_type === 'seed_research')) {
    return cached
  }

  // 4. Mock businesses check
  const mockFound = MOCK_BUSINESSES.find(b => 
    b.slug.toLowerCase() === normalized || 
    b.id.toLowerCase() === normalized ||
    normalizeSlug(b.name) === normalized ||
    (b.city && `${normalizeSlug(b.name)}-${normalizeSlug(b.city)}` === normalized)
  )
  if (mockFound && (mockFound.status || 'approved') === 'approved' && !isPakistaniEntity(mockFound) && mockFound.hasSinglePage !== false && (mockFound.plan !== 'review_1' || mockFound.source_type === 'seed_research')) {
    return mockFound
  }

  return null
})

/**
 * Save new business with status: "pending" by default
 */
export async function saveBusinessToDatabase(businessData: Partial<BusinessItem>): Promise<BusinessItem> {
  const cleanName = sanitizeText(businessData.name || 'New Business', 120)
  const inputLocations = businessData.locations && businessData.locations.length > 0
    ? businessData.locations.map(l => ({
        ...l,
        city: sanitizeText(l.city, 60),
        address: sanitizeText(l.address, 250),
      }))
    : [{ city: sanitizeText(businessData.city || 'New York', 60), address: sanitizeText(businessData.address || 'United States', 250), isPrimary: true }]

  const primaryLoc = inputLocations.find(l => l.isPrimary) || inputLocations[0]
  const summaryCity = primaryLoc.city || sanitizeText(businessData.city || 'New York', 60)
  const summaryAddress = primaryLoc.address || sanitizeText(businessData.address || 'United States', 250)
  const allCities = Array.from(new Set(inputLocations.map(l => l.city).filter(Boolean)))

  const slug = businessData.slug || generateBusinessSlug(cleanName, allCities)
  const bizId = businessData.id || ('biz-' + Date.now())

  const chosenPlan = businessData.plan || 'review_1'
  const isAuthoritative = chosenPlan === 'authoritative_10'
  const isStandard = chosenPlan === 'priority_5'
  const isBasic = chosenPlan === 'review_1'

  const resolvedPrice = businessData.planPrice ?? (isAuthoritative ? 10 : (isStandard ? 5 : 1))
  const resolvedPlanName = businessData.planName || (isAuthoritative ? '$10 Authoritative Plan' : (isStandard ? '$5 Standard Plan' : '$1 Basic Plan'))
  const resolvedHasSinglePage = businessData.hasSinglePage !== undefined ? businessData.hasSinglePage : !isBasic
  const resolvedCanEditProfile = businessData.canEditProfile !== undefined ? businessData.canEditProfile : (isStandard || isAuthoritative)
  const resolvedPostsAllowed = businessData.blog_posts_allowed ?? (isAuthoritative ? 10 : (isStandard ? 5 : 0))
  const resolvedPaymentRef = businessData.payment_reference || businessData.transactionRef || generatePaymentReference()
  const resolvedPaymentStatus = businessData.paymentStatus || (businessData.paymentScreenshot ? 'PAYMENT_VERIFICATION_PENDING' : 'PENDING_PAYMENT')
  const primaryCity = primaryLoc.city || summaryCity

  const newBiz: BusinessItem = {
      id: bizId,
      name: sanitizeText(businessData.name, 120),
      slug,
      category: sanitizeText(businessData.category, 60),
      categoryId: businessData.categoryId || 'local-services',
      subCategory: businessData.subCategory ? sanitizeText(businessData.subCategory, 60) : undefined,
      subcategory: businessData.subCategory ? sanitizeText(businessData.subCategory, 60) : undefined,
      secondaryCategories: Array.isArray(businessData.secondaryCategories) ? businessData.secondaryCategories : [],
      city: sanitizeText(primaryCity, 60),
      cities: allCities,
      locations: inputLocations,
      state: sanitizeText(businessData.state || businessData.province || 'New York', 80),
      province: sanitizeText(businessData.state || businessData.province || 'New York', 80),
      rating: 0,
      reviewCount: 0,
      verified: false,
      isClaimed: false,
      isFeatured: isAuthoritative,
      status: 'pending', // MANDATORY PENDING WORKFLOW
      plan: chosenPlan,
      planName: resolvedPlanName,
      planPrice: resolvedPrice,
      hasSinglePage: resolvedHasSinglePage,
      canEditProfile: resolvedCanEditProfile,
      paymentStatus: resolvedPaymentStatus,
      paymentScreenshot: sanitizeImageUrl(businessData.paymentScreenshot || ''),
      transactionRef: businessData.transactionRef || resolvedPaymentRef,
      payment_reference: resolvedPaymentRef,
      payment_provider: 'payoneer',
      adminNotes: businessData.adminNotes || '',
      blog_post_entitled: isStandard || isAuthoritative,
      blog_posts_allowed: resolvedPostsAllowed,
      blog_posts_used: businessData.blog_posts_used ?? 0,
      blog_post_feature_enabled: false, // Activated only upon admin payment verification
      paymentDetails: businessData.paymentDetails,
      submittedAt: new Date().toISOString(),
      ownerName: sanitizeText(businessData.ownerName || 'Business Representative', 80),
      phone: sanitizePhone(businessData.phone || '(555) 000-0000'),
      whatsapp: businessData.whatsapp ? sanitizePhone(businessData.whatsapp) : '',
      email: sanitizeText(businessData.email || 'contact@business.com', 120),
      website: sanitizeUrl(businessData.website || 'https://biznestusa.com'),
      googleBusinessProfile: sanitizeUrl(businessData.googleBusinessProfile || ''),
      facebookUrl: sanitizeUrl(businessData.facebookUrl || ''),
      instagramUrl: sanitizeUrl(businessData.instagramUrl || ''),
      linkedinUrl: sanitizeUrl(businessData.linkedinUrl || ''),
      address: summaryAddress,
      coverImage: sanitizeImageUrl(businessData.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'),
      logo: sanitizeImageUrl(businessData.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'),
      description: sanitizeText(businessData.description || 'Verified local business listing on BizNestUSA.', 5000),
      services: Array.isArray(businessData.services) ? businessData.services.map(s => sanitizeText(s, 60)) : ['Professional Services'],
      operatingHours: businessData.operatingHours || { 'Monday - Saturday': '09:00 AM - 06:00 PM', 'Sunday': 'Closed' },
      features: [],
      reviews: [],
      faqs: Array.isArray(businessData.faqs) && businessData.faqs.length > 0
        ? businessData.faqs.map((f: any) => ({
            question: sanitizeText(f.question || f.q || '', 300),
            answer: sanitizeText(f.answer || f.a || '', 2000)
          })).filter((f: any) => f.question && f.answer)
        : []
    }

    // Update memory cache
    memoryBusinessesCache = [newBiz, ...memoryBusinessesCache.filter(b => b.slug !== slug && b.id !== bizId)]

    // Persist immediately to localStorage
    saveStoredCustomBusiness(newBiz)

    // Clean all undefined fields before sending to Firestore
    const cleanPayload = JSON.parse(JSON.stringify({
      ...newBiz,
      businessName: newBiz.name,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }))

    // Persist to Firestore with explicit ID using setDoc
    try {
      const docRef = doc(db, 'businesses', bizId)
      await setDoc(docRef, cleanPayload)
    } catch (err) {
      console.warn('Firestore setDoc save fallback, trying addDoc:', err)
      try {
        const addedDoc = await addDoc(collection(db, 'businesses'), cleanPayload)
        newBiz.id = addedDoc.id
        saveStoredCustomBusiness(newBiz)
      } catch (innerErr) {
        console.warn('Firestore addDoc fallback error:', innerErr)
      }
    }

    // Sync with payments collection in Firestore
    try {
      const paymentRec = await createOrGetPaymentRecord({
        userId: newBiz.userId || 'user',
        userEmail: newBiz.email,
        businessId: newBiz.id,
        businessName: newBiz.name,
        businessSlug: newBiz.slug,
        planId: chosenPlan
      })
      if (newBiz.paymentScreenshot) {
        await submitPaymentProof({
          paymentIdOrRef: paymentRec.id,
          screenshotDataUrl: newBiz.paymentScreenshot,
          payoneerTransactionId: newBiz.transactionRef,
          userId: newBiz.userId
        })
      }
    } catch (paySyncErr) {
      console.warn('Payment record sync warning:', paySyncErr)
    }

    return newBiz
  }

  export async function updateBusinessPaymentProof(
    idOrSlug: string,
    payment: {
      paymentMethod: string
      referenceNumber?: string
      paymentScreenshot: string
      amount?: number
      plan?: BusinessPlan
      customerNote?: string
    }
  ): Promise<boolean> {
    const norm = idOrSlug.toLowerCase().trim()
    const nowIso = new Date().toISOString()
    const selectedPlan: BusinessPlan = payment.plan || (payment.amount === 10 ? 'authoritative_10' : (payment.amount === 5 ? 'priority_5' : 'review_1'))
    const isAuthoritative = selectedPlan === 'authoritative_10'
    const isStandard = selectedPlan === 'priority_5'
    const amount = payment.amount ?? (isAuthoritative ? 10 : (isStandard ? 5 : 1))
    
    const paymentDetails = {
      plan: selectedPlan,
      paymentMethod: payment.paymentMethod || 'Payoneer',
      referenceNumber: payment.referenceNumber || '',
      transactionRef: payment.referenceNumber || '',
      paymentScreenshot: payment.paymentScreenshot,
      customerNote: payment.customerNote,
      amount,
      paymentDate: nowIso
    }

    const patch: Partial<BusinessItem> = {
      plan: selectedPlan,
      planPrice: amount,
      paymentScreenshot: payment.paymentScreenshot,
      transactionRef: payment.referenceNumber || '',
      payment_reference: payment.referenceNumber || '',
      payment_provider: 'payoneer',
      paymentDetails,
      paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
      status: 'pending',
      submittedAt: nowIso,
      blog_post_entitled: isStandard || isAuthoritative,
      blog_posts_allowed: isAuthoritative ? 10 : (isStandard ? 5 : 0),
      blog_post_feature_enabled: false
    }

    const idx = memoryBusinessesCache.findIndex(b => b.id === idOrSlug || b.slug.toLowerCase() === norm || b.name.toLowerCase() === norm)
    if (idx !== -1) {
      Object.assign(memoryBusinessesCache[idx], patch)
      ;(memoryBusinessesCache[idx] as any).lastRequestedAt = nowIso
    }

    updateStoredCustomBusiness(idOrSlug, patch as any)

    await updateBusinessInFirestore(idOrSlug, patch as any)

    // Sync to payments collection
    try {
      const biz = memoryBusinessesCache[idx]
      const paymentRec = await createOrGetPaymentRecord({
        userId: biz?.userId || 'user',
        userEmail: biz?.email,
        businessId: biz?.id || idOrSlug,
        businessName: biz?.name || 'Business Listing',
        businessSlug: biz?.slug,
        planId: selectedPlan
      })
      await submitPaymentProof({
        paymentIdOrRef: paymentRec.id,
        screenshotDataUrl: payment.paymentScreenshot,
        payoneerTransactionId: payment.referenceNumber,
        customerNote: payment.customerNote,
        userId: biz?.userId
      })
    } catch (e) {
      console.warn('Payment proof sync to payments collection notice:', e)
    }

    return true
  }

export async function submitBusinessEditRequest(
  idOrSlug: string,
  edits: Partial<BusinessItem>,
  userNote?: string
): Promise<{ success: boolean; message: string; appliedAfter24h: boolean }> {
  const norm = (idOrSlug || '').trim().toLowerCase()
  if (!norm) return { success: false, message: 'Invalid business identifier', appliedAfter24h: false }

  const nowIso = new Date().toISOString()
  const editId = 'edit-' + Date.now()

  const cleanEdits: Record<string, any> = {}
  if (edits.name) cleanEdits.name = sanitizeText(edits.name, 120)
  if (edits.category) cleanEdits.category = sanitizeText(edits.category, 80)
  if (edits.subCategory) cleanEdits.subCategory = sanitizeText(edits.subCategory, 80)
  if (edits.phone) cleanEdits.phone = sanitizePhone(edits.phone)
  if (edits.whatsapp) cleanEdits.whatsapp = sanitizePhone(edits.whatsapp)
  if (edits.email) cleanEdits.email = sanitizeText(edits.email, 120)
  if (edits.website) cleanEdits.website = sanitizeUrl(edits.website)
  if (edits.googleBusinessProfile) cleanEdits.googleBusinessProfile = sanitizeUrl(edits.googleBusinessProfile)
  if (edits.facebookUrl) cleanEdits.facebookUrl = sanitizeUrl(edits.facebookUrl)
  if (edits.instagramUrl) cleanEdits.instagramUrl = sanitizeUrl(edits.instagramUrl)
  if (edits.linkedinUrl) cleanEdits.linkedinUrl = sanitizeUrl(edits.linkedinUrl)
  if (edits.address) cleanEdits.address = sanitizeText(edits.address, 250)
  if (edits.description) cleanEdits.description = sanitizeText(edits.description, 5000)
  if (edits.services) cleanEdits.services = edits.services
  if (edits.operatingHours) cleanEdits.operatingHours = edits.operatingHours
  if (edits.locations) cleanEdits.locations = edits.locations

  const newRequest = {
    id: editId,
    requestedAt: nowIso,
    status: 'pending' as const,
    notes: userNote || 'User profile and business details update',
    changes: cleanEdits
  }

  // Update in memory cache
  const idx = memoryBusinessesCache.findIndex(b => b.id === idOrSlug || b.slug.toLowerCase() === norm)
  if (idx !== -1) {
    const existing = memoryBusinessesCache[idx]
    const updatedRequests = [...(existing.editRequests || []), newRequest]
    memoryBusinessesCache[idx].editRequests = updatedRequests
    memoryBusinessesCache[idx].lastEditedAt = nowIso
  }

  // Update in localStorage
  updateStoredCustomBusiness(idOrSlug, {
    lastEditedAt: nowIso,
    editRequests: [newRequest]
  } as any)

  // Update in Firestore
  try {
    await updateBusinessInFirestore(idOrSlug, {
      lastEditedAt: nowIso,
      latestEditRequest: newRequest
    })
  } catch (err) {
    console.warn('Firestore submitBusinessEditRequest fallback:', err)
  }

  return {
    success: true,
    message: 'Profile update submitted! Changes will be reviewed by admin and applied within 24 hours.',
    appliedAfter24h: true
  }
}

export async function getUserBusinesses(emailOrUid: string): Promise<BusinessItem[]> {
  const norm = (emailOrUid || '').trim().toLowerCase()
  if (!norm) return []
  const normCleanDigits = norm.replace(/[^0-9]/g, '')

  try {
    const all = await getAllBusinesses(true)
    
    // Also get registered user business IDs
    let userRegisteredIds: string[] = []
    if (typeof window !== 'undefined') {
      try {
        const rawIds = localStorage.getItem(LOCAL_USER_BIZ_IDS_KEY)
        if (rawIds) userRegisteredIds = JSON.parse(rawIds)
      } catch (_) {}
    }

    return all.filter(b => {
      const bEmail = (b.email || '').toLowerCase().trim()
      const bUid = (b.userId || '').toLowerCase().trim()
      const bOwner = (b.ownerName || '').toLowerCase().trim()
      const bPhone = (b.phone || '').replace(/[^0-9]/g, '')
      const bWhatsApp = (b.whatsapp || '').replace(/[^0-9]/g, '')

      return (
        bEmail === norm ||
        bUid === norm ||
        bOwner === norm ||
        userRegisteredIds.includes(b.id) ||
        (normCleanDigits.length >= 7 && (bPhone.includes(normCleanDigits) || bWhatsApp.includes(normCleanDigits)))
      )
    })
  } catch (err) {
    console.warn('getUserBusinesses error:', err)
    return []
  }
}

/**
 * CONTACT MESSAGES MANAGEMENT
 */
export async function saveContactMessage(msg: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    id: 'msg-' + Date.now(),
    name: msg.name,
    email: msg.email,
    phone: msg.phone,
    subject: msg.subject,
    message: msg.message,
    createdAt: new Date().toISOString(),
    status: 'unread'
  }

  memoryContactMessagesCache = [newMsg, ...memoryContactMessagesCache]

  try {
    await addDoc(collection(db, 'contact_messages'), newMsg)
  } catch (err) {
    console.warn('Firestore saveContactMessage error:', err)
  }

  return newMsg
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const snap = await getDocs(collection(db, 'contact_messages'))
    if (!snap.empty) {
      const items: ContactMessage[] = []
      snap.forEach(d => {
        const data = d.data()
        items.push({
          id: d.id,
          name: data.name || 'Anonymous',
          email: data.email || '',
          phone: data.phone,
          subject: data.subject || 'General Inquiry',
          message: data.message || '',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'unread'
        })
      })
      memoryContactMessagesCache = items
    }
  } catch (err) {
    console.warn('Firestore getContactMessages error:', err)
  }
  return memoryContactMessagesCache
}

export async function markContactMessageRead(id: string): Promise<boolean> {
  const idx = memoryContactMessagesCache.findIndex(m => m.id === id)
  if (idx !== -1) {
    memoryContactMessagesCache[idx].status = 'read'
  }
  try {
    const ref = doc(db, 'contact_messages', id)
    await updateDoc(ref, { status: 'read' })
  } catch (err) {
    console.warn('Firestore markContactMessageRead error:', err)
  }
  return true
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  memoryContactMessagesCache = memoryContactMessagesCache.filter(m => m.id !== id)
  try {
    const ref = doc(db, 'contact_messages', id)
    await deleteDoc(ref)
  } catch (err) {
    console.warn('Firestore deleteContactMessage error:', err)
  }
  return true
}


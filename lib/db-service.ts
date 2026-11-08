import { cache } from 'react'
import { MOCK_BUSINESSES, BusinessItem, ContactMessage, BusinessPlan } from './data'
import { db } from './firebase'
import { collection, getDocs, query, where, limit, addDoc, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { sanitizeText, sanitizeUrl, sanitizeImageUrl, sanitizePhone, sanitizePersonName } from './sanitizer'
import { computeCitySlugs, isPakistaniEntity } from './directory-helpers'
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
  // User-submitted listings (with userId or submittedAt/createdAt) are pending unless explicitly approved.
  // SECURITY (P0-3): a doc with NO status must NEVER render as approved —
  // missing status defaults to 'pending', never 'approved'.
  let itemStatus: 'pending' | 'approved' | 'rejected' = 'pending'
  if (rawStatus === 'rejected') {
    itemStatus = 'rejected'
  } else if (isSeed || rawStatus === 'approved' || (data.approvedAt && rawStatus !== 'pending')) {
    itemStatus = 'approved'
  } else if (rawStatus === 'pending' || rawStatus === 'pending_approval' || data.submittedAt || data.userId || (data.createdAt && !data.approvedAt) || screenshot || rawPaymentStatus === 'PENDING') {
    itemStatus = 'pending'
  }

  const paymentStatus = rawPaymentStatus || (screenshot || paymentDetails ? 'PENDING' : undefined)

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
    // categoryId: deliberately NOT canonicalized through
    // normalizeBusinessCategoryId here. The stored/raw value already IS
    // the canonical slug for all 292 seeds (via main_category_slug), and
    // canonicalizing would CHANGE rendered output: e.g. the 18 seeds with
    // main_category_slug 'technology-professionals' would flip to
    // 'technology', which would newly match the services-page parent
    // category fallback (b.categoryId === parentCategoryId) and the
    // search route's categoryId substring match. If cursor pagination
    // ever needs a canonical categoryId, that is a separate change with
    // its own filter/render verification — the write path below persists
    // this same derivation so the stored doc matches the read-time value.
    categoryId: data.main_category_slug || data.categoryId || data.category || 'services',
    main_category: data.main_category || data.category,
    main_category_slug: data.main_category_slug || data.categoryId,
    subcategory: data.subcategory || data.subCategory,
    subcategory_slug: data.subcategory_slug || (data.subCategory ? normalizeSlug(data.subCategory) : (data.subcategory ? normalizeSlug(data.subcategory) : undefined)),
    subCategory: data.subcategory || data.subCategory,
    city: primaryLoc.city || data.city || '',
    cities: docCities,
    // Denormalized canonical city slugs for future Firestore cursor
    // pagination (array-contains + startAfter). Always recomputed from
    // the city fields — never trusts a stored copy. No filter reads it
    // yet, so it changes no rendered output or filter result.
    citySlugs: computeCitySlugs({ city: data.city, cities: docCities, locations: docLocations }),
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
    coverImage: data.coverImage || undefined,
    logo: (data.logo || data.logo_url || data.logoUrl || '').trim(),
    description: data.longer_factual_description || data.description || data.short_description || data.aboutText || '',
    short_description: data.short_description,
    longer_factual_description: data.longer_factual_description,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    canonical: data.canonical,
    introduction: data.short_description || data.introduction || data.shortIntro,
    secondaryCategories: data.secondaryCategories,
    schemaType: data.schemaType,
    services: Array.isArray(data.services) && data.services.length > 0 ? data.services : [],
    detailedServices: data.detailedServices,
    sections: data.sections,
    operatingHours: data.operatingHours || (data.hours ? { 'General Hours': data.hours } : undefined),
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
    paymentStatus: (data.paymentStatus || rawPaymentStatus || (screenshot ? 'SUBMITTED' : undefined)) as any,
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
    faqs: data.faqs || [],
    // Photo gallery — $10 Authoritative benefit only (persisted at save
    // only for $10 listings; other plans store an empty gallery).
    gallery: Array.isArray(data.gallery) ? data.gallery.filter(Boolean).slice(0, 5) : []
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
 *
 * Perf: the Firestore read is bounded with limit() — the old query had no
 * limit and pulled the whole collection on every list page render
 * (homepage, business-directory, city and category pages). The cap
 * defaults to 500: comfortably above the live collection (~292 docs), so
 * counts stay exact, but the read can no longer grow without bound.
 * Callers that only render a slice should pass a smaller pageSize.
 * If the collection ever approaches the cap, the truncation warning
 * below fires — raise the cap (or move counts to an aggregation query)
 * before that point, because counts and filtered lists would silently
 * drop listings past the cap.
 *
 * NOTE: true Firestore-side filtered pagination (where city/category +
 * limit + startAfter cursor) is NOT possible on this collection today:
 * seeds carry no approvedAt/categoryId (0/292 in the seed file), city
 * matching needs slug aliases plus the cities[]/locations[] arrays, and
 * category matching is text-inferred in memory — none of that is
 * expressible as a Firestore where(). List pages therefore paginate
 * in memory over this bounded read (see lib/pagination.ts).
 */

// ROUND 3 — build-time seed-JSON fallback for the Firestore fetch race.
//
// The race: getAllBusinesses() races getDocs against a 2.5s timer. On a
// cold start (first Firestore connection during `next build`) the timer
// wins, the query resolves to nothing, and every prerendered city /
// category page is built as an empty shell — round 2 found ZERO business
// names in .next/server/app/city/new-york-city.html.
//
// Durable fix: when the Firestore fetch returns empty or times out AND
// the code is running on the server during static generation
// (NEXT_PHASE === 'phase-production-build'), fall back to the seed JSON
// (biznestusa-seed-businesses.json, 292 records — the same file the live
// docs were imported from), normalized through normalizeBusinessDoc.
//
// Hard guarantees:
// - Firestore-first at runtime: the fallback only runs when Firestore
//   returned ZERO usable business items. If Firestore returns real data
//   it is used as-is and seed records are NEVER merged on top (no
//   duplicates, no stale-seed shadowing of live edits).
// - Server-only: the JSON lives in lib/seed-fallback.ts and is loaded
//   with a dynamic import() inside the build-phase branch, so it lands
//   in a lazy chunk that browsers never fetch. db-service.ts is imported
//   by 'use client' modules (app/add-business/add-business-client.tsx),
//   so a static JSON import here would ship all 292 records to browsers.
//   Nothing in this file statically imports the seed JSON. (A dynamic
//   `fs` import was tried first: Turbopack rejects node builtins anywhere
//   in the client module graph, so the separate lazy module is the shape
//   that builds.)
// - The fallback is build-phase only: runtime SSR / ISR revalidation
//   keeps the existing behaviour (Firestore first, then local items /
//   memory cache) — a live Firestore outage at runtime must not
//   silently serve a stale seed snapshot.
// - Seed records are stamped source_type 'seed_research' /
//   ownership_status 'directory_seed' / status 'approved' before
//   normalization, because the raw file carries no source_type/status
//   fields and normalizeBusinessDoc would otherwise default them to
//   'pending'. entity_type 'professional' records are skipped, exactly
//   as the Firestore path skips them.
//
// Build speed: once the fallback has populated the in-memory cache,
// later prerenders in the same `next build` process reuse it instead of
// re-racing Firestore (2.5s per page × ~600 pages otherwise).
let seedFallbackLoaded = false

function isBuildTimeStaticGeneration(): boolean {
  return typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build'
}

async function loadSeedFallbackBusinesses(): Promise<BusinessItem[]> {
  // Dynamic import of ./seed-fallback, the module that statically
  // imports the 292-record seed JSON. The dynamic import keeps the JSON
  // out of the first-load client bundle (lazy chunk, never fetched — the
  // call site is guarded by typeof window + NEXT_PHASE). A static import
  // here would ship the JSON to browsers, and a dynamic `fs` import was
  // tried first and is rejected by Turbopack anywhere in the client
  // module graph (this file is imported by 'use client' modules).
  const { getSeedBusinessRecords } = await import('./seed-fallback')
  const items: BusinessItem[] = []
  for (const record of getSeedBusinessRecords()) {
    // Field mapping: the raw file stores the name as `business_name`
    // only. Live Firestore docs were imported with `name` set (see
    // scripts/import-seed-businesses.mjs:136), which is what
    // normalizeBusinessDoc reads (businessName || name) — feeding the
    // raw record straight in defaulted every seed to 'Verified
    // Business'. Map it here; every other raw field already matches
    // what the normalizer reads (business_slug, main_category(_slug),
    // subcategory(_slug), city, street_address, website_url,
    // longer_factual_description, official_source_url, ...).
    items.push(normalizeBusinessDoc(
      record.record_id || record.id || record.business_slug,
      { ...record, name: record.business_name, businessName: record.business_name, source_type: 'seed_research', ownership_status: 'directory_seed', status: 'approved' }
    ))
  }
  return items
}

export const getAllBusinesses = cache(async function getAllBusinesses(includePending: boolean = false, pageSize?: number): Promise<BusinessItem[]> {
  const localItems = getStoredCustomBusinesses()
  const cap = pageSize ?? 500

  // Build-time fast path: the seed fallback already populated the cache
  // in this `next build` process — reuse it, don't re-race Firestore.
  if (seedFallbackLoaded) {
    const cachedValid = memoryBusinessesCache.filter(b => !isPakistaniEntity(b))
    return includePending ? cachedValid : cachedValid.filter(b => b.status === 'approved')
  }

  // Firestore items yielded by this call (0 when the race timed out, the
  // query returned empty, or getDocs threw). The seed fallback below only
  // runs when this stays empty.
  let firestoreItems: BusinessItem[] = []

  try {
    // P1-2: public reads fetch APPROVED listings only, so pending
    // listings (owner emails/phones/payment screenshots) never ship
    // to visitors. includePending=true is the separate owner/admin
    // read path and keeps the unfiltered collection query.
    const queryPromise = includePending
      ? getDocs(query(collection(db, 'businesses'), limit(cap)))
      : getDocs(query(collection(db, 'businesses'), where('status', '==', 'approved'), limit(cap)))
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise])

    if (querySnapshot && querySnapshot.size >= cap) {
      console.warn(`Firestore getAllBusinesses hit the read cap (${cap} docs) — counts and filtered lists may be incomplete. Raise the cap.`)
    }

    if (querySnapshot && !querySnapshot.empty) {
      querySnapshot.forEach((docSnap) => {
        const rawDoc = docSnap.data()
        // Content fix: seed docs with entity_type 'professional' are people,
        // not businesses — they belong in the `professionals` collection and
        // must not render as businesses or inflate the business count.
        if (rawDoc.entity_type === 'professional') return
        firestoreItems.push(normalizeBusinessDoc(docSnap.id, rawDoc))
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

  // ROUND 3 — build-time seed fallback (see header comment above): the
  // Firestore race timed out / returned empty, so static generation
  // would otherwise prerender empty shells. Only during `next build`,
  // only for the public path, and only when Firestore yielded zero
  // usable business items — never merged on top of live Firestore data.
  if (firestoreItems.length === 0 && !includePending && isBuildTimeStaticGeneration()) {
    try {
      const seedItems = await loadSeedFallbackBusinesses()
      if (seedItems.length > 0) {
        const seedSlugs = new Set(seedItems.map(b => b.slug.toLowerCase()))
        const seedIds = new Set(seedItems.map(b => b.id.toLowerCase()))
        const nonDuplicateLocal = localItems.filter(
          b => !seedSlugs.has(b.slug.toLowerCase()) && !seedIds.has(b.id.toLowerCase())
        )
        memoryBusinessesCache = [...seedItems, ...nonDuplicateLocal]
        seedFallbackLoaded = true
        console.warn(`getAllBusinesses: Firestore empty/timed out during static generation — fell back to ${seedItems.length} seed businesses from biznestusa-seed-businesses.json`)
      }
    } catch (seedErr) {
      console.warn('getAllBusinesses: seed fallback failed, serving memory cache & local items:', seedErr)
    }
  }

  const validBusinesses = memoryBusinessesCache.filter(b => !isPakistaniEntity(b))

  if (includePending) {
    return validBusinesses
  }
  
  // Public filter: only return approved items
  return validBusinesses.filter(b => b.status === 'approved')
})

export async function getPendingBusinesses(): Promise<BusinessItem[]> {
  const all = await getAllBusinesses(true)
  return all.filter(b => b.status === 'pending' || b.paymentStatus === 'PENDING')
}

async function updateBusinessInFirestore(idOrSlug: string, fieldsToUpdate: Record<string, any>): Promise<void> {
  const norm = (idOrSlug || '').trim()
  if (!norm) throw new Error('updateBusinessInFirestore: empty idOrSlug')

  // Strip all undefined fields to prevent Firestore serialization errors
  const cleanFields = JSON.parse(JSON.stringify(fieldsToUpdate))

  try {
    const docRef = doc(db, 'businesses', norm)
    await updateDoc(docRef, cleanFields)
    return
  } catch (err) {
    // Fallback: resolve by slug, then by stored id field.
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
    console.error('Firestore updateBusinessInFirestore failed — no matching doc or write denied:', norm, err)
    throw err
  }
}

export async function approveBusiness(id: string, adminUid: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryBusinessesCache.findIndex(b => b.id === id || b.slug.toLowerCase() === norm)
  const cached = idx !== -1 ? memoryBusinessesCache[idx] : undefined
  // UX #2: an approved OWNER submission is claimed — the owner is known,
  // so the listing must stop rendering as "Unclaimed". Seeds are never
  // claimed (they have no owner). verified is NOT set here: verification
  // comes only from the real verification path.
  const isSeed = cached?.source_type === 'seed_research' || cached?.ownership_status === 'directory_seed'
  const ownerEmail = (cached?.email || '').trim().toLowerCase()
  const hasOwnerIdentity = Boolean(
    (cached?.userId && cached.userId.trim()) ||
    (ownerEmail && ownerEmail !== 'contact@business.com' && ownerEmail !== 'contact@yourcompany.com')
  )
  const markClaimed = !isSeed && hasOwnerIdentity
  const claimedFields = markClaimed ? { isClaimed: true, claim_status: 'claimed' as const } : {}
  // PRICING (b) — NO free listings: admin approves ONLY submissions with
  // verified payment. Block while payment is unverified. The task's named
  // values 'awaiting_payment' / 'payment_rejected' and this repo's actual
  // awaiting values (PENDING, PENDING_PAYMENT, PAYMENT_VERIFICATION_PENDING,
  // SUBMITTED, UNDER_REVIEW, UNPAID, REJECTED, NEEDS_CHANGES) are all
  // non-verified, so the guard allows only VERIFIED / PAID — the values the
  // payment flows write (payment-actions sets PAID on approve_payment).
  // Fail closed when the listing is not in cache: payment state unknown.
  const paymentStatus = String((cached as any)?.paymentStatus || '').trim().toLowerCase()
  let livePaymentStatus = paymentStatus
  if (paymentStatus !== 'verified' && paymentStatus !== 'paid') {
    // The in-memory cache can be stale: the admin may have just verified
    // the payment via /api/admin/payment-actions, which writes Firestore
    // directly. Re-check the live doc before blocking.
    try {
      if (db) {
        const liveSnap = await getDoc(doc(db, 'businesses', id))
        if (liveSnap.exists()) {
          const live = String((liveSnap.data() as any)?.paymentStatus || '').trim().toLowerCase()
          if (live === 'verified' || live === 'paid') {
            livePaymentStatus = live
            if (idx !== -1) memoryBusinessesCache[idx].paymentStatus = (liveSnap.data() as any).paymentStatus
          }
        }
      }
    } catch (e) {
      console.warn('Approve payment re-check failed, using cached status:', e)
    }
  }
  if (livePaymentStatus !== 'verified' && livePaymentStatus !== 'paid') {
    console.warn(`Approve blocked for business ${id}: payment not verified (paymentStatus: '${(cached as any)?.paymentStatus || ''}'). Verify the payment proof first.`)
    return false
  }
  const prevStatus = idx !== -1 ? memoryBusinessesCache[idx].status : undefined
  const prevPaymentStatus = idx !== -1 ? (memoryBusinessesCache[idx] as any).paymentStatus : undefined
  if (idx !== -1) {
    memoryBusinessesCache[idx].status = 'approved'
    memoryBusinessesCache[idx].paymentStatus = 'VERIFIED'
    memoryBusinessesCache[idx].approvedAt = new Date().toISOString()
    memoryBusinessesCache[idx].approvedBy = adminUid
    if (markClaimed) {
      memoryBusinessesCache[idx].isClaimed = true
      memoryBusinessesCache[idx].claim_status = 'claimed'
    }
  }

  updateStoredCustomBusiness(id, {
    status: 'approved',
    paymentStatus: 'VERIFIED',
    approvedAt: new Date().toISOString(),
    approvedBy: adminUid,
    ...claimedFields
  })

  try {
    await updateBusinessInFirestore(id, {
      status: 'approved',
      paymentStatus: 'VERIFIED',
      approvedAt: new Date().toISOString(),
      approvedBy: adminUid,
      ...claimedFields
    })
  } catch (err) {
    // Firestore write failed: revert the in-memory mutation and fail
    // closed instead of reporting success.
    if (idx !== -1) {
      memoryBusinessesCache[idx].status = prevStatus as any
      ;(memoryBusinessesCache[idx] as any).paymentStatus = prevPaymentStatus
      memoryBusinessesCache[idx].approvedAt = undefined
      memoryBusinessesCache[idx].approvedBy = undefined
      if (markClaimed) {
        memoryBusinessesCache[idx].isClaimed = false
        memoryBusinessesCache[idx].claim_status = 'unclaimed'
      }
    }
    console.error('approveBusiness: Firestore write failed:', err)
    return false
  }

  return true
}

export async function rejectBusiness(id: string, reason?: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryBusinessesCache.findIndex(b => b.id === id || b.slug.toLowerCase() === norm)
  const prevStatus = idx !== -1 ? memoryBusinessesCache[idx].status : undefined
  const prevReason = idx !== -1 ? (memoryBusinessesCache[idx] as any).rejectionReason : undefined
  if (idx !== -1) {
    memoryBusinessesCache[idx].status = 'rejected'
    memoryBusinessesCache[idx].rejectionReason = reason || 'Does not satisfy business verification requirements.'
  }

  updateStoredCustomBusiness(id, {
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason || 'Does not satisfy business verification requirements.'
  })

  try {
    await updateBusinessInFirestore(id, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || 'Does not satisfy business verification requirements.'
    })
  } catch (err) {
    if (idx !== -1) {
      memoryBusinessesCache[idx].status = prevStatus as any
      ;(memoryBusinessesCache[idx] as any).rejectionReason = prevReason
    }
    console.error('rejectBusiness: Firestore write failed:', err)
    return false
  }

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

  // 1. Live Firestore check for real-time approved status.
  // P1-2: public slug lookup fetches APPROVED listings only.
  try {
    const q = query(collection(db, 'businesses'), where('slug', '==', normalized), where('status', '==', 'approved'), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      const item = normalizeBusinessDoc(docSnap.id, docSnap.data())
      memoryBusinessesCache = [
        item,
        ...memoryBusinessesCache.filter(b => b.slug.toLowerCase() !== normalized && b.id !== item.id)
      ]
      // Every paid plan ($1 Basic, $5 Standard, $10 Authoritative) has a single page.
      if (item.status === 'approved' && !isPakistaniEntity(item) && item.hasSinglePage !== false) {
        return item
      }
      return null
    }

    // Direct doc lookup by ID (public read: approved only)
    try {
      const direct = await getDocs(query(collection(db, 'businesses'), where('id', '==', raw), where('status', '==', 'approved'), limit(1)))
      if (!direct.empty) {
        const item = normalizeBusinessDoc(direct.docs[0].id, direct.docs[0].data())
        if (item.status === 'approved' && !isPakistaniEntity(item) && item.hasSinglePage !== false) {
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
  if (localFound && (localFound.status || 'pending') === 'approved' && !isPakistaniEntity(localFound) && localFound.hasSinglePage !== false) {
    return localFound
  }

  // 3. Memory cache check (with city suffix fallback matching)
  const cached = memoryBusinessesCache.find(b => 
    b.slug.toLowerCase() === normalized || 
    b.id.toLowerCase() === normalized ||
    normalizeSlug(b.name) === normalized ||
    (b.city && `${normalizeSlug(b.name)}-${normalizeSlug(b.city)}` === normalized)
  )
  if (cached && (cached.status || 'pending') === 'approved' && !isPakistaniEntity(cached) && cached.hasSinglePage !== false) {
    return cached
  }

  // 4. Mock businesses check
  const mockFound = MOCK_BUSINESSES.find(b => 
    b.slug.toLowerCase() === normalized || 
    b.id.toLowerCase() === normalized ||
    normalizeSlug(b.name) === normalized ||
    (b.city && `${normalizeSlug(b.name)}-${normalizeSlug(b.city)}` === normalized)
  )
  if (mockFound && (mockFound.status || 'pending') === 'approved' && !isPakistaniEntity(mockFound) && mockFound.hasSinglePage !== false) {
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

  const resolvedPrice = isAuthoritative ? 10 : (isStandard ? 5 : 1)
  const resolvedPlanName = businessData.planName || (isAuthoritative ? '$10 Authoritative Plan' : (isStandard ? '$5 Standard Plan' : '$1 Basic Plan'))
  // Every paid tier gets its dedicated single page — including $1 Basic.
  const resolvedHasSinglePage = businessData.hasSinglePage !== undefined ? businessData.hasSinglePage : true
  const resolvedCanEditProfile = businessData.canEditProfile !== undefined ? businessData.canEditProfile : (isStandard || isAuthoritative)
  const resolvedPostsAllowed = businessData.blog_posts_allowed ?? (isAuthoritative ? 10 : (isStandard ? 5 : 0))
  const resolvedPaymentRef = businessData.payment_reference || businessData.transactionRef || generatePaymentReference()
  // PRICING (b): price and payment state are derived from the plan and
  // the screenshot — never trusted from the caller. The hardened rules
  // allow planPrice only as 1/5/10 and paymentStatus only as a pending
  // value on create; a forged 'VERIFIED'/'PAID' is denied server-side.
  const resolvedPaymentStatus = businessData.paymentScreenshot ? 'PAYMENT_VERIFICATION_PENDING' : 'PENDING_PAYMENT'
  const primaryCity = primaryLoc.city || summaryCity

  // Denormalized fields for future Firestore cursor pagination, persisted
  // on the stored doc (cleanPayload below spreads newBiz). categoryId
  // mirrors the normalizer's derivation exactly (main_category_slug ||
  // categoryId || category) so the stored value equals the read-time
  // value — no filter/render change. citySlugs is computed with the
  // shared helper from the same city fields. Neither field is privileged
  // under firestore.rules (noPrivilegedFieldsOnCreate), so the create
  // is still allowed.
  const resolvedCategoryId = (businessData as any).main_category_slug || businessData.categoryId || sanitizeText(businessData.category, 60) || 'local-services'
  const citySlugs = computeCitySlugs({ city: summaryCity, cities: allCities, locations: inputLocations })

  const newBiz: BusinessItem = {
      id: bizId,
      // Caller identity: the hardened rules require the create to carry
      // the caller's own userId (or matching email) — the form client
      // passes resolvedUserId, so preserve it instead of dropping it.
      userId: businessData.userId || '',
      name: sanitizeText(businessData.name, 120),
      slug,
      category: sanitizeText(businessData.category, 60),
      categoryId: resolvedCategoryId,
      subCategory: businessData.subCategory ? sanitizeText(businessData.subCategory, 60) : undefined,
      subcategory: businessData.subCategory ? sanitizeText(businessData.subCategory, 60) : undefined,
      secondaryCategories: Array.isArray(businessData.secondaryCategories) ? businessData.secondaryCategories : [],
      city: sanitizeText(primaryCity, 60),
      cities: allCities,
      citySlugs,
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
      coverImage: sanitizeImageUrl(businessData.coverImage || ''),
      logo: sanitizeImageUrl(businessData.logo || ''),
      // Photo gallery is a $10 Authoritative benefit only — photos uploaded
      // on $1/$5 plans are not published (the form labels the field as such).
      gallery: isAuthoritative && Array.isArray((businessData as any).gallery) ? (businessData as any).gallery.map((g: any) => sanitizeImageUrl(String(g || ''))).filter(Boolean).slice(0, 5) : [],
      zipCode: sanitizeText((businessData as any).zipCode || (businessData as any).zip || '', 10),
      year_established: (businessData as any).year_established ?? (businessData as any).yearEstablished ?? undefined,
      service_area: (businessData as any).service_area || (businessData as any).serviceArea ? sanitizeText(String((businessData as any).service_area || (businessData as any).serviceArea), 200) : undefined,
      priceRange: businessData.priceRange ? sanitizeText(String(businessData.priceRange), 10) : undefined,
      description: sanitizeText(businessData.description || '', 5000),
      services: Array.isArray(businessData.services) ? businessData.services.map(s => sanitizeText(s, 60)) : [],
      operatingHours: businessData.operatingHours || {},
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

    // Deduplicate base64 screenshot if present in both top-level and paymentDetails to ensure payload < 1MB
    if (cleanPayload.paymentScreenshot && cleanPayload.paymentDetails?.paymentScreenshot) {
      cleanPayload.paymentDetails.paymentScreenshot = 'ATTACHED'
    }

    // P0-3 / hardened rules: a listing is born 'pending' and the create
    // may not carry privileged fields (verified, isFeatured, isClaimed).
    // Strip them from the Firestore payload — they are set only by the
    // admin approve/verify flow. paymentStatus and planPrice are NOT
    // stripped: pricing (b) requires them on the listing (pending values
    // only — the rules allow paymentStatus solely as
    // PAYMENT_VERIFICATION_PENDING / PENDING_PAYMENT and planPrice solely
    // as 5 / 10), and the approve guard reads paymentStatus to enforce
    // verified-payment-only approval. The in-memory object above keeps
    // its local defaults for the dashboard.
    delete cleanPayload.verified
    delete cleanPayload.isClaimed
    delete cleanPayload.isFeatured

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
        // P1-5: surface the persistence failure instead of returning
        // success while nothing was saved server-side.
        console.warn('Firestore addDoc fallback error:', innerErr)
        throw new Error('Business listing could not be saved. Please try again.')
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
  // Photo gallery — $10 Authoritative benefit only. The dashboard edit modal
  // offers it only for $10 listings, and $1 listings cannot edit at all.
  if (Array.isArray((edits as any).gallery)) cleanEdits.gallery = (edits as any).gallery.map((g: any) => sanitizeImageUrl(String(g || ''))).filter(Boolean).slice(0, 5)

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

  // Write first; only cache on success. A denied/failed write now throws
  // instead of reporting success to the contact page.
  await addDoc(collection(db, 'contact_messages'), newMsg)
  memoryContactMessagesCache = [newMsg, ...memoryContactMessagesCache]

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


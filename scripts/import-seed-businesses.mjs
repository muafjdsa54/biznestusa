import fs from 'fs'
import path from 'path'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA1phCIqp4oq5jhOkjoaizLtNfdrHDa51w',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'biznestussa.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'biznestussa',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'biznestussa.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '787556817064',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:787556817064:web:e08dacdb75f3362a0b4a9d'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

function cleanDoc(obj) {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      result[key] = null
    } else {
      result[key] = value
    }
  }
  return result
}

async function runImport() {
  console.log('--- STARTING BIZNESTUSA SEED IMPORT ---')
  const jsonPath = path.resolve('biznestusa-seed-businesses.json')
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath)
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  console.log(`Loaded ${rawData.length} records from ${jsonPath}`)

  // 1. Fetch existing Firestore records to prevent duplicate creation and avoid overwriting user records
  console.log('Fetching existing Firestore business listings...')
  const existingDocsSnap = await getDocs(collection(db, 'businesses'))
  console.log(`Existing Firestore docs count: ${existingDocsSnap.size}`)

  const existingSlugs = new Set()
  const existingNamesInCity = new Set()
  const existingWebsites = new Set()
  const existingPhones = new Set()

  existingDocsSnap.forEach(snap => {
    const data = snap.data()
    if (data.slug) existingSlugs.add(data.slug.toLowerCase().trim())
    if (data.business_slug) existingSlugs.add(data.business_slug.toLowerCase().trim())
    if (data.name && data.city) {
      existingNamesInCity.add(`${data.name.toLowerCase().trim()}:::${data.city.toLowerCase().trim()}`)
    }
    if (data.website) existingWebsites.add(data.website.toLowerCase().trim().replace(/\/+$/, ''))
    if (data.phone) existingPhones.add(data.phone.replace(/[^0-9]/g, ''))
  })

  let importedCount = 0
  let skippedCount = 0
  let duplicateCount = 0
  let invalidCount = 0
  const missingOptionalFields = {
    phone: 0,
    email: 0,
    street_address: 0,
    zip: 0,
    hours: 0,
    year_established: 0,
    social_profiles: 0
  }

  const preparedDocuments = []

  for (const item of rawData) {
    // A. Validation
    if (!item.business_name || !item.business_slug || !item.main_category_slug || !item.subcategory_slug) {
      console.warn(`[INVALID] Missing critical keys for record: ${item.record_id}`)
      invalidCount++
      continue
    }

    if (!item.website_url || !item.website_url.startsWith('http')) {
      console.warn(`[INVALID] Invalid website URL for record: ${item.record_id}`)
      invalidCount++
      continue
    }

    const normSlug = item.business_slug.toLowerCase().trim()
    const normCity = (item.city || '').toLowerCase().trim()
    const nameCityKey = `${item.business_name.toLowerCase().trim()}:::${normCity}`
    const normWebsite = item.website_url.toLowerCase().trim().replace(/\/+$/, '')
    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '')

    // B. Duplicate Detection
    if (existingSlugs.has(normSlug)) {
      console.log(`[DUPLICATE SLUG] Skipping ${item.business_slug} (already in DB)`)
      duplicateCount++
      skippedCount++
      continue
    }

    if (normCity && existingNamesInCity.has(nameCityKey)) {
      console.log(`[DUPLICATE NAME/CITY] Skipping ${item.business_name} in ${item.city}`)
      duplicateCount++
      skippedCount++
      continue
    }

    // Optional fields track
    if (!item.phone) missingOptionalFields.phone++
    if (!item.email) missingOptionalFields.email++
    if (!item.street_address) missingOptionalFields.street_address++
    if (!item.zip) missingOptionalFields.zip++
    if (!item.hours) missingOptionalFields.hours++
    if (!item.year_established) missingOptionalFields.year_established++
    if (!item.social_profiles || item.social_profiles.length === 0) missingOptionalFields.social_profiles++

    // C. Document Construction
    const sourceUrls = [
      item.official_source_url,
      ...(Array.isArray(item.secondary_source_urls) ? item.secondary_source_urls : [])
    ].filter(Boolean)

    const docId = item.record_id || `seed-${normSlug}`

    const businessDoc = cleanDoc({
      id: docId,
      record_id: item.record_id,
      entity_type: item.entity_type || 'business',
      slug: normSlug,
      business_slug: normSlug,
      name: item.business_name,
      business_name: item.business_name,
      category: item.main_category,
      main_category: item.main_category,
      categoryId: item.main_category_slug,
      main_category_slug: item.main_category_slug,
      subcategory: item.subcategory,
      subCategory: item.subcategory,
      subcategory_slug: item.subcategory_slug,
      description: item.longer_factual_description || item.short_description,
      short_description: item.short_description || null,
      longer_factual_description: item.longer_factual_description || null,
      introduction: item.short_description || null,
      website: item.website_url,
      website_url: item.website_url,
      phone: item.phone || null,
      email: item.email || null,
      address: item.street_address || (item.city ? `${item.city}, ${item.state_code || item.state || 'USA'}` : 'United States'),
      street_address: item.street_address || null,
      city: item.city || (item.location_type === 'national' ? 'National' : 'United States'),
      cities: item.city ? [item.city] : [],
      state: item.state || 'USA',
      state_code: item.state_code || null,
      province: item.state || 'USA',
      zip: item.zip || null,
      zipCode: item.zip || null,
      country: item.country || 'US',
      service_area: item.service_area || null,
      hours: item.hours || null,
      operatingHours: item.hours ? { 'General Hours': item.hours } : { 'Monday - Saturday': '09:00 AM - 06:00 PM', 'Sunday': 'Closed' },
      services: Array.isArray(item.services) && item.services.length > 0 ? item.services : ['Professional Services'],
      social_profiles: Array.isArray(item.social_profiles) && item.social_profiles.length > 0 ? item.social_profiles : null,
      // Source & Provenance
      source_type: 'seed_research',
      claim_status: 'unclaimed',
      ownership_status: 'directory_seed',
      account_id: null,
      created_by: 'biznestusa_seed_import',
      source_urls: sourceUrls,
      official_source_url: item.official_source_url || item.website_url,
      secondary_source_urls: item.secondary_source_urls || [],
      source_checked_date: item.source_checked_date || '2026-10-05',
      source_notes: item.source_notes || null,
      data_quality_notes: item.data_quality_notes || null,
      verification_confidence: item.verification_confidence || 'medium',
      professional_title: item.professional_title || null,
      organization: item.organization || null,
      year_established: item.year_established || null,
      location_type: item.location_type || 'local',
      candidate_status: 'accepted',
      // Status & Features
      status: 'approved',
      hasSinglePage: true,
      canEditProfile: false,
      isClaimed: false,
      verified: false,
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      faqs: [],
      plan: 'priority_5',
      planName: 'Directory Seed Listing',
      planPrice: 0,
      paymentStatus: 'VERIFIED',
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      logo: (item.logo_url || '').trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      created_at: '2026-10-05T00:00:00.000Z',
      updated_at: '2026-10-05T00:00:00.000Z',
      submittedAt: '2026-10-05T00:00:00.000Z',
      approvedAt: '2026-10-05T00:00:00.000Z',
      approvedBy: 'biznestusa_seed_import'
    })

    preparedDocuments.push({ docId, data: businessDoc })
    existingSlugs.add(normSlug)
    if (normCity) existingNamesInCity.add(nameCityKey)
    if (normWebsite) existingWebsites.add(normWebsite)
    if (cleanPhone) existingPhones.add(cleanPhone)
  }

  console.log(`Writing ${preparedDocuments.length} seed business records to Firestore...`)
  // Batch write with concurrency control
  const batchSize = 10
  for (let i = 0; i < preparedDocuments.length; i += batchSize) {
    const chunk = preparedDocuments.slice(i, i + batchSize)
    await Promise.all(chunk.map(async ({ docId, data }) => {
      try {
        const ref = doc(db, 'businesses', docId)
        await setDoc(ref, data)
        importedCount++
      } catch (err) {
        console.error(`Failed to write doc ${docId}:`, err.message)
        skippedCount++
      }
    }))
    process.stdout.write(`Imported ${Math.min(i + batchSize, preparedDocuments.length)} / ${preparedDocuments.length}...\r`)
  }

  console.log('\n\n========================================')
  console.log('      BIZNESTUSA IMPORT REPORT')
  console.log('========================================')
  console.log(`Total Candidates Evaluated : ${rawData.length}`)
  console.log(`Imported                   : ${importedCount}`)
  console.log(`Skipped                    : ${skippedCount}`)
  console.log(`Duplicates                 : ${duplicateCount}`)
  console.log(`Invalid                    : ${invalidCount}`)
  console.log('Missing Optional Fields    :', JSON.stringify(missingOptionalFields, null, 2))
  console.log('========================================\n')

  process.exit(0)
}

runImport().catch(err => {
  console.error('Fatal import error:', err)
  process.exit(1)
})

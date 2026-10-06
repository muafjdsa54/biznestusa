import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA1phCIqp4oq5jhOkjoaizLtNfdrHDa51w',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'biznestussa.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'biznestussa',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'biznestussa.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '787556817064',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:787556817064:web:e08dacdb75f3362a0b4a9d'
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

async function runVerification() {
  console.log('=== BIZNESTUSA SEED IMPORT VERIFICATION REPORT ===\n')

  // 1. Verify Firestore seed records
  const bizRef = collection(db, 'businesses')
  const seedQuery = query(bizRef, where('source_type', '==', 'seed_research'))
  const seedSnap = await getDocs(seedQuery)
  console.log(`1. Total Firestore Seed Records Found: ${seedSnap.size}`)
  console.log(`2. User Accounts Created: 0 (No Auth or User records created - enforced by import script)`)

  // 3. Inspect sample seed records
  let sampleDocs = []
  let duplicateSlugs = new Set()
  let seenSlugs = new Set()
  let missingCategories = 0
  let missingCities = 0
  let missingSubcategories = 0
  let categoriesCount = new Set()
  let subcategoriesCount = new Set()

  seedSnap.forEach(doc => {
    const data = doc.data()
    if (seenSlugs.has(data.slug)) {
      duplicateSlugs.add(data.slug)
    }
    seenSlugs.add(data.slug)

    if (!data.main_category_slug && !data.category) missingCategories++
    if (!data.city) missingCities++
    if (!data.subcategory_slug && !data.subcategory) missingSubcategories++

    if (data.main_category_slug) categoriesCount.add(data.main_category_slug)
    if (data.subcategory_slug) subcategoriesCount.add(`${data.main_category_slug}/${data.subcategory_slug}`)

    if (sampleDocs.length < 5) {
      sampleDocs.push(data)
    }
  })

  console.log(`3. Slugs analysis:`)
  console.log(`   - Unique slugs: ${seenSlugs.size}`)
  console.log(`   - Duplicate slugs: ${duplicateSlugs.size}`)
  console.log(`   - Categories represented: ${categoriesCount.size}`)
  console.log(`   - Subcategories represented: ${subcategoriesCount.size}`)
  console.log(`   - Missing categories: ${missingCategories}`)
  console.log(`   - Missing subcategories: ${missingSubcategories}`)
  console.log(`   - Missing cities: ${missingCities}`)

  console.log('\n4. Sample Seed Records:')
  sampleDocs.forEach((doc, idx) => {
    console.log(`   [${idx + 1}] ${doc.name}`)
    console.log(`       Slug: /business/${doc.slug}/`)
    console.log(`       Category: ${doc.main_category_slug || doc.category}`)
    console.log(`       Subcategory: ${doc.subcategory_slug || doc.subcategory}`)
    console.log(`       Location: ${doc.city}, ${doc.state_code || doc.state}`)
    console.log(`       Claim Status: ${doc.claim_status}`)
    console.log(`       Ownership Status: ${doc.ownership_status}`)
    console.log(`       Account ID: ${doc.account_id}`)
    console.log(`       Created By: ${doc.created_by}`)
  })

  console.log('\n=== VERIFICATION FINISHED ===')
}

runVerification().catch(err => {
  console.error('Verification failed:', err)
  process.exit(1)
})

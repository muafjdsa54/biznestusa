import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

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

async function testRead() {
  const snap = await getDocs(collection(db, 'businesses'))
  console.log('Total businesses in collection:', snap.size)

  let seedCount = 0
  let claimedCount = 0
  let approvedCount = 0

  snap.forEach(d => {
    const data = d.data()
    if (data.source_type === 'seed_research') seedCount++
    if (data.isClaimed || data.claim_status === 'claimed') claimedCount++
    if (data.status === 'approved') approvedCount++
  })

  console.log('Seed records count:', seedCount)
  console.log('Claimed records count:', claimedCount)
  console.log('Approved records count:', approvedCount)

  const automotiveQuery = query(collection(db, 'businesses'), where('main_category_slug', '==', 'automotive'))
  const autoSnap = await getDocs(automotiveQuery)
  console.log('Automotive category businesses count:', autoSnap.size)

  const autoRepairQuery = query(
    collection(db, 'businesses'),
    where('main_category_slug', '==', 'automotive'),
    where('subcategory_slug', '==', 'auto-repair')
  )
  const autoRepairSnap = await getDocs(autoRepairQuery)
  console.log('Automotive -> Auto Repair businesses count:', autoRepairSnap.size)
  autoRepairSnap.forEach(d => {
    const data = d.data()
    console.log(`- ${data.business_name} (${data.business_slug}) in ${data.city}, ${data.state_code}`)
  })

  process.exit(0)
}

testRead().catch(e => { console.error(e); process.exit(1); })

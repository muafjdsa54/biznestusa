import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA1phCIqp4oq5jhOkjoaizLtNfdrHDa51w',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'biznestussa.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'biznestussa',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'biznestussa.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '787556817064',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:787556817064:web:e08dacdb75f3362a0b4a9d'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample compact base64 receipt screenshot (~2KB)
const SAMPLE_RECEIPT_SCREENSHOT = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function run() {
  console.log('=== CREATING DUMMY USER & DUMMY BUSINESS ===\n');

  const testEmail = `testuser.${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let userId = 'user-test-' + Date.now();

  // 1. Create dummy user in Firebase Auth
  console.log('1. Attempting to create user in Firebase Auth...');
  try {
    const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    userId = cred.user.uid;
    console.log(`   SUCCESS: Firebase Auth user created!`);
    console.log(`   - UID: ${userId}`);
    console.log(`   - Email: ${testEmail}`);
  } catch (authErr) {
    console.warn(`   Auth notice (using generated UID): ${authErr.message}`);
  }

  // 2. Create dummy business with screenshot attached
  const bizId = `biz-pending-test-${Date.now()}`;
  const bizSlug = `summit-peak-roofing-dallas-${Date.now().toString().slice(-4)}`;
  const paymentRef = `BNUSA-PAY-${Date.now().toString().slice(-6)}`;

  console.log('\n2. Creating dummy business in Firestore with screenshot...');
  const businessDoc = {
    id: bizId,
    name: 'Summit Peak Roofing & Remodeling (TEST DUMMY)',
    businessName: 'Summit Peak Roofing & Remodeling (TEST DUMMY)',
    slug: bizSlug,
    business_slug: bizSlug,
    category: 'Home Services',
    main_category: 'Home Services',
    categoryId: 'home-services',
    main_category_slug: 'home-services',
    subcategory: 'Roofer',
    subCategory: 'Roofer',
    subcategory_slug: 'roofer',
    city: 'Dallas',
    cities: ['Dallas'],
    state: 'Texas',
    state_code: 'TX',
    address: '4500 Elm Street, Suite 200, Dallas, TX 75201',
    street_address: '4500 Elm Street, Suite 200',
    zipCode: '75201',
    country: 'US',
    ownerName: 'Alex Turner (Test User)',
    userId: userId,
    phone: '+1 (214) 555-0188',
    email: testEmail,
    website: 'https://summitpeakroofing-test.com',
    description: 'Summit Peak Roofing provides residential and commercial roofing inspections, leak repairs, and roof replacements across the Dallas-Fort Worth metroplex.',
    services: ['Roof Inspection', 'Shingle Replacement', 'Storm Damage Repair', 'Commercial Roofing'],
    operatingHours: {
      'Monday - Friday': '08:00 AM - 06:00 PM',
      'Saturday': '09:00 AM - 02:00 PM',
      'Sunday': 'Closed'
    },
    // PENDING STATUS & PAYMENT PROOF
    status: 'pending',
    paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
    paymentScreenshot: SAMPLE_RECEIPT_SCREENSHOT,
    transactionRef: paymentRef,
    payment_reference: paymentRef,
    payment_provider: 'payoneer',
    plan: 'priority_5',
    planName: '$5 Standard Plan',
    planPrice: 5,
    hasSinglePage: true,
    canEditProfile: true,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    paymentSubmittedAt: new Date().toISOString(),
    paymentDetails: {
      plan: 'priority_5',
      amount: 5,
      paymentMethod: 'Payoneer',
      referenceNumber: paymentRef,
      paymentScreenshot: SAMPLE_RECEIPT_SCREENSHOT,
      paymentDate: new Date().toISOString(),
      customerNote: 'Test dummy business payment screenshot submission'
    }
  };

  const docRef = doc(db, 'businesses', bizId);
  await setDoc(docRef, businessDoc);
  console.log(`   SUCCESS: Business document created in Firestore!`);
  console.log(`   - Document ID: /businesses/${bizId}`);
  console.log(`   - Business Name: ${businessDoc.name}`);
  console.log(`   - Status: ${businessDoc.status}`);
  console.log(`   - Payment Status: ${businessDoc.paymentStatus}`);
  console.log(`   - Screenshot attached: YES (length: ${SAMPLE_RECEIPT_SCREENSHOT.length} bytes)`);

  // 3. Verify in Firestore
  console.log('\n3. Verifying retrieval from Firestore...');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    console.log(`   SUCCESS: Retrieved from Firestore!`);
    console.log(`   - Status in DB: ${data.status}`);
    console.log(`   - Payment Status in DB: ${data.paymentStatus}`);
    console.log(`   - Has Screenshot in DB: ${Boolean(data.paymentScreenshot)}`);
  } else {
    console.error('   FAIL: Doc not found in Firestore!');
  }

  // 4. Verify Admin pending filter match
  console.log('\n4. Checking Admin Panel pending query match:');
  const allSnap = await getDocs(collection(db, 'businesses'));
  let foundInPending = false;
  allSnap.forEach(d => {
    if (d.id === bizId) {
      const data = d.data();
      const s = (data.status || '').toLowerCase().trim();
      const ps = (data.paymentStatus || '').toUpperCase().trim();
      const matches = s === 'pending' || s === 'pending_approval' || (ps === 'PENDING' && s !== 'rejected') || ps === 'PAYMENT_VERIFICATION_PENDING';
      if (matches) foundInPending = true;
      console.log(`   - Business ID: ${d.id}`);
      console.log(`   - Match for Admin Pending Tab: ${matches ? 'YES (Will appear in Pending Tab)' : 'NO'}`);
    }
  });

  console.log('\n=== DUMMY CREATION COMPLETED ===\n');
  console.log('You can now log in to the Admin Panel at /admin');
  console.log(`Look under "Pending Businesses" tab for: "${businessDoc.name}"`);
  console.log(`Document ID for later deletion: ${bizId}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

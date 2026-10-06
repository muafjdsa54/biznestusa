import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';

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

// Test saving a dummy business directly to Firestore
async function testSave() {
  console.log('--- Testing Firestore Direct Write to /businesses ---');
  const testId = 'biz-test-dummy-' + Date.now();
  const dummyPayload = {
    id: testId,
    name: 'Apex Precision Auto Care',
    businessName: 'Apex Precision Auto Care',
    slug: 'apex-precision-auto-care-dallas',
    category: 'Automotive',
    categoryId: 'automotive',
    subCategory: 'Auto Repair',
    subcategory: 'Auto Repair',
    city: 'Dallas',
    cities: ['Dallas'],
    state: 'Texas',
    address: '1234 Main St, Dallas, TX 75201',
    ownerName: 'John Doe',
    email: 'johndoe.test@example.com',
    phone: '+1 (214) 555-0199',
    website: 'https://apexautocaredallas.com',
    description: 'Premier automotive repair and diagnostics center in Dallas, TX.',
    services: ['Brake Repair', 'Oil Change', 'Engine Diagnostics'],
    status: 'pending',
    paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
    plan: 'priority_5',
    planName: '$5 Standard Plan',
    planPrice: 5,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    // Sample base64 screenshot
    paymentScreenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    paymentDetails: {
      plan: 'priority_5',
      amount: 5,
      paymentMethod: 'Payoneer',
      referenceNumber: 'BNUSA-2026-999888',
      paymentScreenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      paymentDate: new Date().toISOString()
    }
  };

  try {
    const docRef = doc(db, 'businesses', testId);
    await setDoc(docRef, dummyPayload);
    console.log('SUCCESS: Written test doc to Firestore /businesses/' + testId);

    // Verify it can be read back
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      console.log('SUCCESS: Read back test doc from Firestore! Status:', snap.data().status);
    } else {
      console.error('FAIL: Doc does not exist after write!');
    }
  } catch (err) {
    console.error('ERROR writing to Firestore:', err);
  }

  process.exit(0);
}

testSave();

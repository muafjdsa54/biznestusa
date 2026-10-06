import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';

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

// Generate dummy base64 string of specified size in KB
function makeBase64(sizeKb) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let str = 'data:image/jpeg;base64,';
  const targetLen = sizeKb * 1024;
  while (str.length < targetLen) {
    str += chars.repeat(10);
  }
  return str.slice(0, targetLen);
}

async function testSizes() {
  const sizes = [100, 300, 600, 1000, 1500];
  for (const s of sizes) {
    console.log(`\nTesting payload with ${s}KB screenshot...`);
    const testId = `biz-size-test-${s}-${Date.now()}`;
    const b64 = makeBase64(s);
    const payload = {
      id: testId,
      name: `Size Test ${s}KB`,
      businessName: `Size Test ${s}KB`,
      slug: `size-test-${s}-${Date.now()}`,
      category: 'Automotive',
      categoryId: 'automotive',
      city: 'Dallas',
      cities: ['Dallas'],
      status: 'pending',
      paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
      paymentScreenshot: b64,
      paymentDetails: {
        paymentScreenshot: b64
      }
    };
    try {
      const docRef = doc(db, 'businesses', testId);
      await setDoc(docRef, payload);
      console.log(`SUCCESS: ${s}KB doc created in Firestore!`);
    } catch (err) {
      console.error(`FAILED: ${s}KB write failed! Code: ${err.code}, Message: ${err.message}`);
    }
  }
  process.exit(0);
}

testSizes();

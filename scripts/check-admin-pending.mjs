import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
const normalizeBusinessDoc = (id, data) => ({ id, ...data });

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

async function checkPending() {
  const snap = await getDocs(collection(db, 'businesses'));
  const allBusinesses = [];
  snap.forEach(d => {
    allBusinesses.push(normalizeBusinessDoc(d.id, d.data()));
  });

  const pendingListings = allBusinesses.filter(b => {
    const s = (b.status || '').toLowerCase().trim();
    const ps = (b.paymentStatus || '').toUpperCase().trim();
    return s === 'pending' || s === 'pending_approval' || (ps === 'PENDING' && s !== 'rejected') || ps === 'PAYMENT_VERIFICATION_PENDING' || ps === 'SUBMITTED';
  });

  console.log('Total businesses in collection:', allBusinesses.length);
  console.log('Total pending businesses in admin filter:', pendingListings.length);
  console.log('\nPending businesses list:');
  pendingListings.forEach((b, i) => {
    console.log(`[${i+1}] ${b.name} (${b.id})`);
    console.log(`    Status: ${b.status} | Payment: ${b.paymentStatus} | Has Proof: ${Boolean(b.paymentScreenshot)}`);
  });

  process.exit(0);
}

checkPending();

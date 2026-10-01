import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR9gjxmjYsO_kmHOp_qX4tfoPyJU5tQmg",
  authDomain: "branches-app-7669d.firebaseapp.com",
  projectId: "branches-app-7669d",
  storageBucket: "branches-app-7669d.firebasestorage.app",
  messagingSenderId: "507847972478",
  appId: "1:507847972478:web:b9d8c79d50a85a253cea2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PAKISTANI_KEYWORDS = [
  'pakistan', 'pakistani', 'karachi', 'lahore', 'islamabad', 'rawalpindi', 
  'faisalabad', 'multan', 'peshawar', 'sialkot', 'quetta', 'hyderabad', 
  'gujranwala', 'sargodha', 'pkr', 'punjab, pakistan'
];

async function verify() {
  console.log("=== VERIFYING FIRESTORE CURRENT STATE ===");
  for (const col of ['businesses', 'professionals', 'jobs']) {
    const snap = await getDocs(collection(db, col));
    console.log(`\nCollection '${col}' (total: ${snap.size}):`);
    snap.forEach(d => {
      const data = d.data();
      const serialized = JSON.stringify(data).toLowerCase();
      const hasPk = PAKISTANI_KEYWORDS.some(k => serialized.includes(k));
      console.log(` - [${hasPk ? 'FAIL: PK FOUND' : 'PASS: US'}] ${data.name || data.title} (${data.city}, ${data.state || data.country}) -> slug: ${data.slug || data.username}`);
    });
  }
  process.exit(0);
}

verify();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";
import path from "path";

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

async function dumpAll() {
  const result = {};
  const collections = ['businesses', 'professionals', 'jobs'];
  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    result[col] = [];
    snap.forEach(d => {
      result[col].push({ id: d.id, ...d.data() });
    });
  }
  fs.writeFileSync(path.join(process.cwd(), "scripts", "all-db-dump.json"), JSON.stringify(result, null, 2));
  console.log(`Dumped:`);
  console.log(`- Businesses: ${result.businesses.length}`);
  console.log(`- Professionals: ${result.professionals.length}`);
  console.log(`- Jobs: ${result.jobs.length}`);
  process.exit(0);
}

dumpAll().catch(e => { console.error(e); process.exit(1); });

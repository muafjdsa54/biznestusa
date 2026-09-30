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

async function inspect() {
  const collections = ['businesses', 'professionals', 'jobs', 'companies'];
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    console.log(`\n=== FIRESTORE COLLECTION: ${colName} (${snap.size} docs) ===`);
    snap.forEach(doc => {
      const d = doc.data();
      const name = d.name || d.fullName || d.title || d.companyName || doc.id;
      const desc = d.description || d.bio || d.about || '';
      const wordCount = desc.trim().split(/\s+/).filter(Boolean).length;
      console.log(`- [${doc.id}] "${name}" | Words: ${wordCount} | slug: ${d.slug || d.username || 'no-slug'}`);
    });
  }

  console.log(`\n=== LOCAL lib/data.ts ===`);
  console.log(`MOCK_BUSINESSES: ${MOCK_BUSINESSES.length}`);
  console.log(`MOCK_COMPANIES: ${MOCK_COMPANIES.length}`);
  console.log(`MOCK_JOBS: ${MOCK_JOBS.length}`);
  console.log(`MOCK_PROFESSIONALS: ${MOCK_PROFESSIONALS.length}`);
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});

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

async function fetchAll() {
  try {
    const snap = await getDocs(collection(db, "businesses"));
    console.log("Total docs in Firestore 'businesses':", snap.size);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | Name: ${data.name || data.businessName} | Slug: ${data.slug}`);
    });
    process.exit(0);
  } catch (err) {
    console.error("Error fetching docs:", err);
    process.exit(1);
  }
}

fetchAll();

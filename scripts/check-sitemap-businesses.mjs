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

async function checkSitemapBusinesses() {
  try {
    const snap = await getDocs(collection(db, "businesses"));
    console.log(`Total businesses in Firestore: ${snap.size}`);
    let approvedCount = 0;
    snap.forEach(d => {
      const data = d.data();
      if ((data.status || 'approved') === 'approved') {
        approvedCount++;
        console.log(`- https://www.listpak.com/business/${data.slug}`);
      }
    });
    console.log(`\nTotal approved businesses accessible for sitemap: ${approvedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkSitemapBusinesses();

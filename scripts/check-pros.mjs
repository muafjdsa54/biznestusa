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

async function checkPros() {
  const snap = await getDocs(collection(db, "professionals"));
  snap.forEach(d => {
    const data = d.data();
    const bioW = (data.bio || '').trim().split(/\s+/).filter(Boolean).length;
    const aboutW = (data.about || '').trim().split(/\s+/).filter(Boolean).length;
    const descW = (data.description || '').trim().split(/\s+/).filter(Boolean).length;
    console.log(`[${d.id}] ${data.name} | Bio: ${bioW} | About: ${aboutW} | Desc: ${descW} | Total Bio+About: ${bioW + aboutW}`);
  });
  process.exit(0);
}

checkPros().catch(e => { console.error(e); process.exit(1); });

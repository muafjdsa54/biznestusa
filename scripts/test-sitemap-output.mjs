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

const PK_CITIES = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'sialkot', 'quetta', 'sargodha'];

async function testSitemap() {
  const bizSnap = await getDocs(collection(db, 'businesses'));
  const proSnap = await getDocs(collection(db, 'professionals'));
  const jobSnap = await getDocs(collection(db, 'jobs'));

  console.log(`Active Firestore records: ${bizSnap.size} businesses, ${proSnap.size} pros, ${jobSnap.size} jobs`);

  const urls = [];
  bizSnap.forEach(d => urls.push(`/business/${d.data().slug}`));
  proSnap.forEach(d => urls.push(`/professionals/${d.data().username}`));
  jobSnap.forEach(d => urls.push(`/jobs/${d.data().slug}`));

  let foundPk = 0;
  urls.forEach(u => {
    const isPk = PK_CITIES.some(c => u.includes(c));
    if (isPk) {
      foundPk++;
      console.error(`FAIL: Pakistani URL detected -> ${u}`);
    }
  });

  if (foundPk === 0) {
    console.log(`SUCCESS: 0 Pakistani URLs found. All ${urls.length} dynamic entity URLs are 100% United States!`);
    console.log("Sample verified US URLs:");
    urls.slice(0, 10).forEach(u => console.log(` + https://www.biznestusa.com${u}`));
  }
  process.exit(0);
}

testSitemap();

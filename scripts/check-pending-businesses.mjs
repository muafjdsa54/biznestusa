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

async function checkPending() {
  const snap = await getDocs(collection(db, 'businesses'));
  console.log('Total businesses in Firestore:', snap.size);
  
  const all = [];
  snap.forEach(d => {
    const data = d.data();
    all.push({
      id: d.id,
      name: data.name || data.businessName || 'Unnamed',
      slug: data.slug || '',
      category: data.category || '',
      city: data.city || '',
      status: data.status || '',
      paymentStatus: data.paymentStatus || '',
      hasScreenshot: Boolean(data.paymentScreenshot || data.paymentProof || data.screenshotUrl || data.proofDoc || data.paymentDetails?.paymentScreenshot),
      paymentMethod: data.paymentMethod || data.paymentDetails?.paymentMethod || '',
      ref: data.paymentReference || data.referenceNumber || data.transactionRef || data.paymentDetails?.referenceNumber || '',
      owner: data.ownerName || data.fullName || '',
      phone: data.phone || '',
      email: data.email || '',
      submittedAt: data.submittedAt || data.createdAt || '',
      approvedAt: data.approvedAt || ''
    });
  });

  const pending = all.filter(b => (b.status || '').toLowerCase() === 'pending' || b.paymentStatus === 'PENDING');
  const rejected = all.filter(b => (b.status || '').toLowerCase() === 'rejected');
  const approved = all.filter(b => (b.status || '').toLowerCase() === 'approved');

  console.log('\n=== FIRESTORE BUSINESS STATUS SUMMARY ===');
  console.log(`Total Records: ${all.length}`);
  console.log(`- Pending Review: ${pending.length}`);
  console.log(`- Approved & Live: ${approved.length}`);
  console.log(`- Rejected: ${rejected.length}`);

  console.log('\n=== USER SUBMITTED BUSINESS LISTINGS ===');
  const userSubmissions = all.filter(b => b.id.startsWith('biz-178') || b.status === 'pending' || b.status === 'rejected' || b.hasScreenshot || b.paymentStatus);
  console.log(`Total user submitted / dynamic listings: ${userSubmissions.length}`);
  
  userSubmissions.forEach((b, idx) => {
    console.log(`\n[#${idx + 1}] ${b.name} (${b.category} • ${b.city})`);
    console.log(`    Doc ID: ${b.id}`);
    console.log(`    Slug: ${b.slug}`);
    console.log(`    Status: "${b.status}" | Payment Status: "${b.paymentStatus || 'N/A'}"`);
    console.log(`    Payment Proof Attached: ${b.hasScreenshot ? 'YES (Screenshot Available)' : 'NO'}`);
    if (b.paymentMethod || b.ref) {
      console.log(`    Payment Method: ${b.paymentMethod} | Ref / TID: ${b.ref}`);
    }
    console.log(`    Owner: ${b.owner} | Phone: ${b.phone} | Email: ${b.email}`);
    console.log(`    Submitted: ${b.submittedAt || 'N/A'}`);
  });

  process.exit(0);
}

checkPending().catch(err => {
  console.error(err);
  process.exit(1);
});

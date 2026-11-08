// fix-live-seeds-2026-11-08.mjs
// Live Firestore data fixes for BizNestUSA (project biznestussa).
// READ-ONLY in --dry-run mode. Real mode:
//  (a) deleteField() the INVENTED operatingHours on docs whose repo JSON
//      record has no real hours (never touches the 35 with real hours);
//  (b) updateDoc() the 8 corrected old seeds with corrected fields only;
//  (c) setDoc() the 70 entity_type='professional' records into the
//      professionals collection (businesses docs are NOT deleted).
// Config: NEXT_PUBLIC_FIREBASE_* from process env (from HEAD:vercel.json);
// fallbacks mirror scripts/import-seed-businesses.mjs. Never writes keys.
import fs from 'fs'
import path from 'path'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteField } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA1phCIqp4oq5jhOkjoaizLtNfdrHDa51w',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'biznestussa.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'biznestussa',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'biznestussa.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '787556817064',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:787556817064:web:e08dacdb75f3362a0b4a9d'
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const DRY_RUN = process.argv.includes('--dry-run')
const INVENTED_HOURS = { 'Monday - Saturday': '09:00 AM - 06:00 PM', 'Sunday': 'Closed' }
const CORRECTED_SLUGS = [
  'olive-and-june',
  'john-byers',
  'david-stark-design-and-production',
  'caitlin-polistena-md-chelmsford-ma',
  'molly-maid',
  'comgroup',
  'katherine-michel',
  'rosine-saghian'
]

function normalizeSlug(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}
// Mirrors lib/professional-service.ts generateProfessionalSlug:
// name only, + city when exactly 1 valid city.
function generateProfessionalSlug(name, cities) {
  const validCities = (cities || []).map(c => (c || '').trim()).filter(Boolean)
    .filter(c => !['all cities', 'nationwide', 'united states', 'usa'].includes(c.toLowerCase()))
  let nameNorm = normalizeSlug(name)
  if (validCities.length === 1) {
    const cityNorm = normalizeSlug(validCities[0])
    if (cityNorm) {
      if (nameNorm.endsWith(`-in-${cityNorm}`)) nameNorm = nameNorm.slice(0, -(4 + cityNorm.length)).replace(/-+$/, '')
      else if (nameNorm.endsWith(`-${cityNorm}`)) nameNorm = nameNorm.slice(0, -(1 + cityNorm.length)).replace(/-+$/, '')
      return `${nameNorm || normalizeSlug(name)}-${cityNorm}`
    }
  }
  return nameNorm || normalizeSlug(name) || 'professional'
}

function cleanDoc(obj) {
  const r = {}
  for (const [k, v] of Object.entries(obj)) r[k] = v === undefined ? null : v
  return r
}
// Expected live doc, built EXACTLY as scripts/import-seed-businesses.mjs builds it.
function buildExpectedDoc(item) {
  const normSlug = (item.business_slug || '').toLowerCase().trim()
  const docId = item.record_id || `seed-${normSlug}`
  const sourceUrls = [item.official_source_url, ...(Array.isArray(item.secondary_source_urls) ? item.secondary_source_urls : [])].filter(Boolean)
  return {
    docId,
    data: cleanDoc({
      id: docId, record_id: item.record_id, entity_type: item.entity_type || 'business',
      slug: normSlug, business_slug: normSlug, name: item.business_name, business_name: item.business_name,
      category: item.main_category, main_category: item.main_category, categoryId: item.main_category_slug,
      main_category_slug: item.main_category_slug, subcategory: item.subcategory, subCategory: item.subcategory,
      subcategory_slug: item.subcategory_slug,
      description: item.longer_factual_description || item.short_description,
      short_description: item.short_description || null, longer_factual_description: item.longer_factual_description || null,
      introduction: item.short_description || null, website: item.website_url, website_url: item.website_url,
      phone: item.phone || null, email: item.email || null,
      address: item.street_address || (item.city ? `${item.city}, ${item.state_code || item.state || 'USA'}` : 'United States'),
      street_address: item.street_address || null,
      city: item.city || (item.location_type === 'national' ? 'National' : 'United States'),
      cities: item.city ? [item.city] : [], state: item.state || 'USA', state_code: item.state_code || null,
      province: item.state || 'USA', zip: item.zip || null, zipCode: item.zip || null, country: item.country || 'US',
      service_area: item.service_area || null, hours: item.hours || null,
      ...(item.hours ? { operatingHours: { 'General Hours': item.hours } } : {}),
      services: Array.isArray(item.services) && item.services.length > 0 ? item.services : [],
      social_profiles: Array.isArray(item.social_profiles) && item.social_profiles.length > 0 ? item.social_profiles : null,
      source_type: 'seed_research', claim_status: 'unclaimed', ownership_status: 'directory_seed', account_id: null,
      created_by: 'biznestusa_seed_import', source_urls: sourceUrls,
      official_source_url: item.official_source_url || item.website_url, secondary_source_urls: item.secondary_source_urls || [],
      source_checked_date: item.source_checked_date || '2026-10-05', source_notes: item.source_notes || null,
      data_quality_notes: item.data_quality_notes || null, verification_confidence: item.verification_confidence || 'medium',
      professional_title: item.professional_title || null, organization: item.organization || null,
      year_established: item.year_established || null, location_type: item.location_type || 'local', candidate_status: 'accepted',
      status: 'approved', hasSinglePage: true, canEditProfile: false, isClaimed: false, verified: false, isFeatured: false,
      rating: 0, reviewCount: 0, reviews: [], faqs: [], plan: 'priority_5', planName: 'Directory Seed Listing',
      planPrice: 0, paymentStatus: 'VERIFIED',
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      logo: (item.logo_url || '').trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      created_at: '2026-10-05T00:00:00.000Z', updated_at: '2026-10-05T00:00:00.000Z',
      submittedAt: '2026-10-05T00:00:00.000Z', approvedAt: '2026-10-05T00:00:00.000Z', approvedBy: 'biznestusa_seed_import'
    })
  }
}

function isInventedHours(v) {
  return v && typeof v === 'object' && !Array.isArray(v) &&
    v['Monday - Saturday'] === INVENTED_HOURS['Monday - Saturday'] && v['Sunday'] === INVENTED_HOURS['Sunday'] &&
    Object.keys(v).length === 2
}
function canon(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o = {}
    for (const k of Object.keys(v).sort()) o[k] = canon(v[k])
    return o
  }
  if (Array.isArray(v)) return v.map(canon)
  return v
}
const same = (a, b) => JSON.stringify(canon(a ?? null)) === JSON.stringify(canon(b ?? null))

function buildProfessionalDoc(item, businessDocId, username) {
  const desc = item.longer_factual_description || item.short_description || ''
  const profession = item.subcategory || item.main_category || 'Specialist'
  return {
    id: username, userId: '', username, slug: username,
    name: item.business_name, fullName: item.business_name,
    title: item.professional_title || profession,
    profession, category: item.main_category || 'Professional / Job Seeker',
    specialization: item.subcategory || profession,
    city: item.city || '', state: item.state || '', province: item.state || '', country: 'United States',
    address: item.street_address || (item.city ? `${item.city}, ${item.state || 'USA'}` : ''),
    rating: 0, reviewCount: 0, hourlyRate: 'Contact for Pricing', availability: 'Available',
    gender: '', avatar: '', coverImage: '',
    bio: desc || 'Verified professional profile on BizNestUSA.',
    about: desc || '',
    skills: Array.isArray(item.services) && item.services.length > 0 ? item.services : [profession],
    experienceYears: 0, verified: false, isFeatured: false,
    status: 'approved', profileStatus: 'APPROVED', verificationStatus: 'UNVERIFIED',
    verificationRequestStatus: 'NOT_REQUESTED',
    submittedAt: '2026-10-05T00:00:00.000Z', approvedAt: '2026-10-05T00:00:00.000Z', approvedBy: 'biznestusa_seed_import',
    phone: item.phone || '', email: item.email || '', whatsapp: '', website: item.website_url || '',
    portfolio: '', resumeUrl: '', currentCompany: item.organization || '',
    education: [], certifications: [], languages: [], previousExperience: [], servicesOffered: [],
    reviews: [], faqs: [],
    // Provenance (so the migration is traceable; businesses doc NOT deleted)
    source_business_doc_id: businessDocId, source_record_id: item.record_id || null,
    entity_type: 'professional', migrated_from: 'businesses', migratedAt: new Date().toISOString()
  }
}

async function main() {
  console.log(`--- FIX LIVE SEEDS 2026-11-08 (${DRY_RUN ? 'DRY RUN — no writes' : 'REAL RUN'}) ---`)
  const raw = JSON.parse(fs.readFileSync(path.resolve('biznestusa-seed-businesses.json'), 'utf8'))
  console.log(`Repo JSON records: ${raw.length} (real hours: ${raw.filter(r => r.hours).length}, no hours: ${raw.filter(r => !r.hours).length}, professional: ${raw.filter(r => r.entity_type === 'professional').length})`)
  const bySlug = new Map(raw.map(r => [(r.business_slug || '').toLowerCase().trim(), r]))
  const byRecordId = new Map(raw.map(r => [r.record_id, r]))

  const bizSnap = await getDocs(collection(db, 'businesses'))
  const proSnapBefore = await getDocs(collection(db, 'professionals'))
  console.log(`Live businesses docs: ${bizSnap.size}; live professionals docs BEFORE: ${proSnapBefore.size}`)
  const existingProIds = new Set(proSnapBefore.docs.map(d => d.id))
  const existingProUsernames = new Set(proSnapBefore.docs.map(d => (d.data().username || '').toLowerCase()))
  // Idempotency: a pro already migrated is recognized by its source business
  // doc id, BEFORE any collision suffixing — otherwise the base username
  // collides with the existing doc, gets a '-2' suffix, and the '-2' id is
  // wrongly counted as "to create" (a real run would create 70 duplicates).
  const migratedBizIds = new Set(proSnapBefore.docs.map(d => d.data().source_business_doc_id).filter(Boolean))

  const liveById = new Map()
  bizSnap.forEach(s => liveById.set(s.id, { id: s.id, data: s.data() }))
  // Extra live docs not in the repo JSON (e.g. Alure, user/test docs) — informational only.
  const repoIds = new Set(raw.map(r => r.record_id))
  const extraBiz = []
  bizSnap.forEach(s => { if (!repoIds.has(s.id)) extraBiz.push(`${s.id} | ${s.data().name || ''} | status=${s.data().status || ''} | entity_type=${s.data().entity_type || ''}`) })
  console.log(`Live businesses docs NOT in repo JSON: ${extraBiz.length}`)
  extraBiz.forEach(x => console.log(`    EXTRA biz: ${x}`))
  console.log(`Pre-existing professionals docs: ${proSnapBefore.size}`)
  proSnapBefore.forEach(s => console.log(`    PRO: ${s.id} | username=${s.data().username || ''} | name=${s.data().name || s.data().fullName || ''} | status=${s.data().status || ''}`))

  // ---- (a) invented hours ----
  const invented = []
  const inventedNoRepo = []
  const realHoursDocs = []
  bizSnap.forEach(s => {
    const d = s.data()
    if (isInventedHours(d.operatingHours)) {
      const repo = bySlug.get((d.slug || d.business_slug || '').toLowerCase().trim()) || byRecordId.get(d.record_id)
      if (!repo) inventedNoRepo.push(s.id)
      else if (!repo.hours) invented.push({ id: s.id, slug: d.slug, name: d.name })
      else realHoursDocs.push(s.id) // invented value in live but repo HAS real hours: do NOT delete
    }
  })
  console.log(`(a) live docs carrying EXACT invented operatingHours: ${invented.length + inventedNoRepo.length + realHoursDocs.length}`)
  console.log(`    -> slated for removal (repo has no real hours): ${invented.length}`)
  console.log(`    -> NOT touched (repo HAS real hours, live value stale): ${realHoursDocs.length} ${JSON.stringify(realHoursDocs)}`)
  console.log(`    -> NOT touched (no matching repo record): ${inventedNoRepo.length} ${JSON.stringify(inventedNoRepo)}`)
  invented.slice(0, 10).forEach(x => console.log(`    e.g. ${x.id} | ${x.name}`))

  // ---- (b) 8 corrected seeds: live vs repo diff ----
  console.log('(b) 8 corrected seeds — live vs repo JSON diff (fields that differ):')
  const corrections = []
  for (const slug of CORRECTED_SLUGS) {
    const repo = bySlug.get(slug)
    if (!repo) { console.log(`    ${slug}: NOT IN REPO JSON`); continue }
    const { docId, data: expected } = buildExpectedDoc(repo)
    const live = liveById.get(docId)
    if (!live) { console.log(`    ${slug} (${docId}): NOT FOUND live`); corrections.push({ slug, docId, found: false, diff: {} }); continue }
    const diff = {}
    for (const k of Object.keys(expected)) {
      // operatingHours is handled by step (a): when the repo record has no
      // real hours the field is DELETED, never re-written. Updating it here
      // would re-add the invented value (key order differs in Firestore,
      // so a naive compare flags it as a diff). Only include it when the
      // repo record HAS real hours.
      if (k === 'operatingHours' && !repo.hours) continue
      if (!same(live.data[k], expected[k])) diff[k] = { live: live.data[k] ?? null, repo: expected[k] ?? null }
    }
    // also flag live-only extra keys vs expected (informational, not updated)
    const extra = Object.keys(live.data).filter(k => !(k in expected))
    console.log(`    ${slug} (${docId}): ${Object.keys(diff).length} differing field(s)${extra.length ? `; live-only keys: ${extra.join(',')}` : ''}`)
    for (const [k, v] of Object.entries(diff)) console.log(`      ${k}: live=${JSON.stringify(v.live)} -> repo=${JSON.stringify(v.repo)}`)
    corrections.push({ slug, docId, found: true, diff })
  }

  // ---- (c) professionals migration preview ----
  console.log('(c) professionals migration preview:')
  const proRecords = raw.filter(r => r.entity_type === 'professional')
  const targets = []
  const usedUsernames = new Set([...existingProUsernames])
  let alreadyMigrated = 0
  for (const item of proRecords) {
    const { docId: bizId } = buildExpectedDoc(item)
    const live = liveById.get(bizId)
    let username = generateProfessionalSlug(item.business_name, item.city ? [item.city] : [])
    const base = username
    // Already migrated? Check the base id / source doc BEFORE suffixing.
    const already = existingProIds.has(base) || migratedBizIds.has(bizId)
    if (!already) {
      let n = 2
      while (usedUsernames.has(username.toLowerCase())) { username = `${base}-${n}`; n++ }
    }
    usedUsernames.add(username.toLowerCase())
    if (already) alreadyMigrated++
    targets.push({ item, bizId, liveFound: !!live, username, already, doc: buildProfessionalDoc(item, bizId, username) })
  }
  console.log(`    repo professional records: ${proRecords.length}; live businesses docs with entity_type=professional: ${[...liveById.values()].filter(x => x.data.entity_type === 'professional').length}`)
  console.log(`    target professional docs: ${targets.length}; already exist in professionals (same doc id): ${alreadyMigrated}; to create: ${targets.length - alreadyMigrated}`)
  console.log(`    live businesses doc missing for a pro record: ${targets.filter(t => !t.liveFound).length}`)
  console.log(`    with phone: ${targets.filter(t => t.item.phone).length}, with email: ${targets.filter(t => t.item.email).length}, with city: ${targets.filter(t => t.item.city).length}, with title: ${targets.filter(t => t.item.professional_title).length}, with org: ${targets.filter(t => t.item.organization).length}`)
  targets.slice(0, 5).forEach(t => console.log(`    e.g. ${t.username} <- ${t.bizId} | ${t.item.business_name} | ${t.item.city || ''}, ${t.item.state || ''} | ${t.item.subcategory} | phone=${!!t.item.phone} email=${!!t.item.email}`))
  console.log('    Doc-ID/username scheme: slug-based username from lib/professional-service.ts generateProfessionalSlug (name + city when exactly 1 city); doc ID == username == slug. The collection already held 1 user-submitted doc (pro-<timestamp> ID, per saveProfessionalToDatabase); a deterministic slug ID is used here so the migration is idempotent, collision-checked against existing usernames, and lookups by username/slug/doc-ID all resolve.')

  if (DRY_RUN) { console.log('--- DRY RUN COMPLETE — no writes made ---'); process.exit(0) }

  // ---- REAL RUN ----
  let removed = 0, removeFail = []
  for (const x of invented) {
    try { await updateDoc(doc(db, 'businesses', x.id), { operatingHours: deleteField() }); removed++ }
    catch (e) { removeFail.push(`${x.id}: ${e.code || ''} ${e.message}`) }
  }
  console.log(`(a) REAL: operatingHours removed: ${removed}/${invented.length}; failures: ${removeFail.length}`)
  removeFail.slice(0, 5).forEach(f => console.log(`    FAIL ${f}`))

  let updated = 0, updateFail = [], noDiff = 0
  for (const c of corrections) {
    if (!c.found) { updateFail.push(`${c.slug}: not found live`); continue }
    const fields = {}
    for (const [k, v] of Object.entries(c.diff)) fields[k] = v.repo
    if (Object.keys(fields).length === 0) { noDiff++; continue }
    try { await updateDoc(doc(db, 'businesses', c.docId), fields); updated++ }
    catch (e) { updateFail.push(`${c.docId}: ${e.code || ''} ${e.message}`) }
  }
  console.log(`(b) REAL: corrected docs updated: ${updated}/8 (already matching: ${noDiff}); failures: ${updateFail.length}`)
  updateFail.forEach(f => console.log(`    FAIL ${f}`))

  let created = 0, createFail = [], skipped = 0
  for (const t of targets) {
    if (t.already) { skipped++; continue }
    try { await setDoc(doc(db, 'professionals', t.username), t.doc); created++ }
    catch (e) { createFail.push(`${t.username}: ${e.code || ''} ${e.message}`) }
  }
  console.log(`(c) REAL: professional docs created: ${created}; skipped (already existed): ${skipped}; failures: ${createFail.length}`)
  createFail.slice(0, 5).forEach(f => console.log(`    FAIL ${f}`))

  // ---- VERIFY (re-read) ----
  const bizAfter = await getDocs(collection(db, 'businesses'))
  const proAfter = await getDocs(collection(db, 'professionals'))
  let stillInvented = 0
  bizAfter.forEach(s => { if (isInventedHours(s.data().operatingHours)) stillInvented++ })
  console.log(`VERIFY: businesses=${bizAfter.size} (before ${bizSnap.size}); professionals=${proAfter.size} (before ${proSnapBefore.size}); docs still carrying invented hours=${stillInvented}`)
  let match8 = 0
  for (const slug of CORRECTED_SLUGS) {
    const repo = bySlug.get(slug); if (!repo) continue
    const { docId, data: expected } = buildExpectedDoc(repo)
    const snap = bizAfter.docs.find(d => d.id === docId)
    if (!snap) { console.log(`  VERIFY ${slug}: MISSING live`); continue }
    const remaining = Object.keys(expected).filter(k => {
      if (k === 'operatingHours' && !repo.hours) return false // deleted by (a), not expected present
      return !same(snap.data()[k], expected[k])
    })
    if (remaining.length === 0) match8++
    else console.log(`  VERIFY ${slug}: still differs on: ${remaining.join(', ')}`)
  }
  console.log(`VERIFY: 8 corrected docs now matching repo: ${match8}/8`)
  console.log('--- DONE ---')
  process.exit(0)
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })

import { cache } from 'react'
import { MOCK_JOBS, JobItem, ProfessionalItem } from './data'
import { getAllProfessionals } from './professional-service'
import { db } from './firebase'
import { collection, getDocs, query, where, limit, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { normalizeSlug } from './db-service'
import { JOB_SLUG_ALIASES } from './job-url'
import { sanitizeText, sanitizeUrl } from './sanitizer'
import { computeCitySlugs, isPakistaniEntity } from './directory-helpers'

let memoryJobsCache: JobItem[] = [...MOCK_JOBS]

export function isExpiredJob(job: JobItem): boolean {
  if (!job.deadline || /open until filled/i.test(job.deadline)) return false
  const deadline = new Date(job.deadline)
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()
}

export const getAllJobs = cache(async function getAllJobs(includePending: boolean = false, pageSize?: number): Promise<JobItem[]> {
  try {
    // P1-2: public reads fetch APPROVED listings only. includePending=true
    // is the separate owner/admin read path and keeps the unfiltered query.
    // Perf: the Firestore read is bounded with limit() — the old query had
    // no limit and pulled the whole collection on every list/search page.
    // (The merged in-memory mock jobs can push the returned array a
    // little past the cap; the cap bounds the Firestore read, not the
    // merged result.) Admin reads default to a higher cap so pending
    // items are not silently hidden.
    const cap = pageSize ?? (includePending ? 500 : 100)
    const snap = await getDocs(includePending
      ? query(collection(db, 'jobs'), limit(cap))
      : query(collection(db, 'jobs'), where('status', '==', 'approved'), limit(cap)))
    if (!snap.empty) {
      const items: JobItem[] = []
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<JobItem>
        const jTitle = data.title || 'Job Opening'
        const jSlug = data.slug || docSnap.id

        items.push({
          id: docSnap.id,
          slug: jSlug,
          title: jTitle,
          company: data.company || 'Hiring Employer',
          companySlug: data.companySlug || normalizeSlug(data.company || 'hiring-company'),
          companyLogo: data.companyLogo || '',
          city: data.city || 'New York',
          cities: data.cities && data.cities.length > 0 ? data.cities : (data.city ? [data.city] : ['New York']),
          province: data.province || 'New York',
          country: data.country || 'United States',
          category: data.category || 'Technology & IT',
          department: data.department || 'Engineering',
          type: data.type || 'Full-time',
          employmentType: data.employmentType || data.type || 'Full-time',
          salary: data.salary || 'Competitive Package',
          experience: data.experience || '',
          education: data.education || 'Bachelor Degree',
          skills: data.skills || [],
          vacancies: data.vacancies ?? '',
          genderPreference: data.genderPreference || 'Any',
          ageRequirement: data.ageRequirement || 'N/A',
          deadline: data.deadline || 'Open until filled',
          joiningDate: data.joiningDate || 'Immediate',
          workingHours: data.workingHours || '',
          shiftType: data.shiftType || '',
          benefits: data.benefits || ['Health Insurance', 'Annual Bonus', 'Paid Leaves'],
          postedDate: data.postedDate || 'Just now',
          description: data.description || 'Verified job vacancy on BizNestUSA.',
          responsibilities: data.responsibilities || [],
          requirements: data.requirements || [],
          preferredQualifications: data.preferredQualifications || [],
          applicationWebsite: data.applicationWebsite || '',
          applicationEmail: data.applicationEmail || '',
          applicationMethod: data.applicationMethod || 'both',
          applicationUrl: data.applicationUrl || data.applicationWebsite || '',
          // UX #9: jobs must NOT default to verified — verification comes
          // only from the real verification path.
          verified: data.verified === true,
          isFeatured: data.isFeatured ?? false,
          // P0-3: a doc with NO status must NEVER render as approved.
          status: data.status || 'pending',
          // Caller identity, preserved so the hardened rules' owner-match
          // (userId / email) can be satisfied on create and update.
          userId: (data as any).userId || '',
          email: (data as any).email || data.applicationEmail || '',
          ownerEmail: (data as any).ownerEmail || (data as any).email || data.applicationEmail || '',
          zipCode: (data as any).zipCode || (data as any).zip || ''
        })
      })

      const existingIds = new Set(items.map(j => j.id))
      const combined = [
        ...items,
        ...memoryJobsCache.filter(j => !existingIds.has(j.id))
      ]
      memoryJobsCache = combined
    }
  } catch (err) {
    console.warn('Firestore getAllJobs fallback error:', err)
  }

  const validJobs = memoryJobsCache.filter(j => !isPakistaniEntity(j))

  if (includePending) {
    return validJobs
  }

  return validJobs.filter(j => (j.status || 'pending') === 'approved' && !isExpiredJob(j))
})

export function normalizeJobDoc(docId: string, data: any): JobItem {
  const title = data.title || 'Job Opportunity'
  const company = data.company || 'Company'
  const itemSlug = data.slug || normalizeSlug(`${title} ${data.city || 'New York'}`)

  return {
    id: docId || data.id || 'job-' + Date.now(),
    slug: itemSlug,
    title,
    company,
    companySlug: data.companySlug || normalizeSlug(company),
    companyLogo: data.companyLogo || '',
    city: data.city || 'New York',
    cities: data.cities || [data.city || 'New York'],
    // Denormalized canonical city slugs for future Firestore cursor
    // pagination. Always recomputed from the city fields (data.city can
    // be a multi-city summary string — its junk slug is dropped by the
    // helper's isUsCity check; the real slugs come from cities[]).
    // No filter reads it yet, so it changes no rendered output.
    citySlugs: computeCitySlugs(data),
    state: data.state || data.province || 'New York',
    province: data.state || data.province || 'New York',
    country: data.country || 'United States',
    category: data.category || 'Technology & IT',
    department: data.department || 'General',
    type: data.type || 'Full-time',
    employmentType: data.employmentType || data.type || 'Full-time',
    salary: data.salary || 'Negotiable',
    // No invented defaults on read either: blank stays blank.
    experience: data.experience || '',
    education: data.education || 'Bachelor Degree',
    skills: data.skills || [],
    vacancies: data.vacancies ?? '',
    genderPreference: data.genderPreference || 'Any',
    ageRequirement: data.ageRequirement || 'N/A',
    deadline: data.deadline || 'Open until filled',
    joiningDate: data.joiningDate || 'Immediate',
    workingHours: data.workingHours || '',
    shiftType: data.shiftType || '',
    benefits: data.benefits || ['Health Insurance', 'Paid Leaves'],
    postedDate: data.postedDate || 'Recent',
    description: data.description || `Job opening for ${title} at ${company}.`,
    responsibilities: data.responsibilities || [],
    requirements: data.requirements || [],
    preferredQualifications: data.preferredQualifications || [],
    applicationWebsite: data.applicationWebsite || '',
    applicationEmail: data.applicationEmail || '',
    applicationMethod: data.applicationMethod || 'both',
    applicationUrl: data.applicationUrl || data.applicationWebsite || '',
    // UX #9: jobs must NOT default to verified.
    verified: data.verified === true,
    isFeatured: data.isFeatured ?? false,
    // P0-3: a doc with NO status must NEVER render as approved.
    status: data.status || 'pending',
    // Caller identity, preserved so the hardened rules' owner-match
    // (userId / email) can be satisfied on create and update.
    userId: data.userId || '',
    email: data.email || data.applicationEmail || '',
    ownerEmail: (data as any).ownerEmail || data.email || data.applicationEmail || '',
    zipCode: (data as any).zipCode || (data as any).zip || ''
  }
}

export const getJobBySlug = cache(async function getJobBySlug(idOrSlug: string, allowExpired: boolean = false): Promise<JobItem | null> {
  const raw = decodeURIComponent(idOrSlug || '').trim()
  const normalized = raw.toLowerCase()
  if (!normalized) return null

  // 1. Live Firestore check (public read: approved only — P1-2)
  try {
    const q = query(collection(db, 'jobs'), where('slug', '==', normalized), where('status', '==', 'approved'), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      const item = normalizeJobDoc(docSnap.id, docSnap.data())
      if (item.status === 'approved' && !isPakistaniEntity(item) && (allowExpired || !isExpiredJob(item))) {
        memoryJobsCache = [
          item,
          ...memoryJobsCache.filter(j => j.slug?.toLowerCase() !== normalized && j.id !== item.id)
        ]
        return item
      }
      return null
    }

    try {
      const direct = await getDocs(query(collection(db, 'jobs'), where('id', '==', raw), where('status', '==', 'approved'), limit(1)))
      if (!direct.empty) {
        const item = normalizeJobDoc(direct.docs[0].id, direct.docs[0].data())
        if (item.status === 'approved' && !isPakistaniEntity(item) && (allowExpired || !isExpiredJob(item))) return item
      }
    } catch (_) {}
  } catch (err) {
    console.warn('Firestore getJobBySlug error:', err)
  }

  // 2. Memory cache check
  const cached = memoryJobsCache.find(j => (j.id === raw || j.slug?.toLowerCase() === normalized) && !isPakistaniEntity(j))
  if (cached && (cached.status || 'pending') === 'approved' && (allowExpired || !isExpiredJob(cached))) {
    return cached
  }

  return null
})

export async function saveJobToDatabase(jobData: Partial<JobItem>): Promise<JobItem> {
  const title = sanitizeText(jobData.title || 'New Job Opportunity', 120)
  const company = sanitizeText(jobData.company || 'Hiring Employer', 120)
  
  // No invented location defaults: blank cities stay blank instead of
  // defaulting to 'New York'.
  const rawCities = (jobData.cities && jobData.cities.length > 0)
    ? jobData.cities.map(c => sanitizeText(c, 60))
    : (jobData.city ? [sanitizeText(jobData.city, 60)] : [])
  const cities = Array.from(new Set(rawCities.filter(Boolean)))

  const citySummary = cities.length === 1
    ? cities[0]
    : (cities.length <= 3 ? cities.join(', ') : `${cities.slice(0, 2).join(', ')} (+${cities.length - 2} cities)`)

  const slug = normalizeSlug(`${title} ${cities[0] || ''}`) + '-' + Math.floor(Math.random() * 1000)

  const newJob: JobItem = {
    id: 'job-' + Date.now(),
    slug,
    title,
    company,
    companySlug: jobData.companySlug || normalizeSlug(company),
    companyLogo: sanitizeUrl(jobData.companyLogo || ''),
    city: citySummary,
    cities: cities,
    // Denormalized canonical city slugs for future Firestore cursor
    // pagination (persisted via the firestorePayload spread below).
    // Computed from cities[] + the first city only — NOT from
    // citySummary, which is a joined display string for multi-city jobs.
    citySlugs: computeCitySlugs({ city: cities[0] || '', cities }),
    province: sanitizeText(jobData.province || '', 60),
    country: 'United States',
    category: sanitizeText(jobData.category || 'Technology & IT', 80),
    department: sanitizeText(jobData.department || 'General', 80),
    type: sanitizeText(jobData.type || 'Full-time', 40),
    employmentType: sanitizeText(jobData.employmentType || jobData.type || 'Full-time', 40),
    salary: sanitizeText(jobData.salary || 'Negotiable', 80),
    // No invented defaults: blank stays blank. The form sends undefined
    // for fields the employer leaves empty — the service must not fill
    // them with '1 - 3 Years', vacancies 1, canned skills, or generic
    // responsibilities/requirements.
    experience: sanitizeText(jobData.experience || '', 60),
    education: sanitizeText(jobData.education || 'Bachelor Degree', 80),
    skills: Array.isArray(jobData.skills) ? jobData.skills.map(s => sanitizeText(s, 50)) : [],
    vacancies: jobData.vacancies ?? '',
    genderPreference: sanitizeText(jobData.genderPreference || 'Any', 40),
    ageRequirement: sanitizeText(jobData.ageRequirement || 'N/A', 40),
    deadline: sanitizeText(jobData.deadline || 'Open until filled', 60),
    joiningDate: sanitizeText(jobData.joiningDate || 'Immediate', 60),
    workingHours: sanitizeText(jobData.workingHours || '', 60),
    shiftType: sanitizeText(jobData.shiftType || '', 40),
    benefits: Array.isArray(jobData.benefits) ? jobData.benefits.map(b => sanitizeText(b, 60)) : ['Health Insurance', 'Paid Leaves'],
    postedDate: 'Just now',
    description: sanitizeText(jobData.description || `Job opening for ${title} at ${company}.`, 5000),
    responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities.map(r => sanitizeText(r, 200)) : [],
    requirements: Array.isArray(jobData.requirements) ? jobData.requirements.map(rq => sanitizeText(rq, 200)) : [],
    preferredQualifications: Array.isArray(jobData.preferredQualifications) ? jobData.preferredQualifications.map(pq => sanitizeText(pq, 200)) : [],
    applicationWebsite: sanitizeUrl(jobData.applicationWebsite || ''),
    applicationEmail: sanitizeText(jobData.applicationEmail || '', 120),
    applicationMethod: jobData.applicationMethod || 'both',
    applicationUrl: sanitizeUrl(jobData.applicationUrl || jobData.applicationWebsite || ''),
    verified: false, // Trust protocol: requires admin verification
    isFeatured: false,
    status: 'pending', // PENDING WORKFLOW
    // Caller identity for the hardened rules' owner-match: userId, email
    // and ownerEmail as passed by the post-job form (authed user's uid and
    // email), plus zipCode. None of these may be dropped — the form sends
    // them so the create can satisfy the caller-identity rule.
    userId: (jobData as any).userId || '',
    email: sanitizeText((jobData as any).email || jobData.applicationEmail || '', 120),
    ownerEmail: (jobData as any).ownerEmail || (jobData as any).email || sanitizeText(jobData.applicationEmail || '', 120),
    zipCode: (jobData as any).zipCode || (jobData as any).zip || ''
  }

  memoryJobsCache = [newJob, ...memoryJobsCache.filter(j => j.id !== newJob.id)]

  // P0-3 / hardened rules: the create may not carry privileged fields
  // (verified, isFeatured). Strip them from the Firestore payload.
  const firestorePayload: Record<string, any> = { ...newJob }
  delete firestorePayload.verified
  delete firestorePayload.isFeatured

  try {
    await addDoc(collection(db, 'jobs'), firestorePayload)
  } catch (err) {
    // P1-5: surface the persistence failure instead of returning
    // success while nothing was saved server-side.
    console.warn('Firestore saveJobToDatabase error:', err)
    throw new Error('Job posting could not be saved. Please try again.')
  }

  return newJob
}

async function updateJobInFirestore(idOrSlug: string, fieldsToUpdate: Record<string, any>): Promise<void> {
  try {
    const docRef = doc(db, 'jobs', idOrSlug)
    await updateDoc(docRef, fieldsToUpdate)
    return
  } catch (err) {
    try {
      const q = query(collection(db, 'jobs'), where('slug', '==', idOrSlug), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, fieldsToUpdate)
        return
      }
      const qId = query(collection(db, 'jobs'), where('id', '==', idOrSlug), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await updateDoc(snapId.docs[0].ref, fieldsToUpdate)
        return
      }
    } catch (innerErr) {
      console.warn('Firestore updateJobInFirestore error:', innerErr)
    }
  }
}

export async function approveJob(id: string, adminUid: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryJobsCache.findIndex(j => j.id === id || j.slug?.toLowerCase() === norm)
  const cached = idx !== -1 ? memoryJobsCache[idx] : undefined
  // PRICING (b) — NO free listings: admin approves ONLY submissions with
  // verified payment. Block while a recorded payment is unverified
  // ('awaiting_payment' / 'payment_rejected' and this repo's equivalents).
  // Jobs have no payment step, so no paymentStatus normally exists and
  // the guard is dormant; it bites only if a paymentStatus is ever
  // recorded on the job.
  const paymentStatus = String((cached as any)?.paymentStatus || '').trim().toLowerCase()
  if (paymentStatus && paymentStatus !== 'verified' && paymentStatus !== 'paid') {
    console.warn(`Approve blocked for job ${id}: payment not verified (paymentStatus: '${(cached as any)?.paymentStatus || ''}').`)
    return false
  }
  if (idx !== -1) {
    memoryJobsCache[idx].status = 'approved'
  }

  await updateJobInFirestore(id, { status: 'approved' })
  return true
}

export async function rejectJob(id: string, reason?: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryJobsCache.findIndex(j => j.id === id || j.slug?.toLowerCase() === norm)
  if (idx !== -1) {
    memoryJobsCache[idx].status = 'rejected'
  }

  await updateJobInFirestore(id, { status: 'rejected', rejectionReason: reason })
  return true
}

export async function deleteJob(idOrSlug: string): Promise<boolean> {
  const norm = (idOrSlug || '').trim().toLowerCase()
  if (!norm) return false

  // 1. Remove from memory cache
  memoryJobsCache = memoryJobsCache.filter(j => j.id.toLowerCase() !== norm && j.slug?.toLowerCase() !== norm)

  // 2. Delete from Firestore
  try {
    const docRef = doc(db, 'jobs', idOrSlug)
    await deleteDoc(docRef)
    return true
  } catch (err) {
    try {
      const q = query(collection(db, 'jobs'), where('slug', '==', norm), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await deleteDoc(snap.docs[0].ref)
        return true
      }
      const qId = query(collection(db, 'jobs'), where('id', '==', idOrSlug), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await deleteDoc(snapId.docs[0].ref)
        return true
      }
    } catch (innerErr) {
      console.warn('Firestore deleteJob error:', innerErr)
    }
  }
  return true
}

/**
 * CANDIDATE MATCHING ENGINE
 * Calculates match percentage between a Job posting and candidates in the Professional / Job Seeker network
 */
export async function getMatchingCandidatesForJob(job: JobItem): Promise<Array<{ candidate: ProfessionalItem; matchScore: number; matchReasons: string[] }>> {
  const allCandidates = await getAllProfessionals(false)
  const results: Array<{ candidate: ProfessionalItem; matchScore: number; matchReasons: string[] }> = []

  const jobSkills = (job.skills || []).map(s => s.toLowerCase().trim())
  const jobTitle = (job.title || '').toLowerCase()
  const jobCities = (job.cities && job.cities.length > 0) 
    ? job.cities.map(c => c.toLowerCase()) 
    : [(job.city || '').toLowerCase()]

  allCandidates.forEach(cand => {
    let score = 50 // Base score
    const reasons: string[] = []

    // 1. Skill Matches (+10 score per matching skill)
    const matchingSkills = cand.skills.filter(s => jobSkills.some(js => js.includes(s.toLowerCase()) || s.toLowerCase().includes(js)))
    if (matchingSkills.length > 0) {
      score += matchingSkills.length * 12
      reasons.push(`Matches ${matchingSkills.length} required skill(s): ${matchingSkills.join(', ')}`)
    }

    // 2. Profession / Title Match (+20 score)
    if (jobTitle.includes(cand.profession.toLowerCase()) || cand.title.toLowerCase().includes(jobTitle) || jobTitle.split(' ').some(w => w.length > 3 && cand.title.toLowerCase().includes(w))) {
      score += 20
      reasons.push(`Matching profession: ${cand.profession}`)
    }

    // 3. Location Match (+15 score)
    const candCityLower = cand.city.toLowerCase()
    const isLocationMatch = jobCities.some(jc => jc.includes(candCityLower) || candCityLower.includes(jc))
    if (isLocationMatch || job.type.toLowerCase().includes('remote')) {
      score += 15
      reasons.push(job.type.toLowerCase().includes('remote') ? 'Open for remote role' : `Located in ${cand.city}`)
    }

    // 4. Availability check
    if (cand.availability && cand.availability.toLowerCase().includes('open to work')) {
      score += 10
      reasons.push('Actively open for job opportunities')
    }

    const finalScore = Math.min(98, score)
    if (finalScore >= 60) {
      results.push({ candidate: cand, matchScore: finalScore, matchReasons: reasons })
    }
  })

  return results.sort((a, b) => b.matchScore - a.matchScore)
}

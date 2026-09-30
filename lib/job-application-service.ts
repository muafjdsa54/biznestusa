import { db } from './firebase'
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, limit } from 'firebase/firestore'
import { JobApplication, ProfessionalItem } from './data'
import { getAllProfessionals } from './professional-service'

let memoryJobApplicationsCache: JobApplication[] = []

/**
 * Check if an email belongs to a registered Professional profile in BizNest USA database
 */
export async function checkProfessionalByEmail(email: string): Promise<{
  found: boolean
  professional?: ProfessionalItem
  isVerified?: boolean
  message?: string
}> {
  const cleanEmail = (email || '').trim().toLowerCase()
  if (!cleanEmail) {
    return { found: false, message: 'Please provide a valid email address.' }
  }

  // 1. Check all professionals from professional-service (handles Firestore & memory cache)
  try {
    const allPros = await getAllProfessionals(true)
    const match = allPros.find(p => (p.email || '').trim().toLowerCase() === cleanEmail)
    if (match) {
      const isVerified = match.verified === true || match.verificationStatus === 'VERIFIED'
      return {
        found: true,
        professional: match,
        isVerified,
        message: 'Professional profile identified.'
      }
    }
  } catch (err) {
    console.warn('Error checking professionals by email:', err)
  }

  // 2. Direct Firestore query fallback
  try {
    const q = query(collection(db, 'professionals'), where('email', '==', cleanEmail), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      const data = docSnap.data() as any
      const isVerified = data.verified === true || data.verificationStatus === 'VERIFIED'
      return {
        found: true,
        professional: { ...data, id: docSnap.id },
        isVerified,
        message: 'Professional profile found in database.'
      }
    }
  } catch (err) {
    console.warn('Firestore checkProfessionalByEmail query fallback error:', err)
  }

  return {
    found: false,
    message: 'No professional profile registered under this email address.'
  }
}

/**
 * Submit a job application verifying the candidate's professional profile
 */
export async function submitJobApplication(params: {
  jobId: string
  jobTitle: string
  companyName: string
  email: string
  coverNote?: string
}): Promise<{
  success: boolean
  code?: 'PROFILE_NOT_FOUND' | 'PROFILE_UNVERIFIED' | 'SUBMITTED' | 'ERROR'
  application?: JobApplication
  professional?: ProfessionalItem
  message: string
}> {
  const checkResult = await checkProfessionalByEmail(params.email)

  if (!checkResult.found || !checkResult.professional) {
    return {
      success: false,
      code: 'PROFILE_NOT_FOUND',
      message: 'No registered professional profile found for this email. Please create your profile first.'
    }
  }

  if (!checkResult.isVerified) {
    return {
      success: false,
      code: 'PROFILE_UNVERIFIED',
      professional: checkResult.professional,
      message: 'Your profile has been found, but it is not verified yet. Please verify your profile to apply for jobs on BizNest USA.'
    }
  }

  const pro = checkResult.professional
  const appId = 'app-' + Date.now()
  const now = new Date().toISOString()

  const newApplication: JobApplication = {
    id: appId,
    jobId: params.jobId,
    jobTitle: params.jobTitle,
    companyName: params.companyName,
    applicantEmail: (pro.email || params.email).trim().toLowerCase(),
    applicantName: pro.fullName || pro.name || 'Verified Professional',
    applicantPhone: pro.phone || pro.whatsapp || '',
    applicantProfession: pro.profession || pro.title || 'Professional',
    applicantUsername: pro.username || pro.slug || '',
    applicantAvatar: pro.avatar || '',
    applicantCity: pro.city || 'United States',
    isVerifiedProfessional: checkResult.isVerified ?? false,
    coverNote: params.coverNote || '',
    resumeUrl: pro.resumeUrl || pro.portfolio || '',
    appliedAt: now,
    status: 'new'
  }

  // Update memory cache
  memoryJobApplicationsCache = [newApplication, ...memoryJobApplicationsCache.filter(a => a.id !== appId)]

  // Persist to Firestore
  try {
    const docRef = doc(db, 'job_applications', appId)
    await setDoc(docRef, newApplication)
  } catch (err) {
    console.warn('Firestore submitJobApplication error:', err)
  }

  return {
    success: true,
    code: 'SUBMITTED',
    application: newApplication,
    professional: pro,
    message: `Application successfully submitted to ${params.companyName}! Your profile has been sent to our recruitment team.`
  }
}

/**
 * Fetch all job applications for the Admin panel
 */
export async function getAllJobApplications(): Promise<JobApplication[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'job_applications'))
    if (!querySnapshot.empty) {
      const items: JobApplication[] = []
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data() as JobApplication
        items.push({ ...data, id: docSnap.id })
      })
      items.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime())
      
      const ids = new Set(items.map(i => i.id))
      memoryJobApplicationsCache = [
        ...items,
        ...memoryJobApplicationsCache.filter(m => !ids.has(m.id))
      ]
    }
  } catch (err) {
    console.warn('Firestore getAllJobApplications error:', err)
  }

  return memoryJobApplicationsCache
}

/**
 * Update application review status in Admin panel
 */
export async function updateJobApplicationStatus(
  id: string,
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected'
): Promise<boolean> {
  const item = memoryJobApplicationsCache.find(a => a.id === id)
  if (item) {
    item.status = status
  }

  try {
    const docRef = doc(db, 'job_applications', id)
    await updateDoc(docRef, { status })
  } catch (err) {
    console.warn('Firestore updateJobApplicationStatus error:', err)
  }

  return true
}

/**
 * Delete a job application
 */
export async function deleteJobApplication(id: string): Promise<boolean> {
  memoryJobApplicationsCache = memoryJobApplicationsCache.filter(a => a.id !== id)

  try {
    const docRef = doc(db, 'job_applications', id)
    await deleteDoc(docRef)
  } catch (err) {
    console.warn('Firestore deleteJobApplication error:', err)
  }

  return true
}

import { cache } from 'react'
import { MOCK_COMPANIES, CompanyItem } from './data'
import { db } from './firebase'
import { collection, getDocs, query, where, limit, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { normalizeSlug } from './db-service'

let memoryCompaniesCache: CompanyItem[] = [...MOCK_COMPANIES]

export const getAllCompanies = cache(async function getAllCompanies(includePending: boolean = false): Promise<CompanyItem[]> {
  try {
    const snap = await getDocs(collection(db, 'companies'))
    if (!snap.empty) {
      const items: CompanyItem[] = []
      snap.forEach((docSnap) => {
        items.push(normalizeCompanyDoc(docSnap.id, docSnap.data()))
      })

      const existingSlugs = new Set(items.map(c => c.slug.toLowerCase()))
      const combined = [
        ...items,
        ...memoryCompaniesCache.filter(c => !existingSlugs.has(c.slug.toLowerCase()))
      ]
      memoryCompaniesCache = combined
    }
  } catch (err) {
    console.warn('Firestore getAllCompanies fallback to memory cache:', err)
  }

  if (includePending) {
    return memoryCompaniesCache
  }

  return memoryCompaniesCache.filter(c => (c.status || 'approved') === 'approved')
})

export function normalizeCompanyDoc(docId: string, data: any): CompanyItem {
  const cName = data.name || 'Verified Company'
  const cSlug = data.slug || normalizeSlug(cName)
  const itemStatus = data.status || 'approved'

  return {
    id: docId || data.id || 'comp-' + Date.now(),
    slug: cSlug,
    name: cName,
    logo: data.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    description: data.description || 'Verified hiring company profile on BizNestUSA.',
    industry: data.industry || 'Technology & IT',
    category: data.category || 'Hiring Company / HR',
    companySize: data.companySize || '10 - 50 Employees',
    employeeCount: String(data.employeeCount || '25'),
    establishedYear: String(data.establishedYear || '2020'),
    registrationNumber: data.registrationNumber || '',
    companyType: data.companyType || 'Private',
    headquarters: data.headquarters || `${data.city || 'New York'}, United States`,
    branchLocations: data.branchLocations || [],
    website: data.website || '',
    careersUrl: data.careersUrl || '',
    googleMapUrl: data.googleMapUrl || '',
    hrName: data.hrName || 'HR Department',
    hrDesignation: data.hrDesignation || 'HR Manager',
    hrEmail: data.hrEmail || '',
    companyEmail: data.companyEmail || '',
    phone: data.phone || '',
    whatsapp: data.whatsapp || '',
    email: data.companyEmail || data.email || 'contact@company.com',
    address: data.address || '',
    city: data.city || 'New York',
    province: data.province || 'New York',
    country: data.country || 'United States',
    linkedin: data.linkedin || '',
    facebook: data.facebook || '',
    instagram: data.instagram || '',
    twitter: data.twitter || '',
    youtube: data.youtube || '',
    github: data.github || '',
    customSocialLinks: data.customSocialLinks || [],
    rating: Number.isFinite(data.rating) ? data.rating : 5.0,
    reviewCount: data.reviewCount || (data.reviews ? data.reviews.length : 0),
    verified: data.verified ?? true,
    isClaimed: data.isClaimed === true,
    isFeatured: data.isFeatured ?? false,
    status: itemStatus,
    submittedAt: data.submittedAt || new Date().toISOString(),
    approvedAt: data.approvedAt,
    approvedBy: data.approvedBy,
    rejectionReason: data.rejectionReason,
    services: data.services || ['Corporate Hiring', 'Talent Acquisition'],
    operatingHours: data.operatingHours || { 'Monday - Friday': '09:00 AM - 06:00 PM' },
    features: data.features || ['Verified Employer'],
    reviews: data.reviews || [],
    faqs: data.faqs || [],
    activeJobsCount: data.activeJobsCount || 1
  }
}

export const getCompanyBySlug = cache(async function getCompanyBySlug(slug: string): Promise<CompanyItem | null> {
  const raw = decodeURIComponent(slug || '').trim()
  const normalized = raw.toLowerCase()
  if (!normalized) return null

  // 1. Live Firestore check
  try {
    const q = query(collection(db, 'companies'), where('slug', '==', normalized), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      const item = normalizeCompanyDoc(docSnap.id, docSnap.data())
      memoryCompaniesCache = [
        item,
        ...memoryCompaniesCache.filter(c => c.slug.toLowerCase() !== normalized && c.id !== item.id)
      ]
      if (item.status === 'approved') return item
      return null
    }

    try {
      const direct = await getDocs(query(collection(db, 'companies'), where('id', '==', raw), limit(1)))
      if (!direct.empty) {
        const item = normalizeCompanyDoc(direct.docs[0].id, direct.docs[0].data())
        if (item.status === 'approved') return item
      }
    } catch (_) {}
  } catch (err) {
    console.warn('Firestore getCompanyBySlug error:', err)
  }

  // 2. Memory cache check
  const cached = memoryCompaniesCache.find(c => c.slug.toLowerCase() === normalized || c.id === normalized)
  if (cached && (cached.status || 'approved') === 'approved') {
    return cached
  }

  return null
})

export async function saveCompanyToDatabase(compData: Partial<CompanyItem>): Promise<CompanyItem> {
  const name = compData.name || 'New Hiring Company'
  const slug = compData.slug || normalizeSlug(name) + '-' + Math.floor(Math.random() * 1000)

  const newComp: CompanyItem = normalizeCompanyDoc('comp-' + Date.now(), {
    ...compData,
    name,
    slug,
    status: 'pending',
    submittedAt: new Date().toISOString()
  })

  memoryCompaniesCache = [newComp, ...memoryCompaniesCache.filter(c => c.slug !== slug)]

  try {
    await addDoc(collection(db, 'companies'), newComp)
  } catch (err) {
    console.warn('Firestore saveCompanyToDatabase error:', err)
  }

  return newComp
}

async function updateCompanyInFirestore(idOrSlug: string, fieldsToUpdate: Record<string, any>): Promise<void> {
  try {
    const docRef = doc(db, 'companies', idOrSlug)
    await updateDoc(docRef, fieldsToUpdate)
    return
  } catch (err) {
    try {
      const q = query(collection(db, 'companies'), where('slug', '==', idOrSlug), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, fieldsToUpdate)
        return
      }
      const qId = query(collection(db, 'companies'), where('id', '==', idOrSlug), limit(1))
      const snapId = await getDocs(qId)
      if (!snapId.empty) {
        await updateDoc(snapId.docs[0].ref, fieldsToUpdate)
        return
      }
    } catch (innerErr) {
      console.warn('Firestore updateCompanyInFirestore error:', innerErr)
    }
  }
}

export async function approveCompany(id: string, adminUid: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryCompaniesCache.findIndex(c => c.id === id || c.slug.toLowerCase() === norm)
  if (idx !== -1) {
    memoryCompaniesCache[idx].status = 'approved'
    memoryCompaniesCache[idx].approvedAt = new Date().toISOString()
    memoryCompaniesCache[idx].approvedBy = adminUid
  }

  await updateCompanyInFirestore(id, {
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: adminUid
  })

  return true
}

export async function rejectCompany(id: string, reason?: string): Promise<boolean> {
  const norm = id.toLowerCase().trim()
  const idx = memoryCompaniesCache.findIndex(c => c.id === id || c.slug.toLowerCase() === norm)
  if (idx !== -1) {
    memoryCompaniesCache[idx].status = 'rejected'
    memoryCompaniesCache[idx].rejectionReason = reason
  }

  await updateCompanyInFirestore(id, {
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason
  })

  return true
}

export async function updateCompanyProfile(idOrSlug: string, updates: Partial<CompanyItem>): Promise<boolean> {
  const idx = memoryCompaniesCache.findIndex(c => c.id === idOrSlug || c.slug === idOrSlug)
  if (idx !== -1) {
    memoryCompaniesCache[idx] = { ...memoryCompaniesCache[idx], ...updates }
  }

  try {
    const docRef = doc(db, 'companies', idOrSlug)
    await updateDoc(docRef, updates)
  } catch (err) {
    console.warn('Firestore updateCompanyProfile error:', err)
  }
  return true
}

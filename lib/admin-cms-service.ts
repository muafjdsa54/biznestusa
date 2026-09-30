import { db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { BUSINESS_CATEGORIES, US_STATES, TOP_CITIES } from './data'

export interface CmsCategory {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  subcategories: string[]
  seoTitle?: string
  metaDescription?: string
  h1?: string
  introContent?: string
  longDescription?: string
  ctaHeading?: string
  ctaText?: string
  noIndex?: boolean
  faqs?: Array<{ question: string; answer: string }>
  featured?: boolean
  updatedAt?: string
}

export interface CmsLocation {
  id: string
  city: string
  state: string
  stateCode: string
  slug: string
  description?: string
  heroHeading?: string
  featured?: boolean
  topCategories?: string[]
  updatedAt?: string
}

export interface CmsArticle {
  id: string
  title: string
  slug: string
  pillar: 'businesses' | 'professionals' | 'jobs' | 'guides'
  excerpt: string
  content: string
  authorName?: string
  status: 'draft' | 'published'
  publishedAt?: string
  updatedAt?: string
  seoTitle?: string
  metaDescription?: string
}

export interface SiteSettings {
  siteName: string
  supportEmail: string
  supportPhone: string
  officeAddress: string
  announcementText: string
  announcementEnabled: boolean
  defaultMetaTitle: string
  defaultMetaDescription: string
  socialLinks: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  updatedAt?: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'BizNest USA',
  supportEmail: 'support@biznestusa.com',
  supportPhone: '+1 (800) 555-0199',
  officeAddress: '100 Wall Street, Suite 1200, New York, NY 10005',
  announcementText: 'Welcome to America\'s verified directory platform. Free listings for all US businesses and professionals.',
  announcementEnabled: false,
  defaultMetaTitle: 'BizNest USA | American Business Directory, Professional Profiles & Jobs',
  defaultMetaDescription: 'Discover verified local businesses, licensed trade professionals, and employment opportunities across all 50 states.',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/biznestusa',
    twitter: 'https://twitter.com/biznestusa'
  }
}

// ---------------- CATEGORIES CRUD ----------------

export async function getCmsCategories(): Promise<CmsCategory[]> {
  try {
    if (db) {
      const colRef = collection(db, 'cms_categories')
      const snapshot = await getDocs(colRef)
      if (!snapshot.empty) {
        return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CmsCategory))
      }
    }
  } catch (err) {
    console.warn('Failed to load categories from Firestore, using initial taxonomy:', err)
  }

  // Fallback to initial BUSINESS_CATEGORIES
  return BUSINESS_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.id,
    description: cat.desc || '',
    icon: cat.icon,
    subcategories: cat.subcategories || [],
    seoTitle: `${cat.name} in the USA | Verified Directory`,
    metaDescription: `Find top-rated ${cat.name} services, contractors, and companies nationwide on BizNest USA.`,
    featured: true
  }))
}

export async function getCmsCategoryBySlug(slug: string): Promise<CmsCategory | null> {
  try {
    if (db) {
      const docRef = doc(db, 'cms_categories', slug)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as CmsCategory
      }
    }
  } catch (err) {
    console.warn(`Error getting CMS category for slug ${slug}:`, err)
  }
  return null
}

export async function saveCmsCategory(category: CmsCategory): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const slug = (category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  const catId = category.id || slug
  const docRef = doc(db, 'cms_categories', catId)

  await setDoc(docRef, {
    ...category,
    id: catId,
    slug,
    updatedAt: new Date().toISOString()
  }, { merge: true })
}

export async function deleteCmsCategory(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await deleteDoc(doc(db, 'cms_categories', id))
}

// ---------------- LOCATIONS CRUD ----------------

export async function getCmsLocations(): Promise<CmsLocation[]> {
  try {
    if (db) {
      const colRef = collection(db, 'cms_locations')
      const snapshot = await getDocs(colRef)
      if (!snapshot.empty) {
        return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CmsLocation))
      }
    }
  } catch (err) {
    console.warn('Failed to load locations from Firestore, using defaults:', err)
  }

  // Fallback to top cities
  return TOP_CITIES.slice(0, 25).map(city => {
    const slug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return {
      id: slug,
      city,
      state: 'United States',
      stateCode: 'US',
      slug,
      description: `Explore verified businesses, licensed contractors, and open job roles across ${city}.`,
      heroHeading: `Best Local Businesses & Services in ${city}`,
      featured: true
    }
  })
}

export async function saveCmsLocation(loc: CmsLocation): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const slug = (loc.slug || loc.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  const locId = loc.id || slug
  const docRef = doc(db, 'cms_locations', locId)

  await setDoc(docRef, {
    ...loc,
    id: locId,
    slug,
    updatedAt: new Date().toISOString()
  }, { merge: true })
}

export async function deleteCmsLocation(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await deleteDoc(doc(db, 'cms_locations', id))
}

// ---------------- ARTICLES / CONTENT CRUD ----------------

export async function getCmsArticles(): Promise<CmsArticle[]> {
  try {
    if (db) {
      const colRef = collection(db, 'cms_articles')
      const snapshot = await getDocs(colRef)
      if (!snapshot.empty) {
        return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CmsArticle))
      }
    }
  } catch (err) {
    console.warn('Failed to load articles from Firestore, using initial set:', err)
  }

  // Initial topical guides
  return [
    {
      id: 'how-to-verify-licensed-contractors-usa',
      title: 'How to Verify Licensed Contractors in the United States',
      slug: 'how-to-verify-licensed-contractors-usa',
      pillar: 'businesses',
      excerpt: 'Essential verification steps for American homeowners and business managers hiring local trade contractors.',
      content: 'Verifying trade licenses, liability insurance, and bonding credentials through official state regulatory portals.',
      authorName: 'BizNest Editorial Staff',
      status: 'published',
      publishedAt: '2026-09-01',
      seoTitle: 'How to Verify Licensed Contractors in the USA',
      metaDescription: 'Step-by-step checklist to verify trade licenses, insurance certificates, and bonding for American contractors.'
    },
    {
      id: 'how-to-hire-independent-professionals-usa',
      title: 'How to Hire Independent 1099 Professionals & Consultants in the USA',
      slug: 'how-to-hire-independent-professionals-usa',
      pillar: 'professionals',
      excerpt: 'A structured vetting framework for evaluating talent portfolios, milestone statements of work, and credential verification.',
      content: 'Clear benchmarks for scoping deliverables, verifying peer references, and executing compliant contractor agreements.',
      authorName: 'BizNest Editorial Staff',
      status: 'published',
      publishedAt: '2026-09-05',
      seoTitle: 'Guide to Hiring Independent Professionals in the USA',
      metaDescription: 'Evaluate verified talent portfolios and hire top independent consultants and specialists in the United States.'
    },
    {
      id: 'small-business-directory-seo-guide-usa',
      title: 'Small Business Directory & Local SEO Guide for the USA',
      slug: 'small-business-directory-seo-guide-usa',
      pillar: 'guides',
      excerpt: 'How structured NAP directory citations and verified business profiles drive local Google map pack prominence.',
      content: 'Consistent Name, Address, and Phone data across authoritative directory hubs reinforces search engine confidence.',
      authorName: 'BizNest Growth Team',
      status: 'published',
      publishedAt: '2026-09-10',
      seoTitle: 'Local SEO & Directory Guide for American Businesses',
      metaDescription: 'Learn how authoritative directory listings improve local SEO visibility and inbound customer phone calls.'
    }
  ]
}

export async function saveCmsArticle(article: CmsArticle): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const slug = (article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  const artId = article.id || slug
  const docRef = doc(db, 'cms_articles', artId)

  await setDoc(docRef, {
    ...article,
    id: artId,
    slug,
    updatedAt: new Date().toISOString(),
    publishedAt: article.publishedAt || new Date().toISOString()
  }, { merge: true })
}

export async function deleteCmsArticle(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await deleteDoc(doc(db, 'cms_articles', id))
}

// ---------------- SITE SETTINGS CRUD ----------------

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    if (db) {
      const docRef = doc(db, 'platform_settings', 'general')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { ...DEFAULT_SETTINGS, ...docSnap.data() } as SiteSettings
      }
    }
  } catch (err) {
    console.warn('Failed to load site settings from Firestore, using defaults:', err)
  }
  return DEFAULT_SETTINGS
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const docRef = doc(db, 'platform_settings', 'general')
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date().toISOString()
  }, { merge: true })
}

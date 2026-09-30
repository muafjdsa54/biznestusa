import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { UserBlogPost, BusinessItem } from './data'
import { sanitizeText } from './sanitizer'
import { normalizeSlug } from './db-service'

const COLLECTION_NAME = 'business_blog_posts'

/**
 * Server-side creation of a business blog post with strict entitlement validation.
 */
export async function createBusinessBlogPost(input: {
  userId: string
  businessId: string
  title: string
  content: string
  keywords?: string[]
  authorName?: string
}): Promise<UserBlogPost> {
  if (!db) throw new Error('Database service is not initialized.')

  const cleanTitle = sanitizeText(input.title || '').trim()
  const cleanContent = sanitizeText(input.content || '').trim()

  if (!cleanTitle || cleanTitle.length < 5) {
    throw new Error('Post title is required and must be at least 5 characters.')
  }
  if (!cleanContent || cleanContent.length < 50) {
    throw new Error('Post content is required and must be at least 50 characters.')
  }

  // 1. Verify Business and Server-Side Blog Entitlement
  const bizRef = doc(db, 'businesses', input.businessId)
  const bizSnap = await getDoc(bizRef)

  if (!bizSnap.exists()) {
    throw new Error('Associated business listing could not be found.')
  }

  const bizData = bizSnap.data() as BusinessItem

  // Verify ownership
  if (bizData.userId && input.userId && bizData.userId !== input.userId) {
    throw new Error('Unauthorized: You do not have permission to publish for this business.')
  }

  // Strict Entitlement Checks
  const isFeatureEnabled = Boolean(bizData.blog_post_feature_enabled || bizData.blog_post_entitled)
  const allowedPosts = bizData.blog_posts_allowed !== undefined ? bizData.blog_posts_allowed : (bizData.plan === 'priority_5' ? 5 : 0)
  const usedPosts = bizData.blog_posts_used || 0

  if (!isFeatureEnabled && bizData.plan !== 'priority_5') {
    throw new Error('Business content posting is exclusive to the $5 Business Priority plan. Please upgrade your listing.')
  }

  if (usedPosts >= allowedPosts) {
    throw new Error(`Entitlement limit reached: You have published ${usedPosts} of ${allowedPosts} allowed business posts.`)
  }

  // 2. Generate Clean Unique Slug
  const baseSlug = normalizeSlug(cleanTitle).slice(0, 60)
  const bizSlug = normalizeSlug(bizData.name || 'biz').slice(0, 25)
  const uniqueId = Math.random().toString(36).substring(2, 7)
  const postSlug = `${baseSlug}-${bizSlug}-${uniqueId}`

  // 3. Create Post Document
  const postId = doc(collection(db, COLLECTION_NAME)).id
  const nowIso = new Date().toISOString()

  // Generate clean excerpt
  const rawExcerpt = cleanContent.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim()
  const excerpt = rawExcerpt.slice(0, 180) + (rawExcerpt.length > 180 ? '...' : '')

  const newPost: UserBlogPost = {
    id: postId,
    userId: input.userId,
    businessId: input.businessId,
    businessName: bizData.name,
    businessSlug: bizData.slug,
    title: cleanTitle,
    slug: postSlug,
    content: cleanContent,
    excerpt,
    keywords: Array.isArray(input.keywords) ? input.keywords.map(k => sanitizeText(k).trim()).filter(Boolean) : [],
    status: 'published',
    createdAt: nowIso,
    publishedAt: nowIso,
    seoTitle: `${cleanTitle} | ${bizData.name} on BizNest USA`,
    metaDescription: excerpt,
    authorName: input.authorName || bizData.ownerName || bizData.name
  }

  // Save to Firestore
  await setDoc(doc(db, COLLECTION_NAME, postId), newPost)

  // Atomically increment posts used on business
  await updateDoc(bizRef, {
    blog_posts_used: increment(1),
    updatedAt: nowIso
  })

  return newPost
}

/**
 * Fetch all posts created for a specific business.
 */
export async function getBusinessBlogPosts(businessId: string): Promise<UserBlogPost[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserBlogPost))
  } catch (err) {
    console.warn('Failed to fetch business blog posts:', err)
    return []
  }
}

/**
 * Fetch published posts for a business to showcase on their public business profile.
 */
export async function getPublishedPostsByBusinessId(businessId: string): Promise<UserBlogPost[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId),
      where('status', '==', 'published')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserBlogPost))
  } catch (err) {
    console.warn('Failed to fetch published posts for business:', err)
    return []
  }
}

/**
 * Fetch all published user-generated business posts across the platform for the blog ecosystem.
 */
export async function getAllPublishedBusinessPosts(limitCount = 50): Promise<UserBlogPost[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'published'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserBlogPost))
  } catch (err) {
    console.warn('Failed to fetch all published business posts:', err)
    return []
  }
}

/**
 * Fetch a single user business post by slug.
 */
export async function getBusinessPostBySlug(slug: string): Promise<UserBlogPost | null> {
  if (!db || !slug) return null
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('slug', '==', slug),
      limit(1)
    )
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const d = snapshot.docs[0]
      return { id: d.id, ...d.data() } as UserBlogPost
    }
  } catch (err) {
    console.warn('Failed to fetch post by slug:', err)
  }
  return null
}

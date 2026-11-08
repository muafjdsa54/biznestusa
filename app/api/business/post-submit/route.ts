import { NextRequest, NextResponse } from 'next/server'
import { createBusinessBlogPost } from '@/lib/user-post-service'
import { verifyUserToken } from '@/lib/server-auth'
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const limit = checkRateLimit(`submit:${getClientIp(req)}`, RATE_LIMITS.submit)
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit.resetAfterSeconds)
    }
    // P1-1: signed-in owners only. The author identity comes from the
    // verified ID token — `userId` in the body is ignored, so nobody can
    // publish a blog post as someone else's business.
    const auth = await verifyUserToken(req)
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }
    const userId = auth.uid

    const body = await req.json()
    const { businessId, title, content, keywords, authorName } = body

    if (!businessId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: businessId, title, content.' },
        { status: 400 }
      )
    }

    const createdPost = await createBusinessBlogPost({
      userId,
      businessId,
      title,
      content,
      keywords,
      authorName
    })

    return NextResponse.json({
      success: true,
      post: createdPost
    })
  } catch (err: any) {
    console.error('Error in post-submit API route:', err)
    // A persistence failure (e.g. Firestore permission-denied from the
    // unauthenticated server client) is a server error, not a bad request
    // — never report it as a client validation failure.
    const code = String(err?.code || '')
    const isServerError =
      code === 'permission-denied' ||
      code === 'unauthenticated' ||
      code === 'unavailable' ||
      code === 'failed-precondition' ||
      /permission-denied|PERMISSION_DENIED/i.test(String(err?.message || ''))
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit business post.' },
      { status: isServerError ? 500 : 400 }
    )
  }
}

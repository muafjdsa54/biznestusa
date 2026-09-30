import { NextRequest, NextResponse } from 'next/server'
import { createBusinessBlogPost } from '@/lib/user-post-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, businessId, title, content, keywords, authorName } = body

    if (!userId || !businessId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, businessId, title, content.' },
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
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit business post.' },
      { status: 400 }
    )
  }
}

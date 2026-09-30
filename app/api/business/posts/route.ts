import { NextRequest, NextResponse } from 'next/server'
import { getBusinessBlogPosts } from '@/lib/user-post-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId is required.' }, { status: 400 })
    }

    const posts = await getBusinessBlogPosts(businessId)
    return NextResponse.json({ success: true, posts })
  } catch (err: any) {
    console.error('Error fetching business posts:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch posts' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { sanitizeText } from '@/lib/sanitizer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessId, action, adminId, adminNotes } = body

    if (!businessId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing businessId or action.' },
        { status: 400 }
      )
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 500 }
      )
    }

    const bizRef = doc(db, 'businesses', businessId)
    const bizSnap = await getDoc(bizRef)

    if (!bizSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Business not found.' },
        { status: 404 }
      )
    }

    const bizData = bizSnap.data()
    const nowIso = new Date().toISOString()
    const updates: Record<string, any> = {
      updatedAt: nowIso
    }

    if (adminNotes !== undefined) {
      updates.adminNotes = sanitizeText(adminNotes).trim()
    }

    switch (action) {
      case 'verify_payment':
        updates.paymentStatus = 'VERIFIED'
        updates.paymentVerifiedAt = nowIso
        updates.paymentVerifiedBy = adminId || 'admin-master'
        // If it's a priority_5 plan, automatically enable blog entitlement upon payment verification
        if (bizData.plan === 'priority_5') {
          updates.blog_post_feature_enabled = true
          updates.blog_post_entitled = true
          updates.blog_posts_allowed = 5
          updates.blog_post_feature_enabled_at = nowIso
          updates.enabled_by_admin_id = adminId || 'admin-master'
        }
        break

      case 'approve_business':
        updates.status = 'approved'
        updates.approvedAt = nowIso
        updates.approvedBy = adminId || 'admin-master'
        updates.verified = true
        break

      case 'enable_blog_feature':
        updates.blog_post_feature_enabled = true
        updates.blog_post_entitled = true
        updates.blog_posts_allowed = 5
        updates.blog_post_feature_enabled_at = nowIso
        updates.enabled_by_admin_id = adminId || 'admin-master'
        break

      case 'disable_blog_feature':
        updates.blog_post_feature_enabled = false
        break

      case 'request_changes':
        updates.status = 'pending'
        updates.paymentStatus = 'NEEDS_CHANGES'
        break

      case 'reject':
        updates.status = 'rejected'
        updates.paymentStatus = 'REJECTED'
        updates.rejectedAt = nowIso
        break

      case 'save_notes':
        // adminNotes already handled above
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    await updateDoc(bizRef, updates)

    return NextResponse.json({
      success: true,
      message: `Action ${action} processed successfully for business ${bizData.name}.`,
      updates
    })
  } catch (err: any) {
    console.error('Error handling admin payment action:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process admin action.' },
      { status: 500 }
    )
  }
}

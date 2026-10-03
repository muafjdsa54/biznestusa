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
      case 'approve_payment':
        updates.paymentStatus = 'PAID'
        updates.paymentVerifiedAt = nowIso
        updates.paymentVerifiedBy = adminId || 'admin-master'
        
        // Activate plan entitlements
        if (bizData.plan === 'authoritative_10') {
          updates.hasSinglePage = true
          updates.canEditProfile = true
          updates.blog_post_feature_enabled = true
          updates.blog_post_entitled = true
          updates.blog_posts_allowed = 10
          updates.blog_post_feature_enabled_at = nowIso
          updates.enabled_by_admin_id = adminId || 'admin-master'
        } else if (bizData.plan === 'priority_5') {
          updates.hasSinglePage = true
          updates.canEditProfile = true
          updates.blog_post_feature_enabled = true
          updates.blog_post_entitled = true
          updates.blog_posts_allowed = 5
          updates.blog_post_feature_enabled_at = nowIso
          updates.enabled_by_admin_id = adminId || 'admin-master'
        } else {
          // review_1 ($1 basic): basic directory card only
          updates.hasSinglePage = false
          updates.canEditProfile = false
          updates.blog_post_feature_enabled = false
          updates.blog_post_entitled = false
          updates.blog_posts_allowed = 0
        }

        // Also update matching record in payments collection
        try {
          const { approvePayment } = await import('@/lib/payment-service')
          await approvePayment(businessId, adminId || 'admin-master')
        } catch (payErr) {
          console.warn('payment-service approve sync notice:', payErr)
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
        updates.blog_posts_allowed = bizData.plan === 'authoritative_10' ? 10 : 5
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

      case 'reject_payment':
      case 'reject':
        updates.status = 'rejected'
        updates.paymentStatus = 'REJECTED'
        updates.rejectedAt = nowIso
        if (adminNotes) {
          updates.rejectionReason = adminNotes
        }
        try {
          const { rejectPayment } = await import('@/lib/payment-service')
          await rejectPayment(businessId, adminNotes || 'Payment rejected by administrator.', adminId || 'admin-master')
        } catch (rejErr) {
          console.warn('payment-service reject sync notice:', rejErr)
        }
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

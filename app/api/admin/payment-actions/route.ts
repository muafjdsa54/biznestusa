import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { sanitizeText } from '@/lib/sanitizer'
import { verifyAdminToken } from '@/lib/server-auth'
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const limit = checkRateLimit(`payment-actions:${getClientIp(req)}`, RATE_LIMITS.adminMail)
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit.resetAfterSeconds)
    }
    // P1-1: admin-only. `adminId` in the body is ignored — the acting
    // admin is the uid of the verified admin ID token.
    const auth = await verifyAdminToken(req)
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }
    const adminId = auth.uid

    const body = await req.json()
    const { businessId, action, adminNotes } = body

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
        updates.paymentVerifiedBy = adminId
        
        // Activate plan entitlements
        if (bizData.plan === 'authoritative_10') {
          updates.hasSinglePage = true
          updates.canEditProfile = true
          updates.blog_post_feature_enabled = true
          updates.blog_post_entitled = true
          updates.blog_posts_allowed = 10
          updates.blog_post_feature_enabled_at = nowIso
          updates.enabled_by_admin_id = adminId
        } else if (bizData.plan === 'priority_5') {
          updates.hasSinglePage = true
          updates.canEditProfile = true
          updates.blog_post_feature_enabled = true
          updates.blog_post_entitled = true
          updates.blog_posts_allowed = 5
          updates.blog_post_feature_enabled_at = nowIso
          updates.enabled_by_admin_id = adminId
        } else {
          // review_1 ($1 Basic): dedicated page IS created; submit only —
          // no edit access, no blog posts, no photo gallery.
          updates.hasSinglePage = true
          updates.canEditProfile = false
          updates.blog_post_feature_enabled = false
          updates.blog_post_entitled = false
          updates.blog_posts_allowed = 0
          updates.gallery = []
        }

        // Also update matching record in payments collection
        try {
          const { approvePayment } = await import('@/lib/payment-service')
          await approvePayment(businessId, adminId)
        } catch (payErr) {
          console.warn('payment-service approve sync notice:', payErr)
        }
        break

      case 'approve_business':
        // PRICING (b) — NO free listings: an approve is rejected unless
        // the payment is VERIFIED. The admin must run verify_payment /
        // approve_payment first. Verified states (stored paymentStatus on
        // the business doc):
        //   'PAID'     — set by verify_payment / approve_payment below and
        //                by lib/payment-service approvePayment.
        //   'VERIFIED' — stored by the approve path itself for listings
        //                that are already approved (lib/db-service
        //                approveBusiness writes it alongside approval).
        // Everything else blocks approval: 'PENDING', 'PENDING_PAYMENT',
        // 'SUBMITTED', 'PAYMENT_VERIFICATION_PENDING', 'REJECTED',
        // 'NEEDS_CHANGES', 'UNPAID', or a missing paymentStatus.
        // (The LocalePak values 'awaiting_payment' / 'payment_rejected'
        // do not exist in this codebase; the above are their equivalents.)
        // The 'verified' badge / isApproved state does NOT lift this
        // guard — only a verified payment does.
        const storedPaymentStatus = String(bizData.paymentStatus || '').trim().toUpperCase()
        if (storedPaymentStatus !== 'PAID' && storedPaymentStatus !== 'VERIFIED') {
          return NextResponse.json(
            {
              success: false,
              error: `Payment not verified (paymentStatus is '${bizData.paymentStatus || 'missing'}'). Approve is blocked: verify the payment first — no free listings.`
            },
            { status: 403 }
          )
        }
        updates.status = 'approved'
        updates.approvedAt = nowIso
        updates.approvedBy = adminId
        // NOTE: verified is NOT set here — verification comes only from
        // the real verification path (lib/db-service approveBusiness
        // likewise never sets verified on approve).
        break

      case 'enable_blog_feature':
        updates.blog_post_feature_enabled = true
        updates.blog_post_entitled = true
        updates.blog_posts_allowed = bizData.plan === 'authoritative_10' ? 10 : 5
        updates.blog_post_feature_enabled_at = nowIso
        updates.enabled_by_admin_id = adminId
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
          await rejectPayment(businessId, adminNotes || 'Payment rejected by administrator.', adminId)
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

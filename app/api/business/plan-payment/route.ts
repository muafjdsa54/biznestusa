import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, setDoc } from 'firebase/firestore'
import { BusinessPlan, BUSINESS_PLANS } from '@/lib/data'
import { sanitizeText } from '@/lib/sanitizer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessId, userId, plan, transactionRef, paymentScreenshot, paymentMethod } = body

    if (!businessId || !plan) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: businessId and plan.' },
        { status: 400 }
      )
    }

    if (plan !== 'review_1' && plan !== 'priority_5') {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected. Must be review_1 ($1) or priority_5 ($5).' },
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
        { success: false, error: 'Business listing not found.' },
        { status: 404 }
      )
    }

    const bizData = bizSnap.data()
    const planInfo = BUSINESS_PLANS[plan as BusinessPlan]
    const nowIso = new Date().toISOString()
    const cleanRef = sanitizeText(transactionRef || '').trim()

    const updatePayload: Record<string, any> = {
      plan,
      planName: planInfo.name,
      planPrice: planInfo.price,
      paymentStatus: 'SUBMITTED',
      paymentSubmittedAt: nowIso,
      updatedAt: nowIso,
      blog_posts_allowed: planInfo.postsAllowed,
      blog_posts_used: bizData.blog_posts_used || 0,
      blog_post_feature_enabled: false, // Awaiting admin payment verification
      paymentDetails: {
        paymentMethod: paymentMethod || 'Direct Payment',
        amount: planInfo.price,
        referenceNumber: cleanRef,
        transactionRef: cleanRef,
        paymentScreenshot: paymentScreenshot || bizData.paymentScreenshot || '',
        paymentDate: nowIso
      }
    }

    if (paymentScreenshot) {
      updatePayload.paymentScreenshot = paymentScreenshot
    }
    if (cleanRef) {
      updatePayload.transactionRef = cleanRef
    }

    await updateDoc(bizRef, updatePayload)

    // Also record into dedicated payments collection for fast admin auditing
    const paymentRecordId = `pay_${businessId}_${Date.now()}`
    await setDoc(doc(db, 'business_payments', paymentRecordId), {
      id: paymentRecordId,
      businessId,
      businessName: bizData.name,
      userId: userId || bizData.userId || '',
      ownerEmail: bizData.email || '',
      plan,
      planName: planInfo.name,
      amount: planInfo.price,
      paymentStatus: 'SUBMITTED',
      transactionRef: cleanRef,
      paymentScreenshot: paymentScreenshot || bizData.paymentScreenshot || '',
      submittedAt: nowIso,
      verifiedAt: null,
      adminId: null,
      adminNotes: ''
    })

    return NextResponse.json({
      success: true,
      message: 'Plan payment details submitted for admin review.',
      plan: planInfo.name
    })
  } catch (err: any) {
    console.error('Error submitting plan payment:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Payment submission failed.' },
      { status: 500 }
    )
  }
}

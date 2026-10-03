import { NextRequest, NextResponse } from 'next/server'
import { createOrGetPaymentRecord } from '@/lib/payment-service'
import { getPayoneerPaymentUrl } from '@/lib/payoneer-config'
import { BusinessPlan, BUSINESS_PLANS } from '@/lib/data'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessId, businessName, businessSlug, userId, userEmail, planId } = body

    if (!businessId || !planId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: businessId and planId.' },
        { status: 400 }
      )
    }

    if (!['review_1', 'priority_5', 'authoritative_10'].includes(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid planId. Must be review_1, priority_5, or authoritative_10.' },
        { status: 400 }
      )
    }

    const paymentRecord = await createOrGetPaymentRecord({
      userId: userId || 'user',
      userEmail: userEmail || '',
      businessId,
      businessName: businessName || 'Business Listing',
      businessSlug,
      planId: planId as BusinessPlan
    })

    const payoneerUrl = getPayoneerPaymentUrl(planId as BusinessPlan)

    return NextResponse.json({
      success: true,
      payment: paymentRecord,
      payoneerUrl
    })
  } catch (err: any) {
    console.error('Payment create error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to initialize payment record.' },
      { status: 500 }
    )
  }
}

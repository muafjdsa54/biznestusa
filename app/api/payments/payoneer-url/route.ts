import { NextRequest, NextResponse } from 'next/server'
import { getPayoneerPaymentUrl } from '@/lib/payoneer-config'
import { BusinessPlan } from '@/lib/data'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const plan = (searchParams.get('plan') || 'review_1') as BusinessPlan

    const paymentUrl = getPayoneerPaymentUrl(plan)

    return NextResponse.json({
      success: true,
      plan,
      paymentUrl: paymentUrl || null,
      provider: 'payoneer'
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve Payoneer link.' },
      { status: 500 }
    )
  }
}

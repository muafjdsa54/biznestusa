import { NextRequest, NextResponse } from 'next/server'
import { submitPaymentProof } from '@/lib/payment-service'
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
    // P1-1: signed-in users only. The owner identity comes from the
    // verified ID token — `userId`/`uid` in the body is ignored, so nobody
    // can attach a proof screenshot to someone else's payment record.
    const auth = await verifyUserToken(req)
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }
    const userId = auth.uid

    const body = await req.json()
    const paymentIdOrRef = body.paymentIdOrRef || body.paymentReference || body.payment_reference || body.businessId
    const screenshotDataUrl = body.screenshotDataUrl || body.paymentScreenshot || body.screenshot
    const payoneerTransactionId = body.payoneerTransactionId || body.payoneer_transaction_id || body.transactionId
    const customerNote = body.customerNote || body.customer_note

    if (!paymentIdOrRef) {
      return NextResponse.json(
        { success: false, error: 'Payment reference or ID is required.' },
        { status: 400 }
      )
    }

    if (!screenshotDataUrl) {
      return NextResponse.json(
        { success: false, error: 'Payment proof screenshot is mandatory.' },
        { status: 400 }
      )
    }

    const result = await submitPaymentProof({
      paymentIdOrRef,
      screenshotDataUrl,
      payoneerTransactionId,
      customerNote,
      userId
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to submit proof.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verification request queued. Team review in progress.',
      payment: result.payment
    })
  } catch (err: any) {
    console.error('Error submitting payment proof:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error while submitting proof.' },
      { status: 500 }
    )
  }
}

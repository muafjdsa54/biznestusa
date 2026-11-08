import { NextRequest, NextResponse } from 'next/server'
import { getAllPaymentRecords, getUserPaymentRecords } from '@/lib/payment-service'
import { verifyAdminToken, verifyUserToken } from '@/lib/server-auth'
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'

/**
 * GET /api/payments/list — authenticated only.
 *
 * - Admin (valid admin ID token) => all payment records.
 * - Signed-in user (valid user ID token) => only that user's own records;
 *   the uid/email come from the verified token, NEVER from query params.
 * - `?isAdmin=true` and `?userId=` / `?email=` are ignored entirely:
 *   self-asserted identity no longer works (audit P1-1).
 */
export async function GET(req: NextRequest) {
  try {
    const limit = checkRateLimit(`payments-list:${getClientIp(req)}`, RATE_LIMITS.submit)
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit.resetAfterSeconds)
    }
    const admin = await verifyAdminToken(req)
    if (admin.ok) {
      const all = await getAllPaymentRecords()
      return NextResponse.json({ success: true, payments: all })
    }

    const user = await verifyUserToken(req)
    if (!user.ok) {
      return NextResponse.json(
        { success: false, error: user.error },
        { status: user.status }
      )
    }

    const userPayments = await getUserPaymentRecords(user.uid, user.email ?? '')
    return NextResponse.json({ success: true, payments: userPayments })
  } catch (err: any) {
    console.error('Error fetching payments list:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to list payments.' },
      { status: 500 }
    )
  }
}

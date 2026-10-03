import { NextRequest, NextResponse } from 'next/server'
import { getAllPaymentRecords, getUserPaymentRecords } from '@/lib/payment-service'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const isAdmin = searchParams.get('isAdmin') === 'true'
    const userId = searchParams.get('userId') || ''
    const userEmail = searchParams.get('email') || ''

    if (isAdmin) {
      const all = await getAllPaymentRecords()
      return NextResponse.json({ success: true, payments: all })
    }

    if (!userId && !userEmail) {
      return NextResponse.json({ success: true, payments: [] })
    }

    const userPayments = await getUserPaymentRecords(userId, userEmail)
    return NextResponse.json({ success: true, payments: userPayments })
  } catch (err: any) {
    console.error('Error fetching payments list:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to list payments.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { submitVerificationRequest, getProfessionalForDashboard } from '@/lib/professional-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idOrUsername, amount, paymentMethod, transactionRef, paymentScreenshot, notes } = body

    if (!idOrUsername) {
      return NextResponse.json({ success: false, error: 'Professional ID or Username required.' }, { status: 400 })
    }

    if (!paymentScreenshot) {
      return NextResponse.json({ success: false, error: 'Payment screenshot proof is mandatory.' }, { status: 400 })
    }

    // Backend validation on screenshot format (base64 data url or https url)
    if (
      !paymentScreenshot.startsWith('data:image/jpeg') &&
      !paymentScreenshot.startsWith('data:image/jpg') &&
      !paymentScreenshot.startsWith('data:image/png') &&
      !paymentScreenshot.startsWith('data:image/webp') &&
      !paymentScreenshot.startsWith('https://') &&
      !paymentScreenshot.startsWith('http://')
    ) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file format. Only JPG, PNG, and WebP payment proofs are accepted.'
      }, { status: 400 })
    }

    const pro = await getProfessionalForDashboard(idOrUsername)
    if (!pro) {
      return NextResponse.json({ success: false, error: 'Professional profile not found.' }, { status: 404 })
    }

    const paymentDetails = {
      amount: Number(amount) || 5,
      paymentMethod: paymentMethod || 'Corporate Card / Direct Verification',
      transactionRef: transactionRef || 'Pending Ref',
      paymentScreenshot,
      submittedAt: new Date().toISOString(),
      notes: notes || ''
    }

    const result = await submitVerificationRequest(idOrUsername, paymentDetails)

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully. Our admin team will review your payment and verification request.',
      request: result.request
    })
  } catch (err: any) {
    console.error('Error in /api/professionals/verify-request:', err)
    return NextResponse.json({ success: false, error: 'Server error submitting verification request.' }, { status: 500 })
  }
}

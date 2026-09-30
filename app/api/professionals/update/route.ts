import { NextRequest, NextResponse } from 'next/server'
import { updateProfessionalProfileSecure, getProfessionalForDashboard } from '@/lib/professional-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idOrUsername, updates, isAdmin } = body

    if (!idOrUsername || !updates) {
      return NextResponse.json({ success: false, error: 'Missing required parameters.' }, { status: 400 })
    }

    const currentPro = await getProfessionalForDashboard(idOrUsername)
    if (!currentPro) {
      return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 })
    }

    // Security Check: Unverified approved professionals CANNOT edit their public profile!
    const isApproved = (currentPro.status || 'approved') === 'approved'
    const isVerified = currentPro.verified === true || currentPro.verificationStatus === 'VERIFIED'

    if (isApproved && !isVerified && !isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Profile editing is available only to verified professionals. Please complete verification to unlock profile editing.'
      }, { status: 403 })
    }

    const result = await updateProfessionalProfileSecure(idOrUsername, updates, Boolean(isAdmin))
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 403 })
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully.', data: result.data })
  } catch (err: any) {
    console.error('Error in /api/professionals/update:', err)
    return NextResponse.json({ success: false, error: 'Server error processing update.' }, { status: 500 })
  }
}

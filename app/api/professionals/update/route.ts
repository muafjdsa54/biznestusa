import { NextRequest, NextResponse } from 'next/server'
import { updateProfessionalProfileSecure, getProfessionalForDashboard } from '@/lib/professional-service'
import { isValidPersonName, isValidUsPhone } from '@/lib/validation'
import { sanitizePersonName, sanitizePhone } from '@/lib/sanitizer'

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

    if (updates.name && !isValidPersonName(updates.name)) {
      return NextResponse.json({
        success: false,
        error: 'Full Name must contain only alphabetic letters (no numbers or special symbols).'
      }, { status: 400 })
    }

    if (updates.phone && !isValidUsPhone(updates.phone)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX.'
      }, { status: 400 })
    }

    if (updates.whatsapp && !isValidUsPhone(updates.whatsapp)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX for WhatsApp.'
      }, { status: 400 })
    }

    if (updates.name) updates.name = sanitizePersonName(updates.name)
    if (updates.phone) updates.phone = sanitizePhone(updates.phone)
    if (updates.whatsapp) updates.whatsapp = sanitizePhone(updates.whatsapp)

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

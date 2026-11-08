import { NextRequest, NextResponse } from 'next/server'
import { updateProfessionalProfileSecure, getProfessionalForDashboard } from '@/lib/professional-service'
import { isValidPersonName, isValidUsPhone } from '@/lib/validation'
import { sanitizePersonName, sanitizePhone } from '@/lib/sanitizer'
import { verifyAdminToken, verifyUserToken } from '@/lib/server-auth'
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
    // P1-1: `isAdmin` in the body is ignored — admin status comes only
    // from a verified admin ID token. A signed-in user may edit ONLY
    // their own profile (token uid, or token email vs the profile email).
    const admin = await verifyAdminToken(req)
    let user: { uid: string; email: string | null } | null = null
    if (!admin.ok) {
      const verified = await verifyUserToken(req)
      if (!verified.ok) {
        return NextResponse.json(
          { success: false, error: verified.error },
          { status: verified.status }
        )
      }
      user = verified
    }
    const isAdmin = admin.ok

    const body = await req.json()
    const { idOrUsername, updates } = body

    if (!idOrUsername || !updates) {
      return NextResponse.json({ success: false, error: 'Missing required parameters.' }, { status: 400 })
    }

    const currentPro = await getProfessionalForDashboard(idOrUsername)
    if (!currentPro) {
      return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 })
    }

    // Ownership: non-admin callers must own the profile they are editing.
    if (!isAdmin && user) {
      const ownsByUid = Boolean(currentPro.userId) && currentPro.userId === user.uid
      const ownsByEmail =
        Boolean(currentPro.email) &&
        Boolean(user.email) &&
        currentPro.email!.trim().toLowerCase() === user.email!.trim().toLowerCase()
      if (!ownsByUid && !ownsByEmail) {
        return NextResponse.json({
          success: false,
          error: 'Forbidden: you can only edit your own profile.'
        }, { status: 403 })
      }
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

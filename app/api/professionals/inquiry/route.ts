import { NextRequest, NextResponse } from 'next/server'
import { saveProfessionalInquiry, getProfessionalInquiries, getProfessionalForDashboard } from '@/lib/professional-service'
import { isValidPersonName, isValidUsPhone, isValidEmail } from '@/lib/validation'
import { sanitizePersonName, sanitizePhone } from '@/lib/sanitizer'
import { verifyAdminToken, verifyUserToken } from '@/lib/server-auth'
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // NOTE (audit P1-1/P1-4): sending an inquiry stays open to visitors —
  // it is the site's public "contact this professional" form and the
  // target Firestore rules allow unauthenticated create for
  // professional_inquiries. The spam defence is the per-IP rate limit
  // below (CAPTCHA is still future work). No inquiry content is ever
  // returned to an unauthenticated caller: reads are locked down in GET.
  try {
    const limit = checkRateLimit(`submit:${getClientIp(req)}`, RATE_LIMITS.submit)
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit.resetAfterSeconds)
    }
    const body = await req.json()
    const { proUsername, proName, senderName, senderEmail, senderWhatsApp, message } = body

    if (!senderName || !senderEmail || !senderWhatsApp || !message) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields including your WhatsApp number.' },
        { status: 400 }
      )
    }

    if (!isValidPersonName(senderName)) {
      return NextResponse.json(
        { success: false, error: 'Full Name must contain only alphabetic letters (no numbers or special symbols).' },
        { status: 400 }
      )
    }

    if (!isValidEmail(senderEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (!isValidUsPhone(senderWhatsApp)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX.' },
        { status: 400 }
      )
    }

    const result = await saveProfessionalInquiry({
      proUsername: proUsername || 'professional',
      proName: proName || 'Professional Specialist',
      senderName: sanitizePersonName(senderName),
      senderEmail: senderEmail.trim(),
      senderWhatsApp: sanitizePhone(senderWhatsApp),
      message: message.trim()
    })

    return NextResponse.json({ success: true, inquiry: result.inquiry })
  } catch (error: any) {
    console.error('API /api/professionals/inquiry error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username') || 'all'

    // P1-1: `GET ?username=all` used to dump EVERY inquiry (names, emails,
    // WhatsApp numbers, messages) to any unauthenticated caller. Reads
    // are now: admin => anything; a signed-in professional => only their
    // own username's inquiries; everyone else => 401/403.
    const admin = await verifyAdminToken(req)
    if (admin.ok) {
      const inquiries = await getProfessionalInquiries(username)
      return NextResponse.json({ success: true, inquiries })
    }

    const user = await verifyUserToken(req)
    if (!user.ok) {
      return NextResponse.json(
        { success: false, error: user.error },
        { status: user.status }
      )
    }
    if (!username || username === 'all') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: specify your own professional username.' },
        { status: 403 }
      )
    }
    const pro = await getProfessionalForDashboard(user.email || user.uid)
    const ownUsername = [pro?.username, pro?.slug, pro?.id].some(
      (v) => v && v.toLowerCase() === username.toLowerCase()
    )
    if (!pro || !ownUsername) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: you can only read your own inquiries.' },
        { status: 403 }
      )
    }
    const inquiries = await getProfessionalInquiries(username)
    return NextResponse.json({ success: true, inquiries })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

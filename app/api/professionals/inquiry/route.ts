import { NextRequest, NextResponse } from 'next/server'
import { saveProfessionalInquiry, getProfessionalInquiries } from '@/lib/professional-service'
import { isValidPersonName, isValidUsPhone, isValidEmail } from '@/lib/validation'
import { sanitizePersonName, sanitizePhone } from '@/lib/sanitizer'

export async function POST(req: NextRequest) {
  try {
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
    const inquiries = await getProfessionalInquiries(username)
    return NextResponse.json({ success: true, inquiries })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

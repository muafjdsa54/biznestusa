import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Contact-form email — sent through the Brevo transactional API
 * (https://api.brevo.com/v3/smtp/email) using the server-only BREVO_API_KEY
 * (Vercel env). The visitor's message goes to support@biznestusa.com, the
 * site's public support inbox, with reply-to set to the visitor so the admin
 * can answer directly. Sender is noreply@biznestusa.com unless
 * BREVO_FROM_EMAIL overrides it.
 *
 * Brevo note: the sender address (or the biznestusa.com domain) must be a
 * verified sender in the Brevo account, and the API key must have IP
 * blocking OFF — Vercel egress IPs rotate, so an allowlisted IP will break
 * sending. Called by lib/email-service.ts (sendContactEmail) from the
 * contact page AFTER the message is saved to Firestore, so a mail failure
 * never loses the visitor's message.
 */
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_API_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL_RAW = process.env.BREVO_FROM_EMAIL || 'BizNest USA <noreply@biznestusa.com>'
const SUPPORT_EMAIL = process.env.BREVO_SUPPORT_EMAIL || 'support@biznestusa.com'

// Split "Display Name <address@example.com>" (or a bare address) into parts.
function parseSender(raw: string): { name: string; email: string } {
  const m = raw.match(/^(.*?)<([^<>]+)>\s*$/)
  if (m) return { name: m[1].trim() || 'BizNest USA', email: m[2].trim() }
  return { name: 'BizNest USA', email: raw.trim() }
}
const FROM = parseSender(FROM_EMAIL_RAW)

function escapeHtml(str: string) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  // Rate limit first (10/hour per IP): the recipient is fixed, so the
  // abuse vector is inbox flooding + Brevo quota burn, not relay.
  const limit = checkRateLimit(
    `contact:${getClientIp(req)}`,
    RATE_LIMITS.contact
  )
  if (!limit.allowed) {
    return rateLimitExceededResponse(limit.resetAfterSeconds)
  }

  if (!BREVO_API_KEY) {
    return NextResponse.json({ ok: false, error: 'mail_not_configured' }, { status: 503 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk || !name || !message || message.length < 10 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const fullSubject = `[BizNestUSA Contact] ${subject || 'General Directory Support'}`

  const textBody = [
    'New contact message from biznestusa.com',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Subject: ${subject || 'General Directory Support'}`,
    '',
    message,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  const htmlBody = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;padding:28px;">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:20px;">New contact message</h1>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${phone ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
          <p style="margin:0 0 16px;font-size:14px;"><strong>Subject:</strong> ${escapeHtml(subject || 'General Directory Support')}</p>
          <div style="border-top:1px solid #e2e8f0;padding-top:16px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  try {
    const brevoRes = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: FROM,
        to: [{ email: SUPPORT_EMAIL }],
        replyTo: { email },
        subject: fullSubject,
        htmlContent: htmlBody,
        textContent: textBody,
      }),
    })

    if (!brevoRes.ok) {
      const errText = await brevoRes.text()
      console.error('[brevo] Brevo API error:', brevoRes.status, errText)
      return NextResponse.json({ ok: false, error: errText }, { status: 502 })
    }

    const data = await brevoRes.json()
    return NextResponse.json({ ok: true, id: data?.messageId ?? null })
  } catch (err: any) {
    console.error('[brevo] send-contact-email error:', err?.message ?? err)
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}

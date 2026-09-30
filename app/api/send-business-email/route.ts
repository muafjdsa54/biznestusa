import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'BizNest USA <onboarding@resend.dev>'
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_BUSINESS_NUMBER || '18005550199').replace(/[^0-9]/g, '')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://biznestusa.com'

interface SubmissionEmailPayload {
  to: string
  businessName: string
  category: string
  address: string
  phone: string
  description: string
  slug: string
  city: string
}

function buildHtml(data: SubmissionEmailPayload) {
  const businessUrl = `${SITE_URL}/${data.slug}`
  const waMessage = encodeURIComponent('Hi, I want to feature my business listing')
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Business Listing is Live</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:#0f2b3d;padding:32px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Your Business Listing is Live</h1>
              <p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">Thank you for listing your business with us!</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#0f172a;">
                Hi there,
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569;">
                Thank you for listing your business with BizNest USA! Your listing is now live and visible to potential customers across the United States.
              </p>

              <h2 style="margin:0 0 12px;font-size:18px;color:#0f2b3d;">Your Submission Summary</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#334155;width:140px;font-size:14px;border-bottom:1px solid #e2e8f0;">Business Name</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${escapeHtml(data.businessName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#334155;font-size:14px;border-bottom:1px solid #e2e8f0;">Category</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${escapeHtml(data.category)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#334155;font-size:14px;border-bottom:1px solid #e2e8f0;">Address</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${escapeHtml(data.address)}, ${escapeHtml(data.city)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#334155;font-size:14px;border-bottom:1px solid #e2e8f0;">Phone</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${escapeHtml(data.phone)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#334155;font-size:14px;">Description</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;">${escapeHtml(data.description)}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${businessUrl}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
                      View Your Live Listing
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="margin:0 0 8px;font-size:16px;color:#166534;">Want More Customers? Feature Your Business!</h3>
                    <p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:#15803d;">
                      Get listed at the top of search results and attract 5x more leads with a Featured Listing.
                    </p>
                    <a href="${whatsappUrl}" style="display:inline-block;padding:10px 20px;background:#16a34a;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Feature on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b;">
                If you have any questions, simply reply to this email or contact us on WhatsApp.
              </p>
              <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">
                Best regards,<br />
                <strong style="color:#0f172a;">The BizNest USA Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} BizNest USA. The trusted American business directory.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildText(data: SubmissionEmailPayload) {
  const businessUrl = `${SITE_URL}/${data.slug}`
  const waMessage = encodeURIComponent('Hi, I want to feature my business listing')
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  return `Your Business Listing is Live!

Thank you for listing your business with us!

Your submission summary:
- Business Name: ${data.businessName}
- Category: ${data.category}
- Address: ${data.address}, ${data.city}
- Phone: ${data.phone}
- Description: ${data.description}

Your business is now live at:
${businessUrl}

Want to feature your business for more visibility?
Contact us on WhatsApp: ${whatsappUrl}

Best regards,
The BizNest USA Team`
}

function escapeHtml(str: string) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmissionEmailPayload

    if (!body?.to || !body?.businessName || !body?.slug) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      console.log('[v0] RESEND_API_KEY not set - skipping email send')
      return NextResponse.json({ ok: true, skipped: true, reason: 'RESEND_API_KEY not configured' })
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [body.to],
        subject: 'Your Business Listing is Live 🎉',
        html: buildHtml(body),
        text: buildText(body),
      }),
    })

    if (!resendRes.ok) {
      const errText = await resendRes.text()
      console.error('[v0] Resend API error:', resendRes.status, errText)
      return NextResponse.json({ ok: false, error: errText }, { status: 502 })
    }

    const data = await resendRes.json()
    return NextResponse.json({ ok: true, id: data?.id ?? null })
  } catch (err: any) {
    console.error('[v0] send-business-email error:', err?.message ?? err)
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}

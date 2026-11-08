import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/server-auth'
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'

/**
 * POST /api/admin/verify-business — admin-only "Mark verified" for a business.
 *
 * Sets verified:true (or false to unverify) plus verifiedAt / verifiedBy on
 * a businesses doc. This is the real business verify path: the detail page
 * shield (app/business/[slug]/page.tsx) and the search "Verified Only"
 * filter both key off biz.verified, and no other code path sets it.
 *
 * Auth: the caller's Firebase ID token is verified by lib/server-auth.ts
 * (uid must be the admin UID — never trust isAdmin / adminId from the
 * body). The update itself is performed with that same ID token via the
 * Firestore REST API, so the write runs AS the signed-in admin and
 * firestore.rules listingUpdate() (isAdmin()) allows it — no rules change
 * is needed. The route's unauthenticated client SDK cannot do this write
 * (see lib/server-auth.ts header), which is why the REST call is used.
 *
 * Body: { businessId: string, verified: boolean } for businesses, or
 * { type: 'company', companyId: string, verified: boolean } for companies.
 * The companies tab has the same gap the business tab had: approveCompany()
 * never sets verified, so without this the companies FAQ ("admin marks that
 * profile verified") would have no code path behind it.
 */

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'biznestusa'

const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`

function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization')
  const match = header?.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

export async function POST(req: NextRequest) {
  try {
    const limit = checkRateLimit(
      `verify-business:${getClientIp(req)}`,
      RATE_LIMITS.adminMail
    )
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit.resetAfterSeconds)
    }

    // Admin-only. Any `adminId` in the body is ignored — the acting admin
    // is the uid of the verified admin ID token.
    const auth = await verifyAdminToken(req)
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }
    const adminId = auth.uid

    const idToken = getBearerToken(req)
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Missing admin ID token.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { businessId, companyId, type, verified } = body
    const isCompany = type === 'company'
    const docId = isCompany ? companyId : businessId
    const collection = isCompany ? 'companies' : 'businesses'
    const label = isCompany ? 'Company' : 'Business'

    if (!docId || typeof docId !== 'string') {
      return NextResponse.json(
        { success: false, error: isCompany ? 'Missing companyId.' : 'Missing businessId.' },
        { status: 400 }
      )
    }
    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'verified must be true or false.' },
        { status: 400 }
      )
    }

    const nowIso = new Date().toISOString()
    const url =
      `${FIRESTORE_REST_BASE}/${collection}/${encodeURIComponent(docId)}` +
      '?updateMask.fieldPaths=verified' +
      '&updateMask.fieldPaths=verifiedAt' +
      '&updateMask.fieldPaths=verifiedBy'

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          verified: { booleanValue: verified },
          verifiedAt: verified
            ? { stringValue: nowIso }
            : { nullValue: null },
          verifiedBy: verified
            ? { stringValue: adminId }
            : { nullValue: null },
        },
      }),
    })

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { success: false, error: `${label} not found.` },
          { status: 404 }
        )
      }
      const detail = await res.text().catch(() => '')
      console.error('verify-business Firestore REST error:', res.status, detail)
      return NextResponse.json(
        { success: false, error: 'Failed to update verification in the database.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      verified,
      message: verified
        ? `${label} marked as verified.`
        : `Verification removed from ${label.toLowerCase()}.`,
    })
  } catch (err: any) {
    console.error('Error handling admin verify-business action:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update verification.' },
      { status: 500 }
    )
  }
}

/**
 * Server-side Firebase ID-token verification — WITHOUT firebase-admin.
 *
 * This repo has no Firebase Admin SDK (and none may be added in this fix),
 * so tokens are verified by calling Google's tokeninfo endpoint, which
 * validates the token signature, expiry and audience server-side and
 * returns the token claims. `fetch` only — no new dependencies.
 *
 * Security notes / limits (see BIZNESTUSA-SECURITY-AUDIT-2026-11-08 §3.3):
 * - tokeninfo does NOT check token revocation (a revoked token still
 *   verifies until it expires). Full revocation checking needs the Admin
 *   SDK — a follow-up, not this fix.
 * - Verifying the token authorizes the CALLER, but it does not
 *   authenticate this route's Firestore client (the client web SDK runs
 *   with no signed-in user here). Firestore writes from API routes are
 *   therefore still denied by the rules until the Admin SDK lands or the
 *   writes move behind the signed-in client. Routes must surface those
 *   persistence failures as 5xx instead of reporting success.
 *
 * Project id: the live Firebase project is `biznestusa` (firestore.rules
 * header). NOTE lib/firebase.ts falls back to `biznestussa` (double-s)
 * when NEXT_PUBLIC_FIREBASE_PROJECT_ID is unset — that fallback is a
 * typo and must NOT be used here; the env var (set in Vercel) is
 * `biznestusa`.
 */

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo'

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'biznestusa'

/** The single admin account (matches isAdmin() in firestore.rules). */
export const ADMIN_UID = '0LM7RVOwGIMVK4rwVD6muuzPYij1'

export type TokenFailure = { ok: false; status: number; error: string }

export type UserToken = {
  ok: true
  uid: string
  email: string | null
  emailVerified: boolean
}

export type AdminToken = { ok: true; uid: string }

function getBearerToken(request: { headers: Headers }): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

/**
 * Verify the `Authorization: Bearer <Firebase ID token>` header against
 * Google's tokeninfo endpoint. Checks the token is valid and unexpired
 * (tokeninfo rejects expired tokens), that `aud` is this Firebase
 * project, and that `iss` is this project's Secure Token issuer.
 * Returns the uid / email / email_verified claims on success.
 */
export async function verifyUserToken(request: {
  headers: Headers
}): Promise<UserToken | TokenFailure> {
  const idToken = getBearerToken(request)
  if (!idToken) {
    return {
      ok: false,
      status: 401,
      error: 'Missing Authorization: Bearer <Firebase ID token> header.',
    }
  }

  let res: Response
  try {
    res = await fetch(
      `${TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`,
      { cache: 'no-store' }
    )
  } catch {
    return {
      ok: false,
      status: 503,
      error: 'Token verification service unavailable. Please try again.',
    }
  }

  // tokeninfo returns 400 for an invalid, malformed or expired token.
  if (!res.ok) {
    return {
      ok: false,
      status: 401,
      error: 'Invalid or expired Firebase ID token.',
    }
  }

  const claims = (await res.json()) as Record<string, unknown>

  if (claims.aud !== FIREBASE_PROJECT_ID) {
    return {
      ok: false,
      status: 401,
      error: 'Token audience does not match this project.',
    }
  }
  if (claims.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
    return {
      ok: false,
      status: 401,
      error: 'Token issuer does not match this project.',
    }
  }
  if (typeof claims.sub !== 'string' || !claims.sub) {
    return { ok: false, status: 401, error: 'Token has no user id.' }
  }

  return {
    ok: true,
    uid: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : null,
    emailVerified:
      claims.email_verified === true || claims.email_verified === 'true',
  }
}

/**
 * Verify the caller is the admin: a valid Firebase ID token whose uid is
 * the admin UID. Returns 401 for a missing/invalid token, 403 for a valid
 * token belonging to a non-admin user. Never trust `isAdmin` / `adminId`
 * / `userId` from the request body or query string.
 */
export async function verifyAdminToken(request: {
  headers: Headers
}): Promise<AdminToken | TokenFailure> {
  const verified = await verifyUserToken(request)
  if (!verified.ok) return verified
  if (verified.uid !== ADMIN_UID) {
    return {
      ok: false,
      status: 403,
      error: 'Forbidden: admin access required.',
    }
  }
  return { ok: true, uid: verified.uid }
}

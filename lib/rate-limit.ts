/**
 * Small dependency-free, in-memory fixed-window rate limiter.
 *
 * Two uses:
 *  - Server (Next.js route handlers): `checkRateLimit(key, preset)` with
 *    `getClientIp(request)` for a per-IP key, plus a per-uid key where a
 *    verified Firebase uid is available (key the bucket on the uid, not
 *    the IP, so one bad actor cannot exhaust a shared IP's budget and a
 *    single user behind NAT is not punished for neighbours).
 *  - Client (form submits): `checkClientRateLimit(key, preset)` — a
 *    UX-level guard only. It is trivially bypassable (clear storage /
 *    call the API directly), so it must never be the only control on a
 *    sensitive flow. For login/register the real enforcement is Firebase
 *    Auth's own server-side throttling; this just stops casual UI abuse.
 *
 * LIMITS — these are first-layer abuse controls, NOT a replacement for
 * provider-side controls (Firebase Auth throttling, Brevo/OpenAI quotas,
 * WAF rules). In-memory counters reset when the serverless instance is
 * recycled, and each instance keeps its own counters, so a determined
 * attacker can get a fresh budget per instance. That is acceptable for
 * this site's threat model (low-traffic directory, dormant keys) but
 * must be revisited if abuse appears: the next step is a shared store
 * (Upstash Redis / Vercel KV) or provider-side limits.
 *
 * Default budgets (justification):
 *  - login / register: 5 attempts / 15 min per IP (and per email on the
 *    client). A real user mistypes a password a few times; 5 covers that
 *    while making credential stuffing ~20 tries/hour/IP — slow enough to
 *    be useless, and Firebase Auth throttles server-side on top.
 *  - contact / mail: 10 / hour per IP. A legitimate visitor sends one
 *    contact message; 10 leaves room for retries without letting one IP
 *    flood the support inbox or burn Brevo quota.
 *  - chat: 20 / hour per authenticated uid (plus 20 / hour per IP
 *    pre-auth, so unauthenticated floods never reach token verification).
 *    A real user asks a handful of questions per visit; 20 caps the
 *    OpenAI spend per account at 20 x 500 tokens/hour.
 *  - submit (public forms: add business/company/professional, post job,
 *    job apply, professional inquiry, payment proof): 10 / hour per IP.
 *    Legitimate submissions are rare (one per visit); 10 stops listing
 *    spam floods while allowing a user to fix and resubmit a few times.
 *  - adminMail: 30 / hour per IP. The caller is the single verified
 *    admin approving listings in a batch; 30 is generous for batch work
 *    and still caps the damage if an admin token is ever stolen.
 */

export type RateLimitPreset = { limit: number; windowMs: number }

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 15 * 60 * 1000 },
  contact: { limit: 10, windowMs: 60 * 60 * 1000 },
  chat: { limit: 20, windowMs: 60 * 60 * 1000 },
  submit: { limit: 10, windowMs: 60 * 60 * 1000 },
  adminMail: { limit: 30, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitPreset>

export type RateLimitResult = {
  allowed: boolean
  /** Requests remaining in the current window (0 when blocked). */
  remaining: number
  /** Seconds until the current window resets (0 when allowed). */
  resetAfterSeconds: number
}

type Bucket = { count: number; resetAt: number }

/** Hard cap on tracked buckets so a flood of distinct keys cannot grow memory unboundedly. */
const MAX_BUCKETS = 10_000

function createStore() {
  const buckets = new Map<string, Bucket>()
  return {
    check(key: string, { limit, windowMs }: RateLimitPreset): RateLimitResult {
      const now = Date.now()
      const bucket = buckets.get(key)
      if (!bucket || now >= bucket.resetAt) {
        // New window. Prune expired buckets opportunistically (cheap,
        // amortised: only when we create a fresh bucket).
        if (buckets.size >= MAX_BUCKETS) {
          for (const [k, b] of buckets) {
            if (now >= b.resetAt) buckets.delete(k)
          }
          // Still full after pruning: drop the oldest entry to stay bounded.
          if (buckets.size >= MAX_BUCKETS) {
            const oldest = buckets.keys().next()
            if (!oldest.done) buckets.delete(oldest.value)
          }
        }
        buckets.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, remaining: limit - 1, resetAfterSeconds: 0 }
      }
      if (bucket.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
        }
      }
      bucket.count += 1
      return {
        allowed: true,
        remaining: limit - bucket.count,
        resetAfterSeconds: 0,
      }
    },
  }
}

/** Server-side store (one per serverless instance — see header note). */
const serverStore = createStore()

/** Client-side store (one per page load — UX guard only, see header note). */
const clientStore = createStore()

/**
 * Server-side fixed-window check. `key` must already include its scope,
 * e.g. `contact:<ip>` or `chat:uid:<uid>`.
 */
export function checkRateLimit(
  key: string,
  preset: RateLimitPreset
): RateLimitResult {
  return serverStore.check(key, preset)
}

/**
 * Client-side fixed-window check for form submits. Same semantics as
 * checkRateLimit but backed by a separate per-page-load store. UX guard
 * only — never the sole control on a sensitive flow.
 */
export function checkClientRateLimit(
  key: string,
  preset: RateLimitPreset
): RateLimitResult {
  return clientStore.check(key, preset)
}

/**
 * Best-effort client IP for a route handler. On Vercel, `x-forwarded-for`
 * starts with the real client IP; `x-real-ip` is the fallback. Returns
 * 'unknown' when neither header is present (shared bucket — still capped).
 * Note: this header is spoofable by a direct caller, so it is only a
 * rate-limit key, never an identity signal.
 */
export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}

/**
 * Standard 429 response for a rate-limited route handler. Sets
 * Retry-After so well-behaved clients back off. Uses the global
 * `Response` (not NextResponse) so this module stays importable from
 * client components.
 */
export function rateLimitExceededResponse(resetAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: 'rate_limited',
      message: 'Too many requests. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.max(1, resetAfterSeconds)),
      },
    }
  )
}

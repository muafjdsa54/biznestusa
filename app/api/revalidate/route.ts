import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminToken } from '@/lib/server-auth'

/**
 * POST /api/revalidate — on-demand ISR revalidation, admin-only.
 *
 * Newly approved listings otherwise stay stale up to the 7-day
 * revalidate window (see BIZNESTUSA-SCORE-REPORT-2026-11-08: live
 * /city/new-york rendered empty from a build-time fetch that returned
 * 0). Admin approve handlers call this fire-and-forget after a
 * successful approve so the public page goes live immediately.
 *
 * Auth: the caller's Firebase ID token (Authorization: Bearer header)
 * must verify as the admin UID — see lib/server-auth.ts
 * verifyAdminToken. Never trust isAdmin / adminId / userId from the
 * request body or query string.
 *
 * Body: { "path": "/business/<slug>" } or { "paths": [...] }.
 * Paths are validated: must be a same-site absolute path (no scheme,
 * host, backslash or ".." traversal).
 */

function isSafePath(p: unknown): p is string {
  if (typeof p !== 'string') return false
  if (p.length < 1 || p.length > 500) return false
  if (!p.startsWith('/')) return false
  if (p.includes('\\') || p.includes('..') || p.includes('//')) return false
  if (/[\s<>]/.test(p)) return false
  return true
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const paths: string[] = []
  if (typeof body === 'object' && body !== null) {
    const { path, paths: multi } = body as { path?: unknown; paths?: unknown }
    if (path !== undefined) {
      if (!isSafePath(path)) {
        return NextResponse.json({ error: 'Invalid path.' }, { status: 400 })
      }
      paths.push(path)
    }
    if (Array.isArray(multi)) {
      for (const p of multi) {
        if (!isSafePath(p)) {
          return NextResponse.json({ error: 'Invalid path in paths array.' }, { status: 400 })
        }
        paths.push(p)
      }
    }
  }

  if (paths.length === 0) {
    return NextResponse.json(
      { error: 'Provide "path" (string) or "paths" (string[]).' },
      { status: 400 }
    )
  }
  if (paths.length > 20) {
    return NextResponse.json({ error: 'At most 20 paths per request.' }, { status: 400 })
  }

  // revalidatePath only marks paths stale; the actual regeneration
  // happens on the next visit, so 20 marks cost this request nothing
  // measurable. (Raised from 10 on 2026-11-08, round 3: a business with
  // many branch cities needs detail + homepage + directory + category +
  // 2 paths per city, which exceeds 10 past 3 cities. Auth and the
  // fire-and-forget approve flow are unchanged.)

  for (const p of paths) {
    revalidatePath(p)
  }

  return NextResponse.json({ ok: true, revalidated: paths })
}

import { NextRequest, NextResponse } from 'next/server'
import { submitJobApplication } from '@/lib/job-application-service'
import { verifyUserToken } from '@/lib/server-auth'
import { verifyTurnstileToken } from '@/lib/turnstile'
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
    const body = await req.json()
    const { action, jobId, jobTitle, companyName, coverNote } = body

    // REMOVED (audit P1-1): the `check_email` action was an email oracle —
    // it told any unauthenticated caller whether an email belongs to a
    // (verified) professional and returned their name/title/city/avatar/
    // username. It is gone; no professional details are ever returned for
    // an email address here. Applicants sign in and apply as themselves.
    if (action === 'check_email') {
      return NextResponse.json({
        success: false,
        found: false,
        message: 'Email lookup is disabled. Sign in with your verified professional account to apply.'
      }, { status: 400 })
    }

    if (action === 'apply') {
      // Cloudflare Turnstile: verified server-side when keys are set
      // (user's job). Gracefully disabled without keys — verifyTurnstileToken
      // returns { success: true, skipped: true } then.
      const turnstile = await verifyTurnstileToken(body.turnstileToken, getClientIp(req))
      if (!turnstile.success) {
        return NextResponse.json(
          { success: false, message: 'Security check failed. Please complete the verification and try again.' },
          { status: 400 }
        )
      }

      // P1-1: the applicant must prove they own the email they apply with.
      // The email comes from the verified ID token, never from the body.
      const auth = await verifyUserToken(req)
      if (!auth.ok) {
        return NextResponse.json(
          { success: false, message: auth.error },
          { status: auth.status }
        )
      }
      const applicantEmail = (auth.email || '').trim().toLowerCase()
      if (!applicantEmail) {
        return NextResponse.json({
          success: false,
          message: 'Your account has no email address. Please sign in with an email account to apply.'
        }, { status: 403 })
      }

      if (!jobId || !jobTitle || !companyName) {
        return NextResponse.json({
          success: false,
          message: 'Missing required application fields (jobId, jobTitle, companyName).'
        }, { status: 400 })
      }

      const result = await submitJobApplication({
        jobId,
        jobTitle,
        companyName,
        email: applicantEmail,
        coverNote
      })

      if (!result.success) {
        return NextResponse.json({
          success: false,
          code: result.code,
          message: result.message
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        code: 'SUBMITTED',
        message: result.message,
        application: result.application
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid action specified.' }, { status: 400 })
  } catch (error: any) {
    console.error('Job application API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Server error processing job application. Please try again.'
    }, { status: 500 })
  }
}

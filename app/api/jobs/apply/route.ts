import { NextRequest, NextResponse } from 'next/server'
import { checkProfessionalByEmail, submitJobApplication } from '@/lib/job-application-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, email, jobId, jobTitle, companyName, coverNote } = body

    if (action === 'check_email') {
      if (!email) {
        return NextResponse.json({ success: false, message: 'Email address is required.' }, { status: 400 })
      }
      const check = await checkProfessionalByEmail(email)
      return NextResponse.json({
        success: check.found,
        found: check.found,
        isVerified: check.isVerified,
        professional: check.professional ? {
          name: check.professional.fullName || check.professional.name,
          title: check.professional.title,
          profession: check.professional.profession,
          city: check.professional.city,
          avatar: check.professional.avatar,
          username: check.professional.username,
          verified: check.isVerified
        } : null,
        message: check.message
      })
    }

    if (action === 'apply') {
      if (!email || !jobId || !jobTitle || !companyName) {
        return NextResponse.json({
          success: false,
          message: 'Missing required application fields (email, jobId, jobTitle, companyName).'
        }, { status: 400 })
      }

      const result = await submitJobApplication({
        jobId,
        jobTitle,
        companyName,
        email,
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

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  CheckCircle2, ShieldCheck, AlertTriangle, UserPlus, 
  ExternalLink, Mail, X, ArrowRight, 
  Sparkles, Building2, MapPin, Check, Briefcase, FileText, Lock
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { toast } from 'sonner'

interface JobInteractiveApplyProps {
  jobId?: string
  jobTitle: string
  companyName: string
  companyLogo?: string
  city?: string
  salary?: string
  type?: string
  applicationWebsite?: string
  publicJobPath?: string
}

interface ProfessionalPreview {
  name: string
  title?: string
  profession?: string
  city?: string
  avatar?: string
  username?: string
  verified?: boolean
}

export default function JobInteractiveApply({ 
  jobId = '',
  jobTitle, 
  companyName,
  companyLogo,
  city = 'United States',
  salary,
  type,
  applicationWebsite = '',
  publicJobPath = ''
}: JobInteractiveApplyProps) {
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applicantEmail, setApplicantEmail] = useState('')
  const [coverNote, setCoverNote] = useState('')
  
  // Verification & Profile State
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalPreview | null>(null)
  const [isVerifiedPro, setIsVerifiedPro] = useState(false)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [profileUnverified, setProfileUnverified] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [submittedCandidateName, setSubmittedCandidateName] = useState('')

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email && !applicantEmail) {
        setApplicantEmail(user.email)
        checkProfile(user.email)
      }
    })
    return () => unsubscribe()
  }, [])

  // Check if email belongs to a registered BizNest USA Professional
  const checkProfile = async (emailToCheck: string) => {
    const cleanEmail = emailToCheck.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) return

    setIsCheckingEmail(true)
    setProfileNotFound(false)
    setProfileUnverified(false)

    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_email',
          email: cleanEmail
        })
      })

      const data = await res.json()

      if (data.found && data.professional) {
        setProfessionalProfile(data.professional)
        const isVer = !!data.isVerified
        setIsVerifiedPro(isVer)
        setProfileNotFound(false)
        setProfileUnverified(!isVer)
      } else {
        setProfessionalProfile(null)
        setIsVerifiedPro(false)
        setProfileNotFound(true)
        setProfileUnverified(false)
      }
    } catch (err) {
      console.warn('Error verifying professional email:', err)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Handle BizNest USA Application Submission
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileNotFound(false)
    setProfileUnverified(false)

    const cleanEmail = applicantEmail.trim().toLowerCase()
    if (!cleanEmail) {
      toast.error('Please enter your registered professional email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          email: cleanEmail,
          jobId: jobId || 'job-' + encodeURIComponent(jobTitle.toLowerCase().replace(/\s+/g, '-')),
          jobTitle,
          companyName,
          coverNote
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setApplicationSubmitted(true)
        setSubmittedCandidateName(data.application?.applicantName || professionalProfile?.name || 'Verified Candidate')
        toast.success(`Application successfully submitted to ${companyName}!`)
      } else {
        if (data.code === 'PROFILE_NOT_FOUND') {
          setProfileNotFound(true)
          setProfileUnverified(false)
          setProfessionalProfile(null)
          toast.error('Account Not Found: You are not registered. Please create your free profile first to apply.', { duration: 5000 })
        } else if (data.code === 'PROFILE_UNVERIFIED') {
          setProfileUnverified(true)
          setProfileNotFound(false)
          toast.error('Profile Unverified: Your profile is not verified yet. Please verify your profile to apply for jobs.', { duration: 5000 })
        } else {
          toast.error(data.message || 'Failed to submit application.', { duration: 5000 })
        }
      }
    } catch (err) {
      toast.error('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetModalState = () => {
    setShowApplyModal(false)
    setProfileNotFound(false)
    setProfileUnverified(false)
    setApplicationSubmitted(false)
    setCoverNote('')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setShowApplyModal(true)
          if (applicantEmail && !professionalProfile && !profileNotFound) {
            checkProfile(applicantEmail)
          }
        }}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-100" />
        <span>Apply on BizNest USA <span className="text-emerald-200 font-medium">(Recommended)</span></span>
      </button>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto font-sans">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  BizNest USA Verified Application
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">{jobTitle}</h3>
                <p className="text-xs text-slate-500 font-medium">{companyName} • {city}</p>
              </div>
              <button
                onClick={resetModalState}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OPTION 1: OFFICIAL CAREER SITE (If Provided) */}
            {applicationWebsite && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">Official Employer Careers Portal</h4>
                      <p className="text-[11px] text-slate-500">Apply directly on {companyName}&apos;s website</p>
                    </div>
                  </div>
                  <a
                    href={applicationWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Go to Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* OPTION 2: APPLY VIA VERIFIED BIZNEST USA PROFESSIONAL PROFILE (RECOMMENDED) */}
            <div className="p-5 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                    <span>Apply with BizNest USA Professional Profile</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                      Recommended
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Your verified credentials, contact details, and CV will be automatically verified and dispatched to {companyName}.
                  </p>
                </div>
              </div>

              {/* SUCCESS STATE */}
              {applicationSubmitted ? (
                <div className="p-5 bg-emerald-100/80 rounded-2xl border border-emerald-300 text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-emerald-950 text-base">Application Sent Successfully!</h5>
                    <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                      Thank you, <strong>{submittedCandidateName}</strong>. Your verified BizNest USA professional profile and CV have been securely dispatched to <strong>{companyName}</strong> recruitment team and listed in your applications dashboard.
                    </p>
                  </div>
                  <button
                    onClick={resetModalState}
                    className="mt-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3.5">
                  
                  {/* Email Input with Verification check */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Your Registered Professional Email <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => {
                          setApplicantEmail(e.target.value)
                          if (profileNotFound) setProfileNotFound(false)
                          if (profileUnverified) setProfileUnverified(false)
                        }}
                        onBlur={() => {
                          if (applicantEmail && !professionalProfile) {
                            checkProfile(applicantEmail)
                          }
                        }}
                        placeholder="e.g. yourname@example.com"
                        className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => checkProfile(applicantEmail)}
                        disabled={isCheckingEmail || !applicantEmail}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isCheckingEmail ? 'Checking...' : 'Verify'}
                      </button>
                    </div>
                  </div>

                  {/* IDENTIFIED PROFESSIONAL PROFILE PREVIEW */}
                  {professionalProfile && (
                    <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in-50 ${
                      isVerifiedPro ? 'bg-emerald-50/90 border-emerald-200' : 'bg-amber-50/90 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        {professionalProfile.avatar ? (
                          <Image
                            src={professionalProfile.avatar}
                            alt={professionalProfile.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {professionalProfile.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-xs truncate">
                              {professionalProfile.name}
                            </span>
                            {isVerifiedPro ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                Verified Professional
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full border border-amber-200">
                                Unverified
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-600 truncate">
                            {professionalProfile.title || professionalProfile.profession || 'Professional'} • {professionalProfile.city || city}
                          </p>
                        </div>
                      </div>

                      {isVerifiedPro ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Ready to Apply
                        </span>
                      ) : (
                        <Link
                          href="/dashboard/professional/verify"
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verify Profile</span>
                        </Link>
                      )}
                    </div>
                  )}

                  {/* CASE 1: NOT REGISTERED ON BIZNEST USA */}
                  {profileNotFound && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-3 animate-in fade-in-50">
                      <div className="flex items-start gap-2.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">You are not registered on BizNest USA</strong>
                          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                            No professional profile was found for <code className="font-bold text-amber-900 bg-amber-100 px-1 py-0.5 rounded">{applicantEmail}</code>. Please create your free professional profile first to apply for jobs on BizNest USA.
                          </p>
                        </div>
                      </div>

                      <div>
                        <Link
                          href="/add-professional"
                          className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Create Free Professional Profile</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* CASE 2: REGISTERED BUT UNVERIFIED */}
                  {profileUnverified && (
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs space-y-3 animate-in fade-in-50">
                      <div className="flex items-start gap-2.5 text-blue-900">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Profile Verification Required</strong>
                          <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                            Your profile has been created, but it is not verified yet. Please verify your profile to activate verified job applications and send your credentials to hiring employers.
                          </p>
                        </div>
                      </div>

                      <div>
                        <Link
                          href="/dashboard/professional"
                          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Go to Professional Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Cover Note */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Cover Note / Message for {companyName} <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Brief note highlighting your relevant experience and why you are a great fit..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isCheckingEmail || (professionalProfile !== null && !isVerifiedPro)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSubmitting 
                        ? 'Verifying Profile & Submitting...' 
                        : (isVerifiedPro ? 'Submit Verified Application' : 'Submit Application via BizNest USA')}
                    </span>
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      )}
    </>
  )
}

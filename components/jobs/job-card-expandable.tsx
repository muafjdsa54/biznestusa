'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Briefcase, MapPin, Building2, ChevronDown, ChevronUp, Check, 
  Sparkles, ExternalLink, ShieldCheck, Mail, AlertTriangle, 
  CheckCircle2, X, ArrowRight, UserPlus, Clock, DollarSign, Award
} from 'lucide-react'
import { JobItem } from '@/lib/data'
import { toast } from 'sonner'

interface JobCardExpandableProps {
  job: JobItem
}

export default function JobCardExpandable({ job }: JobCardExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)

  // BizNest USA Application Form State
  const [applicantEmail, setApplicantEmail] = useState('')
  const [coverNote, setCoverNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [profileUnverified, setProfileUnverified] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [submittedCandidateName, setSubmittedCandidateName] = useState('')

  const careerSiteUrl = job.applicationWebsite || job.applicationUrl || ''

  const handleBiznestApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileNotFound(false)
    setProfileUnverified(false)

    const cleanEmail = applicantEmail.trim()
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
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.company,
          coverNote
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setApplicationSubmitted(true)
        setSubmittedCandidateName(data.application?.applicantName || 'Professional Candidate')
        toast.success(`Application successfully submitted to ${job.company}!`)
      } else {
        if (data.code === 'PROFILE_NOT_FOUND') {
          setProfileNotFound(true)
          setProfileUnverified(false)
          toast.error('Account Not Found: You are not registered on BizNest USA. Please create your free profile first to apply.', { duration: 5000 })
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
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group">
      
      {/* Card Top / Header Summary */}
      <div className="p-6 space-y-4">
        
        {/* Company & Role Header */}
        <div className="flex items-start gap-4">
          <Image
            src={job.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
            alt={job.company}
            width={52}
            height={52}
            loading="lazy"
            sizes="52px"
            className="w-13 h-13 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                {job.type}
              </span>
              {job.cities && job.cities.length > 1 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {job.cities.length} Cities
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors leading-snug">
              {job.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              {job.companySlug ? (
                <Link
                  href={`/companies/${job.companySlug}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{job.company}</span>
                </Link>
              ) : (
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{job.company}</span>
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-[200px]" title={job.cities ? job.cities.join(', ') : job.city}>
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {job.cities && job.cities.length > 1
                  ? (job.cities.length <= 2 ? job.cities.join(', ') : `${job.cities.slice(0, 2).join(', ')} (+${job.cities.length - 2} cities)`)
                  : job.city}
              </span>
            </div>
          </div>
        </div>

        {/* Short preview description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Salary</span>
            <span className="font-extrabold text-slate-900 text-xs">{job.salary}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Experience</span>
            <span className="font-bold text-slate-800 text-xs">{job.experience || '1 - 3 Years'}</span>
          </div>
        </div>

        {/* EXPANDABLE SECTION (Full Details) */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-slate-200/90 animate-in fade-in-50 duration-200">
            
            {/* Multi-branch list if applicable */}
            {job.cities && job.cities.length > 1 && (
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/60 text-xs space-y-1.5">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Available Across {job.cities.length} Cities:</span>
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {job.cities.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-white text-blue-800 rounded-lg text-[11px] font-bold border border-blue-100 shadow-2xs">
                      📍 {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Description */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Full Job Description</h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                {job.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Key Responsibilities</h4>
                <div className="space-y-1.5">
                  {job.responsibilities.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Role Requirements</h4>
                <div className="space-y-1.5">
                  {job.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Target Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-lg text-slate-800 font-semibold text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block font-medium">Vacancies</span>
                <span className="font-extrabold text-slate-900">{job.vacancies || 1} Position(s)</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Employment Type</span>
                <span className="font-extrabold text-slate-900">{job.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Application Route</span>
                <span className="font-bold text-emerald-700">Careers Site / BizNest USA (Recommended)</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Card Action Controls Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        
        {/* Toggle Details Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Apply Button */}
          <button
            onClick={() => {
              setProfileNotFound(false)
              setProfileUnverified(false)
              setApplicationSubmitted(false)
              setShowApplyModal(true)
            }}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* APPLICATION POPUP / MODAL                                                 */}
      {/* ========================================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto font-sans">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Choose Application Method
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">{job.title}</h3>
                <p className="text-xs text-slate-500">{job.company} • {job.city}</p>
              </div>
              <button
                onClick={resetModalState}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OPTION 1: OFFICIAL CAREER SITE (If Provided) */}
            {careerSiteUrl && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">Official Employer Careers Portal</h4>
                      <p className="text-[11px] text-slate-500">Apply directly on {job.company}&apos;s website</p>
                    </div>
                  </div>
                  <a
                    href={careerSiteUrl}
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

            {/* OPTION 2: APPLY ON BIZNEST USA (PROFESSIONAL EMAIL VERIFICATION) - RECOMMENDED */}
            <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/70 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                    <span>Apply via Verified BizNest USA Profile</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                      Recommended
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Enter your email to verify your professional profile and send your CV &amp; credentials to our recruitment dashboard.
                  </p>
                </div>
              </div>

              {/* SUCCESS CONFIRMATION VIEW */}
              {applicationSubmitted ? (
                <div className="p-4 bg-emerald-100/70 rounded-2xl border border-emerald-300 text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
                  <h5 className="font-extrabold text-emerald-950 text-sm">Application Sent Successfully!</h5>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you, <strong>{submittedCandidateName}</strong>. Your verified profile and CV have been received and listed on our recruitment dashboard.
                  </p>
                  <button
                    onClick={resetModalState}
                    className="mt-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBiznestApply} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Your Professional Email Address <span className="text-emerald-600">*</span>
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
                        placeholder="e.g. yourname@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Cover Note / Message for Employer <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Brief note highlighting your relevant experience..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* CASE 1: NOT REGISTERED ON BIZNEST USA */}
                  {profileNotFound && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-3 animate-in fade-in-50">
                      <div className="flex items-start gap-2.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">You are not registered on BizNest USA</strong>
                          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                            No professional profile was found for <code className="font-bold text-amber-900 bg-amber-100 px-1 py-0.5 rounded">{applicantEmail}</code>. Please create your free professional profile first to apply for jobs.
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
                          href="/dashboard/professional/verify"
                          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify Profile Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verifying & Submitting...' : 'Submit Application via BizNest USA'}</span>
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

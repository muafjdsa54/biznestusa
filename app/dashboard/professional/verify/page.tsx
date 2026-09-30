'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { 
  ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Upload, 
  Building, AlertCircle, Sparkles, Check, 
  FileText, Lock, Clock, Eye, X, Award
} from 'lucide-react'
import { toast } from 'sonner'
import { ProfessionalItem } from '@/lib/data'
import { getProfessionalForDashboard, submitVerificationRequest } from '@/lib/professional-service'

function ProfessionalVerificationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<ProfessionalItem | null>(null)
  const [loading, setLoading] = useState(true)

  // Verification Form State
  const [credentialType, setCredentialType] = useState('State Professional License')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [issuingState, setIssuingState] = useState('')
  const [issuingAuthority, setIssuingAuthority] = useState('')
  const [verificationUrl, setVerificationUrl] = useState('')
  const [docBase64, setDocBase64] = useState<string | null>(null)
  const [docFileName, setDocFileName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const urlUsername = searchParams.get('username') || ''
        let userIdentifier = urlUsername
        if (!userIdentifier) {
          const session = sessionStorage.getItem('biznestusa_user_session') || localStorage.getItem('biznestusa_user_session') || sessionStorage.getItem('listpak_user_session') || localStorage.getItem('listpak_user_session')
          if (session) {
            const parsed = JSON.parse(session)
            userIdentifier = parsed.username || parsed.email || ''
          }
        }

        const pro = await getProfessionalForDashboard(userIdentifier)
        setProfile(pro)

        if (pro?.verificationRequestStatus === 'PENDING') {
          setSubmittedSuccess(true)
        }
      } catch (err) {
        console.error('Error fetching professional:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchParams])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.')
      return
    }

    setDocFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      setDocBase64(event.target?.result as string)
      toast.success('Document attached successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      toast.error('Profile not found. Please log in or create a profile first.')
      return
    }

    if (!licenseNumber.trim() && !verificationUrl.trim() && !docBase64) {
      setErrorMsg('Please provide a License/Registration ID, a verification URL, or attach credential document proof.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      await submitVerificationRequest(profile.username || profile.id, {
        amount: 0,
        paymentMethod: credentialType,
        transactionRef: licenseNumber.trim() || verificationUrl.trim() || 'Document Verification',
        paymentScreenshot: docBase64 || '',
        submittedAt: new Date().toISOString()
      })

      setSubmittedSuccess(true)
      toast.success('Verification request submitted for compliance review!')
      window.scrollTo({ top: 100, behavior: 'smooth' })
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading verification details...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/dashboard/professional"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-slate-400 font-medium">Step: Credential Verification</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Official Verified Professional Status</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Professional Verification &amp; Trust Badge
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Verify your credentials to display the verified checkmark badge across search results and on your public portfolio page.
              </p>
            </div>
            
            <div className="px-4 py-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs text-center shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200 block">Verification Fee</span>
              <span className="text-2xl font-extrabold text-white">Free</span>
            </div>
          </div>
        </div>

        {/* Success Confirmation State */}
        {submittedSuccess ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Verification Request Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{profile?.name}</strong>. Your credential verification documents have been received by our compliance desk.
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 text-left max-w-md mx-auto space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Review Timeline:</strong> 1 to 2 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Outcome:</strong> Verified checkmark badge activated upon confirmation</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/professional"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Back to Dashboard
              </Link>
              {profile?.username && (
                <Link
                  href={`/professionals/${profile.username}`}
                  target="_blank"
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Public Profile</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Main Verification Submission Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-900">Submit Verification Evidence</h2>
                <p className="text-xs text-slate-500">Provide details for credential review by our editorial team.</p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Credential Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Credential Type *</label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="State Professional License">State Professional License (Medical, Legal, Engineering, Contractor)</option>
                  <option value="Board Certification / Registry">Board Certification / National Registry</option>
                  <option value="University Degree / Academic Credential">University Degree / Higher Education</option>
                  <option value="Public Verified Portfolio / GitHub / LinkedIn">Verified Public Portfolio / GitHub / LinkedIn</option>
                  <option value="Trade Certification">Trade Certification / Skilled Trade License</option>
                </select>
              </div>

              {/* License Number & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">License / Registration Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. CA-MD-982341 or NY-BAR-77123"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Issuing State / Jurisdiction</label>
                  <input
                    type="text"
                    value={issuingState}
                    onChange={(e) => setIssuingState(e.target.value)}
                    placeholder="e.g. California, New York, Texas"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Issuing Authority / Verification URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Online Registry Verification Link <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={verificationUrl}
                  onChange={(e) => setVerificationUrl(e.target.value)}
                  placeholder="https://search.dca.ca.gov/... or official state board registry link"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Upload Credential Document or Photo Proof
                </label>

                {docBase64 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{docFileName || 'Credential Document Attached'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDocBase64(null); setDocFileName(''); }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Click to upload license certificate, diploma, or business card
                    </span>
                    <span className="text-[11px] text-slate-400">PNG, JPG, PDF or WEBP (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Verification Credentials'}</span>
              </button>
            </form>

            {/* Sidebar Benefits */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Why Verify Your Profile?</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p><strong>Verified Badge:</strong> Stand out with a green verified checkmark on directory searches.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p><strong>Search Priority:</strong> Verified professionals appear higher in regional and category rankings.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p><strong>Employer Trust:</strong> Companies hiring via the BizNestUSA jobs board prefer verified candidates.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 block">Privacy Notice</span>
                <p>Personal identification documents are solely used for verification purposes and are never published publicly on the website.</p>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}

export default function ProfessionalVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfessionalVerificationContent />
    </Suspense>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, Briefcase, MapPin, Phone, Mail, Globe, ShieldCheck, CheckCircle2, 
  Sparkles, ArrowRight, ArrowLeft, Star, Linkedin, Plus, Trash2, UserCheck, Check, Upload
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { STATE_CITIES, US_STATES } from '@/lib/data'
import { loadStates, loadCities, stateCodeForName, searchCities, type GeoState, type GeoCity } from '@/lib/geo-data'
import { saveCompanyToDatabase } from '@/lib/company-service'
import TurnstileWidget from '@/components/turnstile-widget'
import { isTurnstileWidgetEnabled, verifyTurnstileTokenClient } from '@/lib/turnstile'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth'
import StickyWebsiteBanner from '@/components/business/sticky-website-banner'
import { isValidPersonName, validatePersonName, filterPersonNameInput, isValidUsPhone, validateUsPhone, formatUsPhone, isValidEmail } from '@/lib/validation'
import { toast } from 'sonner'

const COMPANY_TYPES = [
  'Private',
  'Public',
  'Government',
  'NGO',
  'Startup',
  'Educational Institution',
  'Recruitment Agency',
  'Other'
]

const INDUSTRIES = [
  'Technology & IT',
  'Construction & Building',
  'Healthcare & Medical',
  'Education & Training',
  'Finance & Banking',
  'Restaurants & Food',
  'Retail & E-commerce',
  'Real Estate & Property',
  'Manufacturing & Industrial',
  'Media, PR & Advertising',
  'Logistics & Courier',
  'Legal & Law Services',
  'Other Industry'
]

export default function AddCompanyClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    category: 'Hiring Company / HR',
    companySize: '',
    establishedYear: '',
    companyType: '' as any,
    website: '',
    careersUrl: '',

    // HR Contact
    hrName: '',
    hrDesignation: '',
    hrEmail: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    province: '',

    // Social Links — only LinkedIn is rendered. The other social fields
    // (facebook, instagram, twitter, youtube, github), registrationNumber,
    // headquarters, googleMapUrl, companyEmail, employeeCount and coverImage
    // were dead state silently submitted unseen, so they are deleted here
    // rather than shipped with invented values.
    linkedin: '',

    // Description & Images
    description: '',
    logo: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Word count for the description floor (30 words, matching add-business).
  const descriptionWordCount = formData.description.trim()
    ? formData.description.trim().split(/\s+/).filter(Boolean).length
    : 0

  // Auth gate: submitting requires a signed-in account with a verified
  // email (hardened firestore.rules: creates need verified email + the
  // caller's own identity). Never submit anonymously.
  const [authUser, setAuthUser] = useState<{ uid: string; email: string | null; emailVerified: boolean } | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [resendingVerification, setResendingVerification] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setAuthUser(fbUser ? { uid: fbUser.uid, email: fbUser.email, emailVerified: fbUser.emailVerified } : null)
      setAuthChecking(false)
    })
    return () => unsubscribe()
  }, [])

  const requireVerifiedAuth = async (): Promise<{ uid: string; email: string } | null> => {
    const user = auth.currentUser
    if (!user) {
      toast.error('Please sign in to submit this company profile. Log in or create an account first.')
      return null
    }
    try { await user.reload() } catch { /* fall through with the cached token state */ }
    if (!user.emailVerified) {
      toast.error('Please verify your email before submitting — check your inbox for the verification link.')
      return null
    }
    return { uid: user.uid, email: user.email || '' }
  }

  const handleResendVerification = async () => {
    const user = auth.currentUser
    if (!user) return
    setResendingVerification(true)
    try {
      await sendEmailVerification(user)
      toast.success('Verification email sent — please check your inbox.')
    } catch {
      toast.error('Could not send the verification email. Please try again in a few minutes.')
    } finally {
      setResendingVerification(false)
    }
  }

  const authBanner = (
    <>
      {!authChecking && !authUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
          <p className="font-extrabold">Sign in to submit your company profile</p>
          <p className="text-amber-800 leading-relaxed">Submitting requires a signed-in account with a verified email. Your profile is reviewed before it goes public.</p>
          <p className="pt-1">
            <Link href="/login" className="font-bold text-blue-700 underline mr-3">Log in</Link>
            <Link href="/register" className="font-bold text-blue-700 underline">Create an account</Link>
          </p>
        </div>
      )}
      {!authChecking && authUser && !authUser.emailVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
          <p className="font-extrabold">Verify your email to submit</p>
          <p className="text-amber-800 leading-relaxed">We sent a verification link to {authUser.email}. Your profile can only be submitted after you verify.</p>
          <button type="button" onClick={handleResendVerification} disabled={resendingVerification} className="font-bold text-blue-700 underline disabled:opacity-50 cursor-pointer">
            {resendingVerification ? 'Sending…' : 'Resend verification email'}
          </button>
        </div>
      )}
      {!authChecking && authUser?.emailVerified && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900">
          Submitting as <strong>{authUser.email}</strong> (verified).
        </div>
      )}
    </>
  )

  // Geo dataset (Census Gazetteer JSON in /public/data). States load once;
  // the selected state's cities load on demand. Any fetch failure falls back
  // to the hardcoded STATE_CITIES / US_STATES lists in lib/data.ts.
  // Stored values stay unchanged: city = plain name, province = state name.
  const [geoStates, setGeoStates] = useState<GeoState[] | null>(null)
  const [geoCities, setGeoCities] = useState<GeoCity[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)

  const fallbackCities = formData.province ? (STATE_CITIES[formData.province] || []) : []
  const usingGeoCities = geoCities.length > 0
  const availableCities = usingGeoCities ? geoCities.map(c => c.name) : fallbackCities
  const filteredCities = usingGeoCities
    ? searchCities(geoCities, citySearch).map(c => c.name)
    : availableCities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase().trim()))

  useEffect(() => {
    let cancelled = false
    loadStates()
      .then(list => { if (!cancelled) setGeoStates(list) })
      .catch(() => { /* fallback: US_STATES options + STATE_CITIES */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!formData.province) {
      setGeoCities([])
      setCitiesLoading(false)
      return
    }
    if (!geoStates) return // states still loading (or failed) — fallback list stays in use
    const code = stateCodeForName(formData.province, geoStates)
    if (!code) {
      setGeoCities([])
      return
    }
    let cancelled = false
    setCitiesLoading(true)
    setGeoCities([])
    loadCities(code)
      .then(list => { if (!cancelled) { setGeoCities(list); setCitiesLoading(false) } })
      .catch(() => { if (!cancelled) setCitiesLoading(false) /* fallback list stays in use */ })
    return () => { cancelled = true }
  }, [formData.province, geoStates])

  const validateStep = (step: number) => {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!formData.name.trim()) errs.name = 'Company Name is required'
      if (!formData.establishedYear.trim()) {
        errs.establishedYear = 'Established Year is required'
      } else if (!/^\d{4}$/.test(formData.establishedYear.trim())) {
        errs.establishedYear = 'Enter a valid 4-digit year (e.g. 2015)'
      } else {
        const yr = Number(formData.establishedYear.trim())
        const currentYear = new Date().getFullYear()
        if (yr < 1800 || yr > currentYear) {
          errs.establishedYear = `Enter a year between 1800 and ${currentYear}`
        }
      }
    }
    if (step === 2) {
      if (!formData.province) errs.province = 'State is required'
      if (!formData.city) errs.city = 'City is required'
    }
    if (step === 3) {
      if (formData.hrName.trim()) {
        const nVal = validatePersonName(formData.hrName)
        if (!nVal.isValid) {
          errs.hrName = nVal.error || 'HR Name must contain only alphabetic letters (no numbers like "232" or special symbols).'
        }
      }
      if (!formData.hrEmail.trim()) {
        errs.hrEmail = 'HR Contact Email is required'
      } else if (!isValidEmail(formData.hrEmail)) {
        errs.hrEmail = 'Please enter a valid email address'
      }
      if (!formData.phone.trim()) {
        errs.phone = 'Contact Phone Number is required'
      } else {
        const pVal = validateUsPhone(formData.phone)
        if (!pVal.isValid) {
          errs.phone = pVal.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX'
        }
      }
      if (formData.whatsapp.trim()) {
        const wVal = validateUsPhone(formData.whatsapp)
        if (!wVal.isValid) {
          errs.whatsapp = wVal.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX'
        }
      }
    }
    if (step === 4) {
      if (!formData.description.trim() || descriptionWordCount < 30) {
        errs.description = `Company description must be at least 30 words (currently ${descriptionWordCount} words)`
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(4)) {
      toast.error('Please complete required fields.')
      return
    }

    // Auth gate — blocks anonymous / unverified submits. saveCompanyToDatabase
    // already saves with status 'pending' (lib/company-service.ts:145); do not
    // override it here. Identity is passed so the hardened rules can match
    // the caller (userId is dropped by the service normalizer today — see report).
    const authed = await requireVerifiedAuth()
    if (!authed) return

    // Cloudflare Turnstile: when keys are set (user's job), a completed
    // check is required and verified server-side via /api/turnstile/verify.
    // With no keys configured the check is skipped and submit proceeds.
    if (isTurnstileWidgetEnabled()) {
      if (!turnstileToken) {
        toast.error('Please complete the security check before submitting.')
        return
      }
      const check = await verifyTurnstileTokenClient(turnstileToken)
      if (!check.success) {
        toast.error('Security check failed. Please try again.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const createdComp = await saveCompanyToDatabase({
        ...formData,
        userId: authed.uid,
        email: authed.email,
        ownerEmail: authed.email
      })
      setSubmittedSlug(createdComp.slug)
      toast.success('Hiring Company profile submitted successfully!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error('Failed to submit company profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <section className="bg-white text-slate-900 pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Company Hiring &amp; HR Profile</span>
          </span>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Register Your Company &amp; Start Hiring Talent
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Build your employer branding profile, publish job vacancies, and discover matching candidate profiles on BizNest USA.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs gap-2">
            <span className="text-slate-600 font-medium">Looking for individual professional registration instead?</span>
            <Link href="/add-professional" className="text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-1 shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Go to Professional Registration</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {submittedSlug ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Employer Verification Under Review</span>
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Company Profile Submitted for Review
              </h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                Your hiring profile for <strong className="text-slate-900">{formData.name}</strong> has been submitted for review. It will appear publicly only after our team approves it — no Verified Employer badge is granted automatically, and there is no fixed approval time.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/post-job"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Post First Job Opening</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/companies"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Browse Companies Directory
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {authBanner}
            <StickyWebsiteBanner businessName={formData.name} />
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { num: 1, label: 'Company Info' },
                { num: 2, label: 'Locations & Web' },
                { num: 3, label: 'HR Contact' },
                { num: 4, label: 'Social & Review' }
              ].map(s => (
                <div
                  key={s.num}
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  className={`py-2 px-1 rounded-xl transition-all font-bold ${
                    currentStep === s.num
                      ? 'bg-blue-600 text-white shadow-md'
                      : currentStep > s.num
                      ? 'bg-blue-50 text-blue-700 cursor-pointer'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <span>Step {s.num}</span>
                  <span className="hidden sm:inline block text-xs font-normal">{s.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
              
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Company Profile Information</h2>
                    <p className="text-xs text-slate-500 mt-1">Enter your organization details for job seekers across the United States.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Acme Innovations LLC"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Industry Taxonomy</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData(p => ({ ...p, industry: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select an industry</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Size</label>
                      <select
                        value={formData.companySize}
                        onChange={(e) => setFormData(p => ({ ...p, companySize: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select company size</option>
                        <option value="1 - 10 Employees">1 - 10 Employees (Startup)</option>
                        <option value="10 - 50 Employees">10 - 50 Employees</option>
                        <option value="50 - 200 Employees">50 - 200 Employees</option>
                        <option value="200 - 500 Employees">200 - 500 Employees</option>
                        <option value="500+ Employees">500+ Employees (Enterprise)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Type</label>
                      <select
                        value={formData.companyType}
                        onChange={(e: any) => setFormData(p => ({ ...p, companyType: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select company type</option>
                        {COMPANY_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Established Year *</label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        maxLength={4}
                        value={formData.establishedYear}
                        onChange={(e) => setFormData(p => ({ ...p, establishedYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="e.g. 2015"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.establishedYear && <p className="text-red-500 text-xs mt-1">{errors.establishedYear}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Headquarters & Web Presence</h2>
                    <p className="text-xs text-slate-500 mt-1">Provide your office address and careers website.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData(p => ({ ...p, province: e.target.value, city: '' }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a state</option>
                        {(geoStates ? geoStates.map(s => s.name) : US_STATES).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                    </div>

                    {/* Searchable City (narrowed to the selected state) */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onClick={() => setIsCityDropdownOpen(true)}
                        onChange={(e) => {
                          setFormData(p => ({ ...p, city: e.target.value }))
                          setCitySearch(e.target.value)
                          setIsCityDropdownOpen(true)
                        }}
                        placeholder={formData.province ? 'Search city in selected state...' : 'Select a state first'}
                        disabled={!formData.province}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      {citiesLoading && formData.province && (
                        <p className="text-slate-400 text-xs mt-1">Loading cities…</p>
                      )}

                      {isCityDropdownOpen && formData.province && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {citiesLoading && (
                            <div className="px-3 py-2 text-xs text-slate-400">Loading cities…</div>
                          )}
                          {filteredCities.map(c => (
                            <div
                              key={c}
                              onClick={() => {
                                setFormData(p => ({ ...p, city: c }))
                                setIsCityDropdownOpen(false)
                              }}
                              className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                            >
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Office Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                        placeholder="Suite #, Street, City, State ZIP..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Website URL</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                        placeholder="https://company.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Careers Page / ATS URL</label>
                      <input
                        type="url"
                        value={formData.careersUrl}
                        onChange={(e) => setFormData(p => ({ ...p, careersUrl: e.target.value }))}
                        placeholder="https://company.com/careers"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">HR & Talent Acquisition Contact</h2>
                    <p className="text-xs text-slate-500 mt-1">Contact information for candidate applications and verification.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">HR Representative Name</label>
                      <input
                        type="text"
                        value={formData.hrName}
                        onChange={(e) => setFormData(p => ({ ...p, hrName: filterPersonNameInput(e.target.value) }))}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.hrName ? (
                        <p className="text-red-500 text-xs mt-1">{errors.hrName}</p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">Alphabetic letters only (no numbers like &quot;232&quot;).</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">HR Designation</label>
                      <input
                        type="text"
                        value={formData.hrDesignation}
                        onChange={(e) => setFormData(p => ({ ...p, hrDesignation: e.target.value }))}
                        placeholder="e.g. Head of Talent Acquisition"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">HR / Careers Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.hrEmail}
                        onChange={(e) => setFormData(p => ({ ...p, hrEmail: e.target.value }))}
                        placeholder="careers@company.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.hrEmail && <p className="text-red-500 text-xs mt-1">{errors.hrEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Office Phone (USA Standard) *</label>
                      <input
                        type="tel"
                        required
                        maxLength={17}
                        value={formData.phone}
                        onChange={(e) => setFormData(p => ({ ...p, phone: formatUsPhone(e.target.value) }))}
                        placeholder="+1 (555) 019-8000"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.phone ? (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Direct HR Line (USA Standard)</label>
                      <input
                        type="tel"
                        maxLength={17}
                        value={formData.whatsapp}
                        onChange={(e) => setFormData(p => ({ ...p, whatsapp: formatUsPhone(e.target.value) }))}
                        placeholder="+1 (555) 019-9000"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.whatsapp ? (
                        <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Social Links & Company Overview</h2>
                    <p className="text-xs text-slate-500 mt-1">LinkedIn is highlighted as the primary company page.</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                    <label className="flex items-center gap-2 text-xs font-extrabold text-blue-900">
                      <Linkedin className="w-4 h-4 text-blue-600 fill-blue-600" />
                      <span>Company LinkedIn Page (Highest Priority)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData(p => ({ ...p, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Logo Image (Optional)</label>
                    <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors block">
                      {formData.logo && !formData.logo.startsWith('http') ? (
                        <div className="flex items-center justify-center gap-3">
                          <img src={formData.logo} alt="Company logo preview" className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                          <div className="text-left">
                            <span className="text-xs font-bold text-emerald-600 block">✓ Custom Logo Uploaded</span>
                            <span className="text-xs text-slate-500 block">Click box to change logo image</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <span className="text-xs text-slate-600 font-medium block">Click to upload company logo</span>
                          <span className="text-xs text-slate-400 block mt-0.5">Supports PNG, JPG, WEBP</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setFormData(p => ({ ...p, logo: reader.result as string }))
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Description & Employer Branding *</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe your company culture, main products/services, mission, and why candidates should join your team..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    <p className="text-xs text-slate-500 mt-1">{descriptionWordCount} / 30 words minimum</p>
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <TurnstileWidget onToken={setTurnstileToken} className="flex justify-center" />
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Creating Profile...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Register Hiring Company Profile</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, Briefcase, MapPin, Phone, Mail, Globe, ShieldCheck, CheckCircle2, 
  Sparkles, ArrowRight, ArrowLeft, Star, Linkedin, Plus, Trash2, UserCheck, Check, Upload
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CITIES } from '@/lib/data'
import { saveCompanyToDatabase } from '@/lib/company-service'
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
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    industry: 'Technology & IT',
    category: 'Hiring Company / HR',
    companySize: '50 - 200 Employees',
    employeeCount: '100',
    establishedYear: '2018',
    registrationNumber: '',
    companyType: 'Private' as any,
    headquarters: '',
    website: '',
    careersUrl: '',
    googleMapUrl: '',

    // HR Contact
    hrName: '',
    hrDesignation: '',
    hrEmail: '',
    companyEmail: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: 'New York',
    province: 'New York',

    // Social Links
    linkedin: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    github: '',
    
    // Description & Images
    description: '',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number) => {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!formData.name.trim()) errs.name = 'Company Name is required'
      if (!formData.establishedYear.trim()) errs.establishedYear = 'Established Year is required'
    }
    if (step === 2) {
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
      if (!formData.description.trim() || formData.description.length < 30) {
        errs.description = 'Company description must be at least 30 characters'
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

    setIsSubmitting(true)
    try {
      const createdComp = await saveCompanyToDatabase({
        ...formData,
        employeeCount: String(formData.employeeCount || '10')
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
                Company Profile Created!
              </h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                Your hiring profile for <strong className="text-slate-900">{formData.name}</strong> has been submitted. Our compliance team will grant your green Verified Employer badge within 24 hours.
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
                href={`/companies/${submittedSlug}`}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Preview Public Company Page
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
                  <span className="hidden sm:inline block text-[11px] font-normal">{s.label}</span>
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
                      {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Industry Taxonomy</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData(p => ({ ...p, industry: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
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
                        value={formData.establishedYear}
                        onChange={(e) => setFormData(p => ({ ...p, establishedYear: e.target.value }))}
                        placeholder="e.g. 2015"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        {CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

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
                        <p className="text-red-500 text-[11px] mt-1">{errors.hrName}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">Alphabetic letters only (no numbers like &quot;232&quot;).</p>
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
                      {errors.hrEmail && <p className="text-red-500 text-[11px] mt-1">{errors.hrEmail}</p>}
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
                        <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
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
                        <p className="text-red-500 text-[11px] mt-1">{errors.whatsapp}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
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
                            <span className="text-[10px] text-slate-500 block">Click box to change logo image</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <span className="text-xs text-slate-600 font-medium block">Click to upload company logo</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Supports PNG, JPG, WEBP</span>
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
                    {errors.description && <p className="text-red-500 text-[11px] mt-1">{errors.description}</p>}
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  User, Briefcase, MapPin, Phone, Mail, Globe, Upload, CheckCircle2, ShieldCheck, 
  Sparkles, ArrowRight, ArrowLeft, Star, ChevronDown, ChevronUp, Lock, Award, 
  Linkedin, Github, Facebook, Instagram, Twitter, Youtube, Plus, Trash2, Check,
  FileText, ExternalLink, MessageCircle, AlertCircle, Building2, Stethoscope,
  Code, Palette, GraduationCap, Wrench, Scale, Calculator, Eye, EyeOff
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CITIES, CATEGORIES, STATE_CITIES, US_STATES } from '@/lib/data'
import { saveProfessionalToDatabase, generateProfessionalSlug } from '@/lib/professional-service'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth'
import { isValidPersonName, validatePersonName, filterPersonNameInput, isValidUsPhone, validateUsPhone, formatUsPhone, isValidEmail } from '@/lib/validation'

// Professions list
const POPULAR_PROFESSIONS = [
  'Software Developer',
  'Doctor',
  'Dentist',
  'Lawyer',
  'Architect',
  'Civil Engineer',
  'Teacher / Educator',
  'Tutor',
  'Chartered Accountant',
  'Graphic Designer',
  'Writer / Content Creator',
  'Photographer',
  'Videographer',
  'Digital Marketer',
  'SEO Expert',
  'Social Media Manager',
  'AI Engineer',
  'Data Scientist',
  'Mobile App Developer',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Auto Mechanic',
  'Welder',
  'Driver',
  'Delivery Rider',
  'Security Guard',
  'Construction Worker',
  'Tailor',
  'Beautician / Hair Stylist',
  'Fitness Trainer',
  'Freelancer',
  'Student / Fresh Graduate',
  'Job Seeker',
  'Consultant',
  'Other Professional'
]

// Availability options
const AVAILABILITY_OPTIONS = [
  'Open to Work (Full-time)',
  'Available for Freelance / Contracts',
  'Part-time / Hourly Consulting',
  'In-Clinic / In-Person Consultation',
  'Remote Only',
  'Not Looking Currently'
]

export default function AddProfessionalClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedUsername, setSubmittedUsername] = useState<string | null>(null)

  // Auth & Account State
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')
  const [showAccountPassword, setShowAccountPassword] = useState(false)

  // Searchable City state
  const [citySearch, setCitySearch] = useState('')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  // Skills input state
  const [skillInput, setSkillInput] = useState('')
  const [customSocialName, setCustomSocialName] = useState('')
  const [customSocialUrl, setCustomSocialUrl] = useState('')

  // Avatar & Photo state
  const [avatarMode, setAvatarMode] = useState<'link' | 'upload'>('link')
  const [avatarLink, setAvatarLink] = useState('')
  const [avatarError, setAvatarError] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    gender: 'Male',
    profession: 'Software Developer',
    category: 'Professional / Job Seeker',
    specialization: '',
    shortBio: '',
    about: '',
    experienceYears: '3',
    availability: 'Open to Work (Full-time)',
    currentCompany: '',
    hourlyRate: '',
    
    // Skills & Arrays
    skills: ['Communication', 'Problem Solving'] as string[],
    languages: ['Urdu', 'English'] as string[],
    servicesOffered: [] as string[],
    
    // Education & Work
    education: [{ degree: '', institution: '', year: '' }],
    certifications: [{ title: '', issuer: '', year: '' }],
    previousExperience: [{ title: '', company: '', duration: '', description: '' }],

    // Location & Contact
    city: '',
    province: '',
    country: 'United States',
    address: '',
    googleMapUrl: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    portfolio: '',
    resumeUrl: '',
    avatar: '',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',

    // Social Links (Highlighted LinkedIn + 16 platforms)
    linkedin: '',
    github: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    behance: '',
    dribbble: '',
    stackoverflow: '',
    medium: '',
    fiverr: '',
    upwork: '',
    freelancer: '',
    kaggle: '',
    researchgate: '',
    orcid: '',
    googleScholar: '',
    customSocialLinks: [] as Array<{ name: string; url: string }>,

    // Dynamic fields depending on profession
  dynamicFields: {} as Record<string, string>
  })

  const availableCities = formData.province ? (STATE_CITIES[formData.province] || []) : []
  const filteredCities = availableCities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase().trim()))
  
  // Avatar Link & Upload Handlers
  const handleAvatarLinkChange = (rawUrl: string) => {
    setAvatarLink(rawUrl)
    setAvatarError('')
    if (!rawUrl.trim()) {
      setFormData(prev => ({ ...prev, avatar: '' }))
      return
    }
    // Auto convert Google Drive links to direct view URL
    const driveMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (driveMatch && driveMatch[1]) {
      const directUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`
      setFormData(prev => ({ ...prev, avatar: directUrl }))
      toast.success('Google Drive image link converted.')
    } else {
      setFormData(prev => ({ ...prev, avatar: rawUrl.trim() }))
    }
  }

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      const err = 'Please select a valid image format (JPG, PNG, or WebP).'
      setAvatarError(err)
      toast.error(err)
      return
    }

    // Strict 200 KB limit
    const maxBytes = 200 * 1024
    if (file.size > maxBytes) {
      const sizeKb = (file.size / 1024).toFixed(0)
      const err = `Your image size is ${sizeKb} KB (exceeds 200 KB limit). Please compress/reduce your image size for free at https://mb2kb.com/ and re-upload.`
      setAvatarError(err)
      toast.error(`Image is ${sizeKb} KB. Please reduce image size at mb2kb.com to under 200 KB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setFormData(prev => ({ ...prev, avatar: result }))
      toast.success('Photo uploaded successfully.')
    }
    reader.readAsDataURL(file)
  }

  // Prefill from session, Firebase Auth, or URL params
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const nameParam = urlParams.get('name')
      const emailParam = urlParams.get('email')

      let sessionName = ''
      let sessionEmail = ''
      const savedSession = sessionStorage.getItem('biznestusa_user_session') || localStorage.getItem('biznestusa_user_session') || sessionStorage.getItem('listpak_user_session') || localStorage.getItem('listpak_user_session')
      if (savedSession) {
        const parsed = JSON.parse(savedSession)
        sessionName = parsed.name || ''
        sessionEmail = parsed.email || ''
        if (parsed.email) {
          setIsUserLoggedIn(true)
        }
      }

      if (auth.currentUser?.email) {
        setIsUserLoggedIn(true)
        sessionEmail = sessionEmail || auth.currentUser.email
        sessionName = sessionName || auth.currentUser.displayName || ''
      }

      setFormData(prev => ({
        ...prev,
        fullName: nameParam || sessionName || prev.fullName,
        email: emailParam || sessionEmail || prev.email
      }))
    } catch (e) {
      // ignore
    }
  }, [])

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Skill management
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }))
  }

  // Custom Social Link management
  const addCustomSocialLink = () => {
    if (customSocialName.trim() && customSocialUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        customSocialLinks: [...prev.customSocialLinks, { name: customSocialName.trim(), url: customSocialUrl.trim() }]
      }))
      setCustomSocialName('')
      setCustomSocialUrl('')
    }
  }

  const removeCustomSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customSocialLinks: prev.customSocialLinks.filter((_, i) => i !== index)
    }))
  }

  // Dynamic profession field updater
  const updateDynamicField = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: { ...prev.dynamicFields, [key]: val }
    }))
  }

  // Repeatable array handlers
  const addEdu = () => setFormData(p => ({ ...p, education: [...p.education, { degree: '', institution: '', year: '' }] }))
  const removeEdu = (idx: number) => setFormData(p => ({ ...p, education: p.education.filter((_, i) => i !== idx) }))

  const addCert = () => setFormData(p => ({ ...p, certifications: [...p.certifications, { title: '', issuer: '', year: '' }] }))
  const removeCert = (idx: number) => setFormData(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== idx) }))

  const addExp = () => setFormData(p => ({ ...p, previousExperience: [...p.previousExperience, { title: '', company: '', duration: '', description: '' }] }))
  const removeExp = (idx: number) => setFormData(p => ({ ...p, previousExperience: p.previousExperience.filter((_, i) => i !== idx) }))

  // Step validation
  const validateStep = (step: number) => {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!formData.fullName.trim()) {
        errs.fullName = 'Full Name is required'
      } else {
        const nVal = validatePersonName(formData.fullName)
        if (!nVal.isValid) {
          errs.fullName = nVal.error || 'Full Name must contain only alphabetic letters (no numbers like "232" or special symbols).'
        }
      }
      if (!formData.title.trim()) errs.title = 'Professional Title is required'
      if (!formData.gender) errs.gender = 'Please select your gender (Male / Female)'
      if (!formData.avatar || !formData.avatar.trim()) {
        errs.avatar = 'Profile photo is required. Please upload an image under 200 KB or paste your Google Drive link.'
        toast.error('Profile photo is required to continue.')
      }
      if (!formData.profession.trim()) errs.profession = 'Please select or type your profession'
      if (!formData.shortBio.trim() || formData.shortBio.length < 20) {
        errs.shortBio = 'Short bio must be at least 20 characters'
      }
    }
    if (step === 3) {
      if (formData.skills.length === 0) errs.skills = 'Add at least 1 core skill'

      const currentYear = new Date().getFullYear()
      const minYear = 1950
      const maxGraduationYear = currentYear + 6
      const maxCertYear = currentYear + 5

      formData.education.forEach((edu, idx) => {
        if (edu.year.trim()) {
          const yrNum = parseInt(edu.year, 10)
          if (isNaN(yrNum) || yrNum < minYear || yrNum > maxGraduationYear) {
            errs[`eduYear_${idx}`] = `Year must be between ${minYear} and ${maxGraduationYear}`
          }
        }
      })

      formData.certifications.forEach((cert, idx) => {
        if (cert.year.trim()) {
          const yrNum = parseInt(cert.year, 10)
          if (isNaN(yrNum) || yrNum < minYear || yrNum > maxCertYear) {
            errs[`certYear_${idx}`] = `Year must be between ${minYear} and ${maxCertYear}`
          }
        }
      })
    }
    if (step === 4) {
      if (!formData.city) errs.city = 'City is required'
      if (!formData.email.trim()) {
        errs.email = 'Email address is required'
      } else if (!isValidEmail(formData.email)) {
        errs.email = 'Please enter a valid email address'
      }
      if (!formData.phone.trim()) {
        errs.phone = 'Phone number is required'
      } else {
        const pVal = validateUsPhone(formData.phone)
        if (!pVal.isValid) {
          errs.phone = pVal.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX'
        }
      }
      if (formData.whatsapp?.trim()) {
        const wVal = validateUsPhone(formData.whatsapp)
        if (!wVal.isValid) {
          errs.whatsapp = wVal.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX for WhatsApp'
        }
      }
      if (!isUserLoggedIn && (!accountPassword || accountPassword.length < 6)) {
        errs.password = 'Password (at least 6 characters) is required to create your dashboard account'
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
    
    // Strict guard: Profile can ONLY be submitted when user is on Step 5 and explicitly clicks submit
    if (currentStep !== 5) {
      handleNextStep()
      return
    }

    if (!validateStep(1) || !validateStep(3) || !validateStep(4)) {
      toast.error('Please make sure all required fields in earlier steps are completed.')
      return
    }

    setIsSubmitting(true)
    try {
      let activeUserId = auth.currentUser?.uid || ''

      // If user is not yet logged in, create Firebase Auth account
      if (!isUserLoggedIn && accountPassword) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, formData.email.trim(), accountPassword)
          if (cred.user) {
            activeUserId = cred.user.uid
            await updateProfile(cred.user, { displayName: formData.fullName.trim() })
            setIsUserLoggedIn(true)
          }
        } catch (authErr: any) {
          console.warn('Firebase Auth notice during profile creation:', authErr?.code)
          if (authErr?.code === 'auth/email-already-in-use') {
            try {
              const signCred = await signInWithEmailAndPassword(auth, formData.email.trim(), accountPassword)
              if (signCred.user) {
                activeUserId = signCred.user.uid
                setIsUserLoggedIn(true)
              }
            } catch (_) {}
          }
        }
      }

      if (!activeUserId) {
        activeUserId = 'usr-pro-' + Date.now()
      }

      const createdPro = await saveProfessionalToDatabase({
        ...formData,
        userId: activeUserId,
        certifications: formData.certifications
          .map((cert) => [cert.title, cert.issuer, cert.year].filter(Boolean).join(' — '))
          .filter(Boolean),
        customSocialLinks: formData.customSocialLinks.map((link) => ({ platform: link.name, url: link.url })),
        experienceYears: Number(formData.experienceYears) || 0,
        status: 'approved',
        profileStatus: 'APPROVED',
        verified: false,
        verificationStatus: 'UNVERIFIED',
        verificationRequestStatus: 'NOT_REQUESTED'
      })
      setSubmittedUsername(createdPro.username)
      
      // Update and persist session in both storages
      const sessionData = {
        name: formData.fullName,
        email: formData.email.trim(),
        role: 'professional',
        hasProfile: true,
        username: createdPro.username,
        userId: activeUserId
      }
      try {
        sessionStorage.setItem('biznestusa_user_session', JSON.stringify(sessionData))
        localStorage.setItem('biznestusa_user_session', JSON.stringify(sessionData))
      } catch (e) {}

      toast.success('Your professional profile has been submitted successfully!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error('Failed to submit profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#0F172A] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              <User className="w-3.5 h-3.5" />
              <span>Personal Professional Profile</span>
            </span>
            <div className="text-xs text-slate-400 font-medium">
              Free • Indexable on Google • Green Verified Badge Available
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Create Your Public Professional Profile & Portfolio
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
            For individuals, freelancers, doctors, software engineers, teachers, skilled workers, and job seekers across the United States.
          </p>

          {/* Mode switch helper banner */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-300 font-medium">Registering a Store, Shop, or Business Company instead?</span>
            <Link href="/add-business" className="text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1 shrink-0">
              <Building2 className="w-3.5 h-3.5" />
              <span>Go to Business Registration</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {submittedUsername ? (
          /* Confirmation State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile Auto-Approved &amp; Publicly Live!</span>
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Your professional profile is now live across the United States!
              </h2>
              <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
                Your profile has been automatically approved and published. Anyone can now view your public portfolio, credentials, and skills on BizNest USA.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left max-w-md mx-auto">
              <div className="flex justify-between text-slate-600">
                <span>Submitted For:</span>
                <span className="font-bold text-slate-900">{formData.fullName} ({formData.title})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Live Public URL:</span>
                <Link
                  href={`/professionals/${submittedUsername}`}
                  target="_blank"
                  className="font-mono text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-1"
                >
                  <span>/professionals/{submittedUsername}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Profile Status:</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>APPROVED &amp; LIVE</span>
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Verification Status:</span>
                <span className="text-red-600 font-extrabold flex items-center gap-1">
                  <span>🚩 UNVERIFIED (Red Flag)</span>
                </span>
              </div>
            </div>

            {/* Verification Promotion Card */}
            <div className="p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 rounded-2xl border-2 border-amber-200 text-left space-y-3 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Remove Red Flag: Verify Your Profile (Rs. 50)</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Your public page currently displays an <strong>Unverified red flag</strong>. Verify for Rs. 50 to earn the official <strong>Green Verified Badge</strong>, gain client trust, and unlock profile editing.
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/professional/verify?username=${encodeURIComponent(submittedUsername)}`}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Pay for Verification (Rs. 50)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/professionals/${submittedUsername}`}
                target="_blank"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Live Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/professional"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Multi-step Form */
          <div className="space-y-8">
            {/* Step Progress Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { num: 1, label: 'Basic Info' },
                { num: 2, label: 'Profession Template' },
                { num: 3, label: 'Skills & Exp' },
                { num: 4, label: 'Location & Contact' },
                { num: 5, label: 'Social & Review' }
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

            <form 
              onSubmit={handleSubmit} 
              onKeyDown={(e) => {
                // Prevent accidental submission on Enter key in inputs
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
                  e.preventDefault()
                  if (currentStep < 5) {
                    handleNextStep()
                  }
                }
              }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6"
            >
              
              {/* STEP 1: BASIC INFO */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Personal & Professional Identity</h2>
                    <p className="text-xs text-slate-500 mt-1">This information identifies you to employers and clients searching BizNest USA.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData(p => ({ ...p, fullName: filterPersonNameInput(e.target.value) }))}
                        placeholder="e.g. Jordan Lee"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.fullName ? (
                        <p className="text-red-500 text-[11px] mt-1">{errors.fullName}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">Real person name (letters only, no numbers like &quot;232&quot;).</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Frontend Developer, Consultant Dermatologist, Electrician"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title}</p>}
                    </div>
                  </div>

                  {/* GENDER & EXPERIENCE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gender Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { val: 'Male', label: 'Male 👨' },
                          { val: 'Female', label: 'Female 👩' }
                        ].map(g => (
                          <button
                            key={g.val}
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, gender: g.val }))}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              formData.gender === g.val
                                ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{g.label}</span>
                            {formData.gender === g.val && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                      {errors.gender && <p className="text-red-500 text-[11px] mt-1">{errors.gender}</p>}
                    </div>

                    {/* Years of Experience */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData(p => ({ ...p, experienceYears: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* MANDATORY PROFESSIONAL PROFILE PICTURE SECTION */}
                  <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="text-xs font-extrabold text-slate-900">
                            Professional Profile Picture *
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Mandatory for Hiring
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload a clear headshot or paste your Google Drive photo link.
                        </p>
                      </div>

                      {/* Mode toggle */}
                      <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold shrink-0">
                        <button
                          type="button"
                          onClick={() => setAvatarMode('link')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            avatarMode === 'link' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          🔗 Google Drive / Link (Recommended)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarMode('upload')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            avatarMode === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📁 Upload (&lt; 200 KB)
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Live Preview Box */}
                      <div className="relative shrink-0 text-center">
                        {formData.avatar ? (
                          <div className="relative group">
                            <img
                              src={formData.avatar}
                              alt="Profile Preview"
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                              onError={() => {
                                setAvatarError('Could not load image from link. Please check permissions or upload an image file.')
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(p => ({ ...p, avatar: '' }))
                                setAvatarLink('')
                              }}
                              className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md text-xs cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200/80 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                            <span className="text-[10px] mt-1 font-bold text-slate-500">No Photo</span>
                          </div>
                        )}
                      </div>

                      {/* Input Control Area */}
                      <div className="flex-1 w-full space-y-2 text-xs">
                        {avatarMode === 'link' ? (
                          <div className="space-y-1.5">
                            <input
                              type="url"
                              value={avatarLink}
                              onChange={(e) => handleAvatarLinkChange(e.target.value)}
                              placeholder="Paste Google Drive link or direct Image URL (e.g. https://drive.google.com/file/d/...)"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>
                                <strong>Recommended:</strong> Google Drive link (make sure file sharing is set to <em>&quot;Anyone with the link can view&quot;</em>).
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer transition-colors text-slate-600 hover:text-blue-600 font-semibold text-xs shadow-2xs">
                                <Upload className="w-4 h-4" />
                                <span>Choose Image File (Strictly Max 200 KB)</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/jpg,image/webp"
                                  onChange={handleAvatarFileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] text-slate-500 pt-1">
                              <span>Accepted: JPG, PNG, WebP (Max 200 KB)</span>
                              <a
                                href="https://mb2kb.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-bold underline inline-flex items-center gap-1"
                              >
                                <span>Reduce image size at MB2KB.com ↗</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {avatarError && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs animate-in fade-in-50">
                            <div className="flex items-start gap-2 text-amber-900 font-semibold">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                              <span>{avatarError}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                              <span className="text-[11px] text-amber-800">Need to compress image?</span>
                              <a
                                href="https://mb2kb.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
                              >
                                <span>Reduce Size at MB2KB.com</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}
                        {errors.avatar && !avatarError && <p className="text-red-500 text-[11px] font-semibold">{errors.avatar}</p>}
                      </div>
                    </div>

                    {/* HR Recruiter Tip Banner */}
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2 text-[11px] text-slate-600">
                      <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>HR &amp; Client Hiring Tip:</strong> Profiles with clear, well-lit professional headshots receive <strong>4x more interview calls &amp; project inquiries</strong> from companies across the United States.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Select Profession *</label>
                      <select
                        value={formData.profession}
                        onChange={(e) => setFormData(p => ({ ...p, profession: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        {POPULAR_PROFESSIONS.map(prof => (
                          <option key={prof} value={prof}>{prof}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category / Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData(p => ({ ...p, specialization: e.target.value }))}
                        placeholder="e.g. Dermatology, Full Stack Web, Solar Wiring"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current Company (Optional)</label>
                      <input
                        type="text"
                        value={formData.currentCompany}
                        onChange={(e) => setFormData(p => ({ ...p, currentCompany: e.target.value }))}
                        placeholder="e.g. Self-Employed or Tech Firm"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData(p => ({ ...p, availability: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        {AVAILABILITY_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Short Professional Bio (Public snippet) *</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.shortBio}
                      onChange={(e) => setFormData(p => ({ ...p, shortBio: e.target.value }))}
                      placeholder="Briefly describe your expertise, key skills, and what you offer to clients or employers..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.shortBio && <p className="text-red-500 text-[11px] mt-1">{errors.shortBio}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Detailed About Section (Full background)</label>
                    <textarea
                      rows={5}
                      value={formData.about}
                      onChange={(e) => setFormData(p => ({ ...p, about: e.target.value }))}
                      placeholder="Write your detailed background, career history, approach to work, major accomplishments, and mission..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: DYNAMIC PROFESSION FIELDS */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{formData.profession} Specific Fields</span>
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">Profession-Specific Dynamic Details</h2>
                    <p className="text-xs text-slate-500 mt-1">Provide domain details tailored to your profession.</p>
                  </div>

                  {/* Doctor Template */}
                  {formData.profession.toLowerCase().includes('doctor') || formData.profession.toLowerCase().includes('dentist') ? (
                    <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-4">
                      <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <span>Medical Doctor & Healthcare Credentials</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">State Medical License Number / NPI</label>
                          <input
                            type="text"
                            placeholder="e.g. CA-MED-849201 or NPI-1092837465"
                            value={formData.dynamicFields.pmdcNumber || ''}
                            onChange={(e) => updateDynamicField('pmdcNumber', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Mount Sinai Hospital, New York"
                            value={formData.dynamicFields.hospitalClinic || ''}
                            onChange={(e) => updateDynamicField('hospitalClinic', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee</label>
                          <input
                            type="text"
                            placeholder="e.g. $150 / consultation"
                            value={formData.dynamicFields.consultationFee || ''}
                            onChange={(e) => updateDynamicField('consultationFee', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Working / OPD Hours</label>
                          <input
                            type="text"
                            placeholder="e.g. Mon - Sat: 4:00 PM - 8:00 PM"
                            value={formData.dynamicFields.workingHours || ''}
                            onChange={(e) => updateDynamicField('workingHours', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : formData.profession.toLowerCase().includes('developer') || formData.profession.toLowerCase().includes('engineer') ? (
                    /* Web Developer Template */
                    <div className="p-5 bg-cyan-50/60 rounded-2xl border border-cyan-200 space-y-4">
                      <div className="flex items-center gap-2 text-cyan-900 font-extrabold text-sm">
                        <Code className="w-5 h-5 text-cyan-600" />
                        <span>Software Development & Tech Stack</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Programming Languages</label>
                          <input
                            type="text"
                            placeholder="TypeScript, Python, JavaScript, Go"
                            value={formData.dynamicFields.programmingLanguages || ''}
                            onChange={(e) => updateDynamicField('programmingLanguages', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Frameworks & Libraries</label>
                          <input
                            type="text"
                            placeholder="Next.js, React, Node.js, Tailwind CSS"
                            value={formData.dynamicFields.frameworks || ''}
                            onChange={(e) => updateDynamicField('frameworks', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Cloud & Databases</label>
                          <input
                            type="text"
                            placeholder="AWS, Vercel, PostgreSQL, Docker"
                            value={formData.dynamicFields.technologies || ''}
                            onChange={(e) => updateDynamicField('technologies', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Open to Remote Work?</label>
                          <select
                            value={formData.dynamicFields.openToRemote || 'Yes'}
                            onChange={(e) => updateDynamicField('openToRemote', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          >
                            <option value="Yes">Yes - Global Remote Work</option>
                            <option value="Hybrid">Hybrid Only</option>
                            <option value="On-site Only">On-site Only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : formData.profession.toLowerCase().includes('designer') || formData.profession.toLowerCase().includes('creative') ? (
                    /* Designer Template */
                    <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-4">
                      <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm">
                        <Palette className="w-5 h-5 text-purple-600" />
                        <span>Graphic Design & Creative Portfolio</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Design Tools & Software</label>
                          <input
                            type="text"
                            placeholder="Figma, Adobe Illustrator, Photoshop, Blender"
                            value={formData.dynamicFields.designSoftware || ''}
                            onChange={(e) => updateDynamicField('designSoftware', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Behance / Dribbble Link</label>
                          <input
                            type="text"
                            placeholder="https://behance.net/username"
                            value={formData.dynamicFields.portfolio || ''}
                            onChange={(e) => updateDynamicField('portfolio', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : formData.profession.toLowerCase().includes('teacher') || formData.profession.toLowerCase().includes('tutor') ? (
                    /* Teacher Template */
                    <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-4">
                      <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                        <GraduationCap className="w-5 h-5 text-amber-600" />
                        <span>Teaching & Education Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Subjects Taught</label>
                          <input
                            type="text"
                            placeholder="e.g. AP Calculus, High School Chemistry, Physics"
                            value={formData.dynamicFields.subjects || ''}
                            onChange={(e) => updateDynamicField('subjects', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Grade Levels</label>
                          <input
                            type="text"
                            placeholder="Middle School, High School, AP Prep, College"
                            value={formData.dynamicFields.gradeLevels || ''}
                            onChange={(e) => updateDynamicField('gradeLevels', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Mode</label>
                          <select
                            value={formData.dynamicFields.teachingMode || 'Online & Home Tuition'}
                            onChange={(e) => updateDynamicField('teachingMode', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          >
                            <option value="Online & Home Tuition">Online & Home Tuition</option>
                            <option value="Online Zoom Only">Online Zoom Only</option>
                            <option value="Home Tuition Only">Home Tuition Only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* General / Skilled Worker Template */
                    <div className="p-5 bg-slate-100 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                        <Wrench className="w-5 h-5 text-slate-600" />
                        <span>Skilled Worker & Technical Capabilities</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Specific Skill Type</label>
                          <input
                            type="text"
                            placeholder="e.g. Master Electrician, Solar Wireman, Auto Mechanic"
                            value={formData.dynamicFields.skillType || ''}
                            onChange={(e) => updateDynamicField('skillType', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Daily / Service Rate</label>
                          <input
                            type="text"
                            placeholder="e.g. $65 / hr or $450 / day"
                            value={formData.dynamicFields.dailyRate || ''}
                            onChange={(e) => updateDynamicField('dailyRate', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Available for Out-of-City Travel?</label>
                          <select
                            value={formData.dynamicFields.availableForTravel || 'Yes'}
                            onChange={(e) => updateDynamicField('availableForTravel', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          >
                            <option value="Yes">Yes - Available to Travel</option>
                            <option value="Within City Only">Within City Only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Equipment / Tools Owned</label>
                          <input
                            type="text"
                            placeholder="Multi-meter, Safety Gear, Welding Kit, Ladder"
                            value={formData.dynamicFields.equipmentOwned || ''}
                            onChange={(e) => updateDynamicField('equipmentOwned', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: SKILLS, EDUCATION & EXPERIENCE */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Skills, Education & Experience</h2>
                    <p className="text-xs text-slate-500 mt-1">Showcase your expertise, degrees, certifications, and work timeline.</p>
                  </div>

                  {/* Skills Tagger */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Skills & Core Competencies *</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Type a skill and press Enter (e.g. Next.js, Clinical Dermatology, Solar Wiring)..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                      >
                        Add Skill
                      </button>
                    </div>
                    {errors.skills && <p className="text-red-500 text-[11px] mb-2">{errors.skills}</p>}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.skills.map((s) => (
                        <span key={s} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-xs font-semibold flex items-center gap-1.5">
                          <span>{s}</span>
                          <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-600 cursor-pointer">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Education List */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-900 text-sm">Education & Degrees</h3>
                      <button type="button" onClick={addEdu} className="text-xs text-blue-600 font-bold flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Degree
                      </button>
                    </div>

                    {formData.education.map((edu, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
                        <input
                          type="text"
                          placeholder="Degree (e.g. BS CS / MD / BBA / MS)"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...formData.education]
                            newEdu[i].degree = e.target.value
                            setFormData(p => ({ ...p, education: newEdu }))
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Institution / University"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...formData.education]
                            newEdu[i].institution = e.target.value
                            setFormData(p => ({ ...p, education: newEdu }))
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <div className="flex flex-col">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="Graduation Year (e.g. 2024)"
                              value={edu.year}
                              onChange={(e) => {
                                const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 4)
                                const newEdu = [...formData.education]
                                newEdu[i].year = cleanVal
                                setFormData(p => ({ ...p, education: newEdu }))
                                if (errors[`eduYear_${i}`]) {
                                  setErrors(prev => {
                                    const copy = { ...prev }
                                    delete copy[`eduYear_${i}`]
                                    return copy
                                  })
                                }
                              }}
                              className={`w-full px-3 py-1.5 bg-white border ${errors[`eduYear_${i}`] ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-lg text-xs`}
                            />
                            {formData.education.length > 1 && (
                              <button type="button" onClick={() => removeEdu(i)} className="text-red-500 hover:text-red-700 px-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {errors[`eduYear_${i}`] && (
                            <p className="text-red-500 text-[10px] font-semibold mt-1">{errors[`eduYear_${i}`]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Certifications List */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-900 text-sm">Certifications & Licenses</h3>
                      <button type="button" onClick={addCert} className="text-xs text-blue-600 font-bold flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Certification
                      </button>
                    </div>

                    {formData.certifications.map((cert, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Certification Title"
                          value={cert.title}
                          onChange={(e) => {
                            const newCert = [...formData.certifications]
                            newCert[i].title = e.target.value
                            setFormData(p => ({ ...p, certifications: newCert }))
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Issuing Authority (AWS, State Board, AICPA)"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newCert = [...formData.certifications]
                            newCert[i].issuer = e.target.value
                            setFormData(p => ({ ...p, certifications: newCert }))
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <div className="flex flex-col">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="Year (e.g. 2024)"
                              value={cert.year}
                              onChange={(e) => {
                                const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 4)
                                const newCert = [...formData.certifications]
                                newCert[i].year = cleanVal
                                setFormData(p => ({ ...p, certifications: newCert }))
                                if (errors[`certYear_${i}`]) {
                                  setErrors(prev => {
                                    const copy = { ...prev }
                                    delete copy[`certYear_${i}`]
                                    return copy
                                  })
                                }
                              }}
                              className={`w-full px-3 py-1.5 bg-white border ${errors[`certYear_${i}`] ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-lg text-xs`}
                            />
                            {formData.certifications.length > 1 && (
                              <button type="button" onClick={() => removeCert(i)} className="text-red-500 hover:text-red-700 px-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {errors[`certYear_${i}`] && (
                            <p className="text-red-500 text-[10px] font-semibold mt-1">{errors[`certYear_${i}`]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* STEP 4: LOCATION & CONTACT */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Location & Direct Contact Info</h2>
                    <p className="text-xs text-slate-500 mt-1">Clients and employers across the United States will use these details to contact you directly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Searchable City */}
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
                      {errors.city && <p className="text-red-500 text-[11px] mt-1">{errors.city}</p>}

                      {isCityDropdownOpen && formData.province && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData(p => ({ ...p, province: e.target.value, city: '' }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a state</option>
                        {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                      <input
                        type="text"
                        disabled
                        value="United States"
                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@domain.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (USA Standard) *</label>
                      <input
                        type="tel"
                        required
                        maxLength={17}
                        value={formData.phone}
                        onChange={(e) => setFormData(p => ({ ...p, phone: formatUsPhone(e.target.value) }))}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.phone ? (
                        <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (USA Standard)</label>
                      <input
                        type="tel"
                        maxLength={17}
                        value={formData.whatsapp}
                        onChange={(e) => setFormData(p => ({ ...p, whatsapp: formatUsPhone(e.target.value) }))}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.whatsapp ? (
                        <p className="text-red-500 text-[11px] mt-1">{errors.whatsapp}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
                      )}
                    </div>
                  </div>

                  {/* ACCOUNT CREATION / PASSWORD SECTION FOR NEW USERS */}
                  {!isUserLoggedIn && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-blue-600" />
                          <span className="font-extrabold text-xs text-slate-900">Set Account Password *</span>
                        </div>
                        <Link href="/login?role=professional" className="text-[11px] text-blue-700 font-bold hover:underline">
                          Already have an account? Log In
                        </Link>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Create a password for your account so you can log into your <strong>Professional Dashboard</strong> and track your profile approval in real time.
                      </p>
                      <div className="relative">
                        <input
                          type={showAccountPassword ? 'text' : 'password'}
                          required
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          placeholder="Create a strong password (at least 6 characters)"
                          className="w-full pl-4 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccountPassword(!showAccountPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                        >
                          {showAccountPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-[11px] font-bold">{errors.password}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Personal Website URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                        placeholder="https://yourname.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Resume / CV Link (Google Drive / DropBox)</label>
                      <input
                        type="url"
                        value={formData.resumeUrl}
                        onChange={(e) => setFormData(p => ({ ...p, resumeUrl: e.target.value }))}
                        placeholder="https://drive.google.com/file/..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SOCIAL PROFILES & SUBMISSION (ALL 100% OPTIONAL) */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">Social Media &amp; Public Links</h2>
                      <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                        100% Optional
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      All links below are completely optional. You can provide any links you have, or leave them blank and click Submit.
                    </p>
                  </div>

                  {/* Optional Notice Banner */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>No links? No problem!</strong> You can leave all fields blank and click <strong>&quot;Submit Profile for Verification&quot;</strong> below.
                    </span>
                  </div>

                  {/* LinkedIn Box (Optional) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-[#0A66C2] fill-[#0A66C2]" />
                        <span>LinkedIn Profile URL</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">Optional</span>
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData(p => ({ ...p, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourusername"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  {/* Other Social Networks Grid (Optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="flex justify-between items-center font-bold text-slate-700 mb-1">
                        <span>GitHub</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional</span>
                      </label>
                      <input
                        type="url"
                        value={formData.github}
                        onChange={(e) => setFormData(p => ({ ...p, github: e.target.value }))}
                        placeholder="https://github.com/username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between items-center font-bold text-slate-700 mb-1">
                        <span>Upwork Profile</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional</span>
                      </label>
                      <input
                        type="url"
                        value={formData.upwork}
                        onChange={(e) => setFormData(p => ({ ...p, upwork: e.target.value }))}
                        placeholder="https://upwork.com/freelancers/..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between items-center font-bold text-slate-700 mb-1">
                        <span>Fiverr Profile</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional</span>
                      </label>
                      <input
                        type="url"
                        value={formData.fiverr}
                        onChange={(e) => setFormData(p => ({ ...p, fiverr: e.target.value }))}
                        placeholder="https://fiverr.com/username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between items-center font-bold text-slate-700 mb-1">
                        <span>Behance / Dribbble</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional</span>
                      </label>
                      <input
                        type="url"
                        value={formData.behance}
                        onChange={(e) => setFormData(p => ({ ...p, behance: e.target.value }))}
                        placeholder="https://behance.net/username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between items-center font-bold text-slate-700 mb-1">
                        <span>Twitter / X</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional</span>
                      </label>
                      <input
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => setFormData(p => ({ ...p, twitter: e.target.value }))}
                        placeholder="https://twitter.com/username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between items-center font-bold text-slate-700 mb-1">
                        <span>YouTube Channel</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional</span>
                      </label>
                      <input
                        type="url"
                        value={formData.youtube}
                        onChange={(e) => setFormData(p => ({ ...p, youtube: e.target.value }))}
                        placeholder="https://youtube.com/@channel"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Repeatable Custom Social Links */}
                  <div className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-slate-900 text-xs">Add Custom Social / Profile Link</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Platform Name (e.g. Medium, Kaggle, Portfolio)"
                        value={customSocialName}
                        onChange={(e) => setCustomSocialName(e.target.value)}
                        className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      <input
                        type="url"
                        placeholder="URL (https://...)"
                        value={customSocialUrl}
                        onChange={(e) => setCustomSocialUrl(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={addCustomSocialLink}
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                      >
                        Add Link
                      </button>
                    </div>

                    {formData.customSocialLinks.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {formData.customSocialLinks.map((link, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-slate-100 rounded-lg text-xs">
                            <span className="font-bold text-slate-800">{link.name}: <a href={link.url} target="_blank" className="text-blue-600 underline font-normal">{link.url}</a></span>
                            <button type="button" onClick={() => removeCustomSocialLink(idx)} className="text-red-600 hover:underline">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
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

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105"
                  >
                    {isSubmitting ? (
                      <span>Submitting Profile...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Profile for Verification</span>
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

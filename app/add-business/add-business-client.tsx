'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, MapPin, Phone, Mail, Globe, Upload, CheckCircle2, ShieldCheck, 
  Sparkles, ArrowRight, ArrowLeft, Star, ChevronDown, ChevronUp, Lock, Eye, EyeOff,
  Award, TrendingUp, Zap, HelpCircle, FileText, Check, AlertCircle, PhoneCall, MessageCircle, 
  Users, Briefcase, LogIn, UserPlus, LogOut, Clock, RefreshCw, ExternalLink, Info, X, Copy,
  CreditCard, Image as ImageIcon, AlertTriangle, Plus, Calendar
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BUSINESS_CATEGORIES, CATEGORIES, STATE_CITIES, US_STATES, BUSINESS_PLANS, BusinessItem, BusinessPlan } from '@/lib/data'
import { loadStates, loadCities, stateCodeForName, searchCities, type GeoState, type GeoCity } from '@/lib/geo-data'
import { saveBusinessToDatabase, getUserBusinesses, updateBusinessPaymentProof } from '@/lib/db-service'
import StickyWebsiteBanner from '@/components/business/sticky-website-banner'
import { auth } from '@/lib/firebase'
import { getAuthHeaders } from '@/lib/client-auth'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from 'firebase/auth'
import { isValidPersonName, validatePersonName, filterPersonNameInput, isValidUsPhone, validateUsPhone, formatUsPhone, isValidEmail, validateEmail } from '@/lib/validation'
import { toast } from 'sonner'
import TurnstileWidget from '@/components/turnstile-widget'
import { isTurnstileWidgetEnabled, verifyTurnstileTokenClient } from '@/lib/turnstile'
import dynamic from 'next/dynamic'

// Wizard step panels are lazy-loaded: the 4,545-line add-business
// client no longer ships every step panel in the initial bundle.
// Steps render on demand (step 1 on first paint, the rest when the
// user navigates, the payment screen only at submit time). The
// screenshot gate (validateStep(5) + handleSubmit re-check) lives
// in this file and is untouched by the split.
const StepIdentityPanel = dynamic(() => import('./steps/step-identity'), {
  loading: () => <div className="py-12 text-center text-sm text-slate-500">Loading step…</div>,
})
const StepLocationsPanel = dynamic(() => import('./steps/step-locations'), {
  loading: () => <div className="py-12 text-center text-sm text-slate-500">Loading step…</div>,
})
const StepHoursPanel = dynamic(() => import('./steps/step-hours'), {
  loading: () => <div className="py-12 text-center text-sm text-slate-500">Loading step…</div>,
})
const StepDetailsPanel = dynamic(() => import('./steps/step-details'), {
  loading: () => <div className="py-12 text-center text-sm text-slate-500">Loading step…</div>,
})
const PaymentScreenPanel = dynamic(() => import('./steps/payment-screen'), {
  loading: () => <div className="py-12 text-center text-sm text-slate-500">Loading payment…</div>,
})

const US_PAYMENT_CHANNELS = [
  {
    id: 'card',
    name: 'Credit / Debit Card or Electronic Portal',
    badge: 'Card / Online',
    instructions: 'Submit corporate card payment or transaction receipt through our secure review terminal.',
    referenceHint: 'Authorization Code or Transaction ID (e.g. AUTH-882341)'
  },
  {
    id: 'ach',
    name: 'ACH Direct / Corporate Wire Transfer',
    badge: 'Bank / ACH',
    instructions: 'Direct depository transfer to BizNest USA Corporate Operations. Include business name in memo.',
    referenceHint: 'Wire / Transfer Sequence Number'
  },
  {
    id: 'zelle',
    name: 'Zelle / Electronic Instant Transfer',
    badge: 'Zelle / Transfer',
    instructions: 'Send verification fee to verify@biznestusa.com. Reference your business name in transfer notes.',
    referenceHint: 'Confirmation Code (e.g. CONF-921820)'
  }
]

// Subcategories mapped directly to USA directory taxonomy
const CATEGORY_SUBCATEGORIES_MAP: Record<string, string[]> = {}
BUSINESS_CATEGORIES.forEach(c => {
  CATEGORY_SUBCATEGORIES_MAP[c.name] = c.subcategories
  CATEGORY_SUBCATEGORIES_MAP[c.id] = c.subcategories
})

const FAQS = [
  {
    q: 'Is it free to search and browse businesses on BizNestUSA?',
    a: 'Yes — searching and browsing the directory is completely free. Listing a business is a paid submission: choose the $1 Basic, $5 Standard, or $10 Authoritative tier, complete the payment, and upload your payment screenshot. Only listings with a verified payment are approved and published.'
  },
  {
    q: 'How long does review take?',
    a: 'Review timing depends on the submission queue. You can track the status of your listing from your account dashboard.'
  },
  {
    q: 'Can I submit multiple businesses under one account?',
    a: 'Yes! You can list 1, 2, 3, or more businesses under a single account. Each business can also contain multiple city branch locations.'
  }
]

export interface FormLocation {
  city: string
  state: string
  address: string
  zipCode: string
  isPrimary: boolean
  citySearchQuery?: string
  isCityDropdownOpen?: boolean
  isCustomCity?: boolean
  customCityName?: string
}

export interface UserSessionData {
  uid?: string
  name?: string
  email?: string
  emailVerified?: boolean
  phone?: string
  role?: string
}

export default function AddBusinessClient() {
  const router = useRouter()

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserSessionData | null>(null)
  // Cloudflare Turnstile token (null until the widget completes; skipped when keys unset)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Signup Form State
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signupError, setSignupError] = useState('')

  // Active View State: 'form' | 'my-businesses'
  const [activeView, setActiveView] = useState<'form' | 'my-businesses'>('form')
  const [userBusinesses, setUserBusinesses] = useState<BusinessItem[]>([])
  const [isLoadingUserBusinesses, setIsLoadingUserBusinesses] = useState(false)
  const [selectedBizModal, setSelectedBizModal] = useState<BusinessItem | null>(null)

  // Payment & Plan Selection State
  const [activePaymentBiz, setActivePaymentBiz] = useState<BusinessItem | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan>('priority_5')
  // Single source of truth for the selected tier's name/price (3 tiers).
  const selectedPlanConfig = BUSINESS_PLANS[selectedPlan]
  const [submittedPlan, setSubmittedPlan] = useState<BusinessPlan>('priority_5')
  const [selectedChannel, setSelectedChannel] = useState<string>('card')
  const [paymentRefNumber, setPaymentRefNumber] = useState('')
  const [paymentScreenshotBase64, setPaymentScreenshotBase64] = useState<string | null>(null)
  const [isUploadingPayment, setIsUploadingPayment] = useState(false)
  const [isWhyFeeModalOpen, setIsWhyFeeModalOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Payoneer Payment Reference & Workflow State
  const [payoneerReference, setPayoneerReference] = useState<string>('')
  const [payoneerUrl, setPayoneerUrl] = useState<string>('')
  const [isLoadingPayoneerUrl, setIsLoadingPayoneerUrl] = useState(false)
  const [hasClickedCompletedPayment, setHasClickedCompletedPayment] = useState(false)
  const [customerNote, setCustomerNote] = useState('')
  const [payoneerTxId, setPayoneerTxId] = useState('')
  const [submittedPaymentRef, setSubmittedPaymentRef] = useState('')

  // Generate unique payment reference on mount
  useEffect(() => {
    if (!payoneerReference) {
      const year = new Date().getFullYear()
      const rand = Math.floor(100000 + Math.random() * 900000)
      setPayoneerReference(`BNUSA-${year}-${rand}`)
    }
  }, [payoneerReference])

  // Fetch Payoneer URL for selected plan
  useEffect(() => {
    let isMounted = true
    const fetchPayoneerUrl = async () => {
      setIsLoadingPayoneerUrl(true)
      try {
        const res = await fetch(`/api/payments/payoneer-url?plan=${selectedPlan}`)
        const data = await res.json()
        if (isMounted && data?.url) {
          setPayoneerUrl(data.url)
        }
      } catch (e) {
        console.warn('Error fetching payoneer url:', e)
      } finally {
        if (isMounted) setIsLoadingPayoneerUrl(false)
      }
    }
    fetchPayoneerUrl()
    return () => { isMounted = false }
  }, [selectedPlan])

  // Wizard Step State (4 Steps: Identity, Locations, Operating Hours, Details).
  // Payment is NOT a wizard step: it appears only at submit time (see showPaymentScreen).
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null)
  const [submittedBizName, setSubmittedBizName] = useState<string>('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Submit-time payment screen: client-side state ONLY — no route, no URL,
  // nothing in the sitemap, never submitted to IndexNow. It renders only
  // after the user fills the form and initiates submit (handleInitiateSubmit).
  const [showPaymentScreen, setShowPaymentScreen] = useState(false)
  // Shown when a signed-in user has not verified their email yet.
  const [showVerifyNotice, setShowVerifyNotice] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  // Operating Hours State
  const [operatingHoursState, setOperatingHoursState] = useState<Record<string, { isOpen: boolean; openTime: string; closeTime: string; is24Hours: boolean }>>({
    Monday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
    Tuesday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
    Wednesday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
    Thursday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
    Friday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
    Saturday: { isOpen: true, openTime: '10:00 AM', closeTime: '04:00 PM', is24Hours: false },
    Sunday: { isOpen: false, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false }
  })

  const applyHoursPreset = (preset: 'standard' | 'retail' | '24_7' | 'mon_sat') => {
    if (preset === 'standard') {
      setOperatingHoursState({
        Monday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false },
        Tuesday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false },
        Wednesday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false },
        Thursday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false },
        Friday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false },
        Saturday: { isOpen: false, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false },
        Sunday: { isOpen: false, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false }
      })
      toast.success('Applied Standard Office Hours (Mon-Fri 9AM-5PM)')
    } else if (preset === 'retail') {
      setOperatingHoursState({
        Monday: { isOpen: true, openTime: '08:00 AM', closeTime: '08:00 PM', is24Hours: false },
        Tuesday: { isOpen: true, openTime: '08:00 AM', closeTime: '08:00 PM', is24Hours: false },
        Wednesday: { isOpen: true, openTime: '08:00 AM', closeTime: '08:00 PM', is24Hours: false },
        Thursday: { isOpen: true, openTime: '08:00 AM', closeTime: '08:00 PM', is24Hours: false },
        Friday: { isOpen: true, openTime: '08:00 AM', closeTime: '08:00 PM', is24Hours: false },
        Saturday: { isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM', is24Hours: false },
        Sunday: { isOpen: true, openTime: '10:00 AM', closeTime: '05:00 PM', is24Hours: false }
      })
      toast.success('Applied Retail & Customer Hours (7 Days)')
    } else if (preset === '24_7') {
      const all24: Record<string, { isOpen: boolean; openTime: string; closeTime: string; is24Hours: boolean }> = {}
      ;['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
        all24[day] = { isOpen: true, openTime: '12:00 AM', closeTime: '11:59 PM', is24Hours: true }
      })
      setOperatingHoursState(all24)
      toast.success('Applied 24/7 Round-the-Clock Service')
    } else if (preset === 'mon_sat') {
      setOperatingHoursState({
        Monday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
        Tuesday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
        Wednesday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
        Thursday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
        Friday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
        Saturday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false },
        Sunday: { isOpen: false, openTime: '09:00 AM', closeTime: '06:00 PM', is24Hours: false }
      })
      toast.success('Applied Mon-Sat 9AM-6PM (Sun Closed)')
    }
  }

  const serializeOperatingHours = (): Record<string, string> => {
    const result: Record<string, string> = {}
    ;['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
      const sched = operatingHoursState[day]
      if (!sched || !sched.isOpen) {
        result[day] = 'Closed'
      } else if (sched.is24Hours) {
        result[day] = 'Open 24 Hours'
      } else {
        result[day] = `${sched.openTime} - ${sched.closeTime}`
      }
    })
    return result
  }

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    subcategory: '',
    logo: '',
    locations: [
      { city: '', state: '', address: '', zipCode: '', isPrimary: true, citySearchQuery: '', isCityDropdownOpen: false, isCustomCity: false, customCityName: '' }
    ] as FormLocation[],
    // FAQs start EMPTY — no pre-filled canned answers (they would publish as fake content).
    faqs: [] as Array<{ question: string; answer: string }>,
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    description: '',
    services: '',
    yearEstablished: '',
    priceRange: '',
    serviceArea: '',
    gallery: [] as string[],
    proofDoc: '',
    googleBusinessProfile: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: ''
  })

  // Errors State
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Geo dataset (Census Gazetteer JSON in /public/data), shared across locations.
  // States load once; each selected state's cities file loads on demand and is
  // cached by state code. Any fetch failure falls back to the hardcoded
  // STATE_CITIES / US_STATES lists in lib/data.ts — the form never breaks.
  const [geoStates, setGeoStates] = useState<GeoState[] | null>(null)
  const [geoCitiesByCode, setGeoCitiesByCode] = useState<Record<string, GeoCity[]>>({})
  const [geoLoadingCodes, setGeoLoadingCodes] = useState<Record<string, boolean>>({})
  const [geoFailedCodes, setGeoFailedCodes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    loadStates()
      .then(list => { if (!cancelled) setGeoStates(list) })
      .catch(() => { /* fallback: US_STATES options + STATE_CITIES */ })
    return () => { cancelled = true }
  }, [])

  const ensureStateCities = (stateName: string) => {
    if (!geoStates || !stateName) return
    const code = stateCodeForName(stateName, geoStates)
    if (!code) return
    if (geoCitiesByCode[code] || geoLoadingCodes[code] || geoFailedCodes[code]) return
    setGeoLoadingCodes(prev => ({ ...prev, [code]: true }))
    loadCities(code)
      .then(list => {
        setGeoCitiesByCode(prev => ({ ...prev, [code]: list }))
        setGeoLoadingCodes(prev => ({ ...prev, [code]: false }))
      })
      .catch(() => {
        setGeoFailedCodes(prev => ({ ...prev, [code]: true }))
        setGeoLoadingCodes(prev => ({ ...prev, [code]: false }))
      })
  }

  // If a state was picked while states.json was still loading, load its cities now.
  useEffect(() => {
    if (!geoStates) return
    const names = Array.from(new Set(formData.locations.map(l => l.state).filter(Boolean)))
    names.forEach(ensureStateCities)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoStates])
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCategoryText, setCustomCategoryText] = useState('')
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false)
  const [customSubcategoryText, setCustomSubcategoryText] = useState('')

  // Active Category Definition & Subcategories
  const activeCategoryDef = useMemo(() => {
    if (!formData.category || isCustomCategory) return null
    return (
      BUSINESS_CATEGORIES.find(
        c => c.name.toLowerCase() === formData.category.toLowerCase() || c.id === formData.category.toLowerCase()
      ) || null
    )
  }, [formData.category, isCustomCategory])

  const availableSubcategories = activeCategoryDef ? activeCategoryDef.subcategories : []

  const handleCategorySelectChange = (val: string) => {
    if (val === 'Other') {
      setIsCustomCategory(true)
      setIsCustomSubcategory(false)
      setCustomSubcategoryText('')
      setFormData(prev => ({
        ...prev,
        category: customCategoryText,
        subcategory: ''
      }))
    } else {
      setIsCustomCategory(false)
      setIsCustomSubcategory(false)
      setCustomSubcategoryText('')
      setFormData(prev => ({
        ...prev,
        category: val,
        subcategory: ''
      }))
    }
    if (errors.category) {
      setErrors(prev => {
        const next = { ...prev }
        delete next.category
        return next
      })
    }
  }

  const handleCustomCategoryTextChange = (text: string) => {
    setCustomCategoryText(text)
    setFormData(prev => ({ ...prev, category: text }))
    if (errors.category) {
      setErrors(prev => {
        const next = { ...prev }
        delete next.category
        return next
      })
    }
  }

  const handleSubcategorySelectChange = (val: string) => {
    if (val === 'Other') {
      setIsCustomSubcategory(true)
      setFormData(prev => ({
        ...prev,
        subcategory: customSubcategoryText
      }))
    } else {
      setIsCustomSubcategory(false)
      setFormData(prev => ({
        ...prev,
        subcategory: val
      }))
    }
  }

  const handleCustomSubcategoryTextChange = (text: string) => {
    setCustomSubcategoryText(text)
    setFormData(prev => ({ ...prev, subcategory: text }))
  }

  // Load User Authentication & Session — Firebase Auth is the ONLY source
  // of truth. Stored sessions are NEVER trusted on mount: a crafted
  // localStorage/sessionStorage entry could otherwise make the form display
  // a victim's businesses. Storage is written only from the verified
  // onAuthStateChanged user object below.
  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userObj: UserSessionData = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          emailVerified: fbUser.emailVerified,
          phone: fbUser.phoneNumber || '',
          role: 'business'
        }
        setCurrentUser(userObj)
        prefillUserForm(userObj)
        fetchUserBusinesses(userObj.email || userObj.uid || '')
        
        try {
          sessionStorage.setItem('biznestusa_user_session', JSON.stringify(userObj))
          localStorage.setItem('biznestusa_user_session', JSON.stringify(userObj))
        } catch (_) {}
      }
      setAuthChecking(false)
    })

    return () => unsubscribe()
  }, [])

  const prefillUserForm = (user: UserSessionData) => {
    const cleanName = filterPersonNameInput(user.name || '')
    setFormData(prev => ({
      ...prev,
      ownerName: prev.ownerName || (isValidPersonName(cleanName) ? cleanName : ''),
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
      whatsapp: prev.whatsapp || user.phone || ''
    }))
  }

  const fetchUserBusinesses = async (emailOrUid: string) => {
    if (!emailOrUid) return
    setIsLoadingUserBusinesses(true)
    try {
      const list = await getUserBusinesses(emailOrUid)
      setUserBusinesses(list)
    } catch (err) {
      console.warn('Failed to load user businesses:', err)
    } finally {
      setIsLoadingUserBusinesses(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`Copied ${text} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your email address and password.')
      return
    }

    setIsLoggingIn(true)
    try {
      // Sign-in must succeed — a stored session is NEVER accepted as a login.
      // The old fallback let anyone who planted a matching-email entry in
      // localStorage walk in with any (wrong) password.
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
      if (!userCredential.user) {
        throw new Error('Invalid credentials')
      }
      const loggedUser: UserSessionData = {
        uid: userCredential.user.uid,
        name: userCredential.user.displayName || loginEmail.split('@')[0],
        email: userCredential.user.email || loginEmail.trim().toLowerCase(),
        emailVerified: userCredential.user.emailVerified,
        phone: userCredential.user.phoneNumber || '',
        role: 'business'
      }

      setCurrentUser(loggedUser)
      sessionStorage.setItem('biznestusa_user_session', JSON.stringify(loggedUser))
      localStorage.setItem('biznestusa_user_session', JSON.stringify(loggedUser))
      prefillUserForm(loggedUser)
      fetchUserBusinesses(loggedUser.email || loggedUser.uid || '')

      toast.success(`Welcome back, ${loggedUser.name || 'Business Partner'}!`)
      setActiveView('form')
    } catch (err: any) {
      console.error('Login error:', err)
      setLoginError(err.message?.includes('invalid-credential') || err.message?.includes('wrong-password')
        ? 'Invalid email or password. Please verify your credentials or create a new account.'
        : err.message || 'Login failed. Please check your credentials.'
      )
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')

    const nameVal = validatePersonName(signupName)
    if (!nameVal.isValid) {
      setSignupError(nameVal.error || 'Full Name must contain only alphabetic letters (no numbers like "232" or special symbols).')
      return
    }
    const phoneVal = validateUsPhone(signupPhone)
    if (!phoneVal.isValid) {
      setSignupError(phoneVal.error || 'Please provide a valid 10-digit US phone number: +1 (XXX) XXX-XXXX.')
      return
    }
    if (!isValidEmail(signupEmail)) {
      setSignupError('Please provide a valid email address.')
      return
    }
    if (!signupPassword || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.')
      return
    }

    setIsSigningUp(true)
    try {
      let newUser: UserSessionData = {
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        phone: signupPhone.trim(),
        role: 'business'
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword)
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: signupName.trim()
          })
          newUser.uid = userCredential.user.uid
          newUser.emailVerified = false
          try {
            await sendEmailVerification(userCredential.user)
          } catch (_) {
            // Best-effort: the user can resend it from the form's verify notice.
          }
        }
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          setSignupError('This email is already registered. Please sign in instead.')
          setIsSigningUp(false)
          return
        }
        console.warn('Firebase Auth creation notice (continuing with local registration):', authErr?.message)
      }

      setCurrentUser(newUser)
      sessionStorage.setItem('biznestusa_user_session', JSON.stringify(newUser))
      localStorage.setItem('biznestusa_user_session', JSON.stringify(newUser))
      prefillUserForm(newUser)

      toast.success('Your BizNest USA account has been created! We sent a verification email — please verify your email before submitting a listing.')
      setActiveView('form')
    } catch (err: any) {
      console.error('Signup error:', err)
      setSignupError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSigningUp(false)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (_) {}
    sessionStorage.removeItem('biznestusa_user_session')
    localStorage.removeItem('biznestusa_user_session')
    sessionStorage.removeItem('listpak_user_session')
    localStorage.removeItem('listpak_user_session')
    setCurrentUser(null)
    setUserBusinesses([])
    toast.success('You have been signed out.')
  }

  // Resend the Firebase email-verification link for the signed-in user.
  const handleResendVerificationEmail = async () => {
    const fbUser = auth.currentUser
    if (!fbUser) {
      toast.error('Please sign in first, then resend the verification email.')
      return
    }
    setIsResendingVerification(true)
    try {
      await sendEmailVerification(fbUser)
      toast.success('Verification email sent. Please check your inbox (and spam folder).')
    } catch (err) {
      console.error('Resend verification error:', err)
      toast.error('Could not send the verification email. Please try again in a moment.')
    } finally {
      setIsResendingVerification(false)
    }
  }

  // Multi-Location Handlers
  const handleAddLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [
        ...prev.locations,
        { city: '', state: '', address: '', zipCode: '', isPrimary: prev.locations.length === 0, citySearchQuery: '', isCityDropdownOpen: false, isCustomCity: false, customCityName: '' }
      ]
    }))
  }

  const handleRemoveLocation = (index: number) => {
    if (formData.locations.length <= 1) return
    setFormData(prev => {
      const updated = prev.locations.filter((_, i) => i !== index)
      if (!updated.some(l => l.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true
      }
      return { ...prev, locations: updated }
    })
  }

  const handleSetPrimaryLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map((loc, i) => ({
        ...loc,
        isPrimary: i === index
      }))
    }))
  }

  const handleLocationCitySelect = (index: number, city: string) => {
    setFormData(prev => {
      const updated = [...prev.locations]
      updated[index] = {
        ...updated[index],
        city,
        isCustomCity: false,
        customCityName: '',
        isCityDropdownOpen: false,
        citySearchQuery: ''
      }
      return { ...prev, locations: updated }
    })
    setErrors(prev => {
      const newErrs = { ...prev }
      delete newErrs[`location_${index}_city`]
      return newErrs
    })
  }

  const handleLocationOtherCitySelect = (index: number) => {
    setFormData(prev => {
      const updated = [...prev.locations]
      updated[index] = {
        ...updated[index],
        isCustomCity: true,
        isCityDropdownOpen: false,
        citySearchQuery: '',
        city: updated[index].customCityName || ''
      }
      return { ...prev, locations: updated }
    })
  }

  const handleCustomCityNameChange = (index: number, name: string) => {
    setFormData(prev => {
      const updated = [...prev.locations]
      updated[index] = {
        ...updated[index],
        customCityName: name,
        city: name
      }
      return { ...prev, locations: updated }
    })
    if (errors[`location_${index}_city`]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[`location_${index}_city`]
        return next
      })
    }
  }

  // FAQ Handlers (Minimum 3 FAQs)
  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => {
      const nextFaqs = [...(prev.faqs || [])]
      nextFaqs[index] = {
        ...nextFaqs[index],
        [field]: value
      }
      return { ...prev, faqs: nextFaqs }
    })
    if (errors.faqs) {
      setErrors(prev => {
        const next = { ...prev }
        delete next.faqs
        return next
      })
    }
  }

  const handleAddFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: '', answer: '' }]
    }))
  }

  const handleRemoveFaq = (index: number) => {
    // FAQs are optional: an owner may remove every FAQ.
    setFormData(prev => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index)
    }))
  }

  const handleLocationAddressChange = (index: number, address: string) => {
    setFormData(prev => {
      const updated = [...prev.locations]
      updated[index] = {
        ...updated[index],
        address
      }
      return { ...prev, locations: updated }
    })
    setErrors(prev => {
      const newErrs = { ...prev }
      delete newErrs[`location_${index}_address`]
      return newErrs
    })
  }

  const toggleLocationCityDropdown = (index: number) => {
    setFormData(prev => {
      const updated = [...prev.locations]
      if (!updated[index].state) return prev
      updated[index] = {
        ...updated[index],
        isCityDropdownOpen: !updated[index].isCityDropdownOpen
      }
      return { ...prev, locations: updated }
    })
  }

  const handleLocationCitySearch = (index: number, query: string) => {
    setFormData(prev => {
      const updated = [...prev.locations]
      updated[index] = {
        ...updated[index],
        citySearchQuery: query
      }
      return { ...prev, locations: updated }
    })
  }

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const loc = formData.locations[index]
      if (loc && loc.address.trim() && loc.city) {
        handleAddLocation()
        setTimeout(() => {
          const nextCityBtn = document.getElementById(`city-dropdown-btn-${index + 1}`)
          if (nextCityBtn) {
            nextCityBtn.focus()
          }
        }, 50)
      } else {
        toast.error('Please select a city and complete the physical address for Location ' + (index + 1) + ' before adding another.')
      }
    }
  }

  // Calculate completion percentage
  const calculateProgress = () => {
    let filled = 0
    if (formData.businessName) filled++
    if (formData.category) filled++
    if (formData.locations.some(l => l.city && l.address)) filled++
    if (formData.phone) filled++
    if (formData.whatsapp) filled++
    if (formData.description.length >= 50) filled++
    return Math.min(100, Math.round((filled / 6) * 100))
  }

  const focusFirstError = (errs: Record<string, string>) => {
    const errorKeys = Object.keys(errs)
    if (errorKeys.length === 0) return

    for (const key of errorKeys) {
      let targetEl: HTMLElement | null = null

      if (key.startsWith('location_')) {
        const parts = key.split('_')
        const idx = parts[1]
        const field = parts[2]
        if (field === 'state') {
          targetEl = document.getElementById(`field-location-${idx}-state`)
        } else if (field === 'city') {
          targetEl = document.getElementById(`field-location-${idx}-customCity`) ||
                     document.getElementById(`field-location-${idx}-city`)
        } else if (field === 'address') {
          targetEl = document.getElementById(`field-location-${idx}-address`)
        } else if (field === 'zip') {
          targetEl = document.getElementById(`field-location-${idx}-zip`)
        }
      } else if (key === 'faqs') {
        const firstEmptyQ = document.querySelector('input[id^="field-faq-"][id$="-question"]') as HTMLElement | null
        const firstEmptyA = document.querySelector('textarea[id^="field-faq-"][id$="-answer"]') as HTMLElement | null
        targetEl = firstEmptyQ || firstEmptyA || document.getElementById('field-faqs')
      } else if (key === 'category') {
        targetEl = isCustomCategory 
          ? (document.getElementById('field-customCategory') || document.getElementById('field-category'))
          : document.getElementById('field-category')
      } else {
        targetEl = document.getElementById(`field-${key}`)
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          targetEl?.focus()
          if (targetEl instanceof HTMLInputElement || targetEl instanceof HTMLTextAreaElement) {
            targetEl.select()
          }
          targetEl?.classList.add('ring-4', 'ring-red-500/50', 'transition-all', 'duration-300')
          setTimeout(() => {
            targetEl?.classList.remove('ring-4', 'ring-red-500/50')
          }, 2000)
        }, 150)
        break
      }
    }
  }

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!formData.businessName.trim()) {
        errs.businessName = 'Business name is required'
      }
      if (!formData.category.trim()) {
        errs.category = isCustomCategory ? 'Please specify your custom industry category' : 'Select an industry category'
      }
    } else if (step === 2) {
      if (formData.locations.length === 0) {
        errs.locations = 'At least one location is required'
      } else {
        formData.locations.forEach((loc, idx) => {
          if (!loc.state?.trim()) {
            errs[`location_${idx}_state`] = `Location ${idx + 1}: State selection is required`
          }
          const effectiveCity = (loc.isCustomCity ? loc.customCityName || '' : loc.city).trim()
          if (!effectiveCity) {
            errs[`location_${idx}_city`] = loc.isCustomCity 
              ? `Location ${idx + 1}: Please specify your city name` 
              : `Location ${idx + 1}: City selection is required`
          }
          if (!loc.address?.trim()) {
            errs[`location_${idx}_address`] = `Location ${idx + 1}: Physical address is required`
          }
          const zipVal = (loc.zipCode || '').trim()
          if (!zipVal) {
            errs[`location_${idx}_zip`] = `Location ${idx + 1}: ZIP code is required`
          } else if (!/^\d{5}(-\d{4})?$/.test(zipVal)) {
            errs[`location_${idx}_zip`] = `Location ${idx + 1}: Enter a valid US ZIP code (e.g. 90210 or 90210-1234)`
          }

          // Duplicate location detection
          const currentKey = `${effectiveCity.toLowerCase()}|${(loc.address || '').trim().toLowerCase()}`
          const isDuplicate = formData.locations.some((otherLoc, otherIdx) => {
            if (otherIdx === idx) return false
            const otherCity = (otherLoc.isCustomCity ? otherLoc.customCityName || '' : otherLoc.city).trim()
            const otherKey = `${otherCity.toLowerCase()}|${(otherLoc.address || '').trim().toLowerCase()}`
            return currentKey === otherKey && effectiveCity && loc.address.trim()
          })
          if (isDuplicate) {
            errs[`location_${idx}_address`] = `Location ${idx + 1}: This location (city & address) has already been added.`
          }
        })
      }

      if (!formData.phone?.trim()) {
        errs.phone = 'Phone number is required'
      } else {
        const pVal = validateUsPhone(formData.phone)
        if (!pVal.isValid) {
          errs.phone = pVal.error || 'Please provide a valid 10-digit US phone number: +1 (XXX) XXX-XXXX'
        }
      }

      if (formData.whatsapp?.trim()) {
        const wVal = validateUsPhone(formData.whatsapp)
        if (!wVal.isValid) {
          errs.whatsapp = wVal.error || 'Please provide a valid 10-digit US phone number: +1 (XXX) XXX-XXXX for WhatsApp'
        }
      }

      if (formData.ownerName?.trim()) {
        const oVal = validatePersonName(formData.ownerName)
        if (!oVal.isValid) {
          errs.ownerName = oVal.error || 'Contact person name must contain only alphabetic letters.'
        }
      }

      // Email is the listing contact address. Account creation happens only
      // in the sign-up tab up front — never inline at submit (see handleSubmit).
      if (!formData.email?.trim()) {
        errs.email = 'Business email is required'
      } else if (!validateEmail(formData.email).isValid) {
        errs.email = 'Please provide a valid business email address (e.g. name@company.com)'
      }
    } else if (step === 3) {
      // Step 3: Business Operating Hours validation
      const anyOpen = Object.values(operatingHoursState).some(s => s.isOpen || s.is24Hours)
      if (!anyOpen) {
        errs.hours = 'Please enable at least one operational day or 24/7 service so customers know when your business is open.'
      }
    } else if (step === 4) {
      // Step 4: Comprehensive Profile & SEO Narrative
      const wordCount = formData.description.trim() ? formData.description.trim().split(/\s+/).filter(Boolean).length : 0
      if (wordCount < 30) {
        const remaining = 30 - wordCount
        errs.description = `Please provide a business description of at least 30 words. Current: ${wordCount} words (${remaining} more words required).`
      }

      // Year established (optional): a sane 4-digit year only.
      if (formData.yearEstablished?.trim()) {
        const yearNum = Number(formData.yearEstablished.trim())
        const currentYear = new Date().getFullYear()
        if (!/^\d{4}$/.test(formData.yearEstablished.trim()) || yearNum < 1800 || yearNum > currentYear) {
          errs.yearEstablished = `Enter a valid 4-digit founding year between 1800 and ${currentYear}.`
        }
      }
      // Price range (optional): only $–$$$$ are valid values.
      if (formData.priceRange && !['$', '$$', '$$$', '$$$$'].includes(formData.priceRange)) {
        errs.priceRange = 'Select a valid price range ($, $$, $$$ or $$$$).'
      }
      // Photo gallery (optional): at most 5 photos.
      if ((formData.gallery || []).length > 5) {
        errs.gallery = 'The photo gallery holds at most 5 photos.'
      }

      // Check if FAQs have questions without answers
      const incompleteFaqs = (formData.faqs || []).filter(f => (f.question.trim() && !f.answer.trim()) || (!f.question.trim() && f.answer.trim()))
      if (incompleteFaqs.length > 0) {
        errs.faqs = 'Please complete both the question and answer for your FAQs, or remove incomplete entries.'
      }
    } else if (step === 5) {
      // Step 5 is the submit-time payment screen (not part of the wizard):
      // no payment screenshot on file means no submission — no exceptions.
      // Only submissions with a verified payment are approved.
      if (!paymentScreenshotBase64) {
        errs.paymentScreenshot = 'Please upload your payment screenshot to submit your business listing. Only submissions with a verified payment are approved.'
      }
    }

    setErrors(errs)
    const errKeys = Object.keys(errs)
    if (errKeys.length > 0) {
      const firstErrorMessage = errs[errKeys[0]]
      toast.error(firstErrorMessage, {
        description: 'Please complete the highlighted field to continue.',
        duration: 4000
      })
      focusFirstError(errs)
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1))
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  // Step 4 done → validate the whole form + auth, THEN show the payment
  // screen. Payment appears ONLY at submit time: the user fills the entire
  // form first and never sees payment before this point.
  const handleInitiateSubmit = () => {
    if (!validateStep(1)) {
      setCurrentStep(1)
      setTimeout(() => validateStep(1), 100)
      return
    }
    if (!validateStep(2)) {
      setCurrentStep(2)
      setTimeout(() => validateStep(2), 100)
      return
    }
    if (!validateStep(3)) {
      setCurrentStep(3)
      setTimeout(() => validateStep(3), 100)
      return
    }
    if (!validateStep(4)) {
      setCurrentStep(4)
      setTimeout(() => validateStep(4), 100)
      return
    }
    const fbUser = auth.currentUser
    if (!fbUser || !currentUser?.uid) {
      toast.error('Please sign in or create an account to submit your business listing.')
      return
    }
    if (!fbUser.emailVerified) {
      setShowVerifyNotice(true)
      toast.error('Please verify your email address before submitting. Check your inbox for the verification email, or resend it from the notice above the form.')
      return
    }
    setShowPaymentScreen(true)
    window.scrollTo({ top: 200, behavior: 'smooth' })
  }

  // Handle Form Submission — runs ONLY from the submit-time payment screen,
  // after the user has filled the form and uploaded a payment screenshot.
  // Listing submission is PAID: the screenshot is a hard gate (validateStep 5),
  // and only submissions with a verified payment are approved.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(1)) {
      setCurrentStep(1)
      setShowPaymentScreen(false)
      setTimeout(() => validateStep(1), 100)
      return
    }
    if (!validateStep(2)) {
      setCurrentStep(2)
      setShowPaymentScreen(false)
      setTimeout(() => validateStep(2), 100)
      return
    }
    if (!validateStep(3)) {
      setCurrentStep(3)
      setShowPaymentScreen(false)
      setTimeout(() => validateStep(3), 100)
      return
    }
    if (!validateStep(4)) {
      setCurrentStep(4)
      setShowPaymentScreen(false)
      setTimeout(() => validateStep(4), 100)
      return
    }
    // Step 5 = the submit-time payment screen: screenshot is a HARD gate.
    if (!validateStep(5)) {
      return
    }

    // Auth gate: submit requires a signed-in user with a VERIFIED email.
    // There is no inline account creation at submit and we NEVER submit
    // with an empty userId — the hardened Firestore rules require the
    // caller's own verified identity on create.
    const fbUser = auth.currentUser
    if (!fbUser || !currentUser?.uid) {
      toast.error('Please sign in or create an account to submit your business listing.')
      setShowPaymentScreen(false)
      return
    }
    if (!fbUser.emailVerified) {
      setShowVerifyNotice(true)
      toast.error('Please verify your email address before submitting. Check your inbox for the verification email, or resend it from the notice above the form.')
      return
    }
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
    const resolvedUserId = fbUser.uid

    setIsSubmitting(true)
    try {
      const primaryLoc = formData.locations.find(l => l.isPrimary) || formData.locations[0] || { city: 'New York', address: 'the United States' }
      const resolvedPrimaryCity = (primaryLoc.isCustomCity ? primaryLoc.customCityName || primaryLoc.city : primaryLoc.city).trim() || 'New York'
      // Top-level state/province must come from the primary location — otherwise
      // lib/db-service.ts defaults EVERY new business to 'New York'.
      const resolvedPrimaryState = (('state' in primaryLoc ? primaryLoc.state : '') || '').trim() || 'New York'
      const resolvedPrimaryZip = (('zipCode' in primaryLoc ? (primaryLoc as FormLocation).zipCode : '') || '').trim()
      const resolvedLocations = formData.locations.map(l => ({
        city: (l.isCustomCity ? l.customCityName || l.city : l.city).trim(),
        state: l.state,
        zipCode: (l.zipCode || '').trim(),
        address: l.address,
        isPrimary: l.isPrimary
      }))
      const resolvedCities = Array.from(new Set(resolvedLocations.map(l => l.city).filter(Boolean)))
      const resolvedFaqs = (formData.faqs || []).map(f => ({
        question: f.question.trim(),
        answer: f.answer.trim()
      })).filter(f => f.question && f.answer)

      const catDef = BUSINESS_CATEGORIES.find(
        c => c.name.toLowerCase() === formData.category.toLowerCase() || c.id === formData.category.toLowerCase()
      )
      const resolvedCategoryId = catDef
        ? catDef.id
        : (formData.category ? formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'local-services')

      // All three paid tiers ($1 Basic, $5 Standard, $10 Authoritative).
      // Price and name are both derived from the selected plan so a $1
      // submission is never labelled as the $5 plan.
      const isAuthoritative = selectedPlan === 'authoritative_10'
      const planPrice = BUSINESS_PLANS[selectedPlan].price
      const planName = BUSINESS_PLANS[selectedPlan].name

      const finalPaymentRef = payoneerReference || ('BNUSA-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000))

      // NOTE: zipCode / year_established / service_area / priceRange / gallery
      // are sent here, but lib/db-service.ts saveBusinessToDatabase builds its
      // stored doc explicitly and does not copy them yet (except zipCode, which
      // survives inside locations[] via its spread). That file needs a
      // passthrough before these fields persist — see final report.
      const businessPayload: Partial<BusinessItem> & { gallery?: string[] } = {
        name: formData.businessName,
        category: formData.category,
        categoryId: resolvedCategoryId,
        subCategory: formData.subcategory || undefined,
        secondaryCategories: formData.subcategory ? [formData.subcategory] : [],
        logo: formData.logo || logoPreview || undefined,
        city: resolvedPrimaryCity,
        state: resolvedPrimaryState,
        province: resolvedPrimaryState,
        zipCode: resolvedPrimaryZip || undefined,
        zip: resolvedPrimaryZip || undefined,
        year_established: formData.yearEstablished?.trim() ? Number(formData.yearEstablished.trim()) : undefined,
        service_area: formData.serviceArea?.trim() || undefined,
        priceRange: formData.priceRange || undefined,
        gallery: (formData.gallery || []).length > 0 ? formData.gallery : undefined,
        address: primaryLoc.address || 'the United States',
        locations: resolvedLocations,
        cities: resolvedCities,
        faqs: resolvedFaqs,
        ownerName: formData.ownerName || currentUser?.name || 'Business Representative',
        userId: resolvedUserId,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone.replace(/[^0-9]/g, ''),
        email: formData.email || currentUser?.email || 'contact@yourcompany.com',
        website: formData.website,
        description: formData.description,
        services: formData.services ? formData.services.split(',').map(s => s.trim()).filter(Boolean) : [],
        googleBusinessProfile: formData.googleBusinessProfile.trim(),
        facebookUrl: formData.facebookUrl.trim(),
        instagramUrl: formData.instagramUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        operatingHours: serializeOperatingHours(),
        status: 'pending',
        plan: selectedPlan,
        planName,
        planPrice,
        hasSinglePage: true,
        canEditProfile: true,
        paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
        paymentScreenshot: paymentScreenshotBase64 || undefined,
        payment_reference: finalPaymentRef,
        payment_provider: 'payoneer',
        transactionRef: payoneerTxId.trim() || paymentRefNumber.trim() || finalPaymentRef,
        payoneer_transaction_id: payoneerTxId.trim() || undefined,
        customer_note: customerNote.trim() || undefined,
        blog_post_entitled: true,
        blog_posts_allowed: BUSINESS_PLANS[selectedPlan].postsAllowed,
        blog_posts_used: 0,
        blog_post_feature_enabled: false,
        paymentDetails: {
          plan: selectedPlan,
          amount: planPrice,
          paymentMethod: 'Payoneer',
          paymentScreenshot: paymentScreenshotBase64 ? 'ATTACHED' : '',
          paymentDate: new Date().toISOString(),
          transactionId: payoneerTxId.trim() || undefined,
          customerNote: customerNote.trim() || undefined
        }
      }

      const saved = await saveBusinessToDatabase(businessPayload)

      // Sync to canonical payment records collection
      try {
        await fetch('/api/payments/submit-proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
          body: JSON.stringify({
            businessId: saved.id || saved.slug,
            businessName: saved.name,
            businessSlug: saved.slug,
            userId: resolvedUserId,
            userEmail: formData.email || currentUser?.email || '',
            planId: selectedPlan,
            paymentReference: finalPaymentRef,
            paymentScreenshot: paymentScreenshotBase64,
            payoneerTransactionId: payoneerTxId.trim() || undefined,
            customerNote: customerNote.trim() || undefined
          })
        })
      } catch (paySyncErr) {
        console.warn('Payment record sync notice:', paySyncErr)
      }

      setIsSubmitting(false)
      setShowPaymentScreen(false)
      setSubmittedSlug(saved.slug)
      setSubmittedBizName(saved.name)
      setSubmittedPlan(selectedPlan)
      setSubmittedPaymentRef(finalPaymentRef)
      
      // Refresh user businesses
      const targetEmail = formData.email || currentUser?.email || ''
      if (targetEmail || resolvedUserId) {
        fetchUserBusinesses(targetEmail || resolvedUserId)
      }

      toast.success('Listing and payment submitted! Only submissions with a verified payment are approved — our team will review it before publishing.')
      window.scrollTo({ top: 200, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      toast.error('An error occurred while saving your listing. Please try again.')
    }
  }

  // Handle Logo File Selection with Auto Canvas Compression (guarantees < 50KB base64)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Logo file size must be less than 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string
      try {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxDim = 400
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL('image/jpeg', 0.85)
            setLogoPreview(compressed)
            setFormData(prev => ({ ...prev, logo: compressed }))
          } else {
            setLogoPreview(rawBase64)
            setFormData(prev => ({ ...prev, logo: rawBase64 }))
          }
          toast.success('Business logo uploaded!')
        }
        img.onerror = () => {
          setLogoPreview(rawBase64)
          setFormData(prev => ({ ...prev, logo: rawBase64 }))
        }
        img.src = rawBase64
      } catch (_) {
        setLogoPreview(rawBase64)
        setFormData(prev => ({ ...prev, logo: rawBase64 }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUrlChange = (url: string) => {
    const trimmed = url.trim()
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    const finalUrl = (driveMatch && driveMatch[1]) ? `https://lh3.googleusercontent.com/d/${driveMatch[1]}` : trimmed
    setLogoPreview(finalUrl || null)
    setFormData(prev => ({ ...prev, logo: finalUrl }))
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setFormData(prev => ({ ...prev, logo: '' }))
  }

  // ZIP code for one location — digits and an optional -XXXX suffix only.
  const handleLocationZipChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9-]/g, '').slice(0, 10)
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map((item, i) => i === index ? { ...item, zipCode: cleaned } : item)
    }))
    if (errors[`location_${index}_zip`]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[`location_${index}_zip`]
        return next
      })
    }
  }

  // Photo gallery (optional, up to 5 photos) — same canvas compression as the logo.
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const remaining = 5 - (formData.gallery || []).length
    if (remaining <= 0) {
      toast.error('You can upload up to 5 photos in the gallery.')
      return
    }
    const accepted = files.filter(file => file.type.startsWith('image/')).slice(0, remaining)
    if (accepted.length === 0) {
      toast.error('Please upload image files (PNG, JPG, JPEG, WEBP).')
      return
    }
    if (files.length > remaining) {
      toast.info(`Only ${remaining} more photo${remaining === 1 ? '' : 's'} can be added (5 maximum).`)
    }
    accepted.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" is larger than 10MB and was skipped.`)
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const rawBase64 = event.target?.result as string
        const addPhoto = (dataUrl: string) => {
          setFormData(prev => {
            if ((prev.gallery || []).length >= 5) return prev
            return { ...prev, gallery: [...(prev.gallery || []), dataUrl] }
          })
        }
        try {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height
            const maxDim = 800
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width)
                width = maxDim
              } else {
                width = Math.round((width * maxDim) / height)
                height = maxDim
              }
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height)
              addPhoto(canvas.toDataURL('image/jpeg', 0.8))
            } else {
              addPhoto(rawBase64)
            }
          }
          img.onerror = () => addPhoto(rawBase64)
          img.src = rawBase64
        } catch (_) {
          addPhoto(rawBase64)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleRemoveGalleryPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index)
    }))
  }

  // Handle Screenshot File Selection with Auto Canvas Compression (guarantees < 100KB base64 for Firestore)
  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Screenshot file size must be less than 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string
      try {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxDim = 800
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL('image/jpeg', 0.65)
            setPaymentScreenshotBase64(compressed)
          } else {
            setPaymentScreenshotBase64(rawBase64.slice(0, 500000))
          }
        }
        img.onerror = () => {
          setPaymentScreenshotBase64(rawBase64.slice(0, 500000))
        }
        img.src = rawBase64
      } catch (_) {
        setPaymentScreenshotBase64(rawBase64.slice(0, 500000))
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle Payment Proof Submission
  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePaymentBiz) return

    if (!paymentScreenshotBase64) {
      toast.error('Please attach or upload your payment transfer screenshot.')
      return
    }

    setIsUploadingPayment(true)
    try {
      // All three paid tiers ($1 Basic, $5 Standard, $10 Authoritative).
      const planPrice = BUSINESS_PLANS[selectedPlan].price
      const channelConfig = US_PAYMENT_CHANNELS.find(c => c.id === selectedChannel) || US_PAYMENT_CHANNELS[0]
      const targetId = activePaymentBiz.id || activePaymentBiz.slug
      const success = await updateBusinessPaymentProof(targetId, {
        paymentMethod: channelConfig.name,
        referenceNumber: paymentRefNumber.trim() || 'N/A',
        paymentScreenshot: paymentScreenshotBase64,
        amount: planPrice,
        plan: selectedPlan
      })

      if (!success) {
        throw new Error('Database update returned false')
      }

      setSubmittedSlug(activePaymentBiz.slug)
      setSubmittedBizName(activePaymentBiz.name)
      setSubmittedPlan(selectedPlan)
      setActivePaymentBiz(null)
      setPaymentScreenshotBase64(null)
      setPaymentRefNumber('')

      if (currentUser?.email || currentUser?.uid) {
        await fetchUserBusinesses(currentUser.email || currentUser.uid || '')
      }

      toast.success('Payment submitted for admin verification. Your listing review is queued!')
      window.scrollTo({ top: 150, behavior: 'smooth' })
    } catch (err) {
      console.error('Payment upload error:', err)
      toast.error('Failed to submit payment proof. Please try again.')
    } finally {
      setIsUploadingPayment(false)
    }
  }

  const handleResetForm = () => {
    setSubmittedSlug(null)
    setSubmittedBizName('')
    setShowPaymentScreen(false)
    setActivePaymentBiz(null)
    setPaymentScreenshotBase64(null)
    setPaymentRefNumber('')
    setLogoPreview(null)
    setCurrentStep(1)
    setFormData({
      businessName: '',
      category: '',
      subcategory: '',
      logo: '',
      locations: [
        { city: '', state: '', address: '', zipCode: '', isPrimary: true, citySearchQuery: '', isCityDropdownOpen: false, isCustomCity: false, customCityName: '' }
      ],
      faqs: [],
      ownerName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      whatsapp: currentUser?.phone || '',
      email: currentUser?.email || '',
      website: '',
      description: '',
      services: '',
      yearEstablished: '',
      priceRange: '',
      serviceArea: '',
      gallery: [],
      proofDoc: '',
      googleBusinessProfile: '',
      facebookUrl: '',
      instagramUrl: '',
      linkedinUrl: ''
    })
    setActiveView('form')
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/80 via-slate-50 to-[#F8FAFC] text-slate-900 pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 overflow-hidden text-center">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/90 text-blue-800 border border-blue-200 text-xs font-bold tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>BizNest USA Business & Brand Onboarding</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Add Your Business to America&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">Digital Ecosystem</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Connect with US customers searching for local businesses, build a trusted online profile, and receive direct phone and message inquiries.
          </p>

          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Searching and browsing the BizNestUSA directory is always free — listing a business is a paid submission: choose a $1, $5, or $10 tier when you submit.
          </p>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-600 font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent Review
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-bold">
              <Clock className="w-4 h-4 text-blue-600" /> Fast Review Queue
            </span>
            <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 font-bold">
              <TrendingUp className="w-4 h-4 text-purple-600" /> US Local Discovery
            </span>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">

        {/* STICKY NOTIFICATION BANNER: FREE WEBSITE ASSISTANCE */}
        <StickyWebsiteBanner businessName={formData.businessName} />

        {/* AUTHENTICATION GATE: IF USER IS NOT LOGGED IN */}
        {!currentUser ? (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {authTab === 'login' ? 'Sign In to Add Your Business' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {authTab === 'login'
                  ? 'Sign in with your BizNest USA credentials to submit and track your business listings in real-time.'
                  : 'Register your account in 30 seconds to submit your business for review, manage locations, and track approval status. Listing is a paid submission — plans start from $1.'}
              </p>
            </div>

            {/* TAB SELECTOR: LOGIN VS SIGNUP */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setLoginError(''); }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Existing User (Sign In)</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthTab('signup'); setSignupError(''); }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>New User (Sign Up)</span>
              </button>
            </div>

            {/* LOGIN FORM */}
            {authTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. hello@mybusiness.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Verifying Account...' : 'Sign In & Continue Listing'}</span>
                </button>

                <p className="text-center text-xs text-slate-500 pt-2">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthTab('signup'); setSignupError(''); }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Create Your Account
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP FORM */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                {signupError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{signupError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name / Owner Name *</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(filterPersonNameInput(e.target.value))}
                      placeholder="e.g. Michael Miller"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Alphabetic letters only (no numbers like &quot;232&quot;).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone / WhatsApp Number (USA Standard) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      maxLength={17}
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(formatUsPhone(e.target.value))}
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">USA format: +1 (XXX) XXX-XXXX (exactly 10 digits).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. alex@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Create Password (Min 6 characters) *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSigningUp ? 'Creating Your Account...' : 'Register & Start Listing'}</span>
                </button>

                <p className="text-center text-xs text-slate-500 pt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthTab('login'); setLoginError(''); }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure Cloud Database</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Free Real-Time Tracking</span>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED LOGGED-IN VIEW */
          <div className="space-y-8">
            
            {/* LOGGED-IN USER TOOLBAR & TAB SELECTOR */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{currentUser.name || 'Account'}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      Active Account
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              {/* TABS: ADD BUSINESS VS MY SUBMITTED BUSINESSES */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => { setActiveView('form'); setSubmittedSlug(null); setShowPaymentScreen(false); setActivePaymentBiz(null); }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeView === 'form'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>+ Add New Business</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('my-businesses');
                    setActivePaymentBiz(null);
                    if (currentUser.email || currentUser.uid) fetchUserBusinesses(currentUser.email || currentUser.uid || '');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeView === 'my-businesses'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>My Submitted Businesses ({userBusinesses.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* EMAIL-VERIFICATION NOTICE: submit is blocked until the email is verified */}
            {(showVerifyNotice || currentUser.emailVerified === false) && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-extrabold text-amber-900">Verify your email to submit a listing</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      We sent a verification email to <strong>{currentUser.email}</strong>. Your listing cannot be submitted until your email is verified.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResendVerificationEmail}
                  disabled={isResendingVerification}
                  className="px-4 py-2.5 min-h-[44px] bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  {isResendingVerification ? 'Sending…' : 'Resend Verification Email'}
                </button>
              </div>
            )}

            {/* TAB CONTENT: MY SUBMITTED BUSINESSES */}
            {activeView === 'my-businesses' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-3xl border border-slate-200">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Your Submitted Listings & Status</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Track your business submissions. Listing is a paid submission — only listings with a verified payment are approved. Once your payment is verified and your listing is approved by our team, it goes live.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fetchUserBusinesses(currentUser.email || currentUser.uid || '')}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUserBusinesses ? 'animate-spin' : ''}`} />
                      <span>Refresh Status</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveView('form'); setSubmittedSlug(null); setShowPaymentScreen(false); setActivePaymentBiz(null); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                    >
                      + Add Another Business
                    </button>
                  </div>
                </div>

                {isLoadingUserBusinesses ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-600">Checking live status of your business submissions...</p>
                  </div>
                ) : userBusinesses.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900">No Business Submissions Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You haven&apos;t submitted any business listings yet under this account. Click below to add your first business!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActiveView('form'); setSubmittedSlug(null); setShowPaymentScreen(false); setActivePaymentBiz(null); }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer"
                    >
                      + Add Your First Business
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBusinesses.map((biz) => {
                      const isApproved = biz.status === 'approved'
                      const isPending = biz.status === 'pending'
                      const isRejected = biz.status === 'rejected'
                      const hasPaymentProof = Boolean(biz.paymentScreenshot || (biz.paymentDetails && biz.paymentDetails.paymentScreenshot))
                      const isUnpaid = !isApproved && !hasPaymentProof

                      return (
                        <div
                          key={biz.id || biz.slug}
                          className={`bg-white rounded-3xl p-6 border flex flex-col justify-between space-y-4 transition-all shadow-lg shadow-slate-900/5 ${
                            isApproved 
                              ? 'border-emerald-200' 
                              : (isUnpaid ? 'border-amber-300 bg-amber-50/20' : 'border-blue-200')
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-lg shrink-0">
                                {biz.name.charAt(0).toUpperCase()}
                              </div>

                              {/* STATUS BADGE */}
                              {isApproved ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Approved & Live</span>
                                </span>
                              ) : isRejected ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-extrabold">
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                  <span>Correction Needed</span>
                                </span>
                              ) : hasPaymentProof ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-extrabold">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  <span>Proof Under Review (1–2h)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Payment Required</span>
                                </span>
                              )}
                            </div>

                            <div>
                              <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{biz.name}</h3>
                              <p className="text-xs font-semibold text-blue-600">{biz.category}</p>
                            </div>

                            {/* UNPAID NOTICE BANNER: SHOWN ONLY UNTIL APPROVED AND WHILE PROOF IS MISSING */}
                            {!isApproved && !hasPaymentProof && (
                              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-xs space-y-2.5">
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Approval Pending (Payment Required)</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setIsWhyFeeModalOpen(true)}
                                    className="text-xs font-bold text-amber-800 underline hover:text-amber-950 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <HelpCircle className="w-3 h-3" />
                                    <span>Why pay?</span>
                                  </button>
                                </div>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                  Submit your payment transfer screenshot to complete your paid listing and put it at the top of the admin approval queue.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActivePaymentBiz(biz)}
                                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Request Approval &amp; Upload Screenshot</span>
                                </button>
                              </div>
                            )}

                            {/* PENDING PAYMENT PROOF VERIFICATION BANNER */}
                            {!isApproved && hasPaymentProof && (
                              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-xs space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span>Payment Proof Attached (Under 1–2h Review)</span>
                                </div>
                                <p className="text-xs text-blue-800 leading-tight">
                                  Your payment screenshot is queued for administrative approval. You can update or re-upload your receipt anytime.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActivePaymentBiz(biz)}
                                  className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 font-extrabold text-xs rounded-xl border border-blue-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5 text-blue-700" />
                                  <span>Update Payment Screenshot / Re-submit</span>
                                </button>
                              </div>
                            )}

                            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {biz.city || 'the United States'}
                                  {biz.locations && biz.locations.length > 1 && ` (+${biz.locations.length - 1} branches)`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{biz.phone || 'Phone not set'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>
                                  Submitted: {biz.submittedAt ? new Date(biz.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* CARD ACTION BUTTONS */}
                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedBizModal(biz)}
                              className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 text-center transition-colors cursor-pointer"
                            >
                              View Details
                            </button>

                            {isApproved ? (
                              <Link
                                href={`/business/${biz.slug}`}
                                target="_blank"
                                className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs text-center flex items-center justify-center gap-1"
                              >
                                <span>View Live</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActivePaymentBiz(biz)}
                                className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl border text-center flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                  hasPaymentProof
                                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-xs'
                                }`}
                              >
                                <span>{hasPaymentProof ? 'Edit / Update Proof' : 'Request Approval'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* TAB CONTENT: ADD BUSINESS WIZARD, PAYMENT SCREEN, OR SUCCESS CONFIRMATION */
              <div>
                {/* 1. Optional legacy payment screen retained for existing records; new US submissions skip it. */}
                {activePaymentBiz ? (
                  <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                          Review &amp; Onboarding Plan
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                          Select Verification Plan: {activePaymentBiz.name}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Submitting review payment queues your listing for human compliance review.
                        </p>
                      </div>
                    </div>

                    {/* PLAN SELECTION CARDS */}
                    <div className="grid grid-cols-1 gap-3.5">
                      <div
                        onClick={() => setSelectedPlan('review_1')}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          selectedPlan === 'review_1'
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Basic — Submit Only</span>
                          {selectedPlan === 'review_1' && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <h4 className="font-extrabold text-slate-900 mt-1.5 text-sm">$1 Basic Plan</h4>
                        <p className="text-xl font-black text-emerald-600 mt-0.5">$1.00</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Dedicated page created. Submit only — no edit access, no blog posts, no photo gallery.
                        </p>
                      </div>
                      <div
                        onClick={() => setSelectedPlan('priority_5')}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          selectedPlan === 'priority_5'
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">Priority + 5 Posts</span>
                          {selectedPlan === 'priority_5' && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                        <h4 className="font-extrabold text-slate-900 mt-1.5 text-sm">$5 Business Priority</h4>
                        <p className="text-xl font-black text-blue-600 mt-0.5">$5.00</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Priority review queue + publish up to 5 business content/blog posts.
                        </p>
                      </div>
                    </div>

                    {/* TRUTHFUL STATEMENT */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800">Truthful Platform Notice</p>
                      <p className="text-xs leading-relaxed">
                        BizNest USA does not guarantee search engine rankings. Review fees cover human verification and platform publication features. Payment does not automatically approve listings.
                      </p>
                    </div>

                    {/* PROOF UPLOAD FORM */}
                    <form onSubmit={handleSubmitPaymentProof} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Transaction ID / Reference Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={paymentRefNumber}
                          onChange={(e) => setPaymentRefNumber(e.target.value)}
                          placeholder="e.g. TRX982736154"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Upload Payment Screenshot *
                        </label>

                        {paymentScreenshotBase64 ? (
                          <div className="relative p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                            <img
                              src={paymentScreenshotBase64}
                              alt="Payment Screenshot"
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">Payment Screenshot Attached</p>
                              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for verification
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPaymentScreenshotBase64(null)}
                              className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer"
                              title="Remove screenshot"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                            <Upload className="w-6 h-6 text-blue-600" />
                            <span className="text-xs font-bold text-slate-800">
                              Click to upload transfer screenshot proof
                            </span>
                            <span className="text-xs text-slate-400">PNG, JPG, JPEG or WEBP (Max 5MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={isUploadingPayment || !paymentScreenshotBase64}
                          className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isUploadingPayment ? 'Submitting Proof...' : 'Submit Proof & Request Fast Approval'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActivePaymentBiz(null);
                            setActiveView('my-businesses');
                          }}
                          className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                        >
                          ← Back to Dashboard
                        </button>
                      </div>
                    </form>
                  </div>
                ) : submittedSlug ? (
                  /* 2. SUBMISSION CONFIRMATION SCREEN (MATCHING USER REQUIREMENT) */
                  <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl max-w-3xl mx-auto text-center space-y-6 animate-in zoom-in-95">
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm border border-blue-200">
                      <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>

                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Payment Submitted — Awaiting Admin Review</span>
                      </span>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Registration &amp; Payment Submitted
                      </h2>

                      <p className="text-sm text-slate-700 max-w-xl mx-auto leading-relaxed font-medium">
                        Your listing submission for <strong className="text-slate-900 text-base">{submittedBizName || formData.businessName}</strong> and your review payment have been recorded.
                      </p>

                      {/* PLAN & PAYMENT SUMMARY BADGE */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-xl mx-auto space-y-2.5 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-600">Plan:</span>
                          <span className="font-extrabold text-slate-900">
                            {submittedPlan ? BUSINESS_PLANS[submittedPlan].name.replace(' Plan', '') : 'Standard'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-600">Amount:</span>
                          <span className="font-extrabold text-blue-600">
                            {submittedPlan ? `$${BUSINESS_PLANS[submittedPlan].price} USD` : '$5 USD'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-600">Payment Reference:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {submittedPaymentRef || 'BNUSA-2026-PENDING'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-600">Status:</span>
                          <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                            Payment Verification Pending
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-600">Screenshot:</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Submitted
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">Directory Approval Status:</span>
                          <span className="font-bold text-slate-700">
                            Pending Editorial Review (Separate from Payment)
                          </span>
                        </div>
                      </div>

                      {/* TRUTHFUL REVIEW NOTICE */}
                      <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 text-left max-w-xl mx-auto space-y-2.5 text-xs text-slate-700">
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>Manual Admin Verification:</strong> Our administrative team will manually verify your Payoneer payment transaction before your business listing is approved.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>Review &amp; Approval:</strong> The website does not automatically approve or publish listings merely upon returning from payment. Features and blog post entitlements activate once payment is verified.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>User Dashboard Tracking:</strong> You can view and track your payment verification status and business approval status separately inside your dashboard anytime.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                      <Link
                        href="/dashboard"
                        className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Go to User Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Submit Another Business</span>
                      </button>

                      <Link
                        href="/"
                        className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition-all text-center"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                ) : showPaymentScreen ? (
                      <PaymentScreenPanel copiedKey={copiedKey} currentUser={currentUser} customerNote={customerNote} errors={errors} formData={formData} handleScreenshotFileChange={handleScreenshotFileChange} handleSubmit={handleSubmit} hasClickedCompletedPayment={hasClickedCompletedPayment} isSubmitting={isSubmitting} paymentScreenshotBase64={paymentScreenshotBase64} payoneerReference={payoneerReference} payoneerTxId={payoneerTxId} payoneerUrl={payoneerUrl} selectedPlan={selectedPlan} selectedPlanConfig={selectedPlanConfig} setCopiedKey={setCopiedKey} setCustomerNote={setCustomerNote} setHasClickedCompletedPayment={setHasClickedCompletedPayment} setPaymentScreenshotBase64={setPaymentScreenshotBase64} setPayoneerTxId={setPayoneerTxId} setSelectedPlan={setSelectedPlan} setShowPaymentScreen={setShowPaymentScreen} turnstileToken={turnstileToken} setTurnstileToken={setTurnstileToken} />
                ) : (
                  /* 4. 4-STEP WIZARD FORM */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT FORM COLUMN (8 Cols) */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-8">
                      
                      {/* STEP PROGRESS BAR */}
                      <div className="space-y-3 pb-6 border-b border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span className="text-blue-600">Step {currentStep} of 4</span>
                          <span>{Math.round((currentStep / 4) * 100)}% Profile Complete</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                          ></div>
                        </div>

                        <div className="hidden sm:grid grid-cols-4 gap-1 text-xs font-semibold text-center text-slate-400 pt-1">
                          <span className={currentStep >= 1 ? 'text-blue-600 font-bold' : ''}>1. Identity</span>
                          <span className={currentStep >= 2 ? 'text-blue-600 font-bold' : ''}>2. Locations</span>
                          <span className={currentStep >= 3 ? 'text-blue-600 font-bold' : ''}>3. Hours</span>
                          <span className={currentStep >= 4 ? 'text-blue-600 font-bold' : ''}>4. Details</span>
                        </div>
                        <p className="sm:hidden text-xs font-bold text-blue-600 text-center pt-1">Step {currentStep} of 4 — {['Identity', 'Locations', 'Hours', 'Details'][currentStep - 1]}</p>
                      </div>

                      {/* STEP 1: BUSINESS IDENTITY */}
                      {currentStep === 1 && <StepIdentityPanel availableSubcategories={availableSubcategories} customCategoryText={customCategoryText} customSubcategoryText={customSubcategoryText} errors={errors} formData={formData} handleCategorySelectChange={handleCategorySelectChange} handleCustomCategoryTextChange={handleCustomCategoryTextChange} handleCustomSubcategoryTextChange={handleCustomSubcategoryTextChange} handleGalleryFileChange={handleGalleryFileChange} handleLogoFileChange={handleLogoFileChange} handleLogoUrlChange={handleLogoUrlChange} handleRemoveGalleryPhoto={handleRemoveGalleryPhoto} handleRemoveLogo={handleRemoveLogo} handleSubcategorySelectChange={handleSubcategorySelectChange} isCustomCategory={isCustomCategory} isCustomSubcategory={isCustomSubcategory} logoPreview={logoPreview} setErrors={setErrors} setFormData={setFormData} />}

                      {/* STEP 2: LOCATION & CONTACT */}
                      {currentStep === 2 && <StepLocationsPanel ensureStateCities={ensureStateCities} errors={errors} formData={formData} geoCitiesByCode={geoCitiesByCode} geoLoadingCodes={geoLoadingCodes} geoStates={geoStates} handleAddLocation={handleAddLocation} handleAddressKeyDown={handleAddressKeyDown} handleCustomCityNameChange={handleCustomCityNameChange} handleLocationAddressChange={handleLocationAddressChange} handleLocationCitySearch={handleLocationCitySearch} handleLocationCitySelect={handleLocationCitySelect} handleLocationOtherCitySelect={handleLocationOtherCitySelect} handleLocationZipChange={handleLocationZipChange} handleRemoveLocation={handleRemoveLocation} handleSetPrimaryLocation={handleSetPrimaryLocation} setErrors={setErrors} setFormData={setFormData} toggleLocationCityDropdown={toggleLocationCityDropdown} />}

                      {/* STEP 3: OPERATING HOURS & AVAILABILITY */}
                      {currentStep === 3 && <StepHoursPanel applyHoursPreset={applyHoursPreset} formData={formData} operatingHoursState={operatingHoursState} setFormData={setFormData} setOperatingHoursState={setOperatingHoursState} />}

                      {/* STEP 4: DETAILS & DESCRIPTION */}
                      {currentStep === 4 && <StepDetailsPanel errors={errors} formData={formData} handleAddFaq={handleAddFaq} handleFaqChange={handleFaqChange} handleRemoveFaq={handleRemoveFaq} setErrors={setErrors} setFormData={setFormData} />}

                      {/* WIZARD BUTTON ACTIONS */}
                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        {currentStep > 1 ? (
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back Section</span>
                          </button>
                        ) : <div></div>}

                        {currentStep < 4 ? (
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Continue to Step {currentStep + 1}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleInitiateSubmit}
                            className="px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Review &amp; Continue to Payment</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                    </div>

                    {/* RIGHT SIDEBAR: STICKY LIVE PREVIEW CARD (4 Cols) */}
                    <div className="lg:col-span-4 sticky top-24 space-y-6">
                      
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            Live Listing Preview
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Draft
                          </span>
                        </div>

                        {/* Simulated Business Card */}
                        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 space-y-3">
                          <div className="flex items-start gap-3">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                                {formData.businessName ? formData.businessName.charAt(0).toUpperCase() : 'B'}
                              </div>
                            )}
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                                {formData.businessName || 'Your Business Name'}
                              </h4>
                              <p className="text-xs font-medium text-slate-500">{formData.category || 'Category'}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                <span>New Directory Listing</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {formData.description || 'Your business description will appear here as you type...'}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {formData.locations[0]?.city || 'the United States'}
                              {formData.locations.length > 1 && ` (+${formData.locations.length - 1} branches)`}
                            </span>
                            <span className="font-bold text-blue-600">{formData.phone || 'Your phone number'}</span>
                          </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-2 space-y-2 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Fast review queue</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Public directory profile URL</span>
                          </div>
                        </div>
                      </div>

                      {/* STICKY SIDEBAR WEBSITE ASSISTANCE CARD (LIGHT THEME) */}
                      <div className="bg-slate-50 text-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              Free Consultation
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-1">Need a Business Website?</h4>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Does your business need a modern, high-speed website? Our technology team builds professional, mobile-friendly websites that showcase your local services.
                        </p>

                        <Link
                          href="/contact"
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Contact Support Team</span>
                        </Link>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                          <span>Direct Support</span>
                          <span className="text-emerald-600 font-bold">Available 7 Days</span>
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* WHY PAY THIS FEE MODAL (PROFESSIONAL EXPLANATION AS REQUESTED) */}
        {isWhyFeeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Why is there a listing fee?</h3>
                    <p className="text-xs text-slate-500">Transparent & Secure Ecosystem Operations</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWhyFeeModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-blue-900 space-y-1">
                  <h4 className="font-extrabold text-blue-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Dedicated Cloud Database & Platform Hosting</span>
                  </h4>
                  <p className="text-xs leading-relaxed">
                    This listing fee directly supports our enterprise-grade cloud database infrastructure, maintaining fast uptime, high-speed multi-city searches, and data storage for your business profile.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 space-y-1">
                  <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Manual Anti-Spam & Fraud Prevention</span>
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Our compliance team manually reviews and authenticates every listing to eliminate duplicate spam and ensure consumers only connect with authentic American businesses. Only submissions with a verified payment are approved.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-900 space-y-1">
                  <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>7-Day Inactive Clean-Up Policy</span>
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Please note: listings that remain without payment proof will be automatically cleaned up and removed from your dashboard after <strong>7 days</strong> from submission.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsWhyFeeModalOpen(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS DETAILS MODAL FOR TRACKING */}
        {selectedBizModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedBizModal.name}</h3>
                  <p className="text-xs text-slate-500">{selectedBizModal.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBizModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-600">Current Status:</span>
                  <span className={`px-2.5 py-1 rounded-full font-extrabold uppercase text-xs ${
                    selectedBizModal.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : (selectedBizModal.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')
                  }`}>
                    {selectedBizModal.status === 'approved' ? 'Approved & Live' : (selectedBizModal.status || 'Pending Review')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Branch Locations:</h4>
                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedBizModal.locations && selectedBizModal.locations.length > 0 ? (
                      selectedBizModal.locations.map((loc, i) => (
                        <p key={i} className="text-slate-700">
                          • <strong>{loc.city}:</strong> {loc.address} {loc.isPrimary && '(Primary)'}
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-700">{selectedBizModal.city}: {selectedBizModal.address}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5">Phone:</span>
                    <span className="font-semibold text-slate-900">{selectedBizModal.phone || 'N/A'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5">WhatsApp:</span>
                    <span className="font-semibold text-slate-900">{selectedBizModal.whatsapp || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Full Description:</h4>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                    {selectedBizModal.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBizModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                {selectedBizModal.status === 'approved' && (
                  selectedBizModal.hasSinglePage === false ? (
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200">
                      Live in Category List/Grid
                    </span>
                  ) : (
                    <Link
                      href={`/business/${selectedBizModal.slug}`}
                      target="_blank"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <span>Open Live Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* LONG-FORM VALUE SECTION 1: WHY LIST YOUR BUSINESS */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Platform Value</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why List Your Business on BizNest USA?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              BizNest USA provides American businesses with the digital directory presence needed to be discovered by customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Independent Online Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create a complete, structured public business profile with your verified services, contact channels, and local branch locations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Direct Customer Inquiries</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers click directly to call your phone number or visit your official website with zero intermediaries or lead fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Human Business Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every listing is reviewed by our team before it goes live. Only submissions with a verified payment are approved and published.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Verified Listing Badge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build trust with American customers through verified business information, license details, and authentic moderation.
              </p>
            </div>
          </div>
        </section>

        {/* VALUE SECTION 2: FREQUENTLY ASKED QUESTIONS */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Onboarding & Payment FAQ</h2>
            <p className="text-slate-500 text-xs">Everything you need to know about listing your business and payment verification.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 bg-slate-50/80 hover:bg-slate-100/80 font-bold text-slate-900 text-xs sm:text-sm text-left flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

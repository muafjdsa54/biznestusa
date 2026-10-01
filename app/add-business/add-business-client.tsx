'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, MapPin, Phone, Mail, Globe, Upload, CheckCircle2, ShieldCheck, 
  Sparkles, ArrowRight, ArrowLeft, Star, ChevronDown, ChevronUp, Lock, Eye, EyeOff,
  Award, TrendingUp, Zap, HelpCircle, FileText, Check, AlertCircle, PhoneCall, MessageCircle, 
  Users, Briefcase, LogIn, UserPlus, LogOut, Clock, RefreshCw, ExternalLink, Info, X, Copy,
  CreditCard, Image as ImageIcon, AlertTriangle, Plus
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BUSINESS_CATEGORIES, CATEGORIES, STATE_CITIES, US_STATES, BusinessItem, BUSINESS_PLANS, BusinessPlan } from '@/lib/data'
import { saveBusinessToDatabase, getUserBusinesses, updateBusinessPaymentProof, normalizeSlug } from '@/lib/db-service'
import StickyWebsiteBanner from '@/components/business/sticky-website-banner'
import { auth } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from 'firebase/auth'
import { isValidPersonName, validatePersonName, filterPersonNameInput, isValidUsPhone, validateUsPhone, formatUsPhone, isValidEmail, validateEmail } from '@/lib/validation'
import { toast } from 'sonner'

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
    q: 'Is it free to submit a business?',
    a: 'Yes. Business submissions are reviewed for completeness and spam before they can appear publicly. There is no payment required to submit a listing.'
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
  phone?: string
  role?: string
}

export default function AddBusinessClient() {
  const router = useRouter()

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserSessionData | null>(null)
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
  const [submittedPlan, setSubmittedPlan] = useState<BusinessPlan>('priority_5')
  const [selectedChannel, setSelectedChannel] = useState<string>('card')
  const [paymentRefNumber, setPaymentRefNumber] = useState('')
  const [paymentScreenshotBase64, setPaymentScreenshotBase64] = useState<string | null>(null)
  const [isUploadingPayment, setIsUploadingPayment] = useState(false)
  const [isWhyFeeModalOpen, setIsWhyFeeModalOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null)
  const [submittedBizName, setSubmittedBizName] = useState<string>('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    subcategory: '',
    logo: '',
    locations: [
      { city: '', state: '', address: '', isPrimary: true, citySearchQuery: '', isCityDropdownOpen: false, isCustomCity: false, customCityName: '' }
    ] as FormLocation[],
    faqs: [
      { question: 'What specific products or services do you offer?', answer: '' },
      { question: 'What areas and cities do you serve in the United States?', answer: '' },
      { question: 'How can clients request an estimate or schedule a consultation?', answer: '' }
    ] as Array<{ question: string; answer: string }>,
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    description: '',
    services: '',
    proofDoc: ''
  })

  // Account Password for guest users
  const [accountPassword, setAccountPassword] = useState('')
  const [showAccountPassword, setShowAccountPassword] = useState(false)

  // Errors State
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Category & Subcategory Custom Input State
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

  // Load User Authentication & Session
  useEffect(() => {
    // 1. Check Session Storage first
    try {
      const stored = sessionStorage.getItem('biznestusa_user_session') || localStorage.getItem('biznestusa_user_session') || sessionStorage.getItem('listpak_user_session') || localStorage.getItem('listpak_user_session')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && (parsed.email || parsed.name)) {
          setCurrentUser(parsed)
          prefillUserForm(parsed)
          fetchUserBusinesses(parsed.email || parsed.uid || '')
        }
      }
    } catch (_) {}

    // 2. Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userObj: UserSessionData = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
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
      let loggedUser: UserSessionData = {
        email: loginEmail.trim().toLowerCase(),
        name: loginEmail.split('@')[0],
        role: 'business'
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
        if (userCredential.user) {
          loggedUser = {
            uid: userCredential.user.uid,
            name: userCredential.user.displayName || loginEmail.split('@')[0],
            email: userCredential.user.email || loginEmail.trim().toLowerCase(),
            phone: userCredential.user.phoneNumber || '',
            role: 'business'
          }
        }
      } catch (authErr: any) {
        const existingSession = localStorage.getItem('biznestusa_user_session') || localStorage.getItem('listpak_user_session')
        if (existingSession) {
          const parsed = JSON.parse(existingSession)
          if (parsed.email?.toLowerCase() === loginEmail.trim().toLowerCase()) {
            loggedUser = parsed
          } else {
            throw new Error(authErr?.message || 'Invalid credentials')
          }
        } else {
          throw new Error(authErr?.message || 'Account not found. Please create an account first.')
        }
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

      toast.success('Your BizNest USA account has been created successfully!')
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

  // Multi-Location Handlers
  const handleAddLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [
        ...prev.locations,
        { city: '', state: '', address: '', isPrimary: prev.locations.length === 0, citySearchQuery: '', isCityDropdownOpen: false, isCustomCity: false, customCityName: '' }
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
    if ((formData.faqs || []).length <= 3) {
      toast.error('A minimum of 3 FAQs is required to maximize customer conversion.')
      return
    }
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

      if (!currentUser) {
        if (!formData.email?.trim()) {
          errs.email = 'Valid business email is required for account creation'
        } else if (!validateEmail(formData.email).isValid) {
          errs.email = 'Please provide a valid business email address (e.g. name@company.com)'
        }
        if (!accountPassword || accountPassword.length < 6) {
          errs.accountPassword = 'Password must be at least 6 characters for your dashboard account'
        }
      }
    } else if (step === 3) {
      const wordCount = formData.description.trim() ? formData.description.trim().split(/\s+/).filter(Boolean).length : 0
      if (wordCount < 250) {
        const remaining = 250 - wordCount
        errs.description = `Description must be at least 250 words for SEO indexing. Current: ${wordCount} words (${remaining} more words required).`
      }

      // Validate at least 3 FAQs
      const validFaqs = (formData.faqs || []).filter(f => f.question.trim() && f.answer.trim())
      if (validFaqs.length < 3) {
        errs.faqs = `Please provide at least 3 FAQ question & answer pairs (${validFaqs.length}/3 completed). FAQs capture customer attention and build immediate credibility.`
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

  // Handle Form Submission: Saves Business Draft and Opens free US listing Payment Screen
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

    setIsSubmitting(true)
    try {
      let resolvedUserId = currentUser?.uid || ''
      if (!currentUser && formData.email && accountPassword) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, formData.email.trim(), accountPassword)
          if (cred.user) {
            await updateProfile(cred.user, { displayName: formData.ownerName || formData.businessName })
            resolvedUserId = cred.user.uid
            const sessionUser: UserSessionData = {
              uid: cred.user.uid,
              name: formData.ownerName || formData.businessName,
              email: formData.email.trim().toLowerCase(),
              role: 'business'
            }
            setCurrentUser(sessionUser)
            sessionStorage.setItem('biznestusa_user_session', JSON.stringify(sessionUser))
            localStorage.setItem('biznestusa_user_session', JSON.stringify(sessionUser))
          }
        } catch (authErr: any) {
          console.warn('Registration auth notice:', authErr?.message)
          const sessionUser: UserSessionData = {
            name: formData.ownerName || formData.businessName,
            email: formData.email.trim().toLowerCase(),
            role: 'business'
          }
          setCurrentUser(sessionUser)
          sessionStorage.setItem('biznestusa_user_session', JSON.stringify(sessionUser))
          localStorage.setItem('biznestusa_user_session', JSON.stringify(sessionUser))
        }
      }

      const primaryLoc = formData.locations.find(l => l.isPrimary) || formData.locations[0] || { city: 'New York', address: 'the United States' }
      const resolvedPrimaryCity = (primaryLoc.isCustomCity ? primaryLoc.customCityName || primaryLoc.city : primaryLoc.city).trim() || 'New York'
      const resolvedLocations = formData.locations.map(l => ({
        city: (l.isCustomCity ? l.customCityName || l.city : l.city).trim(),
        state: l.state,
        address: l.address,
        isPrimary: l.isPrimary
      }))
      const resolvedCities = Array.from(new Set(resolvedLocations.map(l => l.city).filter(Boolean)))
      const resolvedFaqs = (formData.faqs || []).map(f => ({
        question: f.question.trim(),
        answer: f.answer.trim()
      })).filter(f => f.question && f.answer)

      const planConfig = BUSINESS_PLANS[selectedPlan]
      const channelConfig = US_PAYMENT_CHANNELS.find(c => c.id === selectedChannel) || US_PAYMENT_CHANNELS[0]

      const catDef = BUSINESS_CATEGORIES.find(
        c => c.name.toLowerCase() === formData.category.toLowerCase() || c.id === formData.category.toLowerCase()
      )
      const resolvedCategoryId = catDef
        ? catDef.id
        : (formData.category ? formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'local-services')

      const saved = await saveBusinessToDatabase({
        name: formData.businessName,
        category: formData.category,
        categoryId: resolvedCategoryId,
        subCategory: formData.subcategory || undefined,
        secondaryCategories: formData.subcategory ? [formData.subcategory] : [],
        logo: formData.logo || logoPreview || undefined,
        city: resolvedPrimaryCity,
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
        services: formData.services ? formData.services.split(',').map(s => s.trim()) : ['General Services'],
        status: 'pending',
        plan: selectedPlan,
        planPrice: planConfig.price,
        paymentStatus: paymentScreenshotBase64 ? 'SUBMITTED' : 'PENDING',
        paymentScreenshot: paymentScreenshotBase64 || '',
        transactionRef: paymentRefNumber.trim() || '',
        blog_post_entitled: selectedPlan === 'priority_5',
        blog_posts_allowed: selectedPlan === 'priority_5' ? 5 : 0,
        blog_posts_used: 0,
        blog_post_feature_enabled: false,
        paymentDetails: {
          plan: selectedPlan,
          amount: planConfig.price,
          paymentMethod: channelConfig.name,
          referenceNumber: paymentRefNumber.trim() || '',
          paymentScreenshot: paymentScreenshotBase64 || '',
          paymentDate: new Date().toISOString()
        }
      })

      setIsSubmitting(false)
      setSubmittedSlug(saved.slug)
      setSubmittedBizName(saved.name)
      setSubmittedPlan(selectedPlan)
      
      // Refresh user businesses
      const targetEmail = formData.email || currentUser?.email || ''
      if (targetEmail || resolvedUserId) {
        fetchUserBusinesses(targetEmail || resolvedUserId)
      }

      toast.success('Listing and review payment submitted! Our team will review it before publishing.')
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
          const maxDim = 1200
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
            const compressed = canvas.toDataURL('image/jpeg', 0.8)
            setPaymentScreenshotBase64(compressed)
          } else {
            setPaymentScreenshotBase64(rawBase64)
          }
        }
        img.onerror = () => {
          setPaymentScreenshotBase64(rawBase64)
        }
        img.src = rawBase64
      } catch (_) {
        setPaymentScreenshotBase64(rawBase64)
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
      const planConfig = BUSINESS_PLANS[selectedPlan]
      const channelConfig = US_PAYMENT_CHANNELS.find(c => c.id === selectedChannel) || US_PAYMENT_CHANNELS[0]
      const targetId = activePaymentBiz.id || activePaymentBiz.slug
      const success = await updateBusinessPaymentProof(targetId, {
        paymentMethod: channelConfig.name,
        referenceNumber: paymentRefNumber.trim() || 'N/A',
        paymentScreenshot: paymentScreenshotBase64,
        amount: planConfig.price,
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
        { city: '', state: '', address: '', isPrimary: true, citySearchQuery: '', isCityDropdownOpen: false, isCustomCity: false, customCityName: '' }
      ],
      faqs: [
        { question: 'What specific products or services do you offer?', answer: '' },
        { question: 'What areas and cities do you serve in the United States?', answer: '' },
        { question: 'How can clients request an estimate or schedule a consultation?', answer: '' }
      ],
      ownerName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      whatsapp: currentUser?.phone || '',
      email: currentUser?.email || '',
      website: '',
      description: '',
      services: '',
      proofDoc: ''
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
                {authTab === 'login' ? 'Sign In to Add Your Business' : 'Create Free Account & List Business'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {authTab === 'login'
                  ? 'Sign in with your BizNest USA credentials to submit and track your business listings in real-time.'
                  : 'Register your account in 30 seconds to publish your business, manage locations, and track approval status.'}
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
                <span>New User (Sign Up Free)</span>
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
                    Create Free Account
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
                  <p className="text-[10px] text-slate-400 mt-1">Alphabetic letters only (no numbers like &quot;232&quot;).</p>
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
                  <p className="text-[10px] text-slate-400 mt-1">USA format: +1 (XXX) XXX-XXXX (exactly 10 digits).</p>
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

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-500">
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
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
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
                  onClick={() => { setActiveView('form'); setSubmittedSlug(null); setActivePaymentBiz(null); }}
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

            {/* TAB CONTENT: MY SUBMITTED BUSINESSES */}
            {activeView === 'my-businesses' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-3xl border border-slate-200">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Your Submitted Listings & Status</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Track your business submissions. Once free US listing payment is verified, your listing is approved by our team within 1–2 hours and goes live immediately.
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
                      onClick={() => { setActiveView('form'); setSubmittedSlug(null); setActivePaymentBiz(null); }}
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
                      onClick={() => { setActiveView('form'); setSubmittedSlug(null); setActivePaymentBiz(null); }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer"
                    >
                      + Add Your First Business
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBusinesses.map((biz) => {
                      const isApproved = (biz.status || 'approved') === 'approved'
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
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Approved & Live</span>
                                </span>
                              ) : isRejected ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-[11px] font-extrabold">
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                  <span>Correction Needed</span>
                                </span>
                              ) : hasPaymentProof ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-extrabold">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  <span>Proof Under Review (1–2h)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Awaiting Rs. 50 Fee</span>
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
                                    <span>Approval Pending (Rs. 50 Listing Fee)</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setIsWhyFeeModalOpen(true)}
                                    className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <HelpCircle className="w-3 h-3" />
                                    <span>Why pay?</span>
                                  </button>
                                </div>
                                <p className="text-[11px] text-amber-800 leading-relaxed">
                                  Submit your free US listing payment transfer screenshot to put your listing at the top of the admin approval queue.
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
                                <p className="text-[11px] text-blue-800 leading-tight">
                                  Your payment screenshot is queued for administrative approval. You can update or re-upload your receipt anytime.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActivePaymentBiz(biz)}
                                  className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 font-extrabold text-[11px] rounded-xl border border-blue-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div
                        onClick={() => setSelectedPlan('review_1')}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedPlan === 'review_1'
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">Standard</span>
                          {selectedPlan === 'review_1' && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                        <h4 className="font-extrabold text-slate-900 mt-1.5 text-sm">$1 Business Review</h4>
                        <p className="text-xl font-black text-slate-900 mt-0.5">$1.00</p>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Standard queue review, contact validation, categorization check.
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
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">Priority + 5 Posts</span>
                          {selectedPlan === 'priority_5' && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                        <h4 className="font-extrabold text-slate-900 mt-1.5 text-sm">$5 Business Priority</h4>
                        <p className="text-xl font-black text-blue-600 mt-0.5">$5.00</p>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Priority review within 24h + publish up to 5 business content/blog posts.
                        </p>
                      </div>
                    </div>

                    {/* TRUTHFUL STATEMENT */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800">Truthful Platform Notice</p>
                      <p className="text-[11px] leading-relaxed">
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
                              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
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
                            <span className="text-[11px] text-slate-400">PNG, JPG, JPEG or WEBP (Max 5MB)</span>
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

                      {/* PLAN SUMMARY BADGE */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-xl mx-auto space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-600">Selected Plan:</span>
                          <span className="font-extrabold text-slate-900">
                            {submittedPlan === 'priority_5' ? '$5 Business Priority ($5.00)' : '$1 Business Review ($1.00)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-600">Verification Status:</span>
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Under Admin Review
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">Content Blog Entitlement:</span>
                          <span className="font-bold text-slate-800">
                            {submittedPlan === 'priority_5' ? '5 Posts (Unlocks Upon Payment Verification)' : 'Not Included in $1 Review Plan'}
                          </span>
                        </div>
                      </div>

                      {/* TRUTHFUL REVIEW NOTICE */}
                      <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 text-left max-w-xl mx-auto space-y-2.5 text-xs text-slate-700">
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>Truthful Editorial Policy:</strong> The business listing does NOT automatically become approved solely because payment was made. Our admin editorial team reviews all details for accuracy and completeness.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>Queue Processing:</strong> {submittedPlan === 'priority_5' ? 'Priority Queue (processed within 24 hours)' : 'Standard Queue (processed within 48–72 hours)'}.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>Live Tracking:</strong> Track listing review status, admin notes, and manage your business profile anytime from your User Dashboard.
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
                ) : (
                  /* 3. 4-STEP WIZARD FORM */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT FORM COLUMN (8 Cols) */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-8">
                      
                      {/* STEP PROGRESS BAR */}
                      <div className="space-y-3 pb-6 border-b border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span className="text-blue-600">Step {currentStep} of 4</span>
                          <span>{progress}% Profile Complete</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300 rounded-full"
                            style={{ width: `${Math.max(currentStep * 25, progress)}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold text-center text-slate-400 pt-1">
                          <span className={currentStep >= 1 ? 'text-blue-600 font-bold' : ''}>1. Identity</span>
                          <span className={currentStep >= 2 ? 'text-blue-600 font-bold' : ''}>2. Locations</span>
                          <span className={currentStep >= 3 ? 'text-blue-600 font-bold' : ''}>3. Details</span>
                          <span className={currentStep >= 4 ? 'text-blue-600 font-bold' : ''}>4. Verify & Pay</span>
                        </div>
                      </div>

                      {/* STEP 1: BUSINESS IDENTITY */}
                      {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in-50">
                          {/* Category Type Switcher Banner */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-700">What profile type are you creating on BizNest USA?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3 bg-white border-2 border-blue-600 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900">Business / Store</p>
                                  <p className="text-[10px] text-slate-500">Retail shops & vendors</p>
                                </div>
                              </div>

                              <Link
                                href="/add-professional"
                                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl flex items-center gap-3 transition-all hover:bg-blue-50/50 group cursor-pointer"
                              >
                                <div className="p-2 bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 rounded-lg shrink-0">
                                  <Users className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600">Professional</p>
                                  <p className="text-[10px] text-slate-500">Personal & Freelancer</p>
                                </div>
                              </Link>

                              <Link
                                href="/add-company"
                                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl flex items-center gap-3 transition-all hover:bg-blue-50/50 group cursor-pointer"
                              >
                                <div className="p-2 bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 rounded-lg shrink-0">
                                  <Briefcase className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600">Hiring Company / HR</p>
                                  <p className="text-[10px] text-slate-500">Employers & Jobs</p>
                                </div>
                              </Link>
                            </div>
                          </div>

                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Step 1: Business Identity & Category</h2>
                            <p className="text-xs text-slate-500 mt-1">Enter your registered or commercial trade name and industry taxonomy.</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Business Name *
                              </label>
                              <input
                                id="field-businessName"
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => {
                                  setFormData({ ...formData, businessName: e.target.value })
                                  if (errors.businessName) {
                                    setErrors(prev => {
                                      const next = { ...prev }
                                      delete next.businessName
                                      return next
                                    })
                                  }
                                }}
                                placeholder="e.g. Apex Global Solutions / Austin Creative Tech"
                                className={`w-full px-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                  errors.businessName ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                }`}
                              />
                              {errors.businessName && <span className="text-[11px] font-semibold text-red-500 mt-1 block">{errors.businessName}</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-xs font-bold text-slate-700">Industry Category *</label>
                                  {isCustomCategory && (
                                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                                      Custom Industry
                                    </span>
                                  )}
                                </div>
                                <select
                                  id="field-category"
                                  value={isCustomCategory ? 'Other' : (BUSINESS_CATEGORIES.some(c => c.name === formData.category) ? formData.category : (formData.category ? 'Other' : ''))}
                                  onChange={(e) => handleCategorySelectChange(e.target.value)}
                                  className={`w-full px-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
                                    errors.category ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                >
                                  <option value="">-- Select Business Category --</option>
                                  {BUSINESS_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                  ))}
                                  <option value="Other">Other Category (Not Listed)</option>
                                </select>
                                {errors.category && <span className="text-[11px] font-semibold text-red-500 mt-1 block">{errors.category}</span>}

                                {isCustomCategory && (
                                  <div className="mt-2.5 space-y-1">
                                    <label className="block text-[11px] font-bold text-blue-900">
                                      Specify Your Custom Category / Industry *
                                    </label>
                                    <input
                                      id="field-customCategory"
                                      type="text"
                                      value={customCategoryText}
                                      onChange={(e) => handleCustomCategoryTextChange(e.target.value)}
                                      placeholder="e.g. Solar Energy, Biotechnology, Aerospace..."
                                      className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-xs font-bold text-slate-700">Subcategory Specialization</label>
                                  {isCustomSubcategory && (
                                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                                      Custom Specialty
                                    </span>
                                  )}
                                </div>

                                {isCustomCategory ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={formData.subcategory}
                                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                      placeholder="e.g. Solar Panel Fabrication, Research Lab..."
                                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <span className="text-[10px] text-slate-500 mt-1 block">
                                      Enter your specific service focus or primary commercial offering.
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <select
                                      value={isCustomSubcategory ? 'Other' : (availableSubcategories.includes(formData.subcategory) ? formData.subcategory : (formData.subcategory ? 'Other' : ''))}
                                      onChange={(e) => handleSubcategorySelectChange(e.target.value)}
                                      disabled={!formData.category}
                                      className={`w-full px-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-slate-200`}
                                    >
                                      <option value="">
                                        {formData.category ? `-- Select Subcategory Specialization --` : `-- Select Primary Category First --`}
                                      </option>
                                      {availableSubcategories.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                      ))}
                                      {formData.category && (
                                        <option value="Other">Other Subcategory / Specialization</option>
                                      )}
                                    </select>

                                    {isCustomSubcategory && (
                                      <div className="mt-2.5 space-y-1">
                                        <label className="block text-[11px] font-bold text-indigo-900">
                                          Specify Your Subcategory Specialization
                                        </label>
                                        <input
                                          type="text"
                                          value={customSubcategoryText}
                                          onChange={(e) => handleCustomSubcategoryTextChange(e.target.value)}
                                          placeholder="e.g. Tankless Water Heaters, EV Charger Install..."
                                          className="w-full px-4 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* BUSINESS LOGO UPLOAD SECTION */}
                            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                    <span>Business Logo / Brand Icon (Optional)</span>
                                  </label>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Upload your official logo or brand mark to make your listing stand out on BizNest USA.
                                  </p>
                                </div>
                                {logoPreview && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                {/* Preview Avatar Box */}
                                <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs group">
                                  {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                      <Building2 className="w-6 h-6 text-slate-400" />
                                      <span className="text-[9px] font-bold mt-0.5 text-slate-400">No Logo</span>
                                    </div>
                                  )}
                                </div>

                                {/* File Input & URL Input */}
                                <div className="flex-1 w-full space-y-2">
                                  <div className="flex items-center gap-2">
                                    <label className="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl cursor-pointer transition shadow-2xs flex items-center gap-2 hover:border-blue-300">
                                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                                      <span>{logoPreview ? 'Change Logo Image' : 'Choose Logo File (PNG, JPG, WebP)'}</span>
                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={handleLogoFileChange}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>

                                  <div className="relative">
                                    <input
                                      type="url"
                                      value={formData.logo || ''}
                                      onChange={(e) => handleLogoUrlChange(e.target.value)}
                                      placeholder="Or paste direct image URL / Google Drive link"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: LOCATION & CONTACT */}
                      {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in-50">
                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Step 2: Business Locations & Contact Channels</h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Add all physical branches, campuses, or store locations across cities. The first location is set as your Primary location.
                            </p>
                          </div>

                          {/* REPEATABLE LOCATIONS SECTION */}
                          <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                Business Locations ({formData.locations.length} {formData.locations.length === 1 ? 'Location' : 'Locations'})
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">
                                Press <strong>Enter</strong> in address to add another location
                              </span>
                            </div>

                            {formData.locations.map((loc, index) => {
const availableCities = loc.state ? (STATE_CITIES[loc.state] || []) : []
                                      const filteredCities = availableCities.filter(c =>
                                        c.toLowerCase().includes((loc.citySearchQuery || '').toLowerCase().trim())
                                      )

                              return (
                                <div 
                                  key={index}
                                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                                    loc.isPrimary 
                                      ? 'bg-blue-50/40 border-blue-200 shadow-xs' 
                                      : 'bg-slate-50/60 border-slate-200'
                                  }`}
                                >
                                  <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-200/60">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                                        {index + 1}
                                      </span>
                                      <h4 className="text-sm font-extrabold text-slate-900">
                                        Location {index + 1}
                                      </h4>
                                      {loc.isPrimary ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
                                          Primary Location
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleSetPrimaryLocation(index)}
                                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                                        >
                                          Set as Primary
                                        </button>
                                      )}
                                    </div>

                                    {formData.locations.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveLocation(index)}
                                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                      >
                                        Remove Location
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1.5">State *</label>
                                      <select
                                        id={`field-location-${index}-state`}
                                        value={loc.state}
                                        onChange={(e) => {
                                          setFormData(prev => ({
                                            ...prev,
                                            locations: prev.locations.map((item, i) => i === index ? {
                                              ...item,
                                              state: e.target.value,
                                              city: '',
                                              citySearchQuery: '',
                                              isCityDropdownOpen: false
                                            } : item)
                                          }))
                                          if (errors[`location_${index}_state`]) {
                                            setErrors(prev => {
                                              const next = { ...prev }
                                              delete next[`location_${index}_state`]
                                              return next
                                            })
                                          }
                                        }}
                                        className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                          errors[`location_${index}_state`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                        }`}
                                      >
                                        <option value="">Search or select a state</option>
                                        {US_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                                      </select>
                                      {errors[`location_${index}_state`] && (
                                        <span className="text-[11px] font-semibold text-red-500 mt-1 block">
                                          {errors[`location_${index}_state`]}
                                        </span>
                                      )}
                                    </div>
                                    {/* City Selector for Location Block */}
                                    <div className="relative">
                                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        City *
                                      </label>
                                      <div className="relative">
                                        <button
                                          type="button"
                                          id={`field-location-${index}-city`}
                                          onClick={() => toggleLocationCityDropdown(index)}
                                          disabled={!loc.state}
                                          aria-disabled={!loc.state}
                                          className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition disabled:cursor-not-allowed disabled:bg-slate-50 ${
                                            errors[`location_${index}_city`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200 hover:border-slate-300'
                                          }`}
                                        >
                                          <span className={loc.city ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                                            {loc.isCustomCity
                                              ? (loc.customCityName ? `${loc.customCityName} (Custom)` : 'Other City (Type below)')
                                              : (loc.city ? loc.city : loc.state ? `-- Select City (${availableCities.length} Cities) --` : '-- Select a state first --')}
                                          </span>
                                          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${loc.isCityDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {loc.isCityDropdownOpen && (
                                          <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 duration-150">
                                            <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0">
                                              <input
                                                type="text"
                                                value={loc.citySearchQuery || ''}
                                                onChange={(e) => handleLocationCitySearch(index, e.target.value)}
                                                placeholder="Search city..."
                                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                autoFocus
                                              />
                                            </div>

                                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1">
                                              {filteredCities.length > 0 ? (
                                                filteredCities.map((city) => (
                                                  <button
                                                    key={city}
                                                    type="button"
                                                    onClick={() => handleLocationCitySelect(index, city)}
                                                    className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition ${
                                                      loc.city === city ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                  >
                                                    <span>{city}</span>
                                                    {loc.city === city && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                                  </button>
                                                ))
                                              ) : (
                                                <div className="p-3 text-center text-xs text-slate-500 space-y-2">
                                                  <p>City not in standard list.</p>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handleCustomCityNameChange(index, loc.citySearchQuery || '')
                                                      handleLocationOtherCitySelect(index)
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                                  >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Use &ldquo;{loc.citySearchQuery || 'Custom City'}&rdquo;</span>
                                                  </button>
                                                </div>
                                              )}
                                            </div>

                                            {/* Sticky Other City option */}
                                            <div className="p-1 border-t border-slate-100 bg-slate-50/90 sticky bottom-0">
                                              <button
                                                type="button"
                                                onClick={() => handleLocationOtherCitySelect(index)}
                                                className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition font-bold cursor-pointer ${
                                                  loc.isCustomCity ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'
                                                }`}
                                              >
                                                <span className="flex items-center gap-1.5">
                                                  <Plus className="w-3.5 h-3.5" />
                                                  <span>Other City (Not Listed)</span>
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                                                  Specify custom
                                                </span>
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Custom City Input when Other City is selected */}
                                      {loc.isCustomCity && (
                                        <div className="mt-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-200 animate-in fade-in-50 duration-200">
                                          <div className="flex items-center justify-between mb-1">
                                            <label className="block text-[11px] font-bold text-blue-900">
                                              Specify City Name *
                                            </label>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setFormData(prev => {
                                                  const updated = [...prev.locations]
                                                  updated[index] = { ...updated[index], isCustomCity: false, customCityName: '', city: '' }
                                                  return { ...prev, locations: updated }
                                                })
                                              }}
                                              className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                                            >
                                              Back to list
                                            </button>
                                          </div>
                                          <input
                                            type="text"
                                            id={`field-location-${index}-customCity`}
                                            value={loc.customCityName || ''}
                                            onChange={(e) => handleCustomCityNameChange(index, e.target.value)}
                                            placeholder="Enter your city name (e.g. Arlington, Plano, Scottsdale)..."
                                            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                              errors[`location_${index}_city`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-blue-300'
                                            }`}
                                            autoFocus
                                          />
                                        </div>
                                      )}
                                      {errors[`location_${index}_city`] && (
                                        <span className="text-[11px] font-semibold text-red-500 mt-1 block">
                                          {errors[`location_${index}_city`]}
                                        </span>
                                      )}
                                    </div>

                                    {/* Address Field */}
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Physical Address / Area *
                                      </label>
                                      <input
                                        type="text"
                                        id={`field-location-${index}-address`}
                                        value={loc.address}
                                        onChange={(e) => handleLocationAddressChange(index, e.target.value)}
                                        onKeyDown={(e) => handleAddressKeyDown(e, index)}
                                        placeholder="e.g. Suite 400, 1200 Broadway"
                                        className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                          errors[`location_${index}_address`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                        }`}
                                      />
                                      {errors[`location_${index}_address`] && (
                                        <span className="text-[11px] font-semibold text-red-500 mt-1 block">
                                          {errors[`location_${index}_address`]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}

                            <button
                              type="button"
                              onClick={handleAddLocation}
                              className="w-full py-3 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border-2 border-dashed border-blue-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span>+ Add Another Branch / City Location</span>
                            </button>
                          </div>

                          {/* Contact Info Channels */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Phone Number (Calls - USA Standard) *
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-phone"
                                  type="tel"
                                  maxLength={17}
                                  value={formData.phone}
                                  onChange={(e) => {
                                    setFormData({ ...formData, phone: formatUsPhone(e.target.value) })
                                    if (errors.phone) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.phone
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="+1 (555) 123-4567"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.phone ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.phone ? (
                                <span className="text-[11px] font-semibold text-red-500 mt-1 block">{errors.phone}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 mt-1 block">USA format: +1 (XXX) XXX-XXXX (10 digits)</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                WhatsApp Number (Inquiries - USA Standard)
                              </label>
                              <div className="relative">
                                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-whatsapp"
                                  type="tel"
                                  maxLength={17}
                                  value={formData.whatsapp}
                                  onChange={(e) => {
                                    setFormData({ ...formData, whatsapp: formatUsPhone(e.target.value) })
                                    if (errors.whatsapp) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.whatsapp
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="+1 (555) 123-4567"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.whatsapp ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.whatsapp ? (
                                <span className="text-[11px] font-semibold text-red-500 mt-1 block">{errors.whatsapp}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 mt-1 block">USA format: +1 (XXX) XXX-XXXX (10 digits)</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Business Email {!currentUser && <span className="text-red-500">*</span>}
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value })
                                    if (errors.email) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.email
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="info@yourcompany.com"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.email ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.email ? (
                                <span className="text-[11px] font-semibold text-red-500 mt-1 block">{errors.email}</span>
                              ) : (
                                !currentUser && (
                                  <span className="text-[10px] text-slate-400 mt-1 block">Required to create your dashboard login & receive verification confirmation.</span>
                                )
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Contact Person / Representative Name
                              </label>
                              <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-ownerName"
                                  type="text"
                                  value={formData.ownerName}
                                  onChange={(e) => {
                                    const cleaned = filterPersonNameInput(e.target.value)
                                    setFormData({ ...formData, ownerName: cleaned })
                                    if (errors.ownerName) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.ownerName
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="e.g. John Miller (Letters only)"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.ownerName ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.ownerName ? (
                                <span className="text-[11px] font-semibold text-red-500 mt-1 block">{errors.ownerName}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 mt-1 block">Authorized representative or owner name (letters only).</span>
                              )}
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Website (Optional)
                              </label>
                              <div className="relative">
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-website"
                                  type="url"
                                  value={formData.website}
                                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                  placeholder="https://yourcompany.com"
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Account Password Setup for Guests */}
                          {!currentUser && (
                            <div className={`p-5 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 rounded-2xl border transition-all space-y-3 ${
                              errors.accountPassword ? 'border-red-400 bg-red-50/40 ring-2 ring-red-400/20' : 'border-blue-200'
                            }`}>
                              <div className="flex items-center gap-2 text-blue-900">
                                <Lock className="w-4 h-4 text-blue-600" />
                                <h4 className="font-extrabold text-xs">Create Dashboard Password (Required) *</h4>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                Set a secure password for your email (<strong>{formData.email || 'your email'}</strong>) so you can log into your Business Dashboard anytime to check approval status, upload receipts, and manage listings.
                              </p>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Account Password *</label>
                                <div className="relative">
                                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input
                                    id="field-accountPassword"
                                    type={showAccountPassword ? 'text' : 'password'}
                                    value={accountPassword}
                                    onChange={(e) => {
                                      setAccountPassword(e.target.value)
                                      if (errors.accountPassword) {
                                        setErrors(prev => {
                                          const next = { ...prev }
                                          delete next.accountPassword
                                          return next
                                        })
                                      }
                                    }}
                                    placeholder="At least 6 characters"
                                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 ${
                                      errors.accountPassword ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowAccountPassword(!showAccountPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                                  >
                                    {showAccountPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                                {errors.accountPassword && (
                                  <span className="text-[11px] font-semibold text-red-500 mt-1 block">
                                    {errors.accountPassword}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* STEP 3: DETAILS & 250-WORD SEO DESCRIPTION */}
                      {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in-50">
                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Step 3: Comprehensive Profile & SEO Narrative</h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Detailed business listings with 250+ words index 3x faster on Google search engines.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                  Business Overview (Min 250 Words for SEO) *
                                </label>
                                <span className={`text-[11px] font-bold ${
                                  (formData.description.trim().split(/\s+/).filter(Boolean).length >= 250)
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}>
                                  Word Count: {formData.description.trim() ? formData.description.trim().split(/\s+/).filter(Boolean).length : 0} / 250 words
                                </span>
                              </div>
                              <textarea
                                id="field-description"
                                rows={6}
                                value={formData.description}
                                onChange={(e) => {
                                  setFormData({ ...formData, description: e.target.value })
                                  if (errors.description) {
                                    setErrors(prev => {
                                      const next = { ...prev }
                                      delete next.description
                                      return next
                                    })
                                  }
                                }}
                                placeholder="Describe your business background, offerings, why customers in the United States should choose you, years of experience, unique features, and customer guarantees..."
                                className={`w-full p-4 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed ${
                                  errors.description ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                }`}
                              ></textarea>
                              {errors.description && (
                                <span className="text-[11px] font-semibold text-red-500 mt-1 block">{errors.description}</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Key Products / Services Offered (Comma Separated)
                              </label>
                              <input
                                type="text"
                                value={formData.services}
                                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                                placeholder="e.g. Fast Delivery, Custom Furniture, Corporate Packages, 24/7 Support"
                                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>

                            {/* Frequently Asked Questions (Minimum 3 FAQs Required) */}
                            <div id="field-faqs" className="pt-6 border-t border-slate-200/80 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-bold text-slate-900">
                                      Frequently Asked Questions (Minimum 3 FAQs Required) *
                                    </h3>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Direct FAQ answers capture visitor attention, answer buyer concerns immediately, and increase customer inquiries on your listing.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddFaq}
                                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Another FAQ</span>
                                </button>
                              </div>

                              {errors.faqs && (
                                <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                                  <span>{errors.faqs}</span>
                                </div>
                              )}

                              <div className="space-y-4">
                                {(formData.faqs || []).map((faq, faqIdx) => (
                                  <div
                                    key={faqIdx}
                                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-3 shadow-2xs"
                                  >
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                                      <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                          {faqIdx + 1}
                                        </span>
                                        FAQ Item #{faqIdx + 1}
                                      </span>
                                      {(formData.faqs || []).length > 3 && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveFaq(faqIdx)}
                                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                        >
                                          Remove FAQ
                                        </button>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Question *
                                      </label>
                                      <input
                                        id={`field-faq-${faqIdx}-question`}
                                        type="text"
                                        value={faq.question}
                                        onChange={(e) => handleFaqChange(faqIdx, 'question', e.target.value)}
                                        placeholder="e.g. What are your turnaround times or service warranties?"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Answer *
                                      </label>
                                      <textarea
                                        id={`field-faq-${faqIdx}-answer`}
                                        rows={3}
                                        value={faq.answer}
                                        onChange={(e) => handleFaqChange(faqIdx, 'answer', e.target.value)}
                                        placeholder="Provide a clear, detailed, and reassuring response to build customer confidence..."
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 4: PLAN SELECTION & REVIEW PAYMENT */}
                      {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in-50">
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              Step 4: Plan Selection &amp; Review Payment
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                              Choose Your Business Onboarding Plan
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Select an onboarding tier. All submissions undergo human compliance review before public activation.
                            </p>
                          </div>

                          {/* LISTING SUMMARY CHIP */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm">{formData.businessName || 'Business Name'}</p>
                              <p className="text-slate-500 mt-0.5">
                                {formData.category || 'General Services'} • {formData.locations[0]?.city || 'United States'}
                                {formData.locations.length > 1 && ` (+${formData.locations.length - 1} branches)`}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full font-bold text-slate-700 text-[11px]">
                              Owner: {currentUser?.name || formData.ownerName || 'Representative'}
                            </span>
                          </div>

                          {/* PLAN SELECTOR CARDS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* PLAN 1: $1 REVIEW */}
                            <div 
                              onClick={() => setSelectedPlan('review_1')}
                              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                selectedPlan === 'review_1'
                                  ? 'border-blue-600 bg-blue-50/30 shadow-md ring-2 ring-blue-500/10'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                    Standard Review
                                  </span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === 'review_1' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {selectedPlan === 'review_1' && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-extrabold text-slate-900">$1 Business Review</h3>
                                  <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900">$1.00</span>
                                    <span className="text-xs text-slate-500">/ one-time review</span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                    Standard queue review. We ensure your business information is accurate, complete, and properly categorized before public activation.
                                  </p>
                                </div>

                                <ul className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Business information &amp; contact verification</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Data quality review &amp; formatting check</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Correction suggestions &amp; category alignment</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Public business profile upon approval</span>
                                  </li>
                                  <li className="flex items-start gap-2 text-slate-400">
                                    <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span>No blog / article publishing access</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* PLAN 2: $5 PRIORITY */}
                            <div 
                              onClick={() => setSelectedPlan('priority_5')}
                              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                selectedPlan === 'priority_5'
                                  ? 'border-blue-600 bg-blue-50/40 shadow-lg ring-2 ring-blue-500/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-xs">
                                Recommended
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                    Priority + 5 Posts
                                  </span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === 'priority_5' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {selectedPlan === 'priority_5' && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-extrabold text-slate-900">$5 Business Priority</h3>
                                  <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-blue-600">$5.00</span>
                                    <span className="text-xs text-slate-500">/ one-time review</span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                    Expedited priority processing plus content marketing: submit up to 5 business articles directly on BizNest USA linking to your profile.
                                  </p>
                                </div>

                                <ul className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Priority processing:</strong> human review within 24h</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Editorial exposure:</strong> opportunities on category hubs</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Publish up to 5 business blog posts</strong></span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Direct author/business profile backlink attribution</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Priority review badge on your listing</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* TRUTHFUL STATEMENT DISCLAIMER */}
                          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <Info className="w-4 h-4 text-blue-600 shrink-0" />
                              <span>Platform Truthful Disclosure &amp; Search Engine Compliance</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              BizNest USA does not make false guarantees about search engine rankings. Review fees cover human editorial moderation, data accuracy verification, and publication tools. Payment does not guarantee automatic approval if submitted content violates safety policies.
                            </p>
                          </div>

                          {/* PAYMENT DETAILS & SCREENSHOT UPLOAD */}
                          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">Review Payment Instructions</h4>
                                <p className="text-xs text-slate-500">
                                  Amount Due: <strong className="text-blue-600">{selectedPlan === 'priority_5' ? '$5.00 USD' : '$1.00 USD'}</strong>
                                </p>
                              </div>
                              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                                {selectedPlan === 'priority_5' ? '$5 Business Priority' : '$1 Business Review'}
                              </span>
                            </div>

                            {/* CHANNELS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {US_PAYMENT_CHANNELS.map(ch => (
                                <button
                                  key={ch.id}
                                  type="button"
                                  onClick={() => setSelectedChannel(ch.id)}
                                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    selectedChannel === ch.id
                                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                  }`}
                                >
                                  <p className="text-xs font-extrabold">{ch.badge}</p>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{ch.name}</p>
                                </button>
                              ))}
                            </div>

                            {/* SELECTED CHANNEL DETAILS */}
                            {(() => {
                              const activeCh = US_PAYMENT_CHANNELS.find(c => c.id === selectedChannel) || US_PAYMENT_CHANNELS[0]
                              return (
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                  <p className="font-bold text-slate-800">{activeCh.name}</p>
                                  <p className="text-slate-600 text-[11px] leading-relaxed">{activeCh.instructions}</p>
                                </div>
                              )
                            })()}

                            {/* REFERENCE NUMBER */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Transaction / Confirmation ID (Optional or Reference)
                              </label>
                              <input
                                type="text"
                                value={paymentRefNumber}
                                onChange={(e) => setPaymentRefNumber(e.target.value)}
                                placeholder="e.g. AUTH-882341 or Transfer Confirmation #"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                              />
                            </div>

                            {/* SCREENSHOT UPLOAD */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Upload Payment Screenshot / Receipt (Optional for Fast Review)
                              </label>

                              {paymentScreenshotBase64 ? (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={paymentScreenshotBase64}
                                      alt="Screenshot preview"
                                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                    />
                                    <div>
                                      <p className="text-xs font-bold text-slate-900">Receipt Attached</p>
                                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Ready for verification
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentScreenshotBase64(null)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                                  <Upload className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-bold text-slate-700">Click to upload payment screenshot</span>
                                  <span className="text-[10px] text-slate-400">(PNG, JPG, WEBP)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleScreenshotFileChange}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

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
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Continue to Step {currentStep + 1}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>
                              {isSubmitting
                                ? 'Submitting...'
                                : `Submit Business & Payment (${selectedPlan === 'priority_5' ? '$5.00' : '$1.00'})`}
                            </span>
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
                              <p className="text-[11px] font-medium text-slate-500">{formData.category || 'Category'}</p>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                <span>New Directory Listing</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {formData.description || 'Your business description will appear here as you type...'}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {formData.locations[0]?.city || 'the United States'}
                              {formData.locations.length > 1 && ` (+${formData.locations.length - 1} branches)`}
                            </span>
                            <span className="font-bold text-blue-600">{formData.phone || '(555) 234-5678'}</span>
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
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
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

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
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
                    <h3 className="text-lg font-extrabold text-slate-900">Why Pay the free US listing Listing Fee?</h3>
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
                  <p className="text-[11px] leading-relaxed">
                    This modest nominal fee of <strong>free US listing</strong> directly supports our enterprise-grade cloud database infrastructure, maintaining fast uptime, high-speed multi-city searches, and data storage for your business profile.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 space-y-1">
                  <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Manual Anti-Spam & Fraud Prevention</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Our compliance team manually reviews and authenticates every listing within <strong>1 to 2 hours</strong> to eliminate duplicate spam and ensure consumers only connect with authentic the United Statesi businesses.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-900 space-y-1">
                  <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>7-Day Inactive Clean-Up Policy</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Please note: Unverified draft listings that remain without free US listing payment proof will be automatically cleaned up and removed from your dashboard after <strong>7 days</strong> from submission.
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
                  <span className={`px-2.5 py-1 rounded-full font-extrabold uppercase text-[10px] ${
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
                  <Link
                    href={`/business/${selectedBizModal.slug}`}
                    target="_blank"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <span>Open Live Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
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
              <h3 className="font-bold text-slate-900 text-base">Free Business Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero commission per inquiry and zero hidden monthly subscriptions. Standard review is included with all listings.
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

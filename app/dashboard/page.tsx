'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { 
  Building2, MapPin, Phone, Mail, Globe, Upload, CheckCircle2, ShieldCheck, 
  Sparkles, ArrowRight, Star, Clock, AlertCircle, RefreshCw, ExternalLink, 
  Copy, LogIn, UserPlus, LogOut, X, Zap, ChevronRight, Eye, EyeOff, Lock,
  FileText, Edit3, Plus, Check, MessageSquare, Info, AlertTriangle
} from 'lucide-react'
import { BusinessItem, UserBlogPost, BUSINESS_PLANS, BusinessPlan } from '@/lib/data'
import { getUserBusinesses, updateBusinessPaymentProof } from '@/lib/db-service'
import { auth } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth'
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

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export default function BusinessDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading Business Dashboard...</span>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSubmittedParam = searchParams.get('submitted') === 'true'
  const submittedBizName = searchParams.get('name') || ''
  const [showSubmittedAlert, setShowSubmittedAlert] = useState(isSubmittedParam)

  const [currentUser, setCurrentUser] = useState<{ uid?: string; name?: string; email?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [userBusinesses, setUserBusinesses] = useState<BusinessItem[]>([])
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false)

  // Auth Mode for non-logged in users
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)

  // Payment Proof Modal State
  const [activePaymentBiz, setActivePaymentBiz] = useState<BusinessItem | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan>('priority_5')
  const [selectedChannel, setSelectedChannel] = useState<string>('card')
  const [paymentRefNumber, setPaymentRefNumber] = useState('')
  const [paymentScreenshotBase64, setPaymentScreenshotBase64] = useState<string | null>(null)
  const [isUploadingPayment, setIsUploadingPayment] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Blog Post Authoring & Management State
  const [writingPostBiz, setWritingPostBiz] = useState<BusinessItem | null>(null)
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postKeywords, setPostKeywords] = useState('')
  const [postError, setPostError] = useState('')
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [userPosts, setUserPosts] = useState<UserBlogPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  // Details Modal
  const [selectedBizModal, setSelectedBizModal] = useState<BusinessItem | null>(null)

  useEffect(() => {
    // 1. Immediately read session from storage so Ctrl+R refresh is instant
    let sessionFound = false
    const rawSession = sessionStorage.getItem('biznestusa_user_session') || localStorage.getItem('biznestusa_user_session') || sessionStorage.getItem('listpak_user_session') || localStorage.getItem('listpak_user_session')
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession)
        if (parsed && (parsed.email || parsed.name || parsed.uid)) {
          sessionFound = true
          setCurrentUser(parsed)
          fetchBusinesses(parsed.email, parsed.uid || parsed.userId)
        }
      } catch (_) {}
    }
    
    // Fallback: If no explicit session but custom businesses exist in localStorage, hydrate automatically
    if (!sessionFound) {
      try {
        const custom = localStorage.getItem('biznestusa_custom_businesses') || localStorage.getItem('listpak_custom_businesses')
        if (custom) {
          const parsedCustom = JSON.parse(custom)
          if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
            const latest = parsedCustom[0]
            const autoUser = {
              name: latest.ownerName || latest.name || 'Business Owner',
              email: latest.email || 'business@biznestusa.com',
              uid: latest.userId || 'local-biz-owner',
              role: 'business'
            }
            setCurrentUser(autoUser)
            sessionStorage.setItem('biznestusa_user_session', JSON.stringify(autoUser))
            localStorage.setItem('biznestusa_user_session', JSON.stringify(autoUser))
            setUserBusinesses(parsedCustom)
            fetchUserPosts(parsedCustom)
            sessionFound = true
          }
        }
      } catch (_) {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userObj = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Business Owner',
          email: fbUser.email || '',
          role: 'business'
        }
        setCurrentUser(userObj)
        fetchBusinesses(userObj.email, userObj.uid)
        sessionStorage.setItem('biznestusa_user_session', JSON.stringify(userObj))
        localStorage.setItem('biznestusa_user_session', JSON.stringify(userObj))
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchUserPosts = async (businesses: BusinessItem[]) => {
    if (!businesses || businesses.length === 0) {
      setUserPosts([])
      return
    }
    setIsLoadingPosts(true)
    try {
      const allPosts: UserBlogPost[] = []
      for (const biz of businesses) {
        const targetId = biz.id || biz.slug
        if (!targetId) continue
        const res = await fetch(`/api/business/posts?businessId=${encodeURIComponent(targetId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.posts && Array.isArray(data.posts)) {
            allPosts.push(...data.posts)
          }
        }
      }
      // Deduplicate by id
      const uniquePosts = Array.from(new Map(allPosts.map(p => [p.id, p])).values())
      setUserPosts(uniquePosts)
    } catch (err) {
      console.warn('Failed to load user posts:', err)
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const fetchBusinesses = async (email?: string, uid?: string) => {
    const identifier = email || uid || ''
    if (!identifier) return
    setIsLoadingBusinesses(true)
    try {
      const list = await getUserBusinesses(identifier)
      let resolved = list
      if (list.length === 0 && uid && uid !== identifier) {
        const byUid = await getUserBusinesses(uid)
        resolved = byUid
      }
      setUserBusinesses(resolved)
      fetchUserPosts(resolved)
    } catch (err) {
      console.warn('Failed to load user businesses:', err)
    } finally {
      setIsLoadingBusinesses(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.')
      return
    }

    setIsLoggingIn(true)
    try {
      let loggedUser = {
        name: loginEmail.split('@')[0],
        email: loginEmail.trim().toLowerCase(),
        uid: ''
      }

      try {
        const cred = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
        if (cred.user) {
          loggedUser = {
            uid: cred.user.uid,
            name: cred.user.displayName || loginEmail.split('@')[0],
            email: cred.user.email || loginEmail.trim().toLowerCase()
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
          throw new Error('Invalid email or password. Please verify your credentials.')
        }
      }

      setCurrentUser(loggedUser)
      sessionStorage.setItem('biznestusa_user_session', JSON.stringify({ ...loggedUser, role: 'business' }))
      localStorage.setItem('biznestusa_user_session', JSON.stringify({ ...loggedUser, role: 'business' }))
      fetchBusinesses(loggedUser.email, loggedUser.uid)
      toast.success(`Welcome back, ${loggedUser.name}!`)
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setLoginError('Please complete all required fields.')
      return
    }
    if (signupPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.')
      return
    }

    setIsSigningUp(true)
    try {
      let newUser = {
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        uid: ''
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword)
        if (cred.user) {
          await updateProfile(cred.user, { displayName: signupName.trim() })
          newUser.uid = cred.user.uid
        }
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please sign in instead.')
        }
      }

      setCurrentUser(newUser)
      sessionStorage.setItem('biznestusa_user_session', JSON.stringify({ ...newUser, role: 'business' }))
      localStorage.setItem('biznestusa_user_session', JSON.stringify({ ...newUser, role: 'business' }))
      toast.success('Your BizNest USA business account has been created!')
    } catch (err: any) {
      setLoginError(err.message || 'Signup failed. Please try again.')
    } finally {
      setIsSigningUp(false)
    }
  }

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
    toast.success('Signed out successfully.')
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`Copied ${text} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP).')
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
        img.onerror = () => setPaymentScreenshotBase64(rawBase64)
        img.src = rawBase64
      } catch (_) {
        setPaymentScreenshotBase64(rawBase64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePaymentBiz) return

    if (!paymentScreenshotBase64) {
      toast.error('Please attach your payment transfer screenshot.')
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

      if (!success) throw new Error('Update returned false')

      toast.success('Payment submitted for admin review! Verification is queued.')
      setActivePaymentBiz(null)
      setPaymentScreenshotBase64(null)
      setPaymentRefNumber('')

      if (currentUser?.email || currentUser?.uid) {
        fetchBusinesses(currentUser.email, currentUser.uid)
      }
    } catch (err) {
      toast.error('Failed to upload proof. Please try again.')
    } finally {
      setIsUploadingPayment(false)
    }
  }

  // Handle Post Creation with Strict Entitlement Validation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setPostError('')
    if (!writingPostBiz) return

    if (!postTitle.trim() || postTitle.trim().length < 5) {
      setPostError('Post title is required and must be at least 5 characters.')
      return
    }
    if (!postContent.trim() || postContent.trim().length < 50) {
      setPostError('Post content is required and must be at least 50 characters.')
      return
    }

    setIsSubmittingPost(true)
    try {
      const res = await fetch('/api/business/post-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.uid || writingPostBiz.userId || 'user',
          businessId: writingPostBiz.id,
          title: postTitle.trim(),
          content: postContent.trim(),
          keywords: postKeywords ? postKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
          authorName: currentUser?.name || writingPostBiz.ownerName || writingPostBiz.name
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit business post.')
      }

      toast.success('Business post published successfully!')
      if (data.post) {
        setUserPosts(prev => [data.post, ...prev])
      }
      // Update business post count locally
      setUserBusinesses(prev => prev.map(b => b.id === writingPostBiz.id ? { ...b, blog_posts_used: (b.blog_posts_used || 0) + 1 } : b))
      setWritingPostBiz(null)
      setPostTitle('')
      setPostContent('')
      setPostKeywords('')
    } catch (err: any) {
      setPostError(err.message || 'Error publishing post. Please try again.')
    } finally {
      setIsSubmittingPost(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-lg font-bold text-slate-800">Loading Business Dashboard...</h2>
        </main>
        <Footer />
      </div>
    )
  }

  // STATE A: Unauthenticated User -> Sleek Sign In / Sign Up Card
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center w-full">
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {authMode === 'login' ? 'Business Dashboard Login' : 'Create Business Account'}
              </h1>
              <p className="text-xs text-slate-500">
                Log in to check the real-time approval status of your business listings, upload payment receipts, and manage branches.
              </p>
            </div>

            {/* Toggle Login / Signup */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(''); }}
                className={`py-2 rounded-xl transition ${authMode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setLoginError(''); }}
                className={`py-2 rounded-xl transition ${authMode === 'signup' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Create Account
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. owner@business.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? <span>Signing In...</span> : <><span>Sign In to Dashboard</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. owner@business.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSigningUp ? <span>Creating Account...</span> : <><span>Create Account &amp; Access Dashboard</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                href="/add-business"
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-extrabold hover:underline"
              >
                <span>Need to submit a new business? Click here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // STATE B: Authenticated Business Owner Dashboard
  const pendingCount = userBusinesses.filter(b => (b.status || '').toLowerCase() === 'pending' || (b.paymentStatus || '').toUpperCase() === 'PENDING').length
  const approvedCount = userBusinesses.filter(b => (b.status || '').toLowerCase() === 'approved').length
  const rejectedCount = userBusinesses.filter(b => (b.status || '').toLowerCase() === 'rejected').length

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* HEADER SECTION */}
      <section className="bg-white border-b border-slate-200/90 pt-8 pb-10 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Business Owner Dashboard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Welcome, {currentUser.name || currentUser.email}
              </h1>
              <p className="text-xs text-slate-500">
                Track your submitted business listings, upload verification receipts, and monitor approval status in real-time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/add-business"
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Building2 className="w-4 h-4" />
                <span>+ Register Another Business</span>
              </Link>

              <button
                onClick={() => fetchBusinesses(currentUser.email, currentUser.uid)}
                disabled={isLoadingBusinesses}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="Refresh listings"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBusinesses ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Listings</span>
              <p className="text-2xl font-extrabold text-slate-900">{userBusinesses.length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</span>
              <p className="text-2xl font-extrabold text-amber-900">{pendingCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved &amp; Live</span>
              <p className="text-2xl font-extrabold text-emerald-900">{approvedCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Modifications Needed</span>
              <p className="text-2xl font-extrabold text-slate-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LISTINGS CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* SUBMISSION CONFIRMATION ALERT (IF REDIRECTED FROM ADD BUSINESS) */}
        {showSubmittedAlert && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-teal-500/10 border border-emerald-300 shadow-sm flex items-start gap-4 animate-in fade-in-50">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Profile Created &amp; Queued
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                🎉 Your Business Has Been Successfully Submitted!
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {submittedBizName ? <>Your listing for <strong className="text-slate-900">{submittedBizName}</strong> has been registered. </> : 'Your new business profile is now active on your dashboard. '}
                Our compliance team reviews and approves listings within <strong>1 to 2 hours</strong>. Track your verification status in the cards below.
              </p>
            </div>
            <button
              onClick={() => setShowSubmittedAlert(false)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {userBusinesses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-5 max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">No Business Listings Registered Yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have not submitted any business profiles under <strong>{currentUser.email}</strong> yet. Register your business today to reach thousands of customers across the United States.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/add-business"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Register Your First Business Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Your Registered Businesses ({userBusinesses.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userBusinesses.map((biz) => {
                const isApproved = (biz.status || '').toLowerCase() === 'approved'
                const isRejected = (biz.status || '').toLowerCase() === 'rejected'
                const isPending = !isApproved && !isRejected
                const hasPaymentProof = Boolean(biz.paymentScreenshot || biz.paymentDetails?.paymentScreenshot)

                return (
                  <div 
                    key={biz.id || biz.slug}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {biz.category || 'Services'}
                        </span>

                        {isApproved ? (
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved &amp; Live</span>
                          </span>
                        ) : isPending ? (
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Under Review (1–2 Hours)</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Revision Needed</span>
                          </span>
                        )}
                      </div>

                      {/* Business Logo, Title & Location */}
                      <div className="flex items-start gap-3.5">
                        {biz.logo ? (
                          <img
                            src={biz.logo}
                            alt={biz.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                            {biz.name ? biz.name.charAt(0).toUpperCase() : 'B'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-extrabold text-slate-900 truncate">{biz.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{biz.city || 'United States'} • {biz.address || 'Commercial Center'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Moderation & Verification Notice Banner */}
                      {isPending && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>In Moderation Queue</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Our editorial team is reviewing your business details for verification before publishing.
                          </p>
                        </div>
                      )}

                      {isApproved && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-[11px] font-medium">
                            Your business is live and searchable by customers nationwide!
                          </span>
                        </div>
                      )}

                      {isRejected && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Modification Notice</span>
                          </div>
                          <p className="text-[11px] text-red-800">
                            {biz.rejectionReason || 'Please verify your contact and location details to satisfy directory guidelines.'}
                          </p>
                        </div>
                      )}

                      {/* Key details list */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                        <div>
                          <span className="text-slate-400 block font-medium">Phone:</span>
                          <span className="font-bold text-slate-800">{biz.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Submitted:</span>
                          <span className="font-bold text-slate-800">
                            {biz.submittedAt ? new Date(biz.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                          </span>
                        </div>
                      </div>

                      {/* STATUS VISUALIZATION GRID (MATCHING REQUIREMENT 28) */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Plan:</span>
                          <span className="font-extrabold text-slate-900">
                            {biz.plan === 'priority_5' ? '$5 Business Priority' : '$1 Business Review'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Payment Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            biz.paymentStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : biz.paymentStatus === 'REJECTED'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {biz.paymentStatus === 'VERIFIED' ? 'Verified' : biz.paymentStatus === 'REJECTED' ? 'Rejected' : 'Under Review / Submitted'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Business Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {isApproved ? 'Approved' : isRejected ? 'Revision Needed' : 'Pending Review'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-500">Blog Feature:</span>
                          {biz.plan === 'priority_5' ? (
                            biz.blog_post_feature_enabled || biz.paymentStatus === 'VERIFIED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                Enabled ({biz.blog_posts_used || 0}/5 used)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Waiting for Admin Approval
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600">
                              Not Included in $1 Plan
                            </span>
                          )}
                        </div>
                      </div>

                      {/* BLOG FEATURE ACTIONS / UPGRADE PROMPT */}
                      {biz.plan === 'priority_5' && (biz.blog_post_feature_enabled || biz.paymentStatus === 'VERIFIED') ? (
                        <div className="pt-1">
                          {(biz.blog_posts_used || 0) < 5 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setWritingPostBiz(biz)
                                setPostError('')
                              }}
                              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Write Your Post ({5 - (biz.blog_posts_used || 0)} Remaining)</span>
                            </button>
                          ) : (
                            <div className="p-2.5 bg-slate-100 rounded-xl text-center text-xs font-semibold text-slate-500">
                              5 of 5 posts used (Entitlement Limit Reached)
                            </div>
                          )}
                        </div>
                      ) : biz.plan !== 'priority_5' ? (
                        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between gap-2 text-xs">
                          <span className="text-[11px] text-blue-900 font-medium">
                            Business content posting is available with the Priority plan.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePaymentBiz(biz)
                              setSelectedPlan('priority_5')
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shrink-0 cursor-pointer shadow-xs"
                          >
                            Upgrade to $5
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBizModal(biz)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        View Details
                      </button>

                      {isApproved ? (
                        <Link
                          href={`/business/${biz.slug}`}
                          target="_blank"
                          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Live Listing</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePaymentBiz(biz)
                            setSelectedPlan(biz.plan || 'priority_5')
                          }}
                          className="flex-1 px-4 py-2 text-xs font-bold rounded-xl border text-center flex items-center justify-center gap-1.5 transition cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{hasPaymentProof ? 'Update Review Payment' : 'Submit Review Payment'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PUBLISHED BUSINESS POSTS SECTION */}
            <div className="pt-8 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Your Business Content &amp; Blog Posts ({userPosts.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Articles published under your business profiles and linked to your directory listing.
                  </p>
                </div>
              </div>

              {isLoadingPosts ? (
                <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading business posts...</span>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">No business posts written yet.</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Businesses with the $5 Business Priority plan can publish up to 5 articles directly on BizNest USA with backlink attribution to their business listing.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userPosts.map(post => (
                    <div key={post.id || post.slug} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm line-clamp-2">{post.title}</h4>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold shrink-0 capitalize">
                            {post.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Published for: <strong className="text-slate-800">{post.businessName}</strong>
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{post.excerpt}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                        </span>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <span>View Live Article</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: DETAILS PREVIEW */}
      {selectedBizModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedBizModal.name}</h3>
                <p className="text-xs text-slate-500">{selectedBizModal.category} in {selectedBizModal.city}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBizModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-500 block">Address:</span>
                <p className="font-medium">{selectedBizModal.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-slate-500 block">Phone:</span>
                  <p className="font-medium">{selectedBizModal.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">WhatsApp:</span>
                  <p className="font-medium">{selectedBizModal.whatsapp || 'N/A'}</p>
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Description:</span>
                <p className="font-medium leading-relaxed max-h-36 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedBizModal.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBizModal(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: WRITE YOUR POST (STRICT SERVER ENTITLEMENT) */}
      {writingPostBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 my-8 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Write Your Business Post
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                  Publish Article: {writingPostBiz.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Posts remaining: <strong className="text-blue-600">{Math.max(0, 5 - (writingPostBiz.blog_posts_used || 0))} of 5 posts allowed</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWritingPostBiz(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{postError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. 5 Common Plumbing Emergencies and How to Prevent Them"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Content * (Minimum 50 characters)
                </label>
                <textarea
                  rows={8}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your informative article content here. Provide valuable tips, advice, or service breakdowns for customers in your area..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Character count: {postContent.length} / 50 min
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={postKeywords}
                  onChange={(e) => setPostKeywords(e.target.value)}
                  placeholder="e.g. emergency plumber, pipe leak, residential plumbing (optional, comma-separated)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Optional. Do not keyword stuff. Enter natural search terms.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Published articles are linked to your business listing, giving customers informative discovery points and establishing local authority.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setWritingPostBiz(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingPost ? 'Publishing...' : 'Publish Business Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT & PROOF UPLOAD MODAL */}
      {activePaymentBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Review &amp; Onboarding Plan
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                  Select Plan: {activePaymentBiz.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePaymentBiz(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PLAN SELECTION */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedPlan('review_1')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'review_1'
                    ? 'border-blue-600 bg-blue-50/40 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-extrabold">$1 Business Review</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">$1.00</p>
                <p className="text-[10px] text-slate-500 mt-1">Standard review queue, no blog posting</p>
              </div>

              <div
                onClick={() => setSelectedPlan('priority_5')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'priority_5'
                    ? 'border-blue-600 bg-blue-50/40 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-extrabold text-blue-700">$5 Business Priority</p>
                <p className="text-lg font-black text-blue-600 mt-0.5">$5.00</p>
                <p className="text-[10px] text-slate-500 mt-1">Priority queue + 5 business posts</p>
              </div>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Reference / Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  placeholder="e.g. AUTH-9827361 or Confirmation #"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Payment Screenshot / Transfer Proof *
                </label>

                {paymentScreenshotBase64 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={paymentScreenshotBase64}
                        alt="Screenshot"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Proof Attached</p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready for verification
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentScreenshotBase64(null)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Click to upload transfer screenshot</span>
                    <span className="text-[10px] text-slate-400">(PNG, JPG, WEBP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActivePaymentBiz(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPayment || !paymentScreenshotBase64}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isUploadingPayment ? 'Submitting...' : 'Submit Payment Proof'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

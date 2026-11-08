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
  FileText, Edit3, Plus, Check, MessageSquare, Info, AlertTriangle,
  Factory, Briefcase, UserRound, ImageIcon
} from 'lucide-react'
import { BusinessItem, CompanyItem, ProfessionalItem, UserBlogPost, BUSINESS_PLANS, BusinessPlan } from '@/lib/data'
import { getUserBusinesses, updateBusinessPaymentProof, submitBusinessEditRequest } from '@/lib/db-service'
import { getAllCompanies } from '@/lib/company-service'
import { getAllProfessionals } from '@/lib/professional-service'
import { auth } from '@/lib/firebase'
import { getAuthHeaders } from '@/lib/client-auth'
import {
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth'
import { filterPersonNameInput, formatUsPhone } from '@/lib/validation'
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
  // Signup-first flow (LocalePak pattern): the dashboard requires a
  // signed-in user with a VERIFIED email. Unverified users see the
  // verify panel below, not the add cards or their listings.
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState('')
  const [userBusinesses, setUserBusinesses] = useState<BusinessItem[]>([])
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false)
  // Own-submission counts for the add cards. Null = not loaded (yet or
  // on error) — the card then shows no count line rather than a guess.
  // Jobs carry no reliable owner key (no userId; applicationEmail is the
  // employer's contact, not an account link), so the Post a Job card
  // shows no count.
  const [companyCounts, setCompanyCounts] = useState<{ total: number; pending: number; approved: number } | null>(null)
  const [professionalCounts, setProfessionalCounts] = useState<{ total: number; pending: number; approved: number } | null>(null)

  // Payment Proof Modal State
  const [activePaymentBiz, setActivePaymentBiz] = useState<BusinessItem | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan>('priority_5')
  const [selectedChannel, setSelectedChannel] = useState<string>('card')
  const [paymentRefNumber, setPaymentRefNumber] = useState('')
  const [paymentScreenshotBase64, setPaymentScreenshotBase64] = useState<string | null>(null)
  const [isUploadingPayment, setIsUploadingPayment] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Payoneer Payment Reference & Workflow State
  const [payoneerReference, setPayoneerReference] = useState<string>('')
  const [payoneerUrl, setPayoneerUrl] = useState<string>('')
  const [payoneerTxId, setPayoneerTxId] = useState<string>('')
  const [customerNote, setCustomerNote] = useState<string>('')
  const [hasClickedCompletedPayment, setHasClickedCompletedPayment] = useState(false)

  // Sync reference and URL when activePaymentBiz changes
  useEffect(() => {
    if (activePaymentBiz) {
      const ref = activePaymentBiz.payment_reference || activePaymentBiz.paymentDetails?.referenceNumber || ('BNUSA-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000))
      setPayoneerReference(ref)
      setSelectedPlan(activePaymentBiz.plan === 'authoritative_10' ? 'authoritative_10' : 'priority_5')
      setHasClickedCompletedPayment(false)
      setCustomerNote('')
      setPayoneerTxId('')
    }
  }, [activePaymentBiz])

  useEffect(() => {
    if (activePaymentBiz) {
      let isMounted = true
      fetch(`/api/payments/payoneer-url?plan=${selectedPlan}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data?.url) setPayoneerUrl(data.url)
        })
        .catch(console.warn)
      return () => { isMounted = false }
    }
  }, [activePaymentBiz, selectedPlan])

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

  // Edit Business & Profile Modal State ($5 Standard & $10 Authoritative Plans)
  const [editingBiz, setEditingBiz] = useState<BusinessItem | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    website: '',
    description: '',
    services: '',
    ownerName: '',
    googleBusinessProfile: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    gallery: [] as string[]
  })
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  const handleOpenEdit = (biz: BusinessItem) => {
    if (biz.plan === 'review_1') {
      toast.error('Profile editing is not available on the $1 Basic plan. Upgrade to the $5 Standard or $10 Authoritative plan to enable editing.', {
        duration: 5000
      })
      return
    }
    setEditingBiz(biz)
    setEditFormData({
      name: biz.name || '',
      phone: biz.phone || '',
      whatsapp: biz.whatsapp || '',
      address: biz.address || (biz.locations && biz.locations[0]?.address) || '',
      website: biz.website || '',
      description: biz.description || '',
      services: Array.isArray(biz.services) ? biz.services.join(', ') : (biz.services || ''),
      ownerName: biz.ownerName || '',
      googleBusinessProfile: biz.googleBusinessProfile || '',
      facebookUrl: biz.facebookUrl || '',
      instagramUrl: biz.instagramUrl || '',
      linkedinUrl: biz.linkedinUrl || '',
      gallery: Array.isArray((biz as any).gallery) ? [...(biz as any).gallery] : []
    })
  }

  // Photo gallery upload — $10 Authoritative benefit only (same canvas
  // compression as the add-business form; at most 5 photos).
  const handleEditGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const remaining = 5 - (editFormData.gallery || []).length
    if (remaining <= 0) {
      toast.error('You can upload up to 5 photos in the gallery.')
      return
    }
    const accepted = files.filter(file => file.type.startsWith('image/')).slice(0, remaining)
    if (accepted.length === 0) {
      toast.error('Please upload image files (PNG, JPG, JPEG, WEBP).')
      return
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
          setEditFormData(prev => {
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

  const handleRemoveEditGalleryPhoto = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index)
    }))
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBiz) return
    setIsSubmittingEdit(true)
    try {
      const res = await submitBusinessEditRequest(editingBiz.id || editingBiz.slug, {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        whatsapp: editFormData.whatsapp.trim(),
        address: editFormData.address.trim(),
        website: editFormData.website.trim(),
        description: editFormData.description.trim(),
        services: editFormData.services.split(',').map(s => s.trim()).filter(Boolean),
        ownerName: editFormData.ownerName.trim(),
        googleBusinessProfile: editFormData.googleBusinessProfile.trim(),
        facebookUrl: editFormData.facebookUrl.trim(),
        instagramUrl: editFormData.instagramUrl.trim(),
        linkedinUrl: editFormData.linkedinUrl.trim(),
        gallery: editFormData.gallery
      })

      if (res.success) {
        toast.success('Your profile changes have been submitted! They will be reviewed by admin and applied within 24 hours.')
        setEditingBiz(null)
        if (currentUser?.email || currentUser?.uid) {
          fetchBusinesses(currentUser.email, currentUser.uid)
        }
      } else {
        toast.error(res.message || 'Failed to submit profile edits.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting edit request.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Rolling 60-day quota helper for $10 Authoritative plan (and 5 posts for $5 Standard plan)
  const getPostQuotaInfo = (biz: BusinessItem) => {
    if (biz.plan === 'review_1') {
      return { allowed: 0, used: 0, remaining: 0, label: 'Not included in $1 Basic Plan' }
    }
    if (biz.plan === 'priority_5') {
      const used = userPosts.filter(p => p.businessId === biz.id).length || biz.blog_posts_used || 0
      const remaining = Math.max(0, 5 - used)
      return { allowed: 5, used, remaining, label: `${used}/5 posts used (${remaining} remaining)` }
    }
    // Authoritative 10: 10 posts in last 60 days rolling window
    const now = Date.now()
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000
    const sixtyDaysAgo = now - sixtyDaysMs
    const recentPosts = userPosts.filter(p => {
      if (p.businessId !== biz.id) return false
      const postTime = new Date(p.createdAt).getTime()
      return !isNaN(postTime) && postTime >= sixtyDaysAgo
    })
    const used = recentPosts.length
    const remaining = Math.max(0, 10 - used)
    return {
      allowed: 10,
      used,
      remaining,
      label: `${remaining} posts left (${used} of 10 used in last 60 days • fresh 10 after 60-day cycle)`
    }
  }

  useEffect(() => {
    // Identity comes ONLY from Firebase Auth (onAuthStateChanged).
    // Storage JSON is never trusted: no session read, no auto-fabrication
    // from localStorage businesses. Signed-out users go to /login.
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userObj = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Business Owner',
          email: fbUser.email || '',
          role: 'business'
        }
        setCurrentUser(userObj)
        const verified = fbUser.emailVerified === true
        setIsEmailVerified(verified)
        if (verified) {
          fetchBusinesses(userObj.email, userObj.uid)
          fetchMyCounts(userObj.email, userObj.uid)
        } else {
          setUserBusinesses([])
          setCompanyCounts(null)
          setProfessionalCounts(null)
        }
      } else {
        setCurrentUser(null)
        setUserBusinesses([])
        setIsEmailVerified(false)
        setCompanyCounts(null)
        setProfessionalCounts(null)
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Own-submission counts for the Add Company / Add Professional cards.
  // Companies have no userId (submitted anonymously) so they match on the
  // owner's email (email / companyEmail / hrEmail); professionals match
  // on userId first, then email. A failed load leaves the count null and
  // the card simply shows no count line.
  const fetchMyCounts = async (email?: string, uid?: string) => {
    const normEmail = (email || '').toLowerCase().trim()
    const normUid = (uid || '').toLowerCase().trim()
    if (!normEmail && !normUid) return
    try {
      const companies = await getAllCompanies(true)
      const mine = companies.filter((c: CompanyItem) => {
        const emails = [c.email, c.companyEmail, c.hrEmail].map((e) => (e || '').toLowerCase().trim())
        return normEmail ? emails.includes(normEmail) : false
      })
      setCompanyCounts({
        total: mine.length,
        pending: mine.filter((c) => c.status === 'pending').length,
        approved: mine.filter((c) => c.status === 'approved').length,
      })
    } catch (_) {
      setCompanyCounts(null)
    }
    try {
      const pros = await getAllProfessionals(true)
      const mine = pros.filter((p: ProfessionalItem) => {
        if (normUid && p.userId && p.userId.toLowerCase().trim() === normUid) return true
        return normEmail ? (p.email || '').toLowerCase().trim() === normEmail : false
      })
      setProfessionalCounts({
        total: mine.length,
        pending: mine.filter((p) => p.status === 'pending').length,
        approved: mine.filter((p) => p.status === 'approved').length,
      })
    } catch (_) {
      setProfessionalCounts(null)
    }
  }

  const handleResendVerification = async () => {
    setVerifyMsg('')
    try {
      const user = auth.currentUser
      if (!user) {
        setVerifyMsg('Please sign in again, then resend the verification email.')
        return
      }
      await sendEmailVerification(user)
      setVerificationSent(true)
      setVerifyMsg(`Verification email sent to ${user.email}. Please check your inbox (and spam folder), then click the link.`)
    } catch (err: any) {
      setVerifyMsg(err?.message || 'Could not send the verification email. Please try again.')
    }
  }

  // After clicking the link in the verification email, refresh the
  // Firebase user so the dashboard unlocks without a fresh sign-in.
  const handleRecheckVerification = async () => {
    setVerifyMsg('')
    try {
      const user = auth.currentUser
      if (!user) return
      await user.reload()
      const verified = auth.currentUser?.emailVerified === true
      setIsEmailVerified(verified)
      if (verified) {
        setVerifyMsg('Email verified — welcome to your dashboard.')
        if (currentUser) {
          fetchBusinesses(currentUser.email, currentUser.uid)
          fetchMyCounts(currentUser.email, currentUser.uid)
        }
      } else {
        setVerifyMsg('Not verified yet — click the link in the verification email, then try again.')
      }
    } catch (err: any) {
      setVerifyMsg(err?.message || 'Could not check verification status. Please try again.')
    }
  }

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
      const targetId = activePaymentBiz.id || activePaymentBiz.slug
      const finalRef = payoneerReference || ('BNUSA-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000))
      
      const success = await updateBusinessPaymentProof(targetId, {
        paymentMethod: 'Payoneer',
        referenceNumber: finalRef,
        paymentScreenshot: paymentScreenshotBase64,
        amount: planConfig.price,
        plan: selectedPlan
      })

      if (!success) throw new Error('Update returned false')

      // Sync with canonical payment records collection
      try {
        await fetch('/api/payments/submit-proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
          body: JSON.stringify({
            businessId: targetId,
            businessName: activePaymentBiz.name,
            businessSlug: activePaymentBiz.slug,
            userId: currentUser?.uid || activePaymentBiz.userId || 'user',
            userEmail: currentUser?.email || activePaymentBiz.email || '',
            planId: selectedPlan,
            paymentReference: finalRef,
            paymentScreenshot: paymentScreenshotBase64,
            payoneerTransactionId: payoneerTxId.trim() || undefined,
            customerNote: customerNote.trim() || undefined
          })
        })
      } catch (paySyncErr) {
        console.warn('Payment record sync error:', paySyncErr)
      }

      toast.success('Payment submitted for manual admin verification!')
      setActivePaymentBiz(null)
      setPaymentScreenshotBase64(null)
      setPaymentRefNumber('')
      setCustomerNote('')
      setPayoneerTxId('')

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
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
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

  // Signed-out users are redirected to /login by the onAuthStateChanged
  // listener above — this is only a fallback while the redirect lands.
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-lg font-bold text-slate-800">Redirecting to Sign In...</h2>
          <p className="text-xs text-slate-500">
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Click here to sign in</Link>
          </p>
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
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Business Owner Dashboard
                </span>
                {isEmailVerified ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Email Verified
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Email Not Verified
                  </span>
                )}
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

          {/* STATS CARDS — verified users only; unverified users have no
              listings loaded (see the verify panel below). */}
          {isEmailVerified && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listings</span>
              <p className="text-2xl font-extrabold text-slate-900">{userBusinesses.length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Review</span>
              <p className="text-2xl font-extrabold text-amber-900">{pendingCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved &amp; Live</span>
              <p className="text-2xl font-extrabold text-emerald-900">{approvedCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modifications Needed</span>
              <p className="text-2xl font-extrabold text-slate-900">{rejectedCount}</p>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* MAIN LISTINGS CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {!isEmailVerified ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-200 shadow-sm space-y-5 max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Mail className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">Please verify your email</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your account is signed in as <strong>{currentUser.email}</strong>, but the email address is not verified yet. Verify it to unlock the dashboard — the add cards and your listings stay hidden until then.
              </p>
            </div>
            {verifyMsg && (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">{verifyMsg}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleResendVerification}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                {verificationSent ? 'Resend Verification Email' : 'Send Verification Email'}
              </button>
              <button
                type="button"
                onClick={handleRecheckVerification}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                I&apos;ve Verified — Check Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ADD A LISTING — signup-first cards (LocalePak pattern, BizNestUSA styling) */}
            <section aria-label="Add a listing">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Add a Listing</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/add-business" className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-blue-500 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-900">Add Business</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">List your business so customers across the United States can find it.</p>
                  {userBusinesses.length > 0 && (
                    <p className="text-xs font-bold text-slate-600">{userBusinesses.length} submitted · {approvedCount} approved · {pendingCount} pending</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    Add now <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link href="/add-company" className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-blue-500 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Factory className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-900">Add Company</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Add your company profile for hiring and employer visibility.</p>
                  {companyCounts && companyCounts.total > 0 && (
                    <p className="text-xs font-bold text-slate-600">{companyCounts.total} submitted · {companyCounts.approved} approved · {companyCounts.pending} pending</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    Add now <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link href="/add-professional" className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-blue-500 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-900">Add Professional Profile</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Create your professional profile to receive client inquiries.</p>
                  {professionalCounts && professionalCounts.total > 0 && (
                    <p className="text-xs font-bold text-slate-600">{professionalCounts.total} submitted · {professionalCounts.approved} approved · {professionalCounts.pending} pending</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    Add now <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link href="/post-job" className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-blue-500 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-900">Post a Job</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Post an open role for candidates to apply to.</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    Post now <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </section>
        
        {/* SUBMISSION CONFIRMATION ALERT (IF REDIRECTED FROM ADD BUSINESS) */}
        {showSubmittedAlert && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-teal-500/10 border border-emerald-300 shadow-sm flex items-start gap-4 animate-in fade-in-50">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
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
                You have not submitted any business profiles under <strong>{currentUser.email}</strong> yet. Register your business today to reach customers across the United States.
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
                        <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {biz.category || 'Services'}
                        </span>

                        {isApproved ? (
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved &amp; Live</span>
                          </span>
                        ) : isPending ? (
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Under Review (1–2 Hours)</span>
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 flex items-center gap-1">
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
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Our editorial team is reviewing your business details for verification before publishing.
                          </p>
                        </div>
                      )}

                      {isApproved && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-medium">
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
                          <p className="text-xs text-red-800">
                            {biz.rejectionReason || 'Please verify your contact and location details to satisfy directory guidelines.'}
                          </p>
                        </div>
                      )}

                      {/* Key details list */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
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

                      {/* PAYMENT & VERIFICATION STATUS SECTION */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                        {/* Plan */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Plan:</span>
                          <span className="font-extrabold text-slate-900">
                            {biz.plan === 'authoritative_10'
                              ? 'Authoritative'
                              : biz.plan === 'priority_5'
                              ? 'Standard'
                              : 'Basic'}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Amount:</span>
                          <span className="font-bold text-blue-600">
                            {biz.plan === 'authoritative_10' ? '$10 USD' : biz.plan === 'priority_5' ? '$5 USD' : '$1 USD'}
                          </span>
                        </div>

                        {/* Payment Reference */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Payment Reference:</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {biz.payment_reference || (biz as any).paymentDetails?.referenceNumber || biz.transactionRef || 'Pending Ref'}
                          </span>
                        </div>

                        {/* Payment Status */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Status:</span>
                          {(() => {
                            const pStatus = (biz.paymentStatus || '').toUpperCase()
                            const isPaid = pStatus === 'PAID' || pStatus === 'VERIFIED'
                            const isRejectedPayment = pStatus === 'REJECTED'
                            const isPending = pStatus === 'PAYMENT_VERIFICATION_PENDING' || pStatus === 'SUBMITTED' || pStatus === 'UNDER_REVIEW'
                            
                            if (isPaid) {
                              return (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Payment Verified
                                </span>
                              )
                            }
                            if (isRejectedPayment) {
                              return (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                                  Payment Rejected
                                </span>
                              )
                            }
                            if (isPending) {
                              return (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Payment Verification Pending
                                </span>
                              )
                            }
                            return (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                Pending Payment
                              </span>
                            )
                          })()}
                        </div>

                        {/* Screenshot Status */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Screenshot:</span>
                          <span className="font-bold text-slate-800 text-xs">
                            {biz.paymentScreenshot || (biz as any).paymentDetails?.paymentScreenshot ? 'Submitted' : 'Not Submitted'}
                          </span>
                        </div>

                        {/* Separate Business Approval Status */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-semibold text-slate-500">Business Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {isApproved ? 'Approved & Live' : isRejected ? 'Revision Needed' : 'Pending Review'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-500">Blog Feature:</span>
                          {(() => {
                            const quota = getPostQuotaInfo(biz)
                            if (biz.plan === 'review_1') {
                              return (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                                  Not Included in $1 Basic Plan
                                </span>
                              )
                            }
                            if (biz.blog_post_feature_enabled || biz.paymentStatus === 'VERIFIED' || isApproved) {
                              return (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  {quota.label}
                                </span>
                              )
                            }
                            return (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Waiting for Admin Approval
                              </span>
                            )
                          })()}
                        </div>
                      </div>

                      {/* PENDING EDIT NOTICE */}
                      {(biz as any).pendingEditRequest && (
                        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-xs font-medium">
                            Profile edit request is undergoing 24h moderation review.
                          </span>
                        </div>
                      )}

                      {/* BLOG FEATURE ACTIONS / UPGRADE PROMPT */}
                      {(() => {
                        const quota = getPostQuotaInfo(biz)
                        const canPost = (biz.plan === 'priority_5' || biz.plan === 'authoritative_10') && (biz.blog_post_feature_enabled || biz.paymentStatus === 'VERIFIED' || isApproved)
                        if (canPost) {
                          return (
                            <div className="pt-1">
                              {quota.remaining > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWritingPostBiz(biz)
                                    setPostError('')
                                  }}
                                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>
                                    Write Post ({quota.remaining} Left{biz.plan === 'authoritative_10' ? ' in 60-day cycle' : ''})
                                  </span>
                                </button>
                              ) : (
                                <div className="p-2.5 bg-slate-100 rounded-xl text-center text-xs font-semibold text-slate-500">
                                  {biz.plan === 'authoritative_10'
                                    ? 'All 10 posts used in this 60-day cycle. Quota refreshes after the 60-day period.'
                                    : '5 of 5 posts used (Standard Plan limit reached).'}
                                </div>
                              )}
                            </div>
                          )
                        }
                        if (biz.plan === 'review_1') {
                          return (
                            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between gap-2 text-xs">
                              <span className="text-xs text-blue-900 font-medium">
                                Article posting &amp; editing available with Standard ($5) &amp; Authoritative ($10).
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePaymentBiz(biz)
                                  setSelectedPlan('priority_5')
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer shadow-xs"
                              >
                                Upgrade to $5
                              </button>
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBizModal(biz)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Details
                      </button>

                      {/* EDIT OPTION (Enabled for $5 Standard & $10 Authoritative) */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(biz)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                          biz.plan === 'review_1'
                            ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                        title={biz.plan === 'review_1' ? 'Upgrade to $5 or $10 to enable editing' : 'Edit profile & business details (applied after 24h review)'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{biz.plan === 'review_1' ? 'Edit (Upgrade)' : 'Edit Profile'}</span>
                      </button>

                      {isApproved ? (
                        biz.hasSinglePage === false ? (
                          <Link
                            href={`/category/${biz.category ? biz.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general'}`}
                            target="_blank"
                            className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Live in Directory</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                          </Link>
                        ) : (
                          <Link
                            href={`/business/${biz.slug}`}
                            target="_blank"
                            className="flex-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Live Page</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                          </Link>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePaymentBiz(biz)
                            setSelectedPlan(biz.plan === 'authoritative_10' ? 'authoritative_10' : biz.plan === 'review_1' ? 'review_1' : 'priority_5')
                          }}
                          className="flex-1 px-3.5 py-2 text-xs font-bold rounded-xl border text-center flex items-center justify-center gap-1.5 transition cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
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
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0 capitalize">
                            {post.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Published for: <strong className="text-slate-800">{post.businessName}</strong>
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2">{post.excerpt}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-xs text-slate-400">
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
          </>
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
                <span className="text-xs text-slate-400 block mt-1">
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
                <span className="text-xs text-slate-400 block mt-0.5">
                  Optional. Do not keyword stuff. Enter natural search terms.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
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

            {/* PLAN SELECTION (3 PLANS) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

              <div
                onClick={() => setSelectedPlan('review_1')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'review_1'
                    ? 'border-emerald-600 bg-emerald-50/40 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-extrabold text-emerald-700">$1 Basic Plan</p>
                <p className="text-base font-black text-emerald-600 mt-0.5">$1.00</p>
                <p className="text-xs text-slate-500 mt-1">Submit only — dedicated page, no edit, no blog, no gallery</p>
              </div>

              <div
                onClick={() => setSelectedPlan('priority_5')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'priority_5'
                    ? 'border-blue-600 bg-blue-50/40 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-extrabold text-blue-700">$5 Standard Plan</p>
                <p className="text-base font-black text-blue-600 mt-0.5">$5.00</p>
                <p className="text-xs text-slate-500 mt-1">Single page created + dashboard profile editing + 5 posts</p>
              </div>

              <div
                onClick={() => setSelectedPlan('authoritative_10')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'authoritative_10'
                    ? 'border-indigo-600 bg-indigo-50/40 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-extrabold text-indigo-700">$10 Authoritative</p>
                <p className="text-base font-black text-indigo-600 mt-0.5">$10.00</p>
                <p className="text-xs text-slate-500 mt-1">Single page + priority review + 10 posts / 60 days</p>
              </div>
            </div>

            {/* PAYONEER REFERENCE & PAYMENT ACTION CARD */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                <div>
                  <span className="text-xs font-extrabold uppercase text-slate-500 block tracking-wider">
                    BizNestUSA Payment Reference
                  </span>
                  <span className="text-base font-mono font-black text-blue-700">
                    {payoneerReference}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(payoneerReference)
                      setCopiedKey('dashboard_ref')
                      toast.success('Reference copied to clipboard!')
                      setTimeout(() => setCopiedKey(null), 2500)
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  {copiedKey === 'dashboard_ref' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs">Copy Ref</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {payoneerUrl ? (
                  <a
                    href={payoneerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasClickedCompletedPayment(true)}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Pay Securely with Payoneer (${BUSINESS_PLANS[selectedPlan].price.toFixed(2)})</span>
                  </a>
                ) : (
                  <div className="flex-1 py-2.5 px-4 bg-slate-200 text-slate-600 font-bold text-xs rounded-xl text-center">
                    Loading Payoneer Link...
                  </div>
                )}
                {!hasClickedCompletedPayment && (
                  <button
                    type="button"
                    onClick={() => setHasClickedCompletedPayment(true)}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    I&apos;ve Paid
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                After completing payment in Payoneer, attach your receipt screenshot below. Your payment will be manually verified by our team before your listing is approved.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payoneer Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={payoneerTxId}
                  onChange={(e) => setPayoneerTxId(e.target.value)}
                  placeholder="e.g. 192837465 or Payoneer payment reference"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Note (Optional)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="e.g. Payer name or transfer memo"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
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
                    <span className="text-xs text-slate-400">(PNG, JPG, WEBP)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
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

      {/* MODAL 4: EDIT BUSINESS & PROFILE MODAL ($5 & $10 PLANS, 24H REVIEW APPLIED) */}
      {editingBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Edit Profile &amp; Business
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                  {editingBiz.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBiz(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 24-HOUR REVIEW NOTICE REQUIRED BY USER */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>24-Hour Review &amp; Moderation Notice</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                You can edit your personal representative info and business profile details below. In accordance with platform compliance, all submitted modifications will be reviewed by site admin and <strong>applied after 24 hours</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Calls) *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: formatUsPhone(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: formatUsPhone(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address *</label>
                <input
                  type="text"
                  required
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Representative Name</label>
                  <input
                    type="text"
                    value={editFormData.ownerName}
                    onChange={(e) => setEditFormData({ ...editFormData, ownerName: filterPersonNameInput(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Services (Comma Separated)</label>
                <input
                  type="text"
                  value={editFormData.services}
                  onChange={(e) => setEditFormData({ ...editFormData, services: e.target.value })}
                  placeholder="e.g. Plumbing Repairs, Drain Cleaning, Water Heaters"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />
              </div>

              {/* BRAND AUTHORITY PROFILES */}
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Brand Authority &amp; Google Ranking Profiles</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">Google Business Profile (Maps URL)</label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?cid=..."
                      value={editFormData.googleBusinessProfile}
                      onChange={(e) => setEditFormData({ ...editFormData, googleBusinessProfile: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">Facebook Page URL</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={editFormData.facebookUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, facebookUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">Instagram Profile URL</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={editFormData.instagramUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, instagramUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">LinkedIn Profile / Company</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      value={editFormData.linkedinUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              {/* PHOTO GALLERY — $10 AUTHORITATIVE BENEFIT ONLY */}
              {editingBiz.plan === 'authoritative_10' && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Photo Gallery — $10 Authoritative Benefit (up to 5 photos)</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Add or remove listing photos. Changes are reviewed by admin and applied after 24 hours, like other edits.
                  </p>
                  {(editFormData.gallery || []).length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {(editFormData.gallery || []).map((photo, photoIdx) => (
                        <div key={photoIdx} className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <img src={photo} alt={`Business photo ${photoIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditGalleryPhoto(photoIdx)}
                            className="absolute top-1 right-1 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white/90 text-red-600 rounded-lg shadow-xs hover:bg-red-50 cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(editFormData.gallery || []).length < 5 && (
                    <label className="px-4 py-2.5 min-h-[44px] bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl cursor-pointer transition shadow-2xs inline-flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{(editFormData.gallery || []).length === 0 ? 'Add Photos (PNG, JPG, WebP — max 10MB each)' : `Add More Photos (${5 - (editFormData.gallery || []).length} left)`}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        multiple
                        onChange={handleEditGalleryFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingBiz(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingEdit ? 'Submitting...' : 'Submit Changes for 24h Review'}</span>
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

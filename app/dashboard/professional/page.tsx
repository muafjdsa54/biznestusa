'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ProfessionalItem, MOCK_PROFESSIONALS, ProfessionalInquiry } from '@/lib/data'
import { getAllProfessionals, getProfessionalInquiries } from '@/lib/professional-service'
import { db, auth } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import Link from 'next/link'
import {
  User, Briefcase, MapPin, Phone, Mail, Globe, ShieldCheck, Sparkles, Star,
  Linkedin, Github, Edit3, Plus, Trash2, CheckCircle2, Save, FileText, ExternalLink,
  MessageCircle, RefreshCw, Eye, Lock, AlertTriangle, Copy, Check, Clock, XCircle,
  ArrowRight, X, Inbox, Send, LogIn, AlertCircle, LogOut, EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

export default function ProfessionalDashboardPage() {
  const [profile, setProfile] = useState<ProfessionalItem | null>(null)
  const [allProfiles, setAllProfiles] = useState<ProfessionalItem[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'socials' | 'reviews' | 'inquiries'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showVerifySideAlert, setShowVerifySideAlert] = useState(true)
  const [inquiries, setInquiries] = useState<ProfessionalInquiry[]>([])
  const [loadingInquiries, setLoadingInquiries] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  // Inline Authentication State
  const [userSession, setUserSession] = useState<{ email?: string; name?: string; username?: string; role?: string } | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  const fetchInquiries = async (targetUsername?: string) => {
    try {
      setLoadingInquiries(true)
      const u = targetUsername || profile?.username || 'all'
      const inqs = await getProfessionalInquiries(u)
      setInquiries(inqs)
    } catch (err) {
      console.error('Error fetching inquiries:', err)
    } finally {
      setLoadingInquiries(false)
    }
  }

  // Real-time Firestore live listener for inquiries
  useEffect(() => {
    if (!profile) return
    try {
      const unsub = onSnapshot(collection(db, 'professional_inquiries'), (snapshot) => {
        const items: ProfessionalInquiry[] = []
        snapshot.forEach(docSnap => {
          items.push({ id: docSnap.id, ...(docSnap.data() as any) })
        })
        items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())

        const targetUser = (profile?.username || '').toLowerCase().trim()
        const targetName = (profile?.name || '').toLowerCase().trim()

        const matched = items.filter(inq => {
          const pU = (inq.proUsername || '').toLowerCase().trim()
          const pN = (inq.proName || '').toLowerCase().trim()
          return (
            !targetUser ||
            pU === targetUser ||
            pU.includes(targetUser) ||
            targetUser.includes(pU) ||
            (pN && targetName && (pN === targetName || pN.includes(targetName) || targetName.includes(pN)))
          )
        })

        setInquiries(matched.length > 0 ? matched : items)
      }, (err) => {
        console.warn('Inquiries onSnapshot listener error:', err)
      })
      return () => unsub()
    } catch (e) { }
  }, [profile?.username, profile?.name])

  async function loadData() {
    setLoading(true)
    try {
      const all = await getAllProfessionals(true)
      setAllProfiles(all)

      let targetUsername = ''
      let targetEmail = ''
      const session = sessionStorage.getItem('biznestusa_user_session') || localStorage.getItem('biznestusa_user_session') || sessionStorage.getItem('listpak_user_session') || localStorage.getItem('listpak_user_session')
      if (session) {
        try {
          const parsed = JSON.parse(session)
          targetUsername = parsed.username || ''
          targetEmail = parsed.email || ''
          setUserSession(parsed)
        } catch (e) { }
      }
      if (!targetEmail && auth.currentUser?.email) {
        targetEmail = auth.currentUser.email
        setUserSession({ email: targetEmail, name: auth.currentUser.displayName || '' })
      }

      let selectedPro: ProfessionalItem | null = null
      if (targetEmail || targetUsername || auth.currentUser?.uid) {
        const currentUid = auth.currentUser?.uid
        const matched = all.find(p =>
          (currentUid && p.userId && p.userId === currentUid) ||
          (targetEmail && p.email && p.email.toLowerCase().trim() === targetEmail.toLowerCase().trim()) ||
          (targetUsername && p.username && p.username.toLowerCase().trim() === targetUsername.toLowerCase().trim()) ||
          (targetUsername && p.slug && p.slug.toLowerCase().trim() === targetUsername.toLowerCase().trim())
        )
        if (matched) {
          selectedPro = matched
          setProfile(matched)
        }
      }

      if (!selectedPro) {
        setProfile(null)
      }

      if (selectedPro) {
        fetchInquiries(selectedPro.username)
      }
    } catch (err) {
      console.error('Error loading dashboard profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      try {
        await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
      } catch (authErr: any) {
        console.warn('Firebase auth attempt:', authErr?.message)
      }

      const all = await getAllProfessionals(true)
      const matched = all.find(p =>
        (p.email && p.email.toLowerCase().trim() === loginEmail.trim().toLowerCase()) ||
        (p.username && p.username.toLowerCase().trim() === loginEmail.trim().toLowerCase())
      )

      const sessionObj = {
        name: matched?.name || matched?.fullName || loginEmail.split('@')[0],
        email: loginEmail.trim(),
        role: 'professional',
        hasProfile: Boolean(matched),
        username: matched?.username || loginEmail.split('@')[0],
        userId: matched?.userId || auth.currentUser?.uid || ''
      }

      sessionStorage.setItem('biznestusa_user_session', JSON.stringify(sessionObj))
      localStorage.setItem('biznestusa_user_session', JSON.stringify(sessionObj))
      setUserSession(sessionObj)

      if (matched) {
        setProfile(matched)
        toast.success(`Welcome back, ${matched.name}!`)
      } else {
        toast.success('Logged in successfully. Please complete your professional profile setup.')
      }

      await loadData()
    } catch (err: any) {
      setLoginError('Invalid credentials. Please verify your email and password.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (_) { }
    sessionStorage.removeItem('biznestusa_user_session')
    localStorage.removeItem('biznestusa_user_session')
    sessionStorage.removeItem('listpak_user_session')
    localStorage.removeItem('listpak_user_session')
    setUserSession(null)
    setProfile(null)
    toast.success('Logged out successfully.')
  }

  const isApproved = profile ? ((profile.status || 'approved') === 'approved' && (profile.profileStatus || 'APPROVED') === 'APPROVED') : false
  const isPending = profile ? (profile.status === 'pending' || profile.profileStatus === 'PENDING') : false
  const isRejected = profile ? (profile.status === 'rejected' || profile.profileStatus === 'REJECTED') : false
  const isVerified = profile ? (profile.verified === true || profile.verificationStatus === 'VERIFIED') : false
  const isVerificationPending = profile ? (profile.verificationRequestStatus === 'PENDING') : false

  const handleCopyUrl = () => {
    if (!profile) return
    const url = `https://biznestusa.com/professionals/${profile.username}/`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    toast.success('Public profile URL copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleSave = async () => {
    if (!profile) return
    if (!isVerified) {
      toast.error('Profile editing is available only to verified professionals. Please complete verification to unlock profile editing.')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/professionals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idOrUsername: profile.username || profile.id,
          updates: {
            name: profile.name,
            fullName: profile.name,
            title: profile.title,
            city: profile.city,
            availability: profile.availability,
            phone: profile.phone,
            whatsapp: profile.whatsapp,
            bio: profile.bio,
            about: profile.about,
            skills: profile.skills,
            linkedin: profile.linkedin,
            github: profile.github,
            portfolio: profile.portfolio,
            website: profile.website
          }
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Professional Profile updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update profile.')
      }
    } catch (err) {
      toast.error('Network error. Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    if (!profile) return
    if (!isVerified) {
      toast.error('Profile editing is locked for unverified profiles.')
      return
    }
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(p => p ? ({ ...p, skills: [...p.skills, skillInput.trim()] }) : null)
      setSkillInput('')
    }
  }

  const removeSkill = (sk: string) => {
    if (!profile) return
    if (!isVerified) {
      toast.error('Profile editing is locked for unverified profiles.')
      return
    }
    setProfile(p => p ? ({ ...p, skills: p.skills.filter(s => s !== sk) }) : null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-lg font-bold text-slate-800">Loading Your Professional Dashboard...</h2>
        </main>
        <Footer />
      </div>
    )
  }

  // State A: User is not logged in
  if (!userSession && !auth.currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center w-full">
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <LogIn className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Professional Dashboard Login</h1>
              <p className="text-xs text-slate-500">
                Log in to check your profile approval status, view client inquiries, and manage your public portfolio.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleInlineLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. john@professional.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            <div className="pt-4 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Don&apos;t have a professional profile yet?
              </p>
              <Link
                href="/add-professional"
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-extrabold hover:underline"
              >
                <span>Register Professional Profile Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // State B: User is logged in, but has not created a professional profile yet
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 w-full text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900">No Professional Profile Linked Yet</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Logged in as <strong>{userSession?.email || auth.currentUser?.email}</strong>. You have not submitted your professional portfolio profile yet.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/add-professional"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <span>Create Professional Profile Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const pro = profile

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner (Clean Light / White Theme) */}
      <section className="bg-white border-b border-slate-200/90 pt-8 pb-10 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Top Real-Time Approval & Verification Status Banner */}
          {isPending && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                      Profile Status: Pending Moderation
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-amber-950 mt-0.5">
                    Your Professional Profile is Under Review (1–2 Hours)
                  </h3>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Our team is reviewing your profile details. Once approved by the admin, your profile will go live at <span className="font-mono font-bold">/professionals/{pro.username}</span> and become searchable across the United States.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/professional/verify"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Profile</span>
              </Link>
            </div>
          )}

          {isApproved && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                    Profile Status: Approved &amp; Live
                  </span>
                  <h3 className="text-sm font-extrabold text-emerald-950 mt-0.5">
                    Your Profile is Live on BizNestUSA!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Your profile is published and indexed for employers and clients across the United States.
                  </p>
                </div>
              </div>
              <Link
                href={`/professionals/${pro.username}`}
                target="_blank"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>View Public Profile</span>
              </Link>
            </div>
          )}

          {isRejected && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-center gap-3 text-red-900 shadow-sm animate-in fade-in-50">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div className="text-xs">
                <h3 className="font-extrabold text-sm text-red-950">Profile Modification Needed</h3>
                <p>Please update your details to meet directory guidelines and contact support for approval.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pro.name}</h1>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 shadow-2xs">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Not Verified</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-blue-600 font-bold">{profile.title}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/70 w-fit">
                  <span>/professionals/{profile.username}</span>
                  <button
                    onClick={handleCopyUrl}
                    className="p-0.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Profile URL"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isApproved && (
                <Link
                  href={`/professionals/${profile.username}`}
                  target="_blank"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>View Public Profile</span>
                </Link>
              )}

              {isVerified ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              ) : (
                <Link
                  href="/dashboard/professional/verify"
                  className="relative group px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 flex items-center gap-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Now</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </Link>
              )}
            </div>
          </div>

          {/* STATUS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Card 1: Profile Approval Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Profile Status</span>
              <div className="flex items-center gap-2">
                {isApproved && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>}
                {isPending && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>}
                {isRejected && <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>}
                <span className="font-extrabold text-sm text-slate-900">
                  {isApproved ? 'Approved & Public' : isPending ? 'Pending Admin Review' : 'Rejected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isApproved ? 'Visible in BizNest USA public professional directory' : 'Awaiting administrative verification'}
              </p>
            </div>

            {/* Card 2: Verification Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verification Status</span>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-sm text-emerald-700">Verified (Green Badge Active)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-extrabold text-sm text-red-700">Not Verified</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isVerified ? 'Profile editing unlocked & high trust signal' : 'Get Verified to unlock profile editing & green badge'}
              </p>
            </div>

            {/* Card 3: Action Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Profile Editing Access</span>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlocked & Active</span>
                  </span>
                ) : (
                  <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Locked (Verification Required)</span>
                  </span>
                )}
              </div>
              <div className="pt-1">
                {!isVerified ? (
                  <Link
                    href="/dashboard/professional/verify"
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
                  >
                    <span>Verify Profile to Unlock Editing →</span>
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-500">You can edit all profile fields anytime</span>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* Verification Notification Banners */}
        {isVerificationPending && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-bold">Verification Request In Review</strong>
              <span>Our admin team is currently reviewing your payment screenshot. Your profile will receive the green verified badge and editing access once approved.</span>
            </div>
          </div>
        )}

        {!isVerified && isApproved && !isVerificationPending && (
          <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="space-y-1.5 max-w-2xl relative z-10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md">
                  <ShieldCheck className="w-4 h-4 font-bold" />
                </span>
                <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                  <span>Get Your Official Green Verified Badge</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verified profiles get <strong className="text-emerald-300">3x more client inquiries</strong>, rank higher in directory searches, build instant trust, and unlock full profile editing access.
              </p>
            </div>

            <Link
              href="/dashboard/professional/verify"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/30 transition-all shrink-0 flex items-center gap-2 relative z-10 hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Lock Banner if unverified */}
        {!isVerified && (
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                <strong>Read-Only Profile View:</strong> Profile editing is available only to verified professionals. Please complete verification to unlock profile editing.
              </span>
            </div>
            <Link
              href="/dashboard/professional/verify"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Now</span>
            </Link>
          </div>
        )}

        {/* 🌐 FREE PORTFOLIO WEBSITE NOTIFICATION BANNER */}
        {(!pro.website || !pro.portfolio || isVerified) && (
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 border border-blue-400/40 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-xl bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Globe className="w-3.5 h-3.5 text-blue-300" />
                  <span>BizNest USA Career Booster</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
                  100% Free Website
                </span>
              </div>

              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Don&apos;t Have a Portfolio Website? Get One for FREE! 🌐
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                A personal portfolio website gives you <strong className="text-blue-300">10x higher credibility</strong> with corporate clients, HR recruiters, and US companies. BizNest USA connects registered professionals with modern portfolio profile tools.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom Design</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mobile &amp; Fast Responsive</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SEO Ready</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 shrink-0 w-full lg:w-auto">
              <a
                href="/contact"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-white" />
                <span>Contact Tech Support</span>
              </a>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Mobile-first horizontal touch scrollable) */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex overflow-x-auto scroll-smooth whitespace-nowrap flex-nowrap sm:flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'profile', label: isVerified ? 'Edit Profile & Details' : 'View Profile Details (Read Only)' },
            { id: 'experience', label: isVerified ? 'Skills & Credentials' : 'Skills & Credentials (Locked)' },
            { id: 'socials', label: isVerified ? 'Social & Portfolio Links' : 'Social & Portfolio Links (Locked)' },
            { id: 'reviews', label: 'Client Reviews (' + (pro.reviews?.length || 0) + ')' },
            { id: 'inquiries', label: '💬 Client Inquiries (' + inquiries.length + ')' }
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'inquiries') {
                  fetchInquiries(pro.username)
                }
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: EDIT PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">Personal Information</h2>
              {isVerified ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Editing Enabled</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Read-Only</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={!isVerified}
                  value={pro.name}
                  onChange={(e) => setProfile(p => p ? ({ ...p, name: e.target.value, fullName: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  disabled={!isVerified}
                  value={pro.title}
                  onChange={(e) => setProfile(p => p ? ({ ...p, title: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  disabled={!isVerified}
                  value={pro.city}
                  onChange={(e) => setProfile(p => p ? ({ ...p, city: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  disabled={!isVerified}
                  value={pro.gender || 'Male'}
                  onChange={(e) => setProfile(p => p ? ({ ...p, gender: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed font-bold"
                >
                  <option value="Male">Male 👨</option>
                  <option value="Female">Female 👩</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Profile Photo (URL or Google Drive link)</label>
                <input
                  type="url"
                  disabled={!isVerified}
                  value={pro.avatar}
                  onChange={(e) => setProfile(p => p ? ({ ...p, avatar: e.target.value }) : null)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Availability</label>
                <input
                  type="text"
                  disabled={!isVerified}
                  value={pro.availability || ''}
                  onChange={(e) => setProfile(p => p ? ({ ...p, availability: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  disabled={!isVerified}
                  value={pro.phone || ''}
                  onChange={(e) => setProfile(p => p ? ({ ...p, phone: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  disabled={!isVerified}
                  value={pro.whatsapp || ''}
                  onChange={(e) => setProfile(p => p ? ({ ...p, whatsapp: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">Short Bio</label>
              <textarea
                rows={3}
                disabled={!isVerified}
                value={pro.bio}
                onChange={(e) => setProfile(p => p ? ({ ...p, bio: e.target.value }) : null)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">Detailed About Section</label>
              <textarea
                rows={5}
                disabled={!isVerified}
                value={pro.about || ''}
                onChange={(e) => setProfile(p => p ? ({ ...p, about: e.target.value }) : null)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            {isVerified && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SKILLS */}
        {activeTab === 'experience' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">Manage Skills & Credentials</h2>

            {isVerified && (
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Add Skill</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. Next.js, Clinical Dermatology..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                    Add
                  </button>
                </div>
              </div>
            )}

            <div>
              <span className="block font-bold text-slate-700 text-xs mb-2">Current Skills List</span>
              <div className="flex flex-wrap gap-2">
                {pro.skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200">
                    <span>{s}</span>
                    {isVerified && (
                      <button onClick={() => removeSkill(s)} className="text-red-600 hover:text-red-800 cursor-pointer">
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {isVerified && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Skills</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOCIAL LINKS */}
        {activeTab === 'socials' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Manage Social Links</h2>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <label className="block font-bold text-blue-900 text-xs mb-1">LinkedIn Profile (Highlighted)</label>
              <input
                type="url"
                disabled={!isVerified}
                value={pro.linkedin || ''}
                onChange={(e) => setProfile(p => p ? ({ ...p, linkedin: e.target.value }) : null)}
                className="w-full px-4 py-2 bg-white border border-blue-300 rounded-xl text-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">GitHub</label>
                <input
                  type="url"
                  disabled={!isVerified}
                  value={pro.github || ''}
                  onChange={(e) => setProfile(p => p ? ({ ...p, github: e.target.value }) : null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Portfolio Website</label>
                <input
                  type="url"
                  disabled={!isVerified}
                  value={pro.portfolio || ''}
                  onChange={(e) => setProfile(p => p ? ({ ...p, portfolio: e.target.value }) : null)}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:cursor-not-allowed text-xs"
                />
              </div>
            </div>

            {/* Free Website Callout in Tab */}
            {(!pro.portfolio || !pro.website) && (
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-extrabold">Need a professional portfolio profile?</strong>
                    <span className="text-slate-600">Our design &amp; tech team assists BizNest USA registered professionals with modern online portfolios.</span>
                  </div>
                </div>
                <a
                  href="/contact"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-white" />
                  <span>Support Inquiries</span>
                </a>
              </div>
            )}

            {isVerified && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Links</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Client Reviews</h2>
            <div className="space-y-3">
              {pro.reviews && pro.reviews.length > 0 ? (
                pro.reviews.map(r => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{r.userName}</span>
                      <span className="text-amber-500 font-extrabold">★ {r.rating}</span>
                    </div>
                    <p className="text-slate-600">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No reviews received yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CLIENT INQUIRIES & LEADS */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-blue-600" />
                  <span>Client Messages &amp; Project Inquiries</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct project inquiries sent by clients from your public profile page.
                </p>
              </div>

              <button
                onClick={() => fetchInquiries(pro.username)}
                disabled={loadingInquiries}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">No Client Inquiries Received Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  When potential clients visit your public profile page and submit a project inquiry with their name, email, and WhatsApp number, their messages will appear here so you can reply to them on WhatsApp instantly.
                </p>
                <div className="pt-2">
                  <Link
                    href={`/professionals/${pro.username}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Your Live Profile Page</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => {
                  const cleanWhatsAppDigits = (inq.senderWhatsApp || '').replace(/[^0-9]/g, '')
                  const waNumber = cleanWhatsAppDigits.startsWith('0')
                    ? '92' + cleanWhatsAppDigits.slice(1)
                    : cleanWhatsAppDigits

                  return (
                    <div
                      key={inq.id}
                      className="p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all space-y-4 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                            {inq.senderName ? inq.senderName[0].toUpperCase() : 'C'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{inq.senderName}</h4>
                            <span className="text-[11px] text-slate-500 font-medium">{inq.senderEmail}</span>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 font-semibold">
                          {new Date(inq.createdAt || Date.now()).toLocaleString()}
                        </span>
                      </div>

                      {/* Inquiry Message text */}
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                        {inq.message}
                      </div>

                      {/* Action buttons: Direct WhatsApp Reply & Email */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-medium">Client WhatsApp:</span>
                          <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            {inq.senderWhatsApp}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${inq.senderEmail}?subject=Re: Project Inquiry on BizNest USA - ${encodeURIComponent(pro.name)}&body=Hi ${encodeURIComponent(inq.senderName)},%0D%0A%0D%0AThank you for reaching out regarding your project inquiry on BizNest USA.`}
                            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Email Client</span>
                          </a>

                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
                            <span>Reply on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FLOATING SIDE NOTIFICATION: FREE PORTFOLIO WEBSITE NOTIFICATION (FOR ALL / UNVERIFIED USERS) */}
      {showVerifySideAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100%-3rem)] bg-slate-900/95 backdrop-blur-md border border-blue-500/50 rounded-3xl p-4 shadow-2xl shadow-blue-950/60 text-white animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 shrink-0">
                <Globe className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400 border-2 border-slate-900"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-white">Get Free Portfolio Website</h4>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Claim your free custom portfolio site on WhatsApp.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowVerifySideAlert(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <a
              href="https://wa.me/923345636230"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>WhatsApp Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {!isVerified && (
              <Link
                href="/dashboard/professional/verify"
                className="px-3 py-2 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Verify your profile"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

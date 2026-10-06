'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { 
  Building2, ShieldCheck, CheckCircle2, XCircle, Trash2, Search, Filter, LogOut, 
  Eye, EyeOff, RefreshCw, Phone, Mail, MapPin, ExternalLink, Lock, Inbox, AlertTriangle, AlertCircle, Users, 
  BookOpen, Star, Sparkles, Check, Briefcase, DollarSign, Clock, FileText, ChevronRight, X,
  Layers, Globe, Settings, Newspaper, Activity, Copy
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import AdminCmsTabs from '@/components/admin/admin-cms-tabs'
import AdminSeoDiagnostics from '@/components/admin/admin-seo-diagnostics'
import { BusinessItem, ContactMessage, CATEGORIES, ProfessionalItem, CompanyItem, JobItem, ProfessionalVerificationRequest, JobApplication, PaymentRecord } from '@/lib/data'
import { getAllBusinesses, getPendingBusinesses, approveBusiness, rejectBusiness, getContactMessages, markContactMessageRead, deleteContactMessage } from '@/lib/db-service'
import { 
  getAllProfessionals, approveProfessional, rejectProfessional, verifyProfessional, 
  unverifyProfessional, getVerificationRequests, approveVerificationRequest, 
  rejectVerificationRequest, deleteProfessionalProfile 
} from '@/lib/professional-service'
import { getAllCompanies, approveCompany, rejectCompany } from '@/lib/company-service'
import { getAllJobs, approveJob, rejectJob } from '@/lib/job-service'
import { getAllJobApplications, updateJobApplicationStatus, deleteJobApplication } from '@/lib/job-application-service'
import { getPublicJobPath } from '@/lib/job-url'
import { toast } from 'sonner'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [showAdminPass, setShowAdminPass] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [adminUid, setAdminUid] = useState('0LM7RVOwGIMVK4rwVD6muuzPYij1')

  const [activeTab, setActiveTab] = useState<
    'overview' | 'payments' | 'pending' | 'businesses' | 'professionals' | 'verifications' | 'companies' | 'jobs' | 'applications' | 'messages' | 'categories' | 'locations' | 'articles' | 'settings' | 'seo'
  >('overview')

  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'plan_1' | 'plan_5' | 'verified' | 'rejected' | 'needs_changes'>('all')
  const [payStatusFilter, setPayStatusFilter] = useState<'all' | 'PENDING_PAYMENT' | 'PAYMENT_VERIFICATION_PENDING' | 'PAID' | 'REJECTED' | 'REFUNDED'>('all')
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([])
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<PaymentRecord | null>(null)
  const [rejectPaymentTarget, setRejectPaymentTarget] = useState<PaymentRecord | null>(null)
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('')
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({})

  const [allBusinesses, setAllBusinesses] = useState<BusinessItem[]>([])
  const [allProfessionals, setAllProfessionals] = useState<ProfessionalItem[]>([])
  const [verificationRequests, setVerificationRequests] = useState<ProfessionalVerificationRequest[]>([])
  const [allCompanies, setAllCompanies] = useState<CompanyItem[]>([])
  const [allJobs, setAllJobs] = useState<JobItem[]>([])
  const [allJobApplications, setAllJobApplications] = useState<JobApplication[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [bizSearchQuery, setBizSearchQuery] = useState('')
  const [bizStatusFilter, setBizStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'with_proof'>('all')
  const [selectedBiz, setSelectedBiz] = useState<BusinessItem | null>(null)
  const [selectedPro, setSelectedPro] = useState<ProfessionalItem | null>(null)
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'shortlisted' | 'rejected'>('all')
  const [selectedScreenshot, setSelectedScreenshot] = useState<{ url: string; name: string; ref: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Professional filters
  const [proStatusFilter, setProStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [proVerifyFilter, setProVerifyFilter] = useState<'all' | 'verified' | 'unverified'>('all')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isMasterAdmin = user.uid === '0LM7RVOwGIMVK4rwVD6muuzPYij1'
        if (isMasterAdmin) {
          setAdminUid(user.uid)
          setIsAuthenticated(true)
          sessionStorage.setItem('biznestusa_admin_auth', 'true')
          fetchAdminData()
        } else {
          // If a non-admin regular user is logged in, do not grant admin access
          sessionStorage.removeItem('biznestusa_admin_auth')
          setIsAuthenticated(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const bizList = await getAllBusinesses(true)
      setAllBusinesses(bizList)
      const proList = await getAllProfessionals(true)
      setAllProfessionals(proList)
      const verReqs = await getVerificationRequests()
      setVerificationRequests(verReqs)
      const compList = await getAllCompanies(true)
      setAllCompanies(compList)
      const jobList = await getAllJobs(true)
      setAllJobs(jobList)
      const apps = await getAllJobApplications()
      setAllJobApplications(apps)
      const msgs = await getContactMessages()
      setContactMessages(msgs)

      // Fetch unified payment records
      try {
        const payRes = await fetch('/api/payments/list?isAdmin=true')
        if (payRes.ok) {
          const payData = await payRes.json()
          if (payData.payments && Array.isArray(payData.payments)) {
            setPaymentRecords(payData.payments)
          }
        }
      } catch (payErr) {
        console.warn('Payment records fetch notice:', payErr)
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  // --- JOB APPLICATION HANDLERS ---
  const handleUpdateAppStatus = async (id: string, status: 'new' | 'reviewed' | 'shortlisted' | 'rejected') => {
    setActionLoading(id)
    try {
      await updateJobApplicationStatus(id, status)
      setAllJobApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status })
      }
      toast.success(`Application status marked as ${status.toUpperCase()}.`)
    } catch (err) {
      toast.error('Failed to update application status.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteApp = async (id: string, applicantName?: string) => {
    if (!confirm(`Are you sure you want to delete application from "${applicantName || 'Candidate'}"?`)) return
    setActionLoading(id)
    try {
      await deleteJobApplication(id)
      setAllJobApplications(prev => prev.filter(a => a.id !== id))
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null)
      }
      toast.success('Application removed from database.')
    } catch (err) {
      toast.error('Failed to delete application.')
    } finally {
      setActionLoading(null)
    }
  }

  // --- PROFESSIONAL APPROVAL & VERIFICATION HANDLERS ---
  const handleApprovePro = async (id: string, name: string) => {
    setActionLoading(id)
    try {
      await approveProfessional(id, adminUid)
      setAllProfessionals(prev => prev.map(p => (p.id === id || p.username === id) ? { ...p, status: 'approved', profileStatus: 'APPROVED' } : p))
      if (selectedPro && (selectedPro.id === id || selectedPro.username === id)) {
        setSelectedPro({ ...selectedPro, status: 'approved', profileStatus: 'APPROVED' })
      }
      toast.success(`Professional "${name}" approved & published!`)
    } catch (err) {
      toast.error('Failed to approve professional.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectPro = async (id: string, name: string) => {
    const reason = prompt(`Reason for rejecting "${name}":`, 'Profile details could not be validated.')
    if (reason === null) return

    setActionLoading(id)
    try {
      await rejectProfessional(id, reason)
      setAllProfessionals(prev => prev.map(p => (p.id === id || p.username === id) ? { ...p, status: 'rejected', profileStatus: 'REJECTED', rejectionReason: reason } : p))
      if (selectedPro && (selectedPro.id === id || selectedPro.username === id)) {
        setSelectedPro({ ...selectedPro, status: 'rejected', profileStatus: 'REJECTED', rejectionReason: reason })
      }
      toast.info(`Professional profile "${name}" marked as rejected.`)
    } catch (err) {
      toast.error('Failed to reject professional profile.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifyPro = async (id: string, name: string) => {
    setActionLoading(id)
    try {
      await verifyProfessional(id, adminUid)
      setAllProfessionals(prev => prev.map(p => (p.id === id || p.username === id) ? { ...p, verified: true, verificationStatus: 'VERIFIED' } : p))
      if (selectedPro && (selectedPro.id === id || selectedPro.username === id)) {
        setSelectedPro({ ...selectedPro, verified: true, verificationStatus: 'VERIFIED' })
      }
      toast.success(`Verified badge awarded to "${name}". Profile editing unlocked!`)
    } catch (err) {
      toast.error('Failed to verify professional.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnverifyPro = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove verification from "${name}"?`)) return

    setActionLoading(id)
    try {
      await unverifyProfessional(id, adminUid)
      setAllProfessionals(prev => prev.map(p => (p.id === id || p.username === id) ? { ...p, verified: false, verificationStatus: 'UNVERIFIED' } : p))
      if (selectedPro && (selectedPro.id === id || selectedPro.username === id)) {
        setSelectedPro({ ...selectedPro, verified: false, verificationStatus: 'UNVERIFIED' })
      }
      toast.info(`Verification removed from "${name}". Profile editing is now locked.`)
    } catch (err) {
      toast.error('Failed to remove verification.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeletePro = async (id: string, name: string) => {
    if (!confirm(`Permanently remove profile for "${name}"?`)) return
    setActionLoading(id)
    try {
      await deleteProfessionalProfile(id)
      setAllProfessionals(prev => prev.filter(p => p.id !== id && p.username !== id))
      if (selectedPro && (selectedPro.id === id || selectedPro.username === id)) {
        setSelectedPro(null)
      }
      toast.success(`Removed "${name}" from database.`)
    } catch (err) {
      toast.error('Failed to delete professional.')
    } finally {
      setActionLoading(null)
    }
  }

  // --- VERIFICATION REQUESTS HANDLERS ---
  const handleApproveVerificationReq = async (req: ProfessionalVerificationRequest) => {
    setActionLoading(req.id)
    try {
      await approveVerificationRequest(req.id, adminUid)
      setVerificationRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r))
      setAllProfessionals(prev => prev.map(p => (p.id === req.professionalProfileId || p.username === req.username) ? { ...p, verified: true, verificationStatus: 'VERIFIED', verificationRequestStatus: 'APPROVED' } : p))
      toast.success(`Payment confirmed! ${req.proName} is now a Verified Professional with editing unlocked.`)
    } catch (err) {
      toast.error('Failed to approve verification request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectVerificationReq = async (req: ProfessionalVerificationRequest) => {
    const reason = prompt(`Reason for rejecting verification payment for "${req.proName}":`, 'Payment receipt could not be verified or invalid transaction reference.')
    if (reason === null) return

    setActionLoading(req.id)
    try {
      await rejectVerificationRequest(req.id, reason, adminUid)
      setVerificationRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'REJECTED', rejectionReason: reason } : r))
      setAllProfessionals(prev => prev.map(p => (p.id === req.professionalProfileId || p.username === req.username) ? { ...p, verified: false, verificationStatus: 'UNVERIFIED', verificationRequestStatus: 'REJECTED' } : p))
      toast.info(`Verification request for "${req.proName}" rejected.`)
    } catch (err) {
      toast.error('Failed to reject verification request.')
    } finally {
      setActionLoading(null)
    }
  }

  // --- COMPANIES & JOBS ---
  const handleApproveCompany = async (id: string, name: string) => {
    setActionLoading(id)
    try {
      await approveCompany(id, adminUid)
      setAllCompanies(prev => prev.map(c => (c.id === id || c.slug === id) ? { ...c, status: 'approved' } : c))
      toast.success(`Hiring Company "${name}" approved & verified!`)
    } catch (err) {
      toast.error('Failed to approve company.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectCompany = async (id: string, name: string) => {
    const reason = prompt(`Reason for rejecting company "${name}":`, 'Missing official business verification.')
    if (reason === null) return

    setActionLoading(id)
    try {
      await rejectCompany(id, reason)
      setAllCompanies(prev => prev.map(c => (c.id === id || c.slug === id) ? { ...c, status: 'rejected', rejectionReason: reason } : c))
      toast.info(`Company profile "${name}" rejected.`)
    } catch (err) {
      toast.error('Failed to reject company profile.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveJob = async (id: string, title: string) => {
    setActionLoading(id)
    try {
      await approveJob(id, adminUid)
      setAllJobs(prev => prev.map(j => (j.id === id || j.slug === id) ? { ...j, status: 'approved' } : j))
      toast.success(`Job Opening "${title}" approved!`)
    } catch (err) {
      toast.error('Failed to approve job opening.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectJob = async (id: string, title: string) => {
    const reason = prompt(`Reason for rejecting job "${title}":`, 'Spam or inaccurate salary information.')
    if (reason === null) return

    setActionLoading(id)
    try {
      await rejectJob(id, reason)
      setAllJobs(prev => prev.map(j => (j.id === id || j.slug === id) ? { ...j, status: 'rejected' } : j))
      toast.info(`Job opening "${title}" rejected.`)
    } catch (err) {
      toast.error('Failed to reject job opening.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    const emailTrimmed = (adminEmail || '').trim().toLowerCase()
    const passTrimmed = (adminPass || '').trim()

    if (!emailTrimmed || !passTrimmed) {
      setLoginError('Please enter your administrator email and password.')
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailTrimmed, passTrimmed)
      const authedUser = userCredential.user
      const isMasterAdmin = authedUser.uid === '0LM7RVOwGIMVK4rwVD6muuzPYij1'

      if (!isMasterAdmin) {
        await signOut(auth)
        sessionStorage.removeItem('biznestusa_admin_auth')
        setLoginError(`Access Denied: Account ${authedUser.email || authedUser.uid} is not authorized for the Admin Portal.`)
        toast.error('Access Denied: Only the authorized administrator is allowed.')
        return
      }

      setAdminUid(authedUser.uid)
      setIsAuthenticated(true)
      sessionStorage.setItem('biznestusa_admin_auth', 'true')
      toast.success('Firebase Admin authenticated successfully.')
      fetchAdminData()
    } catch (err: any) {
      console.error('Admin authentication error:', err)
      const errCode = err?.code || ''
      const errMsg = err?.message || 'Invalid administrator credentials or password.'
      setLoginError(`Authentication failed${errCode ? ` [${errCode}]` : ''}: ${errMsg}`)
      toast.error(`Authentication failed: ${errCode || 'Check credentials'}`)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (e) {}
    setIsAuthenticated(false)
    sessionStorage.removeItem('biznestusa_admin_auth')
    toast.info('Logged out of Admin Panel.')
  }

  const handleApprove = async (id: string, name: string) => {
    setActionLoading(id)
    try {
      await approveBusiness(id, adminUid)
      setAllBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b))
      if (selectedBiz?.id === id) {
        setSelectedBiz({ ...selectedBiz, status: 'approved' })
      }
      toast.success(`"${name}" is officially approved and live on BizNest USA!`)
    } catch (err) {
      toast.error('Failed to approve business listing.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string, name: string) => {
    const reason = prompt('Enter rejection reason (optional):', 'Does not satisfy business verification requirements.')
    if (reason === null) return

    setActionLoading(id)
    try {
      await rejectBusiness(id, reason)
      setAllBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected', rejectionReason: reason } : b))
      if (selectedBiz?.id === id) {
        setSelectedBiz({ ...selectedBiz, status: 'rejected', rejectionReason: reason })
      }
      toast.info(`"${name}" has been rejected.`)
    } catch (err) {
      toast.error('Failed to reject business listing.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteBusiness = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${name}"?`)) return

    setActionLoading(id)
    try {
      await deleteDoc(doc(db, 'businesses', id))
      setAllBusinesses(prev => prev.filter(b => b.id !== id))
      if (selectedBiz?.id === id) {
        setSelectedBiz(null)
      }
      toast.success(`Removed "${name}" from database.`)
    } catch (err) {
      toast.error('Failed to delete business.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleReadMessage = async (msgId: string) => {
    await markContactMessageRead(msgId)
    setContactMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'read' } : m))
    toast.success('Message marked as read.')
  }

  const handleDeleteMessage = async (msgId: string) => {
    await deleteContactMessage(msgId)
    setContactMessages(prev => prev.filter(m => m.id !== msgId))
    toast.success('Message deleted.')
  }

  const handleAdminPaymentAction = async (businessId: string, action: string, notes?: string) => {
    setActionLoading(businessId + '_' + action)
    try {
      const currentNotes = notes !== undefined ? notes : (adminNotesMap[businessId] ?? '')
      const res = await fetch('/api/admin/payment-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action,
          adminId: adminUid,
          adminNotes: currentNotes
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      toast.success(data.message || 'Action executed successfully.')
      await fetchAdminData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to process payment action.')
    } finally {
      setActionLoading(null)
    }
  }

  // Consolidated payments from payments collection and businesses
  const combinedPayments: PaymentRecord[] = useMemo(() => {
    const map = new Map<string, PaymentRecord>()
    paymentRecords.forEach(p => {
      if (p.business_id) map.set(p.business_id, p)
      else if (p.id) map.set(p.id, p)
    })

    allBusinesses.forEach(biz => {
      const existing = map.get(biz.id)
      if (!existing && (biz.plan || biz.paymentStatus || biz.paymentScreenshot || (biz as any).paymentDetails)) {
        const rawStatus = (biz.paymentStatus || 'PENDING').toUpperCase()
        let normStatus: any = 'PENDING_PAYMENT'
        if (rawStatus === 'VERIFIED' || rawStatus === 'PAID') normStatus = 'PAID'
        else if (rawStatus === 'REJECTED') normStatus = 'REJECTED'
        else if (rawStatus === 'REFUNDED') normStatus = 'REFUNDED'
        else if (rawStatus === 'SUBMITTED' || rawStatus === 'PAYMENT_VERIFICATION_PENDING' || rawStatus === 'UNDER_REVIEW' || Boolean(biz.paymentScreenshot || (biz as any).paymentDetails?.paymentScreenshot)) {
          normStatus = 'PAYMENT_VERIFICATION_PENDING'
        }

        const price = biz.plan === 'authoritative_10' ? 10 : biz.plan === 'priority_5' ? 5 : 1
        const planName = biz.plan === 'authoritative_10' ? 'Authoritative Plan' : biz.plan === 'priority_5' ? 'Standard Plan' : 'Basic Plan'
        const ref = biz.payment_reference || (biz as any).paymentDetails?.referenceNumber || biz.transactionRef || ('BNUSA-2026-' + (biz.id ? biz.id.slice(-6).toUpperCase() : '000000'))

        map.set(biz.id, {
          id: `pay_${biz.id}`,
          user_id: biz.userId || 'direct_user',
          user_email: biz.email || (biz as any).userEmail || '',
          business_id: biz.id,
          business_name: biz.name,
          business_slug: biz.slug,
          customer_name: biz.ownerName || 'Business Owner',
          customer_email: biz.email || '',
          plan_id: biz.plan || 'priority_5',
          plan_name: planName,
          amount: price,
          currency: 'USD',
          payment_reference: ref,
          payment_provider: 'payoneer',
          payment_status: normStatus,
          payment_screenshot_url: biz.paymentScreenshot || (biz as any).paymentDetails?.paymentScreenshot || null,
          payoneer_transaction_id: biz.payoneer_transaction_id || (biz as any).paymentDetails?.transactionId || null,
          customer_note: biz.customer_note || (biz as any).paymentDetails?.customerNote || null,
          created_at: (biz as any).createdAt || biz.submittedAt || new Date().toISOString(),
          screenshot_submitted_at: biz.submittedAt || null,
          verified_at: (biz as any).paymentVerifiedAt || (biz as any).approvedAt || null,
          verified_by: (biz as any).paymentVerifiedBy || (biz as any).approvedBy || null,
          rejection_reason: biz.rejectionReason || null
        })
      }
    })

    return Array.from(map.values())
  }, [paymentRecords, allBusinesses])

  const handleApprovePayment = async (payment: PaymentRecord) => {
    setActionLoading(payment.business_id + '_approve_payment')
    try {
      const res = await fetch('/api/admin/payment-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: payment.business_id,
          action: 'approve_payment',
          adminId: adminUid
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to approve payment')
      toast.success(`Payment verified and plan entitlements activated for "${payment.business_name || 'business'}"!`)
      setSelectedPaymentDetail(null)
      await fetchAdminData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve payment')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectPayment = async (payment: PaymentRecord, reason: string) => {
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required.')
      return
    }
    setActionLoading(payment.business_id + '_reject_payment')
    try {
      const res = await fetch('/api/admin/payment-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: payment.business_id,
          action: 'reject_payment',
          adminId: adminUid,
          adminNotes: reason.trim()
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reject payment')
      toast.info(`Payment rejected for "${payment.business_name || 'business'}". Reason recorded.`)
      setRejectPaymentTarget(null)
      setRejectReasonInput('')
      setSelectedPaymentDetail(null)
      await fetchAdminData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject payment')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingListings = allBusinesses
    .filter(b => {
      const s = (b.status || '').toLowerCase().trim()
      const ps = (b.paymentStatus || '').toUpperCase().trim()
      return s === 'pending' || s === 'pending_approval' || ps === 'PENDING' || ps === 'PAYMENT_VERIFICATION_PENDING' || ps === 'SUBMITTED'
    })
    .sort((a, b) => {
      // 1. Listings with payment screenshot proof attached first
      const aHasProof = Boolean(a.paymentScreenshot || (a.paymentDetails && a.paymentDetails.paymentScreenshot)) ? 1 : 0
      const bHasProof = Boolean(b.paymentScreenshot || (b.paymentDetails && b.paymentDetails.paymentScreenshot)) ? 1 : 0
      if (bHasProof !== aHasProof) return bHasProof - aHasProof

      // 2. Newest submission / re-request timestamp first
      const aTime = new Date((a as any).lastRequestedAt || a.submittedAt || (a as any).createdAt || 0).getTime() || 0
      const bTime = new Date((b as any).lastRequestedAt || b.submittedAt || (b as any).createdAt || 0).getTime() || 0
      return bTime - aTime
    })
  const approvedListings = allBusinesses.filter(b => (b.status || 'approved').toLowerCase().trim() === 'approved')
  const rejectedListings = allBusinesses.filter(b => (b.status || '').toLowerCase().trim() === 'rejected')
  const featuredListings = allBusinesses.filter(b => b.isFeatured)

  const pendingPros = allProfessionals.filter(p => p.status === 'pending' || p.profileStatus === 'PENDING')
  const approvedPros = allProfessionals.filter(p => (p.status || 'approved') === 'approved' && (p.profileStatus || 'APPROVED') === 'APPROVED')
  const rejectedPros = allProfessionals.filter(p => p.status === 'rejected' || p.profileStatus === 'REJECTED')
  const verifiedPros = allProfessionals.filter(p => p.verified === true || p.verificationStatus === 'VERIFIED')
  const unverifiedPros = allProfessionals.filter(p => !p.verified && p.verificationStatus !== 'VERIFIED')
  const pendingVerReqs = verificationRequests.filter(r => r.status === 'PENDING')

  const pendingPayments = allBusinesses.filter(b => {
    const ps = (b.paymentStatus || '').toUpperCase()
    return ps === 'SUBMITTED' || ps === 'PENDING' || ps === 'UNDER_REVIEW' || (Boolean(b.paymentScreenshot || b.paymentDetails?.paymentScreenshot) && ps !== 'VERIFIED')
  })
  const plan1Listings = allBusinesses.filter(b => b.plan === 'review_1' || b.paymentDetails?.plan === 'review_1' || (b as any).listingFee === 1)
  const plan5Listings = allBusinesses.filter(b => b.plan === 'priority_5' || b.paymentDetails?.plan === 'priority_5' || (b as any).listingFee === 5)

  const stats = {
    totalBiz: allBusinesses.length,
    pendingBiz: pendingListings.length,
    approvedBiz: approvedListings.length,
    rejectedBiz: rejectedListings.length,
    featuredBiz: featuredListings.length,
    categories: CATEGORIES.length,
    totalPros: allProfessionals.length,
    pendingPros: pendingPros.length,
    approvedPros: approvedPros.length,
    rejectedPros: rejectedPros.length,
    verifiedPros: verifiedPros.length,
    unverifiedPros: unverifiedPros.length,
    pendingVerReqs: pendingVerReqs.length,
    totalVerReqs: verificationRequests.length,
    totalApps: allJobApplications.length,
    newApps: allJobApplications.filter(a => a.status === 'new').length,
    messages: contactMessages.length,
    unreadMessages: contactMessages.filter(m => m.status === 'unread').length,
    pendingPayments: pendingPayments.length,
    plan1Biz: plan1Listings.length,
    plan5Biz: plan5Listings.length
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F4F7FC] flex items-center justify-center py-16 px-4 font-sans">
          <div className="bg-white border border-[#D9E2F1] rounded-2xl shadow-[0_8px_40px_rgba(15,23,42,0.08)] p-8 sm:p-10 w-full max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
              <Lock className="w-7 h-7 text-[#2563EB]" />
            </div>

            <h1 className="text-2xl font-extrabold text-[#0F172A] text-center mb-2">BizNest USA Secure Admin Portal</h1>
            <p className="text-xs text-[#64748B] text-center mb-8">Firebase Authentication & Administrative Verification Required.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter administrator email"
                  required
                  className="w-full px-4 py-3 bg-[#F4F7FC] border border-[#D9E2F1] rounded-xl text-sm focus:outline-none focus:border-[#2563EB] text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Password or Passcode</label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Enter your Firebase Auth password"
                    className="w-full pl-4 pr-11 py-3 bg-[#F4F7FC] border border-[#D9E2F1] rounded-xl text-sm focus:outline-none focus:border-[#2563EB] font-mono text-[#0F172A]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                    title={showAdminPass ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
              >
                Authenticate to Admin Portal
              </button>

              <p className="text-[11px] text-slate-400 text-center pt-2">
                Sign in with the authorized BizNestUSA Firebase account.
              </p>
            </form>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F4F7FC] text-[#0F172A] font-sans pb-16">
        
        {/* Top Header */}
        <section className="bg-[#0F172A] text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                BizNest USA Administration &amp; Management Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Moderation queues for businesses, professional approvals, credential verification requests, hiring companies, and CMS content hubs.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAdminData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          
          {/* NAVIGATION TABS */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'overview' ? 'bg-[#0F172A] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Overview &amp; Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer shrink-0 ${
                activeTab === 'payments' ? 'bg-[#2563EB] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Payments &amp; Plans</span>
              {stats.pendingPayments > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold animate-pulse">
                  {stats.pendingPayments} New
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer shrink-0 ${
                activeTab === 'pending' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Pending Businesses ({stats.pendingBiz})</span>
            </button>

            <button
              onClick={() => setActiveTab('professionals')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer shrink-0 ${
                activeTab === 'professionals' ? 'bg-[#0F172A] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Professional Profiles ({stats.totalPros})</span>
              {stats.pendingPros > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-extrabold">
                  {stats.pendingPros} Pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer shrink-0 ${
                activeTab === 'verifications' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verification Requests</span>
              {stats.pendingVerReqs > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold animate-pulse">
                  {stats.pendingVerReqs} New
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('businesses')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'businesses' ? 'bg-[#0F172A] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>All Businesses ({stats.totalBiz})</span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'companies' ? 'bg-[#0F172A] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#0284c7]" />
              <span>Companies ({allCompanies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'jobs' ? 'bg-[#0F172A] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Jobs ({allJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer shrink-0 ${
                activeTab === 'applications' ? 'bg-[#0F172A] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Job Applications ({stats.totalApps})</span>
              {stats.newApps > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold animate-pulse">
                  {stats.newApps} New
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'messages' ? 'bg-[#0F172A] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-4 h-4 text-purple-400" />
              <span>Messages ({stats.messages})</span>
            </button>

            {/* CMS MANAGEMENT TABS */}
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'locations' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Locations</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'articles' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Newspaper className="w-4 h-4 text-purple-400" />
              <span>Articles &amp; Guides</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Site Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'seo' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>SEO Diagnostics</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in-50">
              
              {/* Professional Profiles & Verification Overview Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Professional Profiles & Trust Protocol
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div
                    onClick={() => { setActiveTab('professionals'); setProStatusFilter('pending') }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Profiles</span>
                    <p className="text-3xl font-extrabold text-amber-700">{stats.pendingPros}</p>
                    <span className="text-[10px] text-amber-600 font-semibold">Click to review</span>
                  </div>

                  <div
                    onClick={() => { setActiveTab('professionals'); setProStatusFilter('approved') }}
                    className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Approved Profiles</span>
                    <p className="text-3xl font-extrabold text-emerald-700">{stats.approvedPros}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Public directory live</span>
                  </div>

                  <div
                    onClick={() => { setActiveTab('verifications') }}
                    className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Pending Credential Verifications</span>
                    <p className="text-3xl font-extrabold text-purple-700">{stats.pendingVerReqs}</p>
                    <span className="text-[10px] text-purple-600 font-semibold">Awaiting payment check</span>
                  </div>

                  <div
                    onClick={() => { setActiveTab('professionals'); setProVerifyFilter('verified') }}
                    className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Verified (Green ✓)</span>
                    <p className="text-3xl font-extrabold text-blue-700">{stats.verifiedPros}</p>
                    <span className="text-[10px] text-blue-600 font-semibold">Editing unlocked</span>
                  </div>

                  <div
                    onClick={() => { setActiveTab('professionals'); setProVerifyFilter('unverified') }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Unverified Approved</span>
                    <p className="text-3xl font-extrabold text-slate-800">{stats.unverifiedPros}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">Public (editing locked)</span>
                  </div>
                </div>
              </div>

              {/* General Business Overview Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Businesses & Company Listings
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Businesses</span>
                    <p className="text-3xl font-extrabold text-slate-900">{stats.totalBiz}</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-1">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Businesses</span>
                    <p className="text-3xl font-extrabold text-amber-700">{stats.pendingBiz}</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-1">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved Businesses</span>
                    <p className="text-3xl font-extrabold text-emerald-700">{stats.approvedBiz}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-1">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Hiring Companies</span>
                    <p className="text-3xl font-extrabold text-blue-700">{allCompanies.length}</p>
                  </div>
                </div>
              </div>

              {/* Job Vacancies & Incoming Applications Overview Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Jobs &amp; Candidate Applications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab('jobs')}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Job Vacancies</span>
                    <p className="text-3xl font-extrabold text-slate-900">{allJobs.length}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">Active listings</span>
                  </div>

                  <div
                    onClick={() => { setActiveTab('applications'); setAppStatusFilter('new') }}
                    className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">New Received Applications</span>
                    <p className="text-3xl font-extrabold text-emerald-700">{stats.newApps}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Click to review candidates</span>
                  </div>

                  <div
                    onClick={() => { setActiveTab('applications'); setAppStatusFilter('all') }}
                    className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Applications</span>
                    <p className="text-3xl font-extrabold text-indigo-700">{stats.totalApps}</p>
                    <span className="text-[10px] text-indigo-600 font-semibold">All submitted candidates</span>
                  </div>

                  <div
                    onClick={() => { setActiveTab('applications'); setAppStatusFilter('shortlisted') }}
                    className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-xs space-y-1 cursor-pointer hover:scale-102 transition-all"
                  >
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Shortlisted Candidates</span>
                    <p className="text-3xl font-extrabold text-purple-700">{allJobApplications.filter(a => a.status === 'shortlisted').length}</p>
                    <span className="text-[10px] text-purple-600 font-semibold">Ready for interview</span>
                  </div>
                </div>
              </div>

              {/* Policy Explanation Note */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
                <h2 className="text-lg font-extrabold text-slate-900">BizNest USA Professional Approval & Verification Architecture</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">1. Approval (Permission to be Public):</strong>
                    When an admin clicks <strong>Approve Profile</strong>, the status becomes <code className="bg-white px-1 py-0.5 rounded text-emerald-700 font-bold">APPROVED</code> and the profile appears publicly on the directory. However, it remains <code className="bg-white px-1 py-0.5 rounded text-slate-700 font-bold">UNVERIFIED</code> and profile editing is locked until verification is awarded.
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <strong className="text-emerald-950 block mb-1">2. Credential Verification:</strong>
                    When an admin verifies the credential documents and clicks <strong>Approve Verification</strong>, the status becomes <code className="bg-white px-1 py-0.5 rounded text-emerald-700 font-bold">VERIFIED</code>. The profile receives the official green check mark and unlocks full profile editing access for the user.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: PAYMENTS & BUSINESS PLANS DASHBOARD */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                    <span>Business Plans &amp; Payment Management</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review paid business subscriptions ($1 Business Review vs $5 Business Priority), verify payment screenshots, and manage 5-post blog entitlements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {stats.pendingPayments} Payments Pending Review
                  </span>
                </div>
              </div>

              {/* FILTER BUTTONS & SEARCH */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setPaymentFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({allBusinesses.length})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    Pending ({stats.pendingPayments})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('plan_1')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'plan_1' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    $1 Review ({stats.plan1Biz})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('plan_5')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'plan_5' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    $5 Priority ({stats.plan5Biz})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('verified')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'verified' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Verified ({allBusinesses.filter(b => (b.paymentStatus || '').toUpperCase() === 'VERIFIED').length})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('needs_changes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'needs_changes' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
                    }`}
                  >
                    Needs Changes ({allBusinesses.filter(b => (b.paymentStatus || '').toUpperCase() === 'NEEDS_CHANGES' || b.status === 'needs_changes').length})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('rejected')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    Rejected ({allBusinesses.filter(b => (b.paymentStatus || '').toUpperCase() === 'REJECTED').length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search business, user, ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* BUSINESS & PAYMENT LIST */}
              {allBusinesses
                .filter(biz => {
                  const q = searchQuery.toLowerCase().trim()
                  const matchesSearch = !q ||
                    biz.name.toLowerCase().includes(q) ||
                    (biz.email || '').toLowerCase().includes(q) ||
                    (biz.city || '').toLowerCase().includes(q) ||
                    (biz.paymentDetails?.referenceNumber || '').toLowerCase().includes(q) ||
                    (biz.transactionRef || '').toLowerCase().includes(q)

                  const isPlan5 = biz.plan === 'priority_5' || biz.listingFee === 5 || biz.paymentDetails?.plan === 'priority_5'
                  const isPlan1 = !isPlan5
                  const pStatus = (biz.paymentStatus || 'PENDING').toUpperCase()

                  let matchesFilter = true
                  if (paymentFilter === 'pending') {
                    matchesFilter = ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(pStatus) || (Boolean(biz.paymentScreenshot || biz.paymentDetails?.paymentScreenshot) && pStatus !== 'VERIFIED')
                  } else if (paymentFilter === 'plan_1') {
                    matchesFilter = isPlan1
                  } else if (paymentFilter === 'plan_5') {
                    matchesFilter = isPlan5
                  } else if (paymentFilter === 'verified') {
                    matchesFilter = pStatus === 'VERIFIED'
                  } else if (paymentFilter === 'rejected') {
                    matchesFilter = pStatus === 'REJECTED'
                  } else if (paymentFilter === 'needs_changes') {
                    matchesFilter = pStatus === 'NEEDS_CHANGES' || biz.status === 'needs_changes'
                  }

                  return matchesSearch && matchesFilter
                })
                .length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-base">No Listings Found</h3>
                  <p className="text-xs text-slate-500">There are no businesses matching your current plan/payment filter criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBusinesses
                    .filter(biz => {
                      const q = searchQuery.toLowerCase().trim()
                      const matchesSearch = !q ||
                        biz.name.toLowerCase().includes(q) ||
                        (biz.email || '').toLowerCase().includes(q) ||
                        (biz.city || '').toLowerCase().includes(q) ||
                        (biz.paymentDetails?.referenceNumber || '').toLowerCase().includes(q) ||
                        (biz.transactionRef || '').toLowerCase().includes(q)

                      const isPlan5 = biz.plan === 'priority_5' || biz.listingFee === 5 || biz.paymentDetails?.plan === 'priority_5'
                      const isPlan1 = !isPlan5
                      const pStatus = (biz.paymentStatus || 'PENDING').toUpperCase()

                      let matchesFilter = true
                      if (paymentFilter === 'pending') {
                        matchesFilter = ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(pStatus) || (Boolean(biz.paymentScreenshot || biz.paymentDetails?.paymentScreenshot) && pStatus !== 'VERIFIED')
                      } else if (paymentFilter === 'plan_1') {
                        matchesFilter = isPlan1
                      } else if (paymentFilter === 'plan_5') {
                        matchesFilter = isPlan5
                      } else if (paymentFilter === 'verified') {
                        matchesFilter = pStatus === 'VERIFIED'
                      } else if (paymentFilter === 'rejected') {
                        matchesFilter = pStatus === 'REJECTED'
                      } else if (paymentFilter === 'needs_changes') {
                        matchesFilter = pStatus === 'NEEDS_CHANGES' || biz.status === 'needs_changes'
                      }

                      return matchesSearch && matchesFilter
                    })
                    .sort((a, b) => {
                      const aPending = (a.paymentStatus === 'SUBMITTED' || a.paymentStatus === 'PENDING') ? 1 : 0
                      const bPending = (b.paymentStatus === 'SUBMITTED' || b.paymentStatus === 'PENDING') ? 1 : 0
                      if (bPending !== aPending) return bPending - aPending
                      return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
                    })
                    .map((biz) => {
                      const isPlan5 = biz.plan === 'priority_5' || biz.listingFee === 5 || biz.paymentDetails?.plan === 'priority_5'
                      const planPrice = isPlan5 ? '$5.00' : '$1.00'
                      const planLabel = isPlan5 ? '$5 Business Priority Plan' : '$1 Business Review Plan'
                      const pStatus = (biz.paymentStatus || 'PENDING').toUpperCase()
                      const screenshotUrl = biz.paymentScreenshot || biz.paymentDetails?.paymentScreenshot
                      const refNum = biz.paymentDetails?.referenceNumber || biz.transactionRef || ''
                      const userDisplay = biz.email || (biz as any).userEmail || (biz as any).userId || (biz as any).claimedBy || 'Direct User'
                      const postsUsed = biz.blog_posts_used || 0
                      const postsAllowed = biz.blog_posts_allowed || (isPlan5 ? 5 : 0)
                      const isFeatureEnabled = Boolean(biz.blog_post_feature_enabled)

                      return (
                        <div
                          key={biz.id}
                          className={`bg-white rounded-2xl p-6 border shadow-xs transition-all space-y-4 ${
                            isPlan5 ? 'border-purple-200 hover:border-purple-300' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Top Row: Business info & Plan distinction */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div className="flex items-start gap-4">
                              {biz.logo ? (
                                <img
                                  src={biz.logo}
                                  alt={biz.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shrink-0">
                                  {biz.name ? biz.name.charAt(0).toUpperCase() : 'B'}
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-extrabold text-slate-900 text-lg">{biz.name}</h3>
                                  <Link
                                    href={`/biz/${biz.slug}`}
                                    target="_blank"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                                  >
                                    <span>View Listing</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                                <p className="text-xs text-slate-500">
                                  Category: <span className="font-bold text-slate-700">{biz.category}</span> • Location: <span className="font-bold text-slate-700">{biz.city}, {biz.state}</span>
                                </p>
                                <p className="text-xs text-slate-500">
                                  User Account: <span className="font-mono text-slate-700">{userDisplay}</span>
                                </p>
                              </div>
                            </div>

                            {/* Plan Pill & Amount */}
                            <div className="flex flex-wrap items-center gap-3">
                              <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 ${
                                isPlan5
                                  ? 'bg-purple-50 text-purple-900 border-purple-200'
                                  : 'bg-blue-50 text-blue-900 border-blue-200'
                              }`}>
                                <DollarSign className={`w-4 h-4 ${isPlan5 ? 'text-purple-600' : 'text-blue-600'}`} />
                                <div>
                                  <span className="block leading-tight">{planLabel}</span>
                                  <span className="text-[10px] font-normal opacity-80">{planPrice} • {isPlan5 ? 'Priority Queue + 5 Posts' : 'Standard Review Queue'}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                                  pStatus === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : pStatus === 'REJECTED'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : pStatus === 'NEEDS_CHANGES'
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                                }`}>
                                  Payment: {pStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle Row: Submitted details, screenshot, business status, blog entitlement */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {/* Column 1: Submission Details */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Submission Info</span>
                              <p className="text-slate-700 font-medium">
                                Submitted: {biz.submittedAt ? new Date(biz.submittedAt).toLocaleDateString() : 'Direct Entry'}
                              </p>
                              {refNum && (
                                <p className="text-slate-700 font-mono text-[11px]">
                                  Ref #: <span className="font-bold">{refNum}</span>
                                </p>
                              )}
                              <p className="text-slate-600">
                                Method: <span className="font-semibold">{biz.paymentDetails?.paymentMethod || 'Online'}</span>
                              </p>
                            </div>

                            {/* Column 2: Proof Screenshot */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Payment Proof</span>
                              {screenshotUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedScreenshot({ url: screenshotUrl, name: biz.name, ref: refNum })}
                                  className="group flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all cursor-pointer text-left w-full"
                                >
                                  <img
                                    src={screenshotUrl}
                                    alt="Proof"
                                    className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <span className="text-[11px] font-bold text-blue-600 group-hover:underline block">View Screenshot</span>
                                    <span className="text-[10px] text-slate-400">Click to enlarge</span>
                                  </div>
                                </button>
                              ) : (
                                <p className="text-slate-400 italic text-[11px] pt-1">No screenshot uploaded</p>
                              )}
                            </div>

                            {/* Column 3: Business Directory Status */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Business Directory Status</span>
                              <div className="pt-0.5">
                                <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                  biz.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : biz.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {biz.status === 'approved' ? 'Live on Directory' : biz.status === 'rejected' ? 'Rejected' : 'Awaiting Approval'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {biz.status === 'approved' ? 'Publicly discoverable' : 'Hidden from public index'}
                              </p>
                            </div>

                            {/* Column 4: Blog Entitlement (Requirement 7 & 8) */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Blog Entitlement ($5 Plan)</span>
                              {isPlan5 ? (
                                <div className="space-y-1 pt-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isFeatureEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="font-bold text-slate-800 text-[11px]">
                                      {isFeatureEnabled ? '5-Post Feature Active' : 'Feature Disabled / Pending'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-purple-700 font-semibold">
                                    Posts Used: {postsUsed} / {postsAllowed}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-slate-400 italic text-[11px] pt-1">
                                  Not Included ($1 Plan grants 0 posts)
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Admin Notes Row */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                            <input
                              type="text"
                              defaultValue={biz.adminNotes || ''}
                              placeholder="Add internal admin notes for this business / payment..."
                              onChange={(e) => setAdminNotesMap(prev => ({ ...prev, [biz.id]: e.target.value }))}
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 text-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => handleAdminPaymentAction(biz.id, 'save_notes')}
                              disabled={actionLoading === biz.id + '_save_notes'}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shrink-0 transition-colors"
                            >
                              Save Note
                            </button>
                          </div>

                          {/* Bottom Row: Plan-Specific Admin Actions (Requirement 7) */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Actions for <strong className="text-slate-800">{isPlan5 ? '$5 Priority Plan' : '$1 Review Plan'}</strong>:
                            </span>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Common: Verify Payment */}
                              <button
                                type="button"
                                onClick={() => handleAdminPaymentAction(biz.id, 'verify_payment')}
                                disabled={actionLoading === biz.id + '_verify_payment'}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify Payment</span>
                              </button>

                              {/* Common: Approve Business Listing */}
                              {biz.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdminPaymentAction(biz.id, 'approve_business')}
                                  disabled={actionLoading === biz.id + '_approve_business'}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span>Approve Business</span>
                                </button>
                              )}

                              {/* $5 Exclusive Actions: Enable / Disable 5 Post Feature */}
                              {isPlan5 && !isFeatureEnabled && (
                                <button
                                  type="button"
                                  onClick={() => handleAdminPaymentAction(biz.id, 'enable_blog_feature')}
                                  disabled={actionLoading === biz.id + '_enable_blog_feature'}
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Enable 5 Post Feature</span>
                                </button>
                              )}

                              {isPlan5 && isFeatureEnabled && (
                                <button
                                  type="button"
                                  onClick={() => handleAdminPaymentAction(biz.id, 'disable_blog_feature')}
                                  disabled={actionLoading === biz.id + '_disable_blog_feature'}
                                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <span>Disable 5 Post Feature</span>
                                </button>
                              )}

                              {/* Request Changes */}
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt('Enter feedback/changes required for the business owner:', 'Please upload a clear transaction screenshot or correct business address.')
                                  if (reason) handleAdminPaymentAction(biz.id, 'request_changes', reason)
                                }}
                                disabled={actionLoading === biz.id + '_request_changes'}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Request Changes</span>
                              </button>

                              {/* Reject */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Reject payment and listing for "${biz.name}"?`)) {
                                    handleAdminPaymentAction(biz.id, 'reject')
                                  }
                                }}
                                disabled={actionLoading === biz.id + '_reject'}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING BUSINESS QUEUE */}
          {activeTab === 'pending' && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Pending Business Submissions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review user-submitted business listings, locations, and details.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  {pendingListings.length} Awaiting Administrative Review
                </span>
              </div>

              {pendingListings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-base">All Business Submissions Processed</h3>
                  <p className="text-xs text-slate-500">There are no businesses currently waiting in the approval queue.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingListings.map((biz) => {
                    const hasProof = Boolean(biz.paymentScreenshot || (biz.paymentDetails && biz.paymentDetails.paymentScreenshot))
                    const paymentMethod = biz.paymentDetails?.paymentMethod || 'Online Verification'
                    const refNumber = biz.paymentDetails?.referenceNumber || ''

                    return (
                      <div key={biz.id} className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  Pending Approval
                                </span>
                                {hasProof ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Proof Attached</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                    Awaiting Fee
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                {biz.logo ? (
                                  <img
                                    src={biz.logo}
                                    alt={biz.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                                    {biz.name ? biz.name.charAt(0).toUpperCase() : 'B'}
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{biz.name}</h3>
                                  <p className="text-xs text-slate-500">{biz.category} • {biz.city}</p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedBiz(biz)}
                              className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="View Full Profile"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Contact Details */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-2 text-xs text-slate-700">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Owner</span>
                              <span className="font-semibold truncate block">{biz.ownerName || 'Business Owner'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone / WA</span>
                              <span className="font-semibold block">{biz.phone}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                              <span className="font-semibold truncate block">{biz.email}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {biz.description}
                          </p>

                          {/* Payment Proof Section */}
                          {hasProof ? (
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                                  <span>Credential Review ({paymentMethod})</span>
                                </span>
                                {refNumber && (
                                  <span className="font-mono text-[11px] font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                                    Ref: {refNumber}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedScreenshot({
                                  url: biz.paymentScreenshot || biz.paymentDetails?.paymentScreenshot!,
                                  name: biz.name,
                                  ref: refNumber || biz.id
                                })}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Eye className="w-4 h-4" />
                                <span>See Supporting Verification Proof</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>User registered business draft without uploading payment screenshot yet.</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex gap-2">
                          <button
                            onClick={() => handleApprove(biz.id, biz.name)}
                            disabled={actionLoading === biz.id}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            onClick={() => handleReject(biz.id, biz.name)}
                            disabled={actionLoading === biz.id}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBusiness(biz.id, biz.name)}
                            disabled={actionLoading === biz.id}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFESSIONAL PROFILES DIRECTORY */}
          {activeTab === 'professionals' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Professional Profiles Moderation</h2>
                  <p className="text-xs text-slate-500">
                    Approve submissions to make them publicly visible, or toggle verification status.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search name, category, city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-56"
                    />
                  </div>

                  <select
                    value={proStatusFilter}
                    onChange={(e) => setProStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="all">Status: All</option>
                    <option value="pending">Status: Pending</option>
                    <option value="approved">Status: Approved</option>
                    <option value="rejected">Status: Rejected</option>
                  </select>

                  <select
                    value={proVerifyFilter}
                    onChange={(e) => setProVerifyFilter(e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="all">Verification: All</option>
                    <option value="verified">Verification: Verified (✓)</option>
                    <option value="unverified">Verification: Unverified (✕)</option>
                  </select>
                </div>
              </div>

              {/* Profiles Table / Cards */}
              <div className="space-y-4">
                {allProfessionals
                  .filter(p => {
                    const q = searchQuery.toLowerCase().trim()
                    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.profession.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
                    const status = p.status || p.profileStatus?.toLowerCase() || 'approved'
                    const matchesStatus = proStatusFilter === 'all' || status === proStatusFilter
                    const isV = p.verified === true || p.verificationStatus === 'VERIFIED'
                    const matchesVerify = proVerifyFilter === 'all' || (proVerifyFilter === 'verified' ? isV : !isV)
                    return matchesQuery && matchesStatus && matchesVerify
                  })
                  .sort((a, b) => {
                    // 1. Pending profiles always at the top for immediate admin action
                    const aPending = (a.status === 'pending' || a.profileStatus === 'PENDING') ? 1 : 0
                    const bPending = (b.status === 'pending' || b.profileStatus === 'PENDING') ? 1 : 0
                    if (bPending !== aPending) return bPending - aPending

                    // 2. Newest registration timestamp first
                    const bTime = new Date(b.submittedAt || 0).getTime() || (b.id ? parseInt(b.id.replace(/\D/g, '')) || 0 : 0)
                    const aTime = new Date(a.submittedAt || 0).getTime() || (a.id ? parseInt(a.id.replace(/\D/g, '')) || 0 : 0)
                    return bTime - aTime
                  })
                  .map((pro) => {
                    const isAppr = (pro.status || 'approved') === 'approved' && (pro.profileStatus || 'APPROVED') === 'APPROVED'
                    const isPend = pro.status === 'pending' || pro.profileStatus === 'PENDING'
                    const isRej = pro.status === 'rejected' || pro.profileStatus === 'REJECTED'
                    const isVer = pro.verified === true || pro.verificationStatus === 'VERIFIED'

                    return (
                      <div
                        key={pro.username}
                        className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-300"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={pro.avatar}
                            alt={pro.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-extrabold text-slate-900 text-base truncate">{pro.name}</h3>
                              
                              {/* Verification Badge */}
                              {isVer ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Unverified</span>
                                </span>
                              )}

                              {/* Approval Status Badge */}
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                isAppr ? 'bg-emerald-100 text-emerald-800' : isPend ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isAppr ? 'Approved' : isPend ? 'Pending Review' : 'Rejected'}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-blue-600 truncate">{pro.title} ({pro.profession})</p>
                            <p className="text-[11px] text-slate-500">
                              📍 {pro.city} • Rate: {pro.hourlyRate} • {pro.experienceYears}y Exp • Submitted: {new Date(pro.submittedAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                          <button
                            onClick={() => setSelectedPro(pro)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
                          >
                            Full Details
                          </button>

                          {pro.verificationPaymentDetails?.paymentScreenshot && (
                            <button
                              type="button"
                              onClick={() => setSelectedScreenshot({
                                url: pro.verificationPaymentDetails!.paymentScreenshot!,
                                name: pro.name,
                                ref: pro.verificationPaymentDetails!.transactionRef || 'TID'
                              })}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Inspect uploaded payment screenshot"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>See Payment Proof</span>
                            </button>
                          )}

                          {isAppr && (
                            <Link
                              href={`/professionals/${pro.username}`}
                              target="_blank"
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Live</span>
                            </Link>
                          )}

                          {isPend && (
                            <button
                              onClick={() => handleApprovePro(pro.id || pro.username, pro.name)}
                              disabled={actionLoading === (pro.id || pro.username)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                            >
                              Approve Profile
                            </button>
                          )}

                          {isAppr && !isVer && (
                            <button
                              onClick={() => handleVerifyPro(pro.id || pro.username, pro.name)}
                              disabled={actionLoading === (pro.id || pro.username)}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                              title="Award verified badge and unlock profile editing"
                            >
                              Verify
                            </button>
                          )}

                          {isVer && (
                            <button
                              onClick={() => handleUnverifyPro(pro.id || pro.username, pro.name)}
                              disabled={actionLoading === (pro.id || pro.username)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 cursor-pointer"
                              title="Remove verified badge and re-lock editing"
                            >
                              Unverify
                            </button>
                          )}

                          {!isRej && (
                            <button
                              onClick={() => handleRejectPro(pro.id || pro.username, pro.name)}
                              disabled={actionLoading === (pro.id || pro.username)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 cursor-pointer"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            onClick={() => handleDeletePro(pro.id || pro.username, pro.name)}
                            disabled={actionLoading === (pro.id || pro.username)}
                            className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: PROFESSIONAL VERIFICATION REQUESTS (CREDENTIAL REVIEW QUEUE) */}
          {activeTab === 'verifications' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <span>Professional Credential Verification Queue</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review payment screenshot proofs and transaction IDs submitted by registered professionals.
                  </p>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {verificationRequests.length} Total Verification Requests
                </span>
              </div>

              {verificationRequests.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-base">No Verification Requests Yet</h3>
                  <p className="text-xs text-slate-500">When professionals submit their credential documents, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verificationRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                        req.status === 'PENDING'
                          ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          {req.avatar && (
                            <img src={req.avatar} alt={req.proName} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-slate-900 text-base">{req.proName}</h3>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                                req.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'PENDING'
                                  ? 'bg-amber-200 text-amber-900 animate-pulse'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {req.status === 'APPROVED' ? '✓ Verified Approved' : req.status === 'PENDING' ? 'Pending Payment Review' : 'Rejected'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-blue-600">{req.profession} • {req.city}</p>
                          </div>
                        </div>

                        {/* Payment metadata */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-slate-200/80 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Fee Amount</span>
                            <span className="font-extrabold text-emerald-700">Free Verification</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Method</span>
                            <span className="font-bold text-slate-800">{req.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Transaction Ref (TID)</span>
                            <span className="font-mono font-bold text-blue-700">{req.paymentReference}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted Date</span>
                            <span className="font-semibold text-slate-600">{new Date(req.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Screenshot Preview & Action Controls */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                        {req.paymentScreenshot && (
                          <button
                            type="button"
                            onClick={() => setSelectedScreenshot({ url: req.paymentScreenshot!, name: req.proName, ref: req.paymentReference || '' })}
                            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-extrabold rounded-xl border border-blue-200 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center shadow-2xs transition-all hover:scale-105"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span>See Payment Screenshot Proof</span>
                          </button>
                        )}

                        {req.status === 'PENDING' && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleApproveVerificationReq(req)}
                              disabled={actionLoading === req.id}
                              className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Verification</span>
                            </button>

                            <button
                              onClick={() => handleRejectVerificationReq(req)}
                              disabled={actionLoading === req.id}
                              className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ALL BUSINESSES DIRECTORY */}
          {activeTab === 'businesses' && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">All Businesses Directory</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Search and manage all business listings across the United States ({allBusinesses.length} total).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search name, category, city, owner..."
                        value={bizSearchQuery}
                        onChange={(e) => setBizSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-64"
                      />
                    </div>

                    <select
                      value={bizStatusFilter}
                      onChange={(e) => setBizStatusFilter(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="all">Status: All ({allBusinesses.length})</option>
                      <option value="pending">Status: Pending ({stats.pendingBiz})</option>
                      <option value="approved">Status: Approved ({stats.approvedBiz})</option>
                      <option value="rejected">Status: Rejected ({stats.rejectedBiz || 0})</option>
                      <option value="with_proof">With Payment Proof</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Business Name & Category</th>
                        <th className="py-4 px-4">City & Locations</th>
                        <th className="py-4 px-4">Owner & Contact</th>
                        <th className="py-4 px-4">Status & Fee Proof</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allBusinesses
                        .filter(b => {
                          const q = bizSearchQuery.toLowerCase().trim()
                          const matchesQuery = !q || 
                            b.name.toLowerCase().includes(q) || 
                            b.category.toLowerCase().includes(q) || 
                            b.city.toLowerCase().includes(q) || 
                            (b.ownerName && b.ownerName.toLowerCase().includes(q)) || 
                            (b.phone && b.phone.includes(q)) ||
                            (b.email && b.email.toLowerCase().includes(q))
                          
                          const status = (b.status || 'approved').toLowerCase()
                          const hasProof = Boolean(b.paymentScreenshot || (b.paymentDetails && b.paymentDetails.paymentScreenshot))
                          
                          let matchesStatus = true
                          if (bizStatusFilter === 'pending') {
                            matchesStatus = status === 'pending' || b.paymentStatus === 'PENDING'
                          } else if (bizStatusFilter === 'approved') {
                            matchesStatus = status === 'approved'
                          } else if (bizStatusFilter === 'rejected') {
                            matchesStatus = status === 'rejected'
                          } else if (bizStatusFilter === 'with_proof') {
                            matchesStatus = hasProof
                          }

                          return matchesQuery && matchesStatus
                        })
                        .map((biz) => {
                          const isApproved = (biz.status || 'approved') === 'approved'
                          const isPending = biz.status === 'pending' || biz.paymentStatus === 'PENDING'
                          const isRejected = biz.status === 'rejected'
                          const hasProof = Boolean(biz.paymentScreenshot || (biz.paymentDetails && biz.paymentDetails.paymentScreenshot))
                          const proofUrl = biz.paymentScreenshot || biz.paymentDetails?.paymentScreenshot

                          return (
                            <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-extrabold text-slate-900 text-sm">{biz.name}</div>
                                <div className="text-[11px] text-slate-500">{biz.category}</div>
                              </td>
                              <td className="py-4 px-4 font-semibold text-slate-700">
                                <div>{biz.city}</div>
                                {biz.locations && biz.locations.length > 1 && (
                                  <div className="text-[10px] text-blue-600 font-bold">
                                    +{biz.locations.length - 1} more branch{biz.locations.length > 2 ? 'es' : ''}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-slate-600 space-y-0.5">
                                <div className="font-semibold text-slate-800">{biz.ownerName || 'Representative'}</div>
                                <div>{biz.phone}</div>
                                <div className="text-[11px] text-slate-400">{biz.email}</div>
                              </td>
                              <td className="py-4 px-4 space-y-1">
                                <div>
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    isApproved 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : isRejected 
                                      ? 'bg-red-50 text-red-700 border border-red-200' 
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {isApproved ? 'Approved & Live' : isRejected ? 'Rejected' : 'Pending Review'}
                                  </span>
                                </div>
                                {hasProof && proofUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedScreenshot({
                                      url: proofUrl,
                                      name: biz.name,
                                      ref: biz.paymentDetails?.referenceNumber || biz.id
                                    })}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold hover:bg-blue-100 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3 text-blue-600" />
                                    <span>Proof Attached</span>
                                  </button>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right space-x-1.5">
                                {isApproved && (
                                  <Link
                                    href={`/business/${biz.slug}`}
                                    target="_blank"
                                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                                  >
                                    <span>Live</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                                {isPending && (
                                  <button
                                    onClick={() => handleApprove(biz.id, biz.name)}
                                    disabled={actionLoading === biz.id}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedBiz(biz)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => handleDeleteBusiness(biz.id, biz.name)}
                                  disabled={actionLoading === biz.id}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HIRING COMPANIES */}
          {activeTab === 'companies' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900">Hiring Companies Directory</h2>
              <div className="space-y-4">
                {allCompanies.map((comp) => (
                  <div key={comp.slug} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img src={comp.logo} alt={comp.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{comp.name}</h3>
                        <p className="text-xs text-blue-600 font-bold">{comp.industry} • {comp.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/companies/${comp.slug}`} target="_blank" className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                        Preview
                      </Link>
                      {comp.status === 'pending' && (
                        <button onClick={() => handleApproveCompany(comp.id || comp.slug, comp.name)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: JOBS */}
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900">Job Openings Moderation</h2>
              <div className="space-y-4">
                {allJobs.map((job) => (
                  <div key={job.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{job.title}</h3>
                      <p className="text-xs text-slate-500">{job.company} • {job.city} • {job.salary}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={getPublicJobPath(job)} target="_blank" className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                        View
                      </Link>
                      {job.status === 'pending' && (
                        <button onClick={() => handleApproveJob(job.id, job.title)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: JOB APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span>Candidate Job Applications ({allJobApplications.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applications submitted by verified &amp; registered professionals across the United States.
                  </p>
                </div>

                {/* Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setAppStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      appStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({allJobApplications.length})
                  </button>
                  <button
                    onClick={() => setAppStatusFilter('new')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      appStatusFilter === 'new' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    New ({allJobApplications.filter(a => a.status === 'new').length})
                  </button>
                  <button
                    onClick={() => setAppStatusFilter('reviewed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      appStatusFilter === 'reviewed' ? 'bg-blue-600 text-white shadow-2xs' : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    Reviewed ({allJobApplications.filter(a => a.status === 'reviewed').length})
                  </button>
                  <button
                    onClick={() => setAppStatusFilter('shortlisted')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      appStatusFilter === 'shortlisted' ? 'bg-purple-600 text-white shadow-2xs' : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    Shortlisted ({allJobApplications.filter(a => a.status === 'shortlisted').length})
                  </button>
                  <button
                    onClick={() => setAppStatusFilter('rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      appStatusFilter === 'rejected' ? 'bg-red-600 text-white shadow-2xs' : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    Rejected ({allJobApplications.filter(a => a.status === 'rejected').length})
                  </button>
                </div>
              </div>

              {/* Applications List */}
              {allJobApplications.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 shadow-xs">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Applications Received Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When registered professionals apply for jobs through BizNest USA, their verified profiles and submissions will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allJobApplications
                    .filter(app => {
                      if (appStatusFilter !== 'all' && app.status !== appStatusFilter) return false
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase()
                        return (
                          (app.applicantName || '').toLowerCase().includes(q) ||
                          (app.applicantEmail || '').toLowerCase().includes(q) ||
                          (app.jobTitle || '').toLowerCase().includes(q) ||
                          (app.companyName || '').toLowerCase().includes(q)
                        )
                      }
                      return true
                    })
                    .map((app) => (
                      <div
                        key={app.id}
                        className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all space-y-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                          app.status === 'new' ? 'border-emerald-300 bg-emerald-50/20 shadow-sm' : 'border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-3 flex-1 min-w-0">
                          {/* Candidate & Position Header */}
                          <div className="flex items-start gap-3.5">
                            {app.applicantAvatar ? (
                              <img
                                src={app.applicantAvatar}
                                alt={app.applicantName || 'Candidate'}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-base shrink-0">
                                {(app.applicantName || 'P')[0]}
                              </div>
                            )}

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  app.status === 'new'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : app.status === 'shortlisted'
                                    ? 'bg-purple-100 text-purple-800'
                                    : app.status === 'reviewed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {app.status}
                                </span>

                                {app.isVerifiedProfessional && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Verified Professional</span>
                                  </span>
                                )}

                                <span className="text-[11px] text-slate-400 font-medium">
                                  Applied {new Date(app.appliedAt).toLocaleDateString()} at {new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-2 flex-wrap">
                                <h3 className="font-extrabold text-slate-900 text-base">{app.applicantName}</h3>
                                {app.applicantProfession && (
                                  <span className="text-xs text-blue-600 font-semibold">({app.applicantProfession})</span>
                                )}
                              </div>

                              <div className="text-xs text-slate-700">
                                <span>Applied for </span>
                                <strong className="text-slate-900">{app.jobTitle}</strong>
                                <span> at </span>
                                <span className="font-bold text-slate-800">{app.companyName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Candidate Contacts & Cover Note */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{app.applicantEmail}</span>
                            </div>
                            {app.applicantPhone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{app.applicantPhone}</span>
                              </div>
                            )}
                            {app.applicantCity && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{app.applicantCity}</span>
                              </div>
                            )}
                          </div>

                          {app.coverNote && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic line-clamp-2">
                              &ldquo;{app.coverNote}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Action Buttons Column */}
                        <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            {app.applicantUsername && (
                              <Link
                                href={`/professionals/${app.applicantUsername}`}
                                target="_blank"
                                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5"
                              >
                                <span>Profile</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>

                          {/* Quick Status Select */}
                          <div className="flex items-center gap-1">
                            {app.status !== 'shortlisted' && (
                              <button
                                onClick={() => handleUpdateAppStatus(app.id, 'shortlisted')}
                                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-extrabold rounded-lg border border-purple-200 cursor-pointer"
                                title="Shortlist Candidate"
                              >
                                Shortlist
                              </button>
                            )}
                            {app.status === 'new' && (
                              <button
                                onClick={() => handleUpdateAppStatus(app.id, 'reviewed')}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-extrabold rounded-lg border border-blue-200 cursor-pointer"
                                title="Mark Reviewed"
                              >
                                Reviewed
                              </button>
                            )}
                            {app.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-extrabold rounded-lg border border-red-200 cursor-pointer"
                                title="Reject Application"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteApp(app.id, app.applicantName)}
                              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4 animate-in fade-in-50">
              <h2 className="text-xl font-extrabold text-slate-900">Contact Form Messages</h2>
              {contactMessages.map((msg) => (
                <div key={msg.id} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-slate-900">{msg.name}</h3>
                      <p className="text-xs text-slate-500">{msg.email} • {msg.phone}</p>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <strong>Subject: {msg.subject}</strong>
                    <p className="mt-1">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 10-13: CMS MANAGEMENT (CATEGORIES, LOCATIONS, ARTICLES, SETTINGS) */}
          {(activeTab === 'categories' || activeTab === 'locations' || activeTab === 'articles' || activeTab === 'settings') && (
            <AdminCmsTabs activeTab={activeTab} />
          )}

          {/* TAB 14: SEO DIAGNOSTICS & TOPICAL AUTHORITY */}
          {activeTab === 'seo' && (
            <AdminSeoDiagnostics />
          )}

        </div>

        {/* MODAL: APPLICATION COMPLETE DETAILS */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto space-y-5 font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Application Details
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedApp.jobTitle}</h3>
                  <p className="text-xs text-slate-500">{selectedApp.companyName}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Candidate Overview Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
                  {selectedApp.applicantAvatar ? (
                    <img src={selectedApp.applicantAvatar} alt={selectedApp.applicantName || 'Candidate'} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                      {(selectedApp.applicantName || 'P')[0]}
                    </div>
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">{selectedApp.applicantName}</h4>
                      {selectedApp.isVerifiedProfessional && (
                        <span title="Verified Professional">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-600">{selectedApp.applicantProfession || 'Professional Specialist'}</p>
                    <p className="text-[11px] text-slate-400">
                      Applied on {new Date(selectedApp.appliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Candidate Contacts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Email</span>
                    <span className="font-bold text-slate-900">{selectedApp.applicantEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Phone</span>
                    <span className="font-bold text-slate-900">{selectedApp.applicantPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Location</span>
                    <span className="font-bold text-slate-900">{selectedApp.applicantCity || 'United States'}</span>
                  </div>
                </div>

                {/* Cover Note */}
                {selectedApp.coverNote && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Cover Note / Intro Message:</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{selectedApp.coverNote}</p>
                  </div>
                )}

                {/* Status & Quick Updates */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Application Status</span>
                    <span className="text-xs font-extrabold uppercase text-indigo-700">{selectedApp.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateAppStatus(selectedApp.id, 'shortlisted')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        selectedApp.status === 'shortlisted' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleUpdateAppStatus(selectedApp.id, 'reviewed')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        selectedApp.status === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateAppStatus(selectedApp.id, 'rejected')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        selectedApp.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center gap-3">
                {selectedApp.applicantUsername ? (
                  <Link
                    href={`/professionals/${selectedApp.applicantUsername}`}
                    target="_blank"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <span>View Public Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : <div />}

                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PROFESSIONAL COMPLETE DETAILS */}
        {selectedPro && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                  <img src={selectedPro.avatar} alt={selectedPro.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-extrabold text-slate-900">{selectedPro.name}</h3>
                      {selectedPro.verified && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <p className="text-xs font-bold text-blue-600">{selectedPro.title} ({selectedPro.profession})</p>
                    <p className="text-[11px] text-slate-400">/professionals/{selectedPro.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPro(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">Short Bio:</strong>
                  <p className="text-slate-700 leading-relaxed">{selectedPro.bio}</p>
                </div>

                {selectedPro.about && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block font-bold">Detailed About:</strong>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{selectedPro.about}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div><strong>City:</strong> {selectedPro.city}</div>
                  <div><strong>Phone:</strong> {selectedPro.phone || 'N/A'}</div>
                  <div><strong>WhatsApp:</strong> {selectedPro.whatsapp || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedPro.email || 'N/A'}</div>
                  <div><strong>Rate:</strong> {selectedPro.hourlyRate}</div>
                  <div><strong>Experience:</strong> {selectedPro.experienceYears} Years</div>
                </div>

                {selectedPro.skills && selectedPro.skills.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block font-bold">Skills:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPro.skills.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Status:</span>
                  <span className="text-xs font-extrabold text-blue-600 uppercase">
                    {selectedPro.status || 'approved'} • {selectedPro.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/professionals/${selectedPro.username}`}
                    target="_blank"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Public Preview</span>
                  </Link>

                  {selectedPro.status === 'pending' && (
                    <button
                      onClick={() => handleApprovePro(selectedPro.id || selectedPro.username, selectedPro.name)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Approve Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PAYMENT SCREENSHOT INSPECTOR & LEGITIMACY CHECK */}
        {selectedScreenshot && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[95vh] flex flex-col shadow-2xl border border-slate-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{selectedScreenshot.name}</h3>
                      <p className="text-xs font-mono text-blue-600 font-bold">Transaction Ref / TID: {selectedScreenshot.ref}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
                  title="Close Inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* High-Resolution Screenshot Image Area (Click to open in new tab) */}
              <a
                href={selectedScreenshot.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Click image to open full size in new tab"
                className="rounded-2xl overflow-y-auto bg-slate-950 flex flex-col items-center justify-center max-h-[55vh] p-2 border border-slate-800 relative group cursor-pointer"
              >
                <img
                  src={selectedScreenshot.url}
                  alt="Payment Receipt"
                  className="max-h-[50vh] w-auto object-contain rounded-xl group-hover:scale-[1.01] transition-transform duration-200"
                />
                <div className="absolute bottom-4 right-4 bg-black/75 px-3 py-1.5 rounded-lg text-white text-[11px] font-bold flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition shadow-lg">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Click Image to Open Large in New Tab</span>
                </div>
              </a>

              {/* Legitimacy Checklist Box */}
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/80 text-xs space-y-1.5 text-slate-700">
                <span className="font-extrabold text-blue-950 block">Admin Compliance &amp; Verification Checklist:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Confirm credential authenticity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Match TID with bank account statement</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verify corporate registration or bank statement record</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Check date &amp; timestamp authenticity</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                <a
                  href={selectedScreenshot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size Image</span>
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {(() => {
                    const matchedBiz = allBusinesses.find(b => b.name === selectedScreenshot.name || b.id === selectedScreenshot.ref || b.slug === selectedScreenshot.ref)
                    const matchedPro = allProfessionals.find(p => p.name === selectedScreenshot.name || p.username === selectedScreenshot.ref)

                    if (matchedBiz) {
                      const isPending = matchedBiz.status === 'pending' || matchedBiz.paymentStatus === 'PENDING'
                      return isPending ? (
                        <button
                          onClick={() => {
                            handleApprove(matchedBiz.id, matchedBiz.name)
                            setSelectedScreenshot(null)
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve &amp; Publish Business</span>
                        </button>
                      ) : null
                    }

                    if (matchedPro) {
                      return (
                        <button
                          onClick={() => {
                            handleVerifyPro(matchedPro.id || matchedPro.username, matchedPro.name)
                            setSelectedScreenshot(null)
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify &amp; Award Badge</span>
                        </button>
                      )
                    }

                    return null
                  })()}

                  <button
                    onClick={() => setSelectedScreenshot(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW DETAILS MODAL FOR BUSINESS */}
        {selectedBiz && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedBiz.name}</h3>
                  <p className="text-xs text-blue-600 font-bold">{selectedBiz.category} • {selectedBiz.city}</p>
                </div>
                <button
                  onClick={() => setSelectedBiz(null)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Business Description:</span>
                  <p className="leading-relaxed whitespace-pre-line">{selectedBiz.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div><strong>Phone:</strong> {selectedBiz.phone}</div>
                  <div><strong>WhatsApp:</strong> {selectedBiz.whatsapp}</div>
                  <div><strong>Email:</strong> {selectedBiz.email}</div>
                  <div><strong>Website:</strong> {selectedBiz.website}</div>
                  <div className="col-span-2"><strong>Address:</strong> {selectedBiz.address}</div>
                  <div className="col-span-2">
                    <strong>Onboarding Plan:</strong>{' '}
                    <span className="font-extrabold text-blue-700">
                      {selectedBiz.plan === 'authoritative_10'
                        ? '$10 Authoritative Plan (VIP 24h Review, 48h Indexing, 10 Posts / 60d)'
                        : selectedBiz.plan === 'priority_5'
                        ? '$5 Standard Plan (Single Page + Profile Editing + 5 Posts)'
                        : '$1 Basic Plan (Category List/Grid View Only, No Single Page)'}
                    </span>
                  </div>
                </div>

                {/* Operating Hours Display */}
                {selectedBiz.operatingHours && Object.keys(selectedBiz.operatingHours).length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Operating Hours:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      {Object.entries(selectedBiz.operatingHours).map(([day, hrs]) => (
                        <div key={day} className="flex justify-between bg-white px-2 py-1 rounded border border-slate-100">
                          <span className="font-semibold text-slate-600">{day.slice(0, 3)}:</span>
                          <span className={hrs === 'Closed' ? 'text-slate-400' : 'text-slate-900 font-bold'}>{hrs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Edit Request Notice if any */}
                {(selectedBiz as any).pendingEditRequest && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <span className="font-bold text-amber-900 block">Pending Profile Edit Request (24h Review):</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Updated Name: {(selectedBiz as any).pendingEditRequest.name || selectedBiz.name} • Phone: {(selectedBiz as any).pendingEditRequest.phone || selectedBiz.phone}
                    </p>
                  </div>
                )}

                {/* Brand Authority & Social Profiles (Google Business Profile, Facebook, Instagram, LinkedIn) */}
                {(selectedBiz.googleBusinessProfile || selectedBiz.facebookUrl || selectedBiz.instagramUrl || selectedBiz.linkedinUrl) && (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                    <span className="font-extrabold text-indigo-950 block text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Brand Authority &amp; Google Ranking Profiles:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {selectedBiz.googleBusinessProfile && (
                        <div className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Google Business:</span>
                          <a
                            href={selectedBiz.googleBusinessProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold truncate max-w-[170px]"
                          >
                            <span>Open Profile / Maps</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                      {selectedBiz.facebookUrl && (
                        <div className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Facebook:</span>
                          <a
                            href={selectedBiz.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold truncate max-w-[170px]"
                          >
                            <span>Open Facebook</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                      {selectedBiz.instagramUrl && (
                        <div className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Instagram:</span>
                          <a
                            href={selectedBiz.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline flex items-center gap-1 font-semibold truncate max-w-[170px]"
                          >
                            <span>Open Instagram</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                      {selectedBiz.linkedinUrl && (
                        <div className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                          <span className="font-bold text-slate-700">LinkedIn:</span>
                          <a
                            href={selectedBiz.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline flex items-center gap-1 font-semibold truncate max-w-[170px]"
                          >
                            <span>Open LinkedIn</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Screenshot & Large Image Verification in Details Modal */}
                {selectedBiz.paymentScreenshot ? (
                  <div className="p-4 bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
                      <div>
                        <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Payment Screenshot Attached for Verification</span>
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Plan: <strong>{selectedBiz.planName || selectedBiz.plan}</strong> • Ref: <strong>{selectedBiz.transactionRef || selectedBiz.paymentDetails?.referenceNumber || 'N/A'}</strong>
                        </p>
                      </div>

                      <a
                        href={selectedBiz.paymentScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition hover:scale-105 cursor-pointer self-start sm:self-auto"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Large Image in New Tab</span>
                      </a>
                    </div>

                    {/* Screenshot image display with click-to-open-new-tab */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-emerald-200">
                      <a
                        href={selectedBiz.paymentScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Click to open large image in new tab for verification"
                        className="relative group cursor-pointer block shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition-all shadow-md"
                      >
                        <img
                          src={selectedBiz.paymentScreenshot}
                          alt={`Payment receipt for ${selectedBiz.name}`}
                          className="w-36 h-36 object-contain bg-slate-900 group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[11px] font-bold gap-1 text-center p-2">
                          <ExternalLink className="w-4 h-4" />
                          <span>Click to Open Large Image</span>
                        </div>
                      </a>

                      <div className="space-y-1.5 text-xs text-slate-700 flex-1">
                        <p className="font-extrabold text-slate-900 text-xs">
                          Click image or &quot;Open Large Image in New Tab&quot; above to inspect high-resolution transaction details, sender account name, and bank confirmation ID.
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Payment Status: <span className="font-bold uppercase text-emerald-700">{selectedBiz.paymentStatus || 'SUBMITTED'}</span>
                        </p>
                        {selectedBiz.status === 'pending' && (
                          <div className="pt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleApprove(selectedBiz.id, selectedBiz.name)
                                setSelectedBiz({ ...selectedBiz, status: 'approved', paymentStatus: 'VERIFIED' })
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition hover:scale-105 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify &amp; Approve Business</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleReject(selectedBiz.id, selectedBiz.name)
                                setSelectedBiz({ ...selectedBiz, status: 'rejected' })
                              }}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No payment screenshot attached yet for this listing.</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-700 uppercase">
                  Status: {selectedBiz.status || 'approved'}
                </span>

                <div className="flex gap-2">
                  {selectedBiz.plan === 'review_1' || selectedBiz.hasSinglePage === false ? (
                    <Link
                      href={`/category/${selectedBiz.category ? selectedBiz.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general'}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View in Category</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/business/${selectedBiz.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Live Page</span>
                    </Link>
                  )}
                  {selectedBiz.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(selectedBiz.id, selectedBiz.name)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Approve & Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBusiness(selectedBiz.id, selectedBiz.name)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Delete Listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREENSHOT PROOF PREVIEW MODAL */}
        {selectedScreenshot && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Payment Screenshot Proof</h3>
                  <p className="text-xs text-slate-500">
                    Business: <span className="font-bold text-slate-700">{selectedScreenshot.name}</span>
                    {selectedScreenshot.ref && (
                      <span> • Ref: <span className="font-mono font-bold text-slate-800">{selectedScreenshot.ref}</span></span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                <img
                  src={selectedScreenshot.url}
                  alt="Payment Proof"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href={selectedScreenshot.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Open Original in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedScreenshot(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}

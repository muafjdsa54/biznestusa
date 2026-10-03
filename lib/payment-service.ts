import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore'
import {
  BusinessPlan,
  BUSINESS_PLANS,
  PaymentRecord,
  PaymentStatus,
  PaymentAuditLog,
  BusinessItem
} from './data'
import { sanitizeText, sanitizeImageUrl } from './sanitizer'

// In-memory fallback cache for SSR / demo / offline environments
let memoryPaymentsCache: PaymentRecord[] = []

/**
 * Generate unique, collision-safe, human-readable payment reference:
 * e.g. BNUSA-2026-000123
 */
export function generatePaymentReference(): string {
  const year = new Date().getFullYear()
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  return `BNUSA-${year}-${randomSuffix}`
}

/**
 * Validate payment screenshot format and size:
 * PNG, JPG/JPEG, WEBP, <= 10MB
 */
export function validatePaymentScreenshot(dataUrl: string): { valid: boolean; error?: string } {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { valid: false, error: 'Payment screenshot is required.' }
  }

  const trimmed = dataUrl.trim()
  if (!trimmed.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image format. Supported formats: PNG, JPG, JPEG, WEBP.' }
  }

  const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  const matchedType = supportedTypes.some(type => trimmed.startsWith(`data:${type}`))
  if (!matchedType) {
    return { valid: false, error: 'Unsupported file type. Please upload a PNG, JPG, or WEBP image.' }
  }

  // Check approximate base64 payload size (10MB in base64 is ~13.3MB chars)
  const approxSizeBytes = (trimmed.length * 3) / 4
  if (approxSizeBytes > 10 * 1024 * 1024) {
    return { valid: false, error: 'Screenshot file size exceeds 10MB limit.' }
  }

  return { valid: true }
}

/**
 * Create or retrieve an existing pending payment record for a business.
 * Enforces duplicate protection and server-side canonical price lookup.
 */
export async function createOrGetPaymentRecord(params: {
  userId: string
  userEmail?: string
  businessId: string
  businessName: string
  businessSlug?: string
  planId: BusinessPlan
}): Promise<PaymentRecord> {
  const { userId, userEmail, businessId, businessName, businessSlug, planId } = params

  // 1. Canonical Plan Verification
  const planConfig = BUSINESS_PLANS[planId]
  if (!planConfig) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }

  const canonicalPrice = planConfig.price
  const canonicalPlanName = planConfig.name
  const nowIso = new Date().toISOString()

  // 2. Duplicate Protection Check
  // Check if an existing active payment record is already in PENDING_PAYMENT or PAYMENT_VERIFICATION_PENDING
  const existing = await findActivePaymentForBusiness(businessId)
  if (existing && (existing.payment_status === 'PENDING_PAYMENT' || existing.payment_status === 'PAYMENT_VERIFICATION_PENDING')) {
    // If the plan changed while still pending, update the existing record
    if (existing.plan_id !== planId) {
      existing.plan_id = planId
      existing.plan_name = canonicalPlanName
      existing.amount = canonicalPrice
      if (db) {
        try {
          await updateDoc(doc(db, 'payments', existing.id), {
            plan_id: planId,
            plan_name: canonicalPlanName,
            amount: canonicalPrice,
            updated_at: nowIso
          })
        } catch (e) {
          console.warn('Error updating payment plan in Firestore:', e)
        }
      }
    }
    return existing
  }

  // 3. Generate New Payment Record
  const paymentId = `pay_${businessId}_${Date.now()}`
  const reference = generatePaymentReference()

  const record: PaymentRecord = {
    id: paymentId,
    user_id: userId || 'anonymous_user',
    user_email: userEmail || '',
    business_id: businessId,
    business_name: sanitizeText(businessName, 100),
    business_slug: businessSlug || '',
    plan_id: planId,
    plan_name: canonicalPlanName,
    amount: canonicalPrice,
    currency: 'USD',
    payment_reference: reference,
    payment_provider: 'payoneer',
    payment_status: 'PENDING_PAYMENT',
    payoneer_transaction_id: null,
    payment_screenshot_url: null,
    customer_note: null,
    created_at: nowIso,
    screenshot_submitted_at: null,
    verified_at: null,
    rejected_at: null,
    verified_by: null,
    rejection_reason: null,
    admin_notes: null
  }

  // Store in memory
  memoryPaymentsCache = [record, ...memoryPaymentsCache.filter(p => p.id !== record.id)]

  // Store in Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'payments', paymentId), record)
      await logPaymentAudit({
        payment_id: paymentId,
        payment_reference: reference,
        business_id: businessId,
        action: 'created',
        notes: `Created payment record for ${canonicalPlanName} ($${canonicalPrice} USD)`
      })
    } catch (err) {
      console.warn('Firestore payment record save error:', err)
    }
  }

  return record
}

/**
 * Submit payment screenshot & details for verification.
 */
export async function submitPaymentProof(params: {
  paymentIdOrRef: string
  screenshotDataUrl: string
  payoneerTransactionId?: string
  customerNote?: string
  userId?: string
}): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
  const { paymentIdOrRef, screenshotDataUrl, payoneerTransactionId, customerNote, userId } = params

  // 1. Validate Screenshot
  const validation = validatePaymentScreenshot(screenshotDataUrl)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const nowIso = new Date().toISOString()
  const cleanTxId = sanitizeText(payoneerTransactionId || '', 100)
  const cleanNote = sanitizeText(customerNote || '', 1000)

  // 2. Find Payment Record
  let payment = await findPaymentByIdOrRef(paymentIdOrRef)
  if (!payment) {
    return { success: false, error: 'Payment record not found.' }
  }

  // Optional: User authorization check
  if (userId && payment.user_id && payment.user_id !== 'anonymous_user' && payment.user_id !== userId) {
    return { success: false, error: 'Unauthorized: You do not own this payment record.' }
  }

  // 3. Update Payment Record to PAYMENT_VERIFICATION_PENDING
  payment.payment_status = 'PAYMENT_VERIFICATION_PENDING'
  payment.payment_screenshot_url = screenshotDataUrl
  payment.payoneer_transaction_id = cleanTxId || null
  payment.customer_note = cleanNote || null
  payment.screenshot_submitted_at = nowIso
  payment.rejection_reason = null

  // Update memory cache
  const mIdx = memoryPaymentsCache.findIndex(p => p.id === payment!.id)
  if (mIdx !== -1) {
    memoryPaymentsCache[mIdx] = { ...payment }
  } else {
    memoryPaymentsCache.push(payment)
  }

  // Update Firestore
  if (db) {
    try {
      await updateDoc(doc(db, 'payments', payment.id), {
        payment_status: 'PAYMENT_VERIFICATION_PENDING',
        payment_screenshot_url: screenshotDataUrl,
        payoneer_transaction_id: cleanTxId || null,
        customer_note: cleanNote || null,
        screenshot_submitted_at: nowIso,
        rejection_reason: null,
        updated_at: nowIso
      })

      // Sync with Business document
      await updateDoc(doc(db, 'businesses', payment.business_id), {
        paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
        paymentScreenshot: screenshotDataUrl,
        transactionRef: cleanTxId || payment.payment_reference,
        payment_reference: payment.payment_reference,
        payment_provider: 'payoneer',
        paymentSubmittedAt: nowIso,
        rejectionReason: null,
        updatedAt: nowIso,
        paymentDetails: {
          plan: payment.plan_id,
          amount: payment.amount,
          paymentMethod: 'Payoneer',
          referenceNumber: payment.payment_reference,
          transactionRef: cleanTxId || payment.payment_reference,
          paymentScreenshot: screenshotDataUrl,
          customerNote: cleanNote,
          paymentDate: nowIso
        }
      })

      await logPaymentAudit({
        payment_id: payment.id,
        payment_reference: payment.payment_reference,
        business_id: payment.business_id,
        action: 'screenshot_submitted',
        notes: `Customer uploaded screenshot proof (Tx ID: ${cleanTxId || 'N/A'})`
      })
    } catch (err) {
      console.warn('Error updating payment proof in Firestore:', err)
    }
  }

  return { success: true, payment }
}

/**
 * Admin action: Approve Payment and activate plan entitlements
 */
export async function approvePayment(
  paymentIdOrBizId: string,
  adminId: string = 'admin-master'
): Promise<{ success: boolean; message: string; payment?: PaymentRecord }> {
  let payment = await findPaymentByIdOrRef(paymentIdOrBizId)
  if (!payment) {
    // Try finding by business ID
    payment = await findActivePaymentForBusiness(paymentIdOrBizId)
  }

  const nowIso = new Date().toISOString()

  if (payment) {
    payment.payment_status = 'PAID'
    payment.verified_at = nowIso
    payment.verified_by = adminId

    const mIdx = memoryPaymentsCache.findIndex(p => p.id === payment!.id)
    if (mIdx !== -1) memoryPaymentsCache[mIdx] = { ...payment }

    if (db) {
      try {
        await updateDoc(doc(db, 'payments', payment.id), {
          payment_status: 'PAID',
          verified_at: nowIso,
          verified_by: adminId,
          updated_at: nowIso
        })
      } catch (e) {
        console.warn('Firestore updateDoc payment error:', e)
      }
    }
  }

  const businessId = payment?.business_id || paymentIdOrBizId
  const plan: BusinessPlan = payment?.plan_id || 'review_1'
  const isAuthoritative = plan === 'authoritative_10'
  const isStandard = plan === 'priority_5'

  // Update business document with plan entitlements
  if (db && businessId) {
    try {
      const bizRef = doc(db, 'businesses', businessId)
      const bizSnap = await getDoc(bizRef)
      if (bizSnap.exists()) {
        const updates: Record<string, any> = {
          paymentStatus: 'PAID',
          paymentVerifiedAt: nowIso,
          paymentVerifiedBy: adminId,
          updatedAt: nowIso,
          plan,
          planName: BUSINESS_PLANS[plan].name,
          planPrice: BUSINESS_PLANS[plan].price,
          hasSinglePage: !isAuthoritative && !isStandard ? false : true,
          canEditProfile: isStandard || isAuthoritative,
          blog_post_entitled: isStandard || isAuthoritative,
          blog_posts_allowed: isAuthoritative ? 10 : (isStandard ? 5 : 0),
          blog_post_feature_enabled: isStandard || isAuthoritative,
          blog_post_feature_enabled_at: isStandard || isAuthoritative ? nowIso : null,
          enabled_by_admin_id: isStandard || isAuthoritative ? adminId : null
        }
        await updateDoc(bizRef, updates)
      }

      if (payment) {
        await logPaymentAudit({
          payment_id: payment.id,
          payment_reference: payment.payment_reference,
          business_id: businessId,
          action: 'approved',
          admin_id: adminId,
          notes: `Payment verified & approved. Activated entitlements for ${payment.plan_name}.`
        })
      }
    } catch (err) {
      console.warn('Firestore business entitlement update error:', err)
    }
  }

  return {
    success: true,
    message: 'Payment verified and approved successfully.',
    payment: payment || undefined
  }
}

/**
 * Admin action: Reject Payment with mandatory reason
 */
export async function rejectPayment(
  paymentIdOrBizId: string,
  reason: string,
  adminId: string = 'admin-master'
): Promise<{ success: boolean; message: string; payment?: PaymentRecord }> {
  if (!reason || !reason.trim()) {
    throw new Error('A rejection reason is mandatory.')
  }

  let payment = await findPaymentByIdOrRef(paymentIdOrBizId)
  if (!payment) {
    payment = await findActivePaymentForBusiness(paymentIdOrBizId)
  }

  const nowIso = new Date().toISOString()
  const cleanReason = sanitizeText(reason, 500)

  if (payment) {
    payment.payment_status = 'REJECTED'
    payment.rejected_at = nowIso
    payment.rejection_reason = cleanReason

    const mIdx = memoryPaymentsCache.findIndex(p => p.id === payment!.id)
    if (mIdx !== -1) memoryPaymentsCache[mIdx] = { ...payment }

    if (db) {
      try {
        await updateDoc(doc(db, 'payments', payment.id), {
          payment_status: 'REJECTED',
          rejected_at: nowIso,
          rejection_reason: cleanReason,
          updated_at: nowIso
        })
      } catch (e) {
        console.warn('Firestore payment reject error:', e)
      }
    }
  }

  const businessId = payment?.business_id || paymentIdOrBizId
  if (db && businessId) {
    try {
      const bizRef = doc(db, 'businesses', businessId)
      await updateDoc(bizRef, {
        paymentStatus: 'REJECTED',
        rejectionReason: cleanReason,
        rejectedAt: nowIso,
        updatedAt: nowIso
      })

      if (payment) {
        await logPaymentAudit({
          payment_id: payment.id,
          payment_reference: payment.payment_reference,
          business_id: businessId,
          action: 'rejected',
          admin_id: adminId,
          notes: `Payment rejected. Reason: ${cleanReason}`
        })
      }
    } catch (e) {
      console.warn('Firestore business rejection sync error:', e)
    }
  }

  return {
    success: true,
    message: 'Payment rejected.',
    payment: payment || undefined
  }
}

/**
 * Retrieve all payment records (for admin dashboard)
 */
export async function getAllPaymentRecords(): Promise<PaymentRecord[]> {
  if (!db) return memoryPaymentsCache

  try {
    const q = query(collection(db, 'payments'), orderBy('created_at', 'desc'), limit(200))
    const snap = await getDocs(q)
    const list: PaymentRecord[] = []
    snap.forEach(docSnap => {
      list.push(docSnap.data() as PaymentRecord)
    })

    if (list.length > 0) {
      memoryPaymentsCache = list
      return list
    }
  } catch (err) {
    console.warn('Error fetching all payments from Firestore:', err)
  }

  return memoryPaymentsCache
}

/**
 * Retrieve user's payment records (security: filtered to user)
 */
export async function getUserPaymentRecords(userId: string, email?: string): Promise<PaymentRecord[]> {
  if (!userId && !email) return []

  const results: PaymentRecord[] = []
  if (db) {
    try {
      if (userId) {
        const q1 = query(collection(db, 'payments'), where('user_id', '==', userId))
        const s1 = await getDocs(q1)
        s1.forEach(d => results.push(d.data() as PaymentRecord))
      }
      if (email) {
        const q2 = query(collection(db, 'payments'), where('user_email', '==', email.toLowerCase()))
        const s2 = await getDocs(q2)
        s2.forEach(d => {
          if (!results.some(r => r.id === d.id)) results.push(d.data() as PaymentRecord)
        })
      }
    } catch (e) {
      console.warn('Error fetching user payments from Firestore:', e)
    }
  }

  // Merge with memory cache
  memoryPaymentsCache.forEach(p => {
    if ((p.user_id === userId || (email && p.user_email?.toLowerCase() === email.toLowerCase())) && !results.some(r => r.id === p.id)) {
      results.push(p)
    }
  })

  return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * Find payment record by ID or payment reference
 */
export async function findPaymentByIdOrRef(idOrRef: string): Promise<PaymentRecord | null> {
  const norm = idOrRef.trim()
  const memMatch = memoryPaymentsCache.find(p => p.id === norm || p.payment_reference === norm)
  if (memMatch) return memMatch

  if (!db) return null

  try {
    const docRef = doc(db, 'payments', norm)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return snap.data() as PaymentRecord
    }

    const q = query(collection(db, 'payments'), where('payment_reference', '==', norm), limit(1))
    const qSnap = await getDocs(q)
    if (!qSnap.empty) {
      return qSnap.docs[0].data() as PaymentRecord
    }
  } catch (err) {
    console.warn('findPaymentByIdOrRef error:', err)
  }

  return null
}

/**
 * Find active payment for a business
 */
export async function findActivePaymentForBusiness(businessId: string): Promise<PaymentRecord | null> {
  const mem = memoryPaymentsCache.find(p => p.business_id === businessId)
  if (mem) return mem

  if (!db) return null

  try {
    const q = query(
      collection(db, 'payments'),
      where('business_id', '==', businessId),
      orderBy('created_at', 'desc'),
      limit(1)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      return snap.docs[0].data() as PaymentRecord
    }
  } catch (err) {
    console.warn('findActivePaymentForBusiness error:', err)
  }

  return null
}

/**
 * Audit log recording
 */
async function logPaymentAudit(log: Omit<PaymentAuditLog, 'id' | 'created_at'>) {
  if (!db) return
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const payload: PaymentAuditLog = {
      ...log,
      id,
      created_at: new Date().toISOString()
    }
    await setDoc(doc(db, 'payment_audit_logs', id), payload)
  } catch (e) {
    console.warn('logPaymentAudit error:', e)
  }
}

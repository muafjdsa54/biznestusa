'use client'

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Check, CheckCircle2, Clock, Copy, ExternalLink, Info, ShieldCheck, Upload, X } from 'lucide-react'
import { BUSINESS_PLANS, type BusinessPlan } from '@/lib/data'
import { toast } from 'sonner'
import TurnstileWidget from '@/components/turnstile-widget'
import type { UserSessionData } from '../add-business-client'
import type { AddBusinessFormData } from './types'

interface PaymentScreenPanelProps {
  copiedKey: string | null
  currentUser: UserSessionData | null
  customerNote: string
  errors: Record<string, string>
  formData: AddBusinessFormData
  handleScreenshotFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: FormEvent) => Promise<void>
  hasClickedCompletedPayment: boolean
  isSubmitting: boolean
  paymentScreenshotBase64: string | null
  payoneerReference: string
  payoneerTxId: string
  payoneerUrl: string
  selectedPlan: BusinessPlan
  selectedPlanConfig: (typeof BUSINESS_PLANS)[BusinessPlan]
  setCopiedKey: Dispatch<SetStateAction<string | null>>
  setCustomerNote: Dispatch<SetStateAction<string>>
  setHasClickedCompletedPayment: Dispatch<SetStateAction<boolean>>
  setPaymentScreenshotBase64: Dispatch<SetStateAction<string | null>>
  setPayoneerTxId: Dispatch<SetStateAction<string>>
  setSelectedPlan: Dispatch<SetStateAction<BusinessPlan>>
  setShowPaymentScreen: Dispatch<SetStateAction<boolean>>
  turnstileToken: string | null
  setTurnstileToken: Dispatch<SetStateAction<string | null>>
}

export default function PaymentScreenPanel({ copiedKey, currentUser, customerNote, errors, formData, handleScreenshotFileChange, handleSubmit, hasClickedCompletedPayment, isSubmitting, paymentScreenshotBase64, payoneerReference, payoneerTxId, payoneerUrl, selectedPlan, selectedPlanConfig, setCopiedKey, setCustomerNote, setHasClickedCompletedPayment, setPaymentScreenshotBase64, setPayoneerTxId, setSelectedPlan, setShowPaymentScreen, turnstileToken, setTurnstileToken }: PaymentScreenPanelProps) {
  return (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 animate-in fade-in-50">
                          {/* SUBMIT-TIME PAYMENT SCREEN — client-side state only (showPaymentScreen):
                              NO route, NO URL, NOT in the sitemap, NEVER submitted to IndexNow,
                              so it cannot be indexed on Google or Bing. /add-business itself
                              stays indexable. It renders ONLY after the user fills the whole
                              form and initiates submit — never as a gate to the form. */}
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              Payment Required to Submit
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                              Complete Payment to Submit Your Listing
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Choose a paid tier and upload your payment screenshot. Your listing is submitted only after payment proof is uploaded — only submissions with a verified payment are approved.
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
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full font-bold text-slate-700 text-xs">
                              Owner: {currentUser?.name || formData.ownerName || 'Representative'}
                            </span>
                          </div>

                          {/* 3 PLAN SELECTOR CARDS */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* PLAN 1: $1 BASIC PLAN */}
                            <div 
                              onClick={() => setSelectedPlan('review_1')}
                              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                selectedPlan === 'review_1'
                                  ? 'border-emerald-600 bg-emerald-50/40 shadow-lg ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                    Basic Plan
                                  </span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === 'review_1' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {selectedPlan === 'review_1' && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-extrabold text-slate-900">$1 Basic Plan</h3>
                                  <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-emerald-600">$1.00</span>
                                    <span className="text-xs text-slate-500">/ one-time review</span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                    <strong>Dedicated standalone page created</strong> for your business. Submit only — no edit access, no blog posts, no photo gallery.
                                  </p>
                                </div>

                                <ul className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Dedicated Single Page Created:</strong> Permanent company ownership URL (/business/[slug])</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Category List &amp; Grid View:</strong> Shows with &quot;View Full Profile&quot; action</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span>Submit only — no dashboard edit access</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span>No blog posts, no photo gallery</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* PLAN 2: $5 STANDARD PLAN */}
                            <div 
                              onClick={() => setSelectedPlan('priority_5')}
                              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                selectedPlan === 'priority_5'
                                  ? 'border-blue-600 bg-blue-50/40 shadow-lg ring-2 ring-blue-500/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-xs">
                                Recommended
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                    Standard Plan
                                  </span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === 'priority_5' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {selectedPlan === 'priority_5' && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-extrabold text-slate-900">$5 Standard Plan</h3>
                                  <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-blue-600">$5.00</span>
                                    <span className="text-xs text-slate-500">/ one-time review</span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                    <strong>Dedicated standalone page created</strong> to show business ownership. User dashboard profile &amp; business editing enabled.
                                  </p>
                                </div>

                                <ul className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Dedicated Single Page Created:</strong> Permanent company ownership URL (/business/[slug])</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Category List &amp; Grid View:</strong> Shows with "View Full Profile" action</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Dashboard Edit Option:</strong> Edit profile &amp; business info (applied after review)</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Publish up to 5 business articles</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Priority human verification badge</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* PLAN 3: $10 AUTHORITATIVE PLAN */}
                            <div 
                              onClick={() => setSelectedPlan('authoritative_10')}
                              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                selectedPlan === 'authoritative_10'
                                  ? 'border-indigo-600 bg-indigo-50/40 shadow-lg ring-2 ring-indigo-500/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-xs">
                                VIP Authority
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                                    Authoritative Plan
                                  </span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === 'authoritative_10' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {selectedPlan === 'authoritative_10' && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-extrabold text-slate-900">$10 Authoritative Plan</h3>
                                  <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-indigo-600">$10.00</span>
                                    <span className="text-xs text-slate-500">/ one-time review</span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                    WhatsApp VIP support, directory syndication, and <strong>10 blog posts every 60 days</strong>.
                                  </p>
                                </div>

                                <ul className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                    <span><strong>Dedicated Single Page Created:</strong> High-authority standalone profile</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                    <span><strong>10 Blog Posts per 60 Days:</strong> Rolling cycle quota (e.g. 7 created = 3 left; refreshes to 10 after 60 days)</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Dashboard Edit Option:</strong> Profile &amp; business updates applied after review</span>
                                  </li>
                                  
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Multiple High DA backlinks &amp; directory syndication</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Priority VIP Email &amp; WhatsApp concierge support</span>
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
                            <p className="text-xs leading-relaxed">
                              BizNest USA does not make false guarantees about search engine rankings. Review fees cover human editorial moderation, data accuracy verification, and publication tools. Payment does not guarantee automatic approval if submitted content violates safety policies.
                            </p>
                          </div>

                          {/* PAYMENT DETAILS & SCREENSHOT UPLOAD */}
                          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                              <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Secure payment processed through Payoneer</span>
                                </span>
                                <h4 className="font-extrabold text-slate-900 text-lg">Complete Your Payment</h4>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  You selected <strong>{selectedPlanConfig.name}</strong> — <strong className="text-blue-600">${selectedPlanConfig.price.toFixed(2)} USD</strong>.
                                </p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right self-start sm:self-auto">
                                <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Business Listing</span>
                                <span className="text-xs font-black text-slate-800 truncate max-w-[180px] block">
                                  {formData.businessName || 'Your Business'}
                                </span>
                              </div>
                            </div>

                            {/* UNIQUE PAYMENT REFERENCE CARD */}
                            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                  BizNestUSA Payment Reference
                                </span>
                                <p className="text-base sm:text-lg font-mono font-black text-blue-700 tracking-wider">
                                  {payoneerReference}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Please include this reference if Payoneer asks for a memo or payment note.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(payoneerReference)
                                    setCopiedKey('ref')
                                    toast.success('Payment reference copied to clipboard!')
                                    setTimeout(() => setCopiedKey(null), 2500)
                                  }
                                }}
                                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
                              >
                                {copiedKey === 'ref' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Copy Reference</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* STEP 1: PAY VIA PAYONEER BUTTON */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                                  <span>Complete payment securely through Payoneer</span>
                                </span>
                                <span className="text-xs font-bold text-slate-500">Official Checkout Link</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Click the button below to open Payoneer in a secure tab and complete your payment of <strong>${selectedPlanConfig.price.toFixed(2)} USD</strong>.
                              </p>
                              
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                                {payoneerUrl ? (
                                  <a
                                    href={payoneerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setHasClickedCompletedPayment(true)}
                                    className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-center"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Pay Securely with Payoneer (${selectedPlanConfig.price.toFixed(2)})</span>
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toast.info('Payoneer link is loading. Please check in a moment.')}
                                    className="flex-1 py-3 px-5 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                  >
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span>Loading Payoneer Link...</span>
                                  </button>
                                )}

                                {!hasClickedCompletedPayment && (
                                  <button
                                    type="button"
                                    onClick={() => setHasClickedCompletedPayment(true)}
                                    className="px-5 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                  >
                                    I&apos;ve Completed My Payment
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* STEP 2: CONFIRMATION & SCREENSHOT FORM (REVEALED WHEN USER HAS PAID OR READY) */}
                            {hasClickedCompletedPayment && (
                              <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-200 space-y-4 animate-in fade-in-50">
                                <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                                    <span>Upload Payment Confirmation &amp; Details</span>
                                  </span>
                                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                    Manual Verification Queue
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed">
                                  After completing the payment, return to BizNestUSA and upload your payment confirmation screenshot. Your payment will be manually verified by our team before your business listing is approved.
                                </p>

                                {/* OPTIONAL TRANSACTION ID */}
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Payoneer Transaction ID (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={payoneerTxId}
                                    onChange={(e) => setPayoneerTxId(e.target.value)}
                                    placeholder="e.g. 192837465 or Payoneer payment reference"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                                  />
                                </div>

                                {/* OPTIONAL CUSTOMER NOTE */}
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Customer Note (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={customerNote}
                                    onChange={(e) => setCustomerNote(e.target.value)}
                                    placeholder="e.g. Payment sent from company account or payer name"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                </div>

                                {/* SCREENSHOT UPLOAD (MANDATORY REQUIREMENT) */}
                                <div id="field-payment-screenshot">
                                  <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-slate-900">
                                      Upload Payment Screenshot / Receipt (Required to Complete Submission) *
                                    </label>
                                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                      Mandatory Proof
                                    </span>
                                  </div>

                                  {paymentScreenshotBase64 ? (
                                    <div className="p-3 bg-white border-2 border-emerald-500/50 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={paymentScreenshotBase64}
                                          alt="Screenshot preview"
                                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-xs"
                                        />
                                        <div>
                                          <p className="text-xs font-bold text-slate-900">Payment Receipt Attached</p>
                                          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for admin manual verification
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setPaymentScreenshotBase64(null)}
                                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                                        title="Remove screenshot"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="p-5 border-2 border-dashed border-amber-300 hover:border-blue-500 bg-amber-50/40 hover:bg-blue-50/30 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center group">
                                      <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-blue-100 flex items-center justify-center text-amber-700 group-hover:text-blue-600 transition">
                                        <Upload className="w-5 h-5" />
                                      </div>
                                      <span className="text-xs font-extrabold text-slate-800">
                                        Click to attach payment transfer screenshot *
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        Submission is unlocked once your payment receipt (PNG, JPG, WEBP, max 10MB) is uploaded.
                                      </span>
                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleScreenshotFileChange}
                                        className="hidden"
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {/* SUBMIT — HARD GATE: DISABLED UNTIL THE PAYMENT SCREENSHOT IS UPLOADED */}
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => setShowPaymentScreen(false)}
                              className="px-5 py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>Back to Edit Form</span>
                            </button>
                            <div className="flex flex-col items-end gap-1.5">
                              {errors.paymentScreenshot && (
                                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  {errors.paymentScreenshot}
                                </span>
                              )}
                              {!paymentScreenshotBase64 && (
                                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Upload your payment screenshot above to enable submission
                                </span>
                              )}
                              <TurnstileWidget onToken={setTurnstileToken} />
                              <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !paymentScreenshotBase64}
                                className={`px-8 py-3.5 min-h-[44px] text-white font-extrabold text-sm rounded-xl shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer ${
                                  !paymentScreenshotBase64
                                    ? 'bg-slate-400 opacity-60 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                }`}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>
                                  {isSubmitting
                                    ? 'Submitting...'
                                    : `Submit Business & Payment ($${selectedPlanConfig.price.toFixed(2)})`}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Mail, Star, HelpCircle, MessageCircle, CheckCircle2, Send, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export interface ReviewItem {
  id: string
  userName: string
  rating: number
  date: string
  comment: string
}

export interface FaqItem {
  question: string
  answer: string
}

interface ProfessionalHeroActionsProps {
  proName: string
  proUsername?: string
}

export function ProfessionalHeroActions({ proName, proUsername }: ProfessionalHeroActionsProps) {
  const [showContactModal, setShowContactModal] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderWhatsApp, setSenderWhatsApp] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!senderName.trim() || !senderEmail.trim() || !senderWhatsApp.trim() || !message.trim()) {
      toast.error('Please enter all required fields including your WhatsApp number.')
      return
    }

    setIsSubmitting(true)
    const inquiryPayload = {
      id: 'inq-' + Date.now(),
      proUsername: proUsername || 'professional',
      proName: proName || 'Professional Specialist',
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      senderWhatsApp: senderWhatsApp.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'new'
    }

    try {
      // 1. Direct Firestore write
      try {
        await setDoc(doc(db, 'professional_inquiries', inquiryPayload.id), inquiryPayload)
      } catch (firestoreErr) {
        console.warn('Direct Firestore save failed, fallback to API:', firestoreErr)
      }

      // 2. Server API sync
      const res = await fetch('/api/professionals/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryPayload)
      })

      toast.success(`Inquiry sent to ${proName}! They will reply to you on WhatsApp.`)
      setShowContactModal(false)
      setSenderName('')
      setSenderEmail('')
      setSenderWhatsApp('')
      setMessage('')
    } catch (err) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Contact Button Island trigger */}
      <button
        onClick={() => setShowContactModal(true)}
        className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
      >
        <Mail className="w-4 h-4" />
        <span>Contact Professional</span>
      </button>

      {/* Contact Inquiry Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 font-sans border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Send Inquiry to {proName}</h3>
                <p className="text-[11px] text-slate-500">Get a direct project estimate or hire {proName}</p>
              </div>
              <button onClick={() => setShowContactModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Robert Smith"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Your WhatsApp Number *</label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">Instant Reply</span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={senderWhatsApp}
                    onChange={(e) => setSenderWhatsApp(e.target.value)}
                    placeholder="e.g. (555) 234-5678 or +1 212 555 0199"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
                  />
                  <MessageCircle className="w-4 h-4 text-[#25D366] absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  The professional will reply to you on WhatsApp instantly.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Inquiry Message *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your project scope, timeline, or requirements..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

interface ProfessionalReviewsSectionProps {
  proName: string
  initialReviews: ReviewItem[]
}

export function ProfessionalReviewsSection({ proName, initialReviews }: ProfessionalReviewsSectionProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerRating, setReviewerRating] = useState(5)
  const [reviewerComment, setReviewerComment] = useState('')
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewerName || !reviewerComment) {
      toast.error('Please complete all review fields.')
      return
    }
    const newRev: ReviewItem = {
      id: 'rev-' + Date.now(),
      userName: reviewerName,
      rating: reviewerRating,
      date: 'Just now',
      comment: reviewerComment,
    }
    setReviews([newRev, ...reviews])
    setShowReviewModal(false)
    setReviewerName('')
    setReviewerComment('')
    toast.success('Thank you! Your review has been recorded.')
  }

  return (
    <>
      {/* Interactive Reviews Section */}
      <div id="professional-reviews-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Ratings & Client Reviews</h2>
            <p className="text-xs text-slate-500">Feedback from clients and colleagues on BizNest USA.</p>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Write a Review
          </button>
        </div>

        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-900">{rev.userName}</span>
                  <span className="text-slate-400">{rev.date}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No reviews submitted yet.</p>
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Write Review for {proName}</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Emily Davis"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Star Rating</label>
                <select
                  value={reviewerRating}
                  onChange={(e) => setReviewerRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-amber-600"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Below Average</option>
                  <option value={1}>1 Star - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Review *</label>
                <textarea
                  rows={4}
                  required
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  placeholder="Share your experience working with this professional..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export function ProfessionalFaqsSection({ faqs }: { faqs: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!faqs || faqs.length === 0) return null

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
      <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        <span>Frequently Asked Questions</span>
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full p-4 text-left font-bold text-xs text-slate-900 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span>{faq.question}</span>
              <span>{openFaq === idx ? '−' : '+'}</span>
            </button>
            {openFaq === idx && (
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProfessionalInteractiveActions(props: ProfessionalHeroActionsProps) {
  return <ProfessionalHeroActions {...props} />
}

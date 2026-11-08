'use client'

import { useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { isValidPersonName, validatePersonName, filterPersonNameInput } from '@/lib/validation'
import { submitBusinessReview } from '@/lib/review-service'

interface ReviewModalProps {
  businessName: string
  businessSlug?: string
  businessId?: string
  isOpen: boolean
  onClose: () => void
  onAddReview: (review: { id?: string; userName: string; rating: number; date: string; comment: string; status?: 'pending' | 'approved' | 'rejected' }) => void
}

function slugFromPathname(): string {
  if (typeof window === 'undefined') return ''
  const parts = window.location.pathname.split('/').filter(Boolean)
  // Detail pages live at /business/<slug>/
  return parts[0] === 'business' && parts[1] ? decodeURIComponent(parts[1]) : ''
}

export default function ReviewModal({ businessName, businessSlug, businessId, isOpen, onClose, onAddReview }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [userName, setUserName] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!userName.trim() || !comment.trim()) {
      toast.error('Please complete your name and review comment.')
      return
    }

    const nameVal = validatePersonName(userName)
    if (!nameVal.isValid) {
      toast.error(nameVal.error || 'Full Name must contain only alphabetic letters (no numbers like "232" or special symbols).')
      return
    }

    const slug = (businessSlug || '').trim() || slugFromPathname()
    if (!slug) {
      toast.error('Could not determine which business this review is for. Please reload the page and try again.')
      return
    }

    setIsSubmitting(true)
    try {
      // Persist first — nothing is toasted and the modal stays open on failure.
      // New reviews are saved as status 'pending' and are NOT public until
      // an admin approves them.
      const saved = await submitBusinessReview({
        businessSlug: slug,
        businessId,
        businessName,
        userName: userName.trim(),
        rating,
        comment: comment.trim(),
      })
      onAddReview({
        id: saved.id,
        userName: saved.userName,
        rating: saved.rating,
        date: 'Just now',
        comment: saved.comment,
        status: saved.status,
      })
      toast.success('Thank you! Your review has been submitted and is pending review.')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 font-sans">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Write a Review</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Share your authentic customer experience for <strong className="text-slate-900">{businessName}</strong>.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-700">{rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(filterPersonNameInput(e.target.value))}
                placeholder="e.g. Michael Roberts"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Alphabetic letters only (no numbers like &quot;232&quot;).</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Detailed Review *</label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe product quality, customer service, or pricing..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Posting…' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

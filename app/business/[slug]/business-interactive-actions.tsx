'use client'

import React, { useState } from 'react'
import { Share2, Bookmark, ShieldCheck, MessageSquare, ArrowUpDown, Star } from 'lucide-react'
import ClaimBusinessModal from '@/components/business/claim-business-modal'
import ReviewModal from '@/components/business/review-modal'
import { toast } from 'sonner'

export interface ReviewItem {
  id: string
  userName: string
  rating: number
  date: string
  comment: string
}

interface BusinessHeroActionsProps {
  businessName: string
  isClaimed: boolean
}

export function BusinessHeroActions({ businessName, isClaimed }: BusinessHeroActionsProps) {
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Business profile link copied to clipboard!')
    }
  }

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Removed from saved bookmarks' : 'Added to saved bookmarks!')
  }

  return (
    <>
      {/* Action Buttons inside Hero */}
      <div id="hero-action-buttons" className="flex items-center gap-2 w-full md:w-auto flex-wrap">
        <button
          onClick={handleShare}
          className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          title="Share Listing"
          aria-label="Share Listing"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleBookmark}
          className={`p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            isBookmarked ? 'bg-amber-500 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
          }`}
          title="Save Bookmark"
          aria-label="Save Bookmark"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {!isClaimed && (
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Claim Business</span>
          </button>
        )}
      </div>

      {/* Claim Business Modal */}
      <ClaimBusinessModal
        businessName={businessName}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </>
  )
}

interface BusinessReviewsSectionProps {
  businessName: string
  initialReviews: ReviewItem[]
  initialRating: number
  initialReviewCount: number
}

export function BusinessReviewsSection({
  businessName,
  initialReviews,
  initialRating,
  initialReviewCount,
}: BusinessReviewsSectionProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [rating, setRating] = useState(initialRating)
  const [reviewCount, setReviewCount] = useState(initialReviewCount)

  const handleAddReview = (newReview: { userName: string; rating: number; date: string; comment: string }) => {
    const updatedReviews = [{ id: 'rev-' + Date.now(), ...newReview }, ...reviews]
    const totalStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = Number((totalStars / updatedReviews.length).toFixed(1))

    setReviews(updatedReviews)
    setRating(avgRating)
    setReviewCount(updatedReviews.length)
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOrder === 'highest') return b.rating - a.rating
    if (sortOrder === 'lowest') return a.rating - b.rating
    return 0
  })

  return (
    <>
      {/* Reviews Interactive Controls & List */}
      <div id="reviews-interactive-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              {reviewCount > 0 ? (
                <>
                  <span className="text-2xl font-extrabold text-slate-900">{rating}</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-current' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">({reviewCount} total reviews)</span>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Star className="w-4 h-4 text-slate-300" />
                  <span>0 customer reviews</span>
                  <span className="text-slate-400">• Be the first to review</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
                aria-label="Sort Customer Reviews"
              >
                <option value="newest">Newest Reviews</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {sortedReviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No reviews written yet. Be the first to review {businessName}!
          </p>
        ) : (
          <div className="space-y-4">
            {sortedReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <span>{rev.userName}</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Reviewer
                    </span>
                  </span>
                  <div className="flex text-amber-400 text-xs">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block font-medium">{rev.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        businessName={businessName}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onAddReview={handleAddReview}
      />
    </>
  )
}

export default function BusinessInteractiveActions(props: BusinessHeroActionsProps) {
  return <BusinessHeroActions {...props} />
}


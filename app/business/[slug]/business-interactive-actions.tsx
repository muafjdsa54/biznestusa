'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Share2, Bookmark, ShieldCheck, MessageSquare, ArrowUpDown, Star } from 'lucide-react'
import { toast } from 'sonner'
import type { StoredBusinessReview } from '@/lib/review-service'

// Review/claim modals and the Firestore-backed review service load only on
// demand — the modals when opened, the fetch when the reviews section
// scrolls into view. That keeps the ~373 KiB Firebase client chunk out of
// the detail page's initial bundle (it was 200 KiB before reviews went real).
const ClaimBusinessModal = dynamic(() => import('@/components/business/claim-business-modal'), { ssr: false })
const ReviewModal = dynamic(() => import('@/components/business/review-modal'), { ssr: false })

function slugFromPathname(): string {
  if (typeof window === 'undefined') return ''
  const parts = window.location.pathname.split('/').filter(Boolean)
  // Detail pages live at /business/<slug>/
  return parts[0] === 'business' && parts[1] ? decodeURIComponent(parts[1]) : ''
}

function toReviewItem(r: StoredBusinessReview): ReviewItem {
  return {
    id: r.id,
    userName: r.userName,
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    comment: r.comment,
  }
}

export interface ReviewItem {
  id: string
  userName: string
  rating: number
  date: string
  comment: string
}

interface BusinessHeroActionsProps {
  businessName: string
  businessSlug?: string
  businessId?: string
  isClaimed: boolean
}

export function BusinessHeroActions({ businessName, businessSlug, businessId, isClaimed }: BusinessHeroActionsProps) {
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
        businessSlug={businessSlug}
        businessId={businessId}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </>
  )
}

interface BusinessReviewsSectionProps {
  businessName: string
  businessSlug?: string
  businessId?: string
  initialReviews: ReviewItem[]
  initialRating: number
  initialReviewCount: number
}

export function BusinessReviewsSection({
  businessName,
  businessSlug: businessSlugProp,
  businessId,
  initialReviews,
  initialRating,
  initialReviewCount,
}: BusinessReviewsSectionProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest')
  // initialReviews come from the APPROVED business doc, so they are approved
  // by construction. Reviews submitted through the modal land in the
  // business_reviews collection as status 'pending' and must never join
  // this public list (or the average) until an admin approves them.
  const [approvedExtraReviews, setApprovedExtraReviews] = useState<ReviewItem[]>([])
  // The author's own pending reviews — shown to the author only, never public.
  const [myPendingReviews, setMyPendingReviews] = useState<ReviewItem[]>([])
  const [businessSlug, setBusinessSlug] = useState(businessSlugProp || '')
  // Extra (Firestore) reviews load only once this section scrolls into
  // view — most visitors never get here, so the Firebase chunk is not
  // fetched for them at all.
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [reviewsVisible, setReviewsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setReviewsVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReviewsVisible(true)
          obs.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!businessSlugProp) {
      const fromPath = slugFromPathname()
      if (fromPath) setBusinessSlug(fromPath)
    }
  }, [businessSlugProp])

  useEffect(() => {
    if (!businessSlug || !reviewsVisible) return
    let cancelled = false
    import('@/lib/review-service').then(({ getApprovedReviewsForBusiness, getMyPendingReviewsForBusiness }) => {
      if (cancelled) return
      getApprovedReviewsForBusiness(businessSlug).then((list) => {
        if (!cancelled) setApprovedExtraReviews(list.map(toReviewItem))
      })
      getMyPendingReviewsForBusiness(businessSlug).then((list) => {
        if (!cancelled) setMyPendingReviews(list.map(toReviewItem))
      })
    })
    return () => {
      cancelled = true
    }
  }, [businessSlug, reviewsVisible])

  // Approved-only average: the stored aggregate (initialRating /
  // initialReviewCount, which already covers the embedded initialReviews)
  // plus any newly approved Firestore reviews. Pending reviews never count.
  const { approvedReviews, rating, reviewCount } = useMemo(() => {
    const approved = [...approvedExtraReviews, ...initialReviews]
    const totalCount = initialReviewCount + approvedExtraReviews.length
    const totalStars =
      initialRating * initialReviewCount +
      approvedExtraReviews.reduce((sum, r) => sum + r.rating, 0)
    return {
      approvedReviews: approved,
      rating: totalCount > 0 ? Number((totalStars / totalCount).toFixed(1)) : 0,
      reviewCount: totalCount,
    }
  }, [approvedExtraReviews, initialReviews, initialRating, initialReviewCount])

  const handleAddReview = (newReview: { id?: string; userName: string; rating: number; date: string; comment: string; status?: 'pending' | 'approved' | 'rejected' }) => {
    // The modal only calls this AFTER a successful Firestore write, and new
    // reviews are always 'pending'. Keep them out of the public list and
    // out of the average; show them to their author as pending only.
    if (newReview.status !== 'approved') {
      const pendingItem: ReviewItem = {
        id: newReview.id || 'rev-' + Date.now(),
        userName: newReview.userName,
        rating: newReview.rating,
        date: newReview.date,
        comment: newReview.comment,
      }
      setMyPendingReviews((prev) => [
        pendingItem,
        ...prev.filter((r) => r.id !== pendingItem.id),
      ])
      return
    }
    const approvedItem: ReviewItem = {
      id: newReview.id || 'rev-' + Date.now(),
      userName: newReview.userName,
      rating: newReview.rating,
      date: newReview.date,
      comment: newReview.comment,
    }
    setApprovedExtraReviews((prev) => [
      approvedItem,
      ...prev.filter((r) => r.id !== approvedItem.id),
    ])
  }

  const sortedReviews = [...approvedReviews].sort((a, b) => {
    if (sortOrder === 'highest') return b.rating - a.rating
    if (sortOrder === 'lowest') return a.rating - b.rating
    return 0
  })

  return (
    <>
      {/* Reviews Interactive Controls & List */}
      <div ref={sectionRef} id="reviews-interactive-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6 w-full">
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

        {myPendingReviews.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-amber-700">
              Your review{myPendingReviews.length > 1 ? 's are' : ' is'} pending review — only you can see {myPendingReviews.length > 1 ? 'them' : 'it'} until our team approves {myPendingReviews.length > 1 ? 'them' : 'it'}.
            </p>
            {myPendingReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <span>{rev.userName}</span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Pending review
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

        {sortedReviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No reviews yet. Be the first to review {businessName}! New reviews are checked by our team before they appear.
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
        businessSlug={businessSlug}
        businessId={businessId}
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


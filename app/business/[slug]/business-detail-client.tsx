'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, Building2, ShieldCheck, Star, Clock, Globe, Share2, Bookmark, CheckCircle2, MessageSquare, ArrowUpDown } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BusinessItem } from '@/lib/data'
import { getBusinessBySlug } from '@/lib/db-service'
import ClaimBusinessModal from '@/components/business/claim-business-modal'
import ReviewModal from '@/components/business/review-modal'
import { toast } from 'sonner'

export default function BusinessDetailClient({ slug }: { slug: string }) {
  const [biz, setBiz] = useState<BusinessItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest')

  useEffect(() => {
    async function loadData() {
      const data = await getBusinessBySlug(slug)
      if (data) {
        data.reviews = data.reviews || []
        data.reviewCount = data.reviews.length
      }
      setBiz(data)
      setLoading(false)
    }

    loadData()
  }, [slug])

  if (loading || !biz) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    )
  }

  const mapQuery = encodeURIComponent(`${biz.address || ''}, ${biz.city || ''}, United States`)
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed`

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Business profile link copied to clipboard!')
    }
  }

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Removed from saved bookmarks' : 'Added to saved bookmarks!')
  }

  const handleAddReview = (newReview: { userName: string; rating: number; date: string; comment: string }) => {
    if (biz) {
      const updatedReviews = [{ id: 'rev-' + Date.now(), ...newReview }, ...(biz.reviews || [])]
      const totalStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = Number((totalStars / updatedReviews.length).toFixed(1))

      setBiz({
        ...biz,
        rating: avgRating,
        reviewCount: updatedReviews.length,
        reviews: updatedReviews
      })
      toast.success('Thank you! Your review has been added to BizNest USA.')
    }
  }

  // Sorted reviews calculation
  const sortedReviews = [...(biz.reviews || [])].sort((a, b) => {
    if (sortOrder === 'highest') return b.rating - a.rating
    if (sortOrder === 'lowest') return a.rating - b.rating
    return 0 // Default insertion order (newest first)
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* Hero Cover Banner */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="h-64 sm:h-80 w-full relative">
          <img src={biz.coverImage} alt={biz.name} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <img
                src={biz.logo}
                alt={biz.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-2xl bg-white shrink-0"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {biz.category}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Open Now</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{biz.name}</span>
                  {biz.verified && (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  )}
                </h1>

                <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{biz.address || biz.city}</span>
                  <span>•</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {biz.rating} ({biz.reviewCount || sortedReviews.length} customer reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <button
                onClick={handleShare}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title="Share Listing"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleBookmark}
                className={`p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isBookmarked ? 'bg-amber-500 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
                title="Save Bookmark"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {!biz.isClaimed && (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim Business</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900">About {biz.name}</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{biz.description}</p>

              {biz.services && biz.services.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Products & Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {biz.services.map((service) => (
                      <span key={service} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800">
                        ✓ {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Location Map</span>
              </h2>
              <iframe
                src={mapSrc}
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="w-full rounded-xl border border-slate-200"
              />
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Direct Actions</h3>
              
              <div className="space-y-2.5">
                <a
                  href={`tel:${biz.phone}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {biz.phone}</span>
                </a>

                {biz.whatsapp && (
                  <a
                    href={`https://wa.me/${biz.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                )}

                {biz.email && (
                  <a
                    href={`mailto:${biz.email}`}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </a>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Operating Hours</span>
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(biz.operatingHours || {}).map(([day, hours]) => (
                  <div key={day} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{day}</span>
                    <span className="font-bold text-slate-900">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Reviews Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Database Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{biz.rating}</span>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-xs text-slate-500 font-medium">({sortedReviews.length} total reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
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
            <p className="text-xs text-slate-500 italic text-center py-4">No reviews written yet. Be the first to review {biz.name}!</p>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{rev.userName}</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Verified Reviewer</span>
                    </span>
                    <div className="flex text-amber-400 text-xs">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">{rev.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Claim Business Modal */}
      <ClaimBusinessModal
        businessName={biz.name}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />

      {/* Review Modal */}
      <ReviewModal
        businessName={biz.name}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onAddReview={handleAddReview}
      />

      <Footer />
    </div>
  )
}

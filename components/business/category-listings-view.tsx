'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Building2, MapPin, Phone, Star, ShieldCheck, Clock, ArrowRight, 
  Briefcase, LayoutGrid, List, ExternalLink, CheckCircle2, Sparkles, Award
} from 'lucide-react'
import { BusinessItem } from '@/lib/data'

interface CategoryListingsViewProps {
  businesses: BusinessItem[]
  categoryName?: string
  cityName?: string
  subCategoryTitle?: string
}

export default function CategoryListingsView({
  businesses,
  categoryName,
  cityName,
  subCategoryTitle
}: CategoryListingsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Filter strictly approved businesses as required
  const approvedListings = businesses.filter(b => (b.status || 'approved').toLowerCase() === 'approved')

  if (approvedListings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-xs space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-lg font-extrabold text-slate-900">No approved businesses listed yet.</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Be one of the first verified businesses in {categoryName || 'this category'}{cityName ? ` in ${cityName}` : ''}. Gain early local visibility and give customers in your area a direct way to discover your services.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/add-business"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>List Your Business</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* HEADER WITH VIEW MODE TOGGLE (LIST VIEW / GRID VIEW) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>
              Verified {categoryName || 'Business'} Listings ({approvedListings.length})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin verified local businesses across the United States.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List View"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW (MATCHING HOUZZ / USER SCREENSHOT ARCHITECTURE) */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {approvedListings.map((biz) => {
            const isSeed = biz.source_type === 'seed_research' || biz.ownership_status === 'directory_seed'
            const isBasicPlan = !isSeed && (biz.plan === 'review_1' || biz.hasSinglePage === false)
            const isAuthoritative = biz.plan === 'authoritative_10'
            const isStandard = biz.plan === 'priority_5' && !isSeed

            // Format hours snippet
            const hoursSnippet = biz.operatingHours 
              ? (biz.operatingHours['Monday - Friday'] || biz.operatingHours['Monday - Saturday'] || biz.operatingHours['General Hours'] || biz.operatingHours['Monday'] || 'Mon-Sat 9AM-6PM')
              : (typeof biz.hours === 'string' ? biz.hours : 'Hours on official site')

            return (
              <div
                key={biz.id || biz.slug}
                className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs hover:shadow-md flex flex-col md:flex-row items-stretch ${
                  isAuthoritative 
                    ? 'border-blue-300 ring-2 ring-blue-500/10' 
                    : isStandard 
                    ? 'border-slate-200/90' 
                    : 'border-slate-200/70 bg-slate-50/20'
                }`}
              >
                {/* LEFT PHOTO COLUMN (Matching Screenshot) */}
                <div className="md:w-64 lg:w-72 relative min-h-[180px] md:min-h-full bg-slate-100 shrink-0">
                  <img
                    src={biz.coverImage || biz.logo || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'}
                    alt={biz.name}
                    className="w-full h-full object-cover absolute inset-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent md:hidden" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {isSeed ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <span>Unclaimed Listing</span>
                      </span>
                    ) : isAuthoritative ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Featured Partner</span>
                      </span>
                    ) : isStandard ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold tracking-wider backdrop-blur-xs">
                        Basic Listing
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT CONTENT COLUMN */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Header Row: Logo Avatar + Name + Rating */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {biz.logo ? (
                          <img
                            src={biz.logo}
                            alt={biz.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs mt-0.5"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                            {biz.name ? biz.name.charAt(0).toUpperCase() : 'B'}
                          </div>
                        )}
                        <div>
                          {isBasicPlan ? (
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-1.5">
                              <span>{biz.name}</span>
                              {biz.verified && !isSeed && (
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                            </h3>
                          ) : (
                            <Link
                              href={`/business/${biz.slug}`}
                              className="font-extrabold text-slate-900 text-base sm:text-lg hover:text-blue-600 flex items-center gap-1.5 transition-colors group"
                            >
                              <span className="group-hover:underline">{biz.name}</span>
                              {biz.verified && !isSeed && (
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                            </Link>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {/* Stars Rating (no fake stars if 0 ratings) */}
                            {biz.rating > 0 && biz.reviewCount > 0 ? (
                              <div className="flex items-center gap-1 text-amber-600 text-xs font-extrabold">
                                <span className="text-slate-900 font-bold">{biz.rating.toFixed(1)}</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                                  ))}
                                </div>
                                <span className="text-slate-500 font-normal">
                                  ({biz.reviewCount} {biz.reviewCount === 1 ? 'Review' : 'Reviews'})
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 font-medium">
                                {isSeed ? 'Unclaimed Public Listing' : 'Verified Directory Listing'}
                              </span>
                            )}

                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-semibold text-slate-600">
                              {biz.subcategory || biz.subCategory || biz.category || categoryName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description Snippet */}
                    <div className="flex items-start gap-2 pt-1 text-xs text-slate-600 leading-relaxed">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-2">
                        {biz.description || `Verified professional service provider offering dedicated solutions in ${biz.city || 'United States'}.`}
                      </p>
                    </div>

                    {/* Meta Info: Location + Hours */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{biz.address || `${biz.city}, United States`}</span>
                      </div>
                      
                      {biz.hours && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-medium">Hours: {hoursSnippet}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Direct Contact Phone & Website */}
                    <div className="flex items-center gap-2">
                      {biz.phone && (
                        <a
                          href={`tel:${biz.phone}`}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{biz.phone}</span>
                        </a>
                      )}

                      {biz.website && !biz.website.includes('biznestusa.com') && (
                        <a
                          href={biz.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {biz.googleBusinessProfile && (
                        <a
                          href={biz.googleBusinessProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Verified Google Business Profile"
                          className="px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold rounded-xl border border-blue-200 transition flex items-center gap-1 text-[11px]"
                        >
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>Google Profile</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>

                    {/* View Profile Action */}
                    {isBasicPlan ? (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        Basic Directory Listing
                      </span>
                    ) : (
                      <Link
                        href={`/business/${biz.slug}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 group cursor-pointer"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* 2. GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {approvedListings.map((biz) => {
            const isSeed = biz.source_type === 'seed_research' || biz.ownership_status === 'directory_seed'
            const isBasicPlan = !isSeed && (biz.plan === 'review_1' || biz.hasSinglePage === false)
            const isAuthoritative = biz.plan === 'authoritative_10'

            const hoursSnippet = biz.operatingHours 
              ? (biz.operatingHours['Monday - Friday'] || biz.operatingHours['Monday - Saturday'] || biz.operatingHours['General Hours'] || biz.operatingHours['Monday'] || 'Mon-Sat 9AM-6PM')
              : (typeof biz.hours === 'string' ? biz.hours : 'Hours on official site')

            return (
              <div
                key={biz.id || biz.slug}
                className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isAuthoritative 
                    ? 'border-blue-300 ring-2 ring-blue-500/10' 
                    : 'border-slate-200/90'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Logo, Title & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {biz.logo ? (
                        <img
                          src={biz.logo}
                          alt={biz.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center shrink-0">
                          {biz.name ? biz.name.charAt(0).toUpperCase() : 'B'}
                        </div>
                      )}
                      <div className="min-w-0">
                        {isBasicPlan ? (
                          <h3 className="font-bold text-slate-900 text-base truncate flex items-center gap-1">
                            <span className="truncate">{biz.name}</span>
                            {biz.verified && !isSeed && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </h3>
                        ) : (
                          <Link
                            href={`/business/${biz.slug}`}
                            className="font-bold text-slate-900 text-base hover:text-blue-600 flex items-center gap-1 truncate transition-colors"
                          >
                            <span className="truncate">{biz.name}</span>
                            {biz.verified && !isSeed && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </Link>
                        )}
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {biz.city}, {biz.state_code || biz.state || biz.province || 'USA'}
                        </p>
                      </div>
                    </div>

                    {biz.rating > 0 && biz.reviewCount > 0 ? (
                      <div className="flex items-center gap-1 text-slate-700 text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span>{biz.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                        {isSeed ? 'Unclaimed' : 'Directory'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {biz.description}
                  </p>

                  {biz.hours && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{hoursSnippet}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  {biz.phone ? (
                    <a
                      href={`tel:${biz.phone}`}
                      className="font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{biz.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No phone listed</span>
                  )}

                  {isBasicPlan ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Directory Listing
                    </span>
                  ) : (
                    <Link
                      href={`/business/${biz.slug}`}
                      className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

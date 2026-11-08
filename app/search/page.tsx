'use client'

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ListingLogo } from '@/components/listing-logo'
import SearchFilters from '@/components/search/search-filters'
import { BusinessItem, JobItem, ProfessionalItem } from '@/lib/data'
import { getPublicJobPath } from '@/lib/job-url'
import Link from 'next/link'
import { 
  Search, MapPin, Building2, Briefcase, Users, Star, ArrowRight, 
  Grid, List, Filter, Plus, UserPlus, CheckCircle2 
} from 'lucide-react'

function parseSearchQuery(rawQuery: string): { keyword: string; location: string } {
  if (!rawQuery) return { keyword: '', location: '' }
  const inIndex = rawQuery.toLowerCase().indexOf(' in ')
  if (inIndex !== -1) {
    const keyword = rawQuery.substring(0, inIndex).trim()
    const location = rawQuery.substring(inIndex + 4).trim()
    return { keyword, location }
  }
  return { keyword: rawQuery.trim(), location: '' }
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawQ = searchParams.get('q') || ''
  const initialLocParam = searchParams.get('location') || searchParams.get('city') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialType = (searchParams.get('type') as 'businesses' | 'professionals' | 'jobs') || 'businesses'

  const parsed = useMemo(() => parseSearchQuery(rawQ), [rawQ])
  const initialKeyword = parsed.keyword || rawQ
  const initialLocation = initialLocParam || parsed.location

  const [activeTab, setActiveTab] = useState<'businesses' | 'professionals' | 'jobs'>(initialType)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [location, setLocation] = useState(initialLocation)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // Server-side search results (one page per request — the client never
  // downloads whole collections; see app/api/search/route.ts). The three
  // arrays below hold the CURRENT PAGE for the active tab only; the tab
  // badges use `counts` (server totals), not these page arrays.
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessItem[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<ProfessionalItem[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobItem[]>([])
  const [counts, setCounts] = useState({ businesses: 0, professionals: 0, jobs: 0 })
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  // First load + submit/tab/page changes fetch immediately; typing
  // debounces (see the effect below) so each keystroke is not a request.
  const fetchNowRef = useRef(true)
  const requestIdRef = useRef(0)

  const fetchResults = useCallback(async () => {
    const myId = ++requestIdRef.current
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (keyword.trim()) params.set('q', keyword.trim())
      if (location.trim()) params.set('location', location.trim())
      if (selectedCategory.trim()) params.set('category', selectedCategory.trim())
      params.set('type', activeTab)
      if (onlyVerified) params.set('verified', 'true')
      if (minRating > 0) params.set('minRating', String(minRating))
      params.set('page', String(page))
      const res = await fetch(`/api/search?${params.toString()}`)
      if (!res.ok) throw new Error(`Search failed: ${res.status}`)
      const data = await res.json()
      // Ignore stale responses from an earlier keystroke's request.
      if (requestIdRef.current !== myId) return
      if (data.type === 'professionals') {
        setFilteredProfessionals(data.results || [])
      } else if (data.type === 'jobs') {
        setFilteredJobs(data.results || [])
      } else {
        setFilteredBusinesses(data.results || [])
      }
      setCounts(data.counts || { businesses: 0, professionals: 0, jobs: 0 })
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Error fetching search data:', err)
    } finally {
      if (requestIdRef.current === myId) setLoading(false)
    }
  }, [keyword, location, selectedCategory, activeTab, onlyVerified, minRating, page])

  // Debounced search: typing waits 400ms; fetchNowRef (submit, tab or
  // page change) fetches immediately instead.
  useEffect(() => {
    if (fetchNowRef.current) {
      fetchNowRef.current = false
      fetchResults()
      return
    }
    const timer = setTimeout(fetchResults, 400)
    return () => clearTimeout(timer)
  }, [fetchResults])

  // Sync state with URL search parameters on route navigation
  useEffect(() => {
    const currentQ = searchParams.get('q') || ''
    const currentLoc = searchParams.get('location') || searchParams.get('city') || ''
    const currentCat = searchParams.get('category') || ''
    const currentType = searchParams.get('type') as 'businesses' | 'professionals' | 'jobs' | null

    const currentParsed = parseSearchQuery(currentQ)
    const nextKeyword = currentParsed.keyword || currentQ
    const nextLocation = currentLoc || currentParsed.location
    // Only overwrite state when the URL actually differs (typing must
    // never be reset to the stale URL value mid-keystroke).
    if (nextKeyword !== keyword) setKeyword(nextKeyword)
    if (nextLocation !== location) setLocation(nextLocation)
    if (currentCat !== selectedCategory) setSelectedCategory(currentCat)
    if (currentType && ['businesses', 'professionals', 'jobs'].includes(currentType) && currentType !== activeTab) {
      setActiveTab(currentType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])


  // Server totals for the active tab (from /api/search counts), so the
  // tab badges and the filters panel show the full match count, not
  // just the current page.
  const currentCount = activeTab === 'businesses'
    ? counts.businesses
    : activeTab === 'professionals'
    ? counts.professionals
    : counts.jobs

  const handleResetFilters = () => {
    setKeyword('')
    setLocation('')
    setSelectedCategory('')
    setOnlyVerified(false)
    setMinRating(0)
    setPage(1)
    fetchNowRef.current = true
    router.replace('/search')
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    if (selectedCategory.trim()) params.set('category', selectedCategory.trim())
    if (activeTab !== 'businesses') params.set('type', activeTab)
    setPage(1)
    fetchNowRef.current = true
    router.replace(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Directory Search Across the USA
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Discover verified businesses, individual professionals, and career vacancies.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-6 flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search name, category, title, or skill..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-2 px-3.5 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State, or ZIP code..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Three Connected Navigation Tabs */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setActiveTab('businesses'); setPage(1); fetchNowRef.current = true }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'businesses'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Businesses</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'businesses' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {counts.businesses}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('professionals'); setPage(1); fetchNowRef.current = true }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'professionals'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Professionals</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'professionals' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {counts.professionals}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('jobs'); setPage(1); fetchNowRef.current = true }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Jobs</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'jobs' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {counts.jobs}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="lg:hidden px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Filters */}
          <div className={`lg:col-span-3 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
            <SearchFilters
              activeTab={activeTab}
              selectedLocation={location}
              selectedCategory={selectedCategory}
              onlyVerified={onlyVerified}
              minRating={minRating}
              onLocationChange={setLocation}
              onCategoryChange={setSelectedCategory}
              onVerifiedChange={setOnlyVerified}
              onRatingChange={setMinRating}
              onReset={handleResetFilters}
              totalCount={currentCount}
            />
          </div>

          {/* Right Results Grid */}
          <div className="lg:col-span-9 space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
                Searching real listings...
              </div>
            ) : activeTab === 'businesses' ? (
              filteredBusinesses.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                  {filteredBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <ListingLogo
                            name={biz.name}
                            src={biz.logo}
                            size={40}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <Link href={`/business/${biz.slug}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 truncate block">
                              {biz.name}
                            </Link>
                            <p className="text-[11px] text-slate-500 truncate">{biz.category} • {biz.city}, {biz.state || biz.province || 'USA'}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {biz.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">{biz.phone || 'Phone upon request'}</span>
                        <Link href={`/business/${biz.slug}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                          <span>View Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">No businesses found in this category yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your keyword or location filter, or be the first to list your company!
                  </p>
                  <Link
                    href="/add-business"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>List Your Business</span>
                  </Link>
                </div>
              )
            ) : activeTab === 'professionals' ? (
              filteredProfessionals.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                  {filteredProfessionals.map((pro) => (
                    <div
                      key={pro.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <ListingLogo
                            name={pro.name}
                            src={pro.avatar}
                            size={40}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <Link href={`/professionals/${pro.username}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 truncate block">
                              {pro.name}
                            </Link>
                            <p className="text-[11px] text-slate-500 truncate">{pro.profession}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {pro.bio}
                        </p>

                        {pro.skills && pro.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {pro.skills.slice(0, 3).map((s) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{pro.city}, {pro.state || 'USA'}</span>
                        <Link href={`/professionals/${pro.username}`} className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                          <span>View Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">No professionals found matching your search</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try different keywords or create your own professional portfolio profile.
                  </p>
                  <Link
                    href="/add-professional"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Professional Profile</span>
                  </Link>
                </div>
              )
            ) : (
              filteredJobs.length > 0 ? (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <ListingLogo
                          name={job.company}
                          src={job.companyLogo}
                          size={40}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <Link href={getPublicJobPath(job)} className="font-bold text-slate-900 text-sm hover:text-blue-600 block">
                            {job.title}
                          </Link>
                          <p className="text-[11px] text-slate-500">
                            {job.company} • {job.city}, {job.state || 'USA'} • <span className="font-medium text-emerald-700">{job.workplaceType || job.type}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs font-semibold text-slate-900">{job.salary}</span>
                        <Link
                          href={getPublicJobPath(job)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">No jobs found matching your criteria</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Looking to hire talent in this field? Post a job vacancy for your business.
                  </p>
                  <Link
                    href="/post-job"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post a Job</span>
                  </Link>
                </div>
              )
            )}

            {/* Server-side pagination (50 results per page) */}
            {!loading && currentCount > 0 && totalPages > 1 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages} · {currentCount} result{currentCount === 1 ? '' : 's'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => { setPage(page - 1); fetchNowRef.current = true }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => { setPage(page + 1); fetchNowRef.current = true }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
        Loading directory search...
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

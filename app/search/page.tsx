'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Image from 'next/image'
import SearchFilters from '@/components/search/search-filters'
import { BusinessItem, JobItem, ProfessionalItem } from '@/lib/data'
import { getAllBusinesses } from '@/lib/db-service'
import { getAllJobs } from '@/lib/job-service'
import { getAllProfessionals } from '@/lib/professional-service'
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

  // Real Database Lists
  const [businessesList, setBusinessesList] = useState<BusinessItem[]>([])
  const [jobsList, setJobsList] = useState<JobItem[]>([])
  const [professionalsList, setProfessionalsList] = useState<ProfessionalItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAllData() {
      setLoading(true)
      try {
        const [bizData, jobsData, prosData] = await Promise.all([
          getAllBusinesses().catch(() => [] as BusinessItem[]),
          getAllJobs().catch(() => [] as JobItem[]),
          getAllProfessionals().catch(() => [] as ProfessionalItem[])
        ])
        setBusinessesList((bizData || []).filter(b => b.status === 'approved' || !b.status))
        setJobsList((jobsData || []).filter(j => j.status === 'approved' || !j.status))
        setProfessionalsList((prosData || []).filter(p => p.status === 'approved' || !p.status))
      } catch (err) {
        console.error('Error fetching search data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAllData()
  }, [])

  // Sync state with URL search parameters on route navigation
  useEffect(() => {
    const currentQ = searchParams.get('q') || ''
    const currentLoc = searchParams.get('location') || searchParams.get('city') || ''
    const currentCat = searchParams.get('category') || ''
    const currentType = searchParams.get('type') as 'businesses' | 'professionals' | 'jobs' | null

    const currentParsed = parseSearchQuery(currentQ)
    setKeyword(currentParsed.keyword || currentQ)
    setLocation(currentLoc || currentParsed.location)
    setSelectedCategory(currentCat)
    if (currentType && ['businesses', 'professionals', 'jobs'].includes(currentType)) {
      setActiveTab(currentType)
    }
  }, [searchParams])

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    return businessesList.filter(biz => {
      const q = keyword.toLowerCase().trim()
      const loc = location.toLowerCase().trim()

      const matchesKeyword = !q ||
        biz.name.toLowerCase().includes(q) ||
        (biz.description || '').toLowerCase().includes(q) ||
        (biz.category || '').toLowerCase().includes(q) ||
        (biz.categoryId || '').toLowerCase().includes(q) ||
        (biz.subCategory || '').toLowerCase().includes(q) ||
        (biz.subcategory || '').toLowerCase().includes(q) ||
        (biz.secondaryCategories && biz.secondaryCategories.some(sc => sc.toLowerCase().includes(q))) ||
        (biz.services && biz.services.some(s => s.toLowerCase().includes(q)))

      const matchesLocation = !loc ||
        (biz.city || '').toLowerCase().includes(loc) ||
        (biz.state || '').toLowerCase().includes(loc) ||
        (biz.province || '').toLowerCase().includes(loc) ||
        (biz.address || '').toLowerCase().includes(loc) ||
        (biz.zipCode || '').toLowerCase().includes(loc) ||
        (biz.cities && biz.cities.some(c => c.toLowerCase().includes(loc))) ||
        (biz.locations && biz.locations.some(l => 
          (l.city || '').toLowerCase().includes(loc) || 
          (l.state || '').toLowerCase().includes(loc) || 
          (l.address || '').toLowerCase().includes(loc)
        ))

      const selNorm = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')
      const catNorm = (biz.category || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const catIdNorm = (biz.categoryId || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const subCatNorm = (biz.subCategory || biz.subcategory || '').toLowerCase().replace(/[^a-z0-9]/g, '')

      const matchesCategory = !selectedCategory ||
        catNorm.includes(selNorm) ||
        selNorm.includes(catNorm) ||
        catIdNorm.includes(selNorm) ||
        selNorm.includes(catIdNorm) ||
        subCatNorm.includes(selNorm) ||
        (biz.secondaryCategories && biz.secondaryCategories.some(sc => sc.toLowerCase().replace(/[^a-z0-9]/g, '').includes(selNorm)))

      const matchesVerified = !onlyVerified || biz.verified
      const matchesRating = (biz.rating || 0) >= minRating

      return matchesKeyword && matchesLocation && matchesCategory && matchesVerified && matchesRating
    })
  }, [businessesList, keyword, location, selectedCategory, onlyVerified, minRating])

  // Filtered Professionals
  const filteredProfessionals = useMemo(() => {
    return professionalsList.filter(pro => {
      const q = keyword.toLowerCase().trim()
      const loc = location.toLowerCase().trim()

      const matchesKeyword = !q ||
        (pro.name || '').toLowerCase().includes(q) ||
        (pro.fullName || '').toLowerCase().includes(q) ||
        (pro.title || '').toLowerCase().includes(q) ||
        (pro.profession || '').toLowerCase().includes(q) ||
        (pro.specialization || '').toLowerCase().includes(q) ||
        (pro.bio || '').toLowerCase().includes(q) ||
        (pro.skills && pro.skills.some(s => s.toLowerCase().includes(q)))

      const matchesLocation = !loc ||
        (pro.city || '').toLowerCase().includes(loc) ||
        (pro.state || '').toLowerCase().includes(loc) ||
        (pro.province || '').toLowerCase().includes(loc) ||
        (pro.zipCode || '').toLowerCase().includes(loc) ||
        (pro.cities && pro.cities.some(c => c.toLowerCase().includes(loc)))

      const selNorm = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')
      const proCatNorm = (pro.category || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const proProfNorm = (pro.profession || '').toLowerCase().replace(/[^a-z0-9]/g, '')

      const matchesCategory = !selectedCategory ||
        proCatNorm.includes(selNorm) ||
        selNorm.includes(proCatNorm) ||
        proProfNorm.includes(selNorm) ||
        selNorm.includes(proProfNorm)

      const matchesVerified = !onlyVerified || pro.verified
      const matchesRating = (pro.rating || 0) >= minRating

      return matchesKeyword && matchesLocation && matchesCategory && matchesVerified && matchesRating
    })
  }, [professionalsList, keyword, location, selectedCategory, onlyVerified, minRating])

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobsList.filter(job => {
      const q = keyword.toLowerCase().trim()
      const loc = location.toLowerCase().trim()

      const matchesKeyword = !q ||
        (job.title || '').toLowerCase().includes(q) ||
        (job.company || '').toLowerCase().includes(q) ||
        (job.description || '').toLowerCase().includes(q) ||
        (job.category || '').toLowerCase().includes(q) ||
        (job.skills && job.skills.some(s => s.toLowerCase().includes(q)))

      const matchesLocation = !loc ||
        (job.city || '').toLowerCase().includes(loc) ||
        (job.state || '').toLowerCase().includes(loc) ||
        (job.country || '').toLowerCase().includes(loc) ||
        (job.workplaceType || '').toLowerCase().includes(loc) ||
        (job.cities && job.cities.some(c => c.toLowerCase().includes(loc)))

      const selNorm = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')
      const jobCatNorm = (job.category || '').toLowerCase().replace(/[^a-z0-9]/g, '')

      const matchesCategory = !selectedCategory ||
        jobCatNorm.includes(selNorm) ||
        selNorm.includes(jobCatNorm)

      const matchesVerified = !onlyVerified || (job.verified ?? true)

      return matchesKeyword && matchesLocation && matchesCategory && matchesVerified
    })
  }, [jobsList, keyword, location, selectedCategory, onlyVerified])

  const currentCount = activeTab === 'businesses'
    ? filteredBusinesses.length
    : activeTab === 'professionals'
    ? filteredProfessionals.length
    : filteredJobs.length

  const handleResetFilters = () => {
    setKeyword('')
    setLocation('')
    setSelectedCategory('')
    setOnlyVerified(false)
    setMinRating(0)
    router.replace('/search')
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    if (selectedCategory.trim()) params.set('category', selectedCategory.trim())
    if (activeTab !== 'businesses') params.set('type', activeTab)
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
                onClick={() => setActiveTab('businesses')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'businesses'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Businesses</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'businesses' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {filteredBusinesses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('professionals')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'professionals'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Professionals</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'professionals' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {filteredProfessionals.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Jobs</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'jobs' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {filteredJobs.length}
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
                          <Image
                            src={biz.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                            alt={biz.name}
                            width={40}
                            height={40}
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
                          <Image
                            src={pro.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={pro.name}
                            width={40}
                            height={40}
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
                        <Image
                          src={job.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                          alt={job.company}
                          width={40}
                          height={40}
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

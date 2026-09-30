'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ProfessionalItem, TOP_CITIES, US_STATES } from '@/lib/data'
import { getAllProfessionals } from '@/lib/professional-service'
import Link from 'next/link'
import { 
  Users, MapPin, Search, ShieldCheck, Star, ArrowRight, Award, CheckCircle2, 
  Linkedin, Briefcase, Filter, Sparkles, UserPlus, Globe, Check,
  LayoutDashboard, LogIn, UserCheck
} from 'lucide-react'

const QUICK_PROFESSIONS = [
  'All Professions',
  'Software Engineer',
  'Full Stack Developer',
  'Physician / Doctor',
  'Accountant / CPA',
  'Attorney / Lawyer',
  'UI/UX Designer',
  'Marketing Specialist',
  'Electrician',
  'General Contractor'
]

function ProfessionalsContent() {
  const searchParams = useSearchParams()
  const qParam = searchParams.get('q') || searchParams.get('keyword') || ''
  const cityParam = searchParams.get('city') || searchParams.get('location') || ''
  const categoryParam = searchParams.get('category') || ''
  const professionParam = searchParams.get('profession') || ''

  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userSession, setUserSession] = useState<{ name?: string; email?: string; username?: string; hasProfile?: boolean } | null>(null)

  // Search & Filters
  const [query, setQuery] = useState(qParam)
  const [selectedCity, setSelectedCity] = useState(cityParam)
  const [selectedProfession, setSelectedProfession] = useState(professionParam || categoryParam || 'All Professions')
  const [selectedAvailability, setSelectedAvailability] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'name'>('rating')

  // Sync state when URL search parameters change
  useEffect(() => {
    const qP = searchParams.get('q') || searchParams.get('keyword') || ''
    const cityP = searchParams.get('city') || searchParams.get('location') || ''
    const catP = searchParams.get('category') || ''
    const profP = searchParams.get('profession') || ''

    if (qP !== undefined) setQuery(qP)
    if (cityP !== undefined) setSelectedCity(cityP)
    if (profP || catP) setSelectedProfession(profP || catP)
  }, [searchParams])

  useEffect(() => {
    try {
      const sess = sessionStorage.getItem('biznestusa_user_session') || localStorage.getItem('biznestusa_user_session') || sessionStorage.getItem('listpak_user_session') || localStorage.getItem('listpak_user_session')
      if (sess) {
        setUserSession(JSON.parse(sess))
      }
    } catch (e) {}

    async function loadData() {
      setLoading(true)
      try {
        const data = await getAllProfessionals(false)
        setProfessionals(data)
      } catch (err) {
        console.error('Error fetching professionals:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Multi-facet filtering logic
  const filtered = professionals.filter(pro => {
    const q = query.toLowerCase().trim()
    const matchesQuery = !q || 
      pro.name.toLowerCase().includes(q) ||
      (pro.fullName && pro.fullName.toLowerCase().includes(q)) ||
      pro.title.toLowerCase().includes(q) ||
      pro.profession.toLowerCase().includes(q) ||
      (pro.specialization && pro.specialization.toLowerCase().includes(q)) ||
      (pro.category && pro.category.toLowerCase().includes(q)) ||
      (pro.bio && pro.bio.toLowerCase().includes(q)) ||
      (Array.isArray(pro.skills) && pro.skills.some((s: string) => s.toLowerCase().includes(q))) ||
      (Array.isArray(pro.education) ? pro.education.some((e: any) => (e.degree?.toLowerCase().includes(q) || e.institution?.toLowerCase().includes(q))) : (typeof pro.education === 'string' && pro.education.toLowerCase().includes(q)))

    const matchesCity = !selectedCity || 
      pro.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
      (pro.state && pro.state.toLowerCase().includes(selectedCity.toLowerCase())) ||
      (pro.cities && pro.cities.some(c => c.toLowerCase().includes(selectedCity.toLowerCase())))

    const profNorm = selectedProfession.toLowerCase().replace(/[^a-z0-9]/g, '')
    const matchesProfession = selectedProfession === 'All Professions' || 
      (pro.profession || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(profNorm) ||
      profNorm.includes((pro.profession || '').toLowerCase().replace(/[^a-z0-9]/g, '')) ||
      (pro.category || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(profNorm) ||
      profNorm.includes((pro.category || '').toLowerCase().replace(/[^a-z0-9]/g, '')) ||
      (pro.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(profNorm)

    const matchesAvailability = !selectedAvailability || (pro.availability && pro.availability.toLowerCase().includes(selectedAvailability.toLowerCase()))
    const isV = pro.verified === true || pro.verificationStatus === 'VERIFIED'
    const matchesVerified = verificationFilter === 'all' || (verificationFilter === 'verified' ? isV : !isV)

    return matchesQuery && matchesCity && matchesProfession && matchesAvailability && matchesVerified
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5)
    if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                <Users className="w-3.5 h-3.5" />
                <span>United States Professional & Talent Network</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Verified Professionals & Subject Matter Experts
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Discover software engineers, physicians, certified accountants, attorneys, designers, marketing specialists, and skilled professionals across the United States.
              </p>
            </div>

            {/* User Action CTA: Dashboard or Registration */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              {userSession ? (
                <Link
                  href="/dashboard/professional"
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Professional Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Link
                    href="/register/professional"
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Professional Profile</span>
                  </Link>
                  <Link
                    href="/login?role=professional"
                    className="px-4 py-3 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-blue-400" />
                    <span>Dashboard Login</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, profession, skill (e.g. React, Physician, Tax)..."
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
              >
                <option value="">All US Locations</option>
                {selectedCity && !TOP_CITIES.includes(selectedCity) && !(US_STATES as readonly string[]).includes(selectedCity) && (
                  <option value={selectedCity}>{selectedCity}</option>
                )}
                <optgroup label="Top Metros">
                  {TOP_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
                <optgroup label="US States">
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="md:col-span-4 flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
              >
                <option value="">All Availability</option>
                <option value="Open to Work">Open to Work (Full-time)</option>
                <option value="Freelance">Freelance / Contracts</option>
                <option value="Consulting">Consulting / In-Clinic</option>
              </select>
            </div>
          </div>

          {/* Quick Profession Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            {QUICK_PROFESSIONS.map(p => (
              <button
                key={p}
                onClick={() => setSelectedProfession(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedProfession === p
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              United States Professionals Directory ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500">Approved professional profiles indexed across all 50 states.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* 3-way Verification Filter */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl font-bold">
              <button
                onClick={() => setVerificationFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  verificationFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setVerificationFilter('verified')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  verificationFilter === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified (✓)</span>
              </button>
              <button
                onClick={() => setVerificationFilter('unverified')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  verificationFilter === 'unverified' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Unverified (✕)
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="experience">Sort: Most Experience</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12 text-center">
            <div className="col-span-full text-slate-400 text-sm">Loading professional profiles...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No professionals found matching your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Try clearing search terms or selected city to view all profiles.</p>
            <button
              onClick={() => { setQuery(''); setSelectedCity(''); setSelectedProfession('All Professions'); setVerificationFilter('all') }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pro) => {
              const isVer = pro.verified === true || pro.verificationStatus === 'VERIFIED'
              return (
                <div
                  key={pro.username}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-4">
                    {/* Top Profile Header */}
                    <div className="flex items-start gap-4">
                      <Image
                        src={pro.avatar}
                        alt={pro.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        sizes="64px"
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0"
                      />
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/professionals/${pro.username}`}
                            className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors truncate"
                          >
                            {pro.name}
                          </Link>
                          {isVer ? (
                            <span title="Verified Professional">
                              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                            </span>
                          ) : (
                            <span
                              title="Not Verified"
                              className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200"
                            >
                              ✕ Not Verified
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-blue-600 line-clamp-1">{pro.title}</p>
                        
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {pro.city}
                          </span>
                          <span>•</span>
                          <span className="font-extrabold text-amber-500 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {pro.rating}
                          </span>
                          <span>•</span>
                          <span className="text-slate-600 font-semibold">{pro.experienceYears}y Exp</span>
                        </div>
                      </div>
                    </div>

                    {/* Short Bio */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {pro.bio}
                    </p>

                    {/* Skills Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pro.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {skill}
                        </span>
                      ))}
                      {pro.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-bold">+{pro.skills.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with LinkedIn & CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pro.linkedin && (
                        <a
                          href={pro.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View LinkedIn Profile"
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <span className="text-xs font-extrabold text-slate-900">{pro.hourlyRate}</span>
                    </div>

                    <Link
                      href={`/professionals/${pro.username}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 shadow-xs"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Registered User Floating Quick Dashboard Access Bar */}
      {userSession && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <Link
            href="/dashboard/professional"
            className="px-4 py-3 bg-slate-900/95 backdrop-blur-md hover:bg-slate-800 text-white text-xs font-extrabold rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-2.5 transition-all hover:scale-105 group"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-3.5 h-3.5" />
            </div>
            <span>My Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function ProfessionalsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">
        Loading professionals directory...
      </div>
    }>
      <ProfessionalsContent />
    </Suspense>
  )
}

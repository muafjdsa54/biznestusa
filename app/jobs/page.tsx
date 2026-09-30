'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { JobItem, TOP_CITIES, US_STATES } from '@/lib/data'
import { getAllJobs } from '@/lib/job-service'
import Link from 'next/link'
import { Briefcase, MapPin, Search, Filter, Plus } from 'lucide-react'
import JobCardExpandable from '@/components/jobs/job-card-expandable'

function JobsContent() {
  const searchParams = useSearchParams()
  const qParam = searchParams.get('q') || searchParams.get('keyword') || ''
  const cityParam = searchParams.get('city') || searchParams.get('location') || ''
  const typeParam = searchParams.get('type') || ''
  const categoryParam = searchParams.get('category') || ''

  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState(qParam || categoryParam)
  const [selectedType, setSelectedType] = useState<string>(typeParam)
  const [selectedCity, setSelectedCity] = useState<string>(cityParam)

  // Sync state when URL search parameters change
  useEffect(() => {
    const qP = searchParams.get('q') || searchParams.get('keyword') || ''
    const cityP = searchParams.get('city') || searchParams.get('location') || ''
    const typeP = searchParams.get('type') || ''
    const catP = searchParams.get('category') || ''

    if (qP || catP) setQuery(qP || catP)
    if (cityP) setSelectedCity(cityP)
    if (typeP) setSelectedType(typeP)
  }, [searchParams])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const data = await getAllJobs(false)
        setJobs(data)
      } catch (err) {
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredJobs = jobs.filter(job => {
    const q = query.toLowerCase().trim()
    const matchesQuery = !q || 
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      (job.description && job.description.toLowerCase().includes(q)) ||
      (job.category && job.category.toLowerCase().includes(q)) ||
      (job.skills || []).some(s => s.toLowerCase().includes(q))
    
    const matchesType = !selectedType || job.type.toLowerCase() === selectedType.toLowerCase() || (job.workplaceType && job.workplaceType.toLowerCase() === selectedType.toLowerCase())
    const matchesCity = !selectedCity || 
      job.city.toLowerCase().includes(selectedCity.toLowerCase()) || 
      (job.state && job.state.toLowerCase().includes(selectedCity.toLowerCase())) ||
      (job.cities && job.cities.some(c => c.toLowerCase().includes(selectedCity.toLowerCase())))

    return matchesQuery && matchesType && matchesCity
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* Jobs Hero Header */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>USA Employment Portal</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Find Your Next Career Opportunity
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
                Connect directly with verified American companies, local employers, and growing teams hiring across New York, Los Angeles, Chicago, and nationwide.
              </p>
            </div>

            <Link
              href="/post-job"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job Free</span>
            </Link>
          </div>

          {/* Job Search Input Bar */}
          <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, skill, or company..."
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
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
                  {TOP_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </optgroup>
                <optgroup label="US States">
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <Filter className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Jobs Listing Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <h2 className="text-xl font-extrabold text-slate-900">
            Open Vacancies ({filteredJobs.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Sorted by Recently Posted</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading job openings...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No open positions found</h3>
            <p className="text-xs text-slate-500">Try adjusting your keyword, city, or job type filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredJobs.map((job) => (
              <JobCardExpandable key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs text-slate-500">Loading jobs portal...</div>}>
      <JobsContent />
    </Suspense>
  )
}

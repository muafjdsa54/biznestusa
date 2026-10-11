'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { JobItem, TOP_CITIES, US_STATES } from '@/lib/data'
import { Briefcase, MapPin, Search, Filter, Plus } from 'lucide-react'
import JobCardExpandable from '@/components/jobs/job-card-expandable'

interface JobsDirectoryClientProps {
  initialJobs: JobItem[]
}

export default function JobsDirectoryClient({ initialJobs }: JobsDirectoryClientProps) {
  const searchParams = useSearchParams()
  const qParam = searchParams.get('q') || searchParams.get('keyword') || ''
  const cityParam = searchParams.get('city') || searchParams.get('location') || ''
  const typeParam = searchParams.get('type') || ''
  const categoryParam = searchParams.get('category') || ''

  const [jobs] = useState<JobItem[]>(initialJobs)
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
    <div className="space-y-8">
      {/* Search Input Bar */}
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

      {/* Main Jobs Listing Content */}
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <h2 className="text-xl font-extrabold text-slate-900">
            Open Vacancies ({filteredJobs.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Sorted by Recently Posted</span>
        </div>

        {filteredJobs.length === 0 ? (
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
      </div>
    </div>
  )
}

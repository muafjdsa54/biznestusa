'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Users, Briefcase } from 'lucide-react'
import CitySearchDropdown from '@/components/ui/city-search-dropdown'

export type SearchTab = 'businesses' | 'professionals' | 'jobs'

export default function HeroSearchForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SearchTab>('businesses')
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmedQuery = query.trim()
    const trimmedCity = city.trim()
    const params = new URLSearchParams()
    if (trimmedQuery) params.set('q', trimmedQuery)
    if (trimmedCity) params.set('city', trimmedCity)

    if (activeTab === 'businesses') {
      router.push(params.toString() ? `/search?${params.toString()}` : '/search')
    } else if (activeTab === 'professionals') {
      router.push(params.toString() ? `/professionals?${params.toString()}` : '/professionals')
    } else if (activeTab === 'jobs') {
      router.push(params.toString() ? `/jobs?${params.toString()}` : '/jobs')
    }
  }

  const tabPlaceholders = {
    businesses: 'Search businesses, contractors, services (e.g. Plumbers, Electricians)...',
    professionals: 'Search independent professionals, licensed trades, consultants...',
    jobs: 'Search job titles, roles, or hiring companies...'
  }

  return (
    <div className="mt-6 sm:mt-8 max-w-3xl mx-auto w-full">
      {/* Prominent Search Tabs */}
      <div className="flex items-center justify-center gap-2 mb-3" role="tablist" aria-label="Directory search modes">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'businesses'}
          onClick={() => setActiveTab('businesses')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'businesses'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Businesses</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'professionals'}
          onClick={() => setActiveTab('professionals')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'professionals'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Professionals</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'jobs'}
          onClick={() => setActiveTab('jobs')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs</span>
        </button>
      </div>

      {/* Main Search Bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200 p-2.5 sm:p-3.5 flex flex-col sm:flex-row gap-2.5"
        role="search"
        aria-label={`Search ${activeTab}`}
      >
        <div className="flex items-center gap-2.5 flex-1 px-3 py-1 bg-slate-50/80 rounded-xl border border-slate-100 focus-within:border-blue-300 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            id="search-query-input"
            name="q"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tabPlaceholders[activeTab]}
            className="flex-1 text-slate-900 placeholder-slate-400 bg-transparent outline-none text-xs sm:text-sm py-1.5 font-medium"
            aria-label="Search query"
          />
        </div>

        <div className="flex items-center gap-2 sm:w-60 px-3 py-1 bg-slate-50/80 rounded-xl border border-slate-100 focus-within:border-blue-300 focus-within:bg-white transition-all">
          <CitySearchDropdown
            value={city}
            onChange={setCity}
            placeholder="All US Cities / States"
            className="w-full"
            inputClassName="border-none focus:ring-0 py-1 pl-7 text-xs sm:text-sm bg-transparent font-medium text-slate-800"
          />
        </div>

        <button
          id="hero-search-submit"
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          aria-label={`Submit ${activeTab} search`}
        >
          <Search className="w-4 h-4" />
          <span>Find {activeTab === 'businesses' ? 'Businesses' : activeTab === 'professionals' ? 'Talent' : 'Jobs'}</span>
        </button>
      </form>
    </div>
  )
}

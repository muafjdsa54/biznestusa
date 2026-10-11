'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CompanyItem, TOP_CITIES } from '@/lib/data'
import { Building2, MapPin, Search, ShieldCheck, ArrowRight, Linkedin, Filter } from 'lucide-react'

interface CompaniesDirectoryClientProps {
  initialCompanies: CompanyItem[]
}

export default function CompaniesDirectoryClient({ initialCompanies }: CompaniesDirectoryClientProps) {
  const [companies] = useState<CompanyItem[]>(initialCompanies)
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [onlyVerified, setOnlyVerified] = useState(false)

  const filtered = companies.filter(c => {
    const q = query.toLowerCase().trim()
    const industry = c.industry || ''
    const matchesQuery = !q || c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q) || industry.toLowerCase().includes(q)
    const matchesCity = !selectedCity || c.city.toLowerCase() === selectedCity.toLowerCase()
    const matchesIndustry = !selectedIndustry || industry.toLowerCase().includes(selectedIndustry.toLowerCase())
    const matchesVerified = !onlyVerified || c.verified

    return matchesQuery && matchesCity && matchesIndustry && matchesVerified
  })

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company name or industry..."
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
            <option value="">All US Metros &amp; Cities</option>
            {TOP_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology &amp; IT</option>
            <option value="Construction">Construction &amp; Building</option>
            <option value="Healthcare">Healthcare &amp; Medical</option>
            <option value="Education">Education &amp; Training</option>
            <option value="Finance">Finance &amp; Banking</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900">
          Hiring Companies ({filtered.length})
        </h2>
        <span className="text-xs text-slate-500 font-medium">Verified US Employers</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No hiring companies match your search</h3>
          <p className="text-xs text-slate-500">Try broadening your city or industry filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((comp) => (
            <div key={comp.slug} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Image src={comp.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'} alt={comp.name} width={56} height={56} loading="lazy" sizes="56px" className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/companies/${comp.slug}`} className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors truncate">
                        {comp.name}
                      </Link>
                      {comp.verified && <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-xs font-bold text-blue-600">{comp.industry || 'Company'}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>📍 {comp.city}</span>
                      <span>•</span>
                      <span>{comp.companySize}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {comp.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {comp.linkedin && (
                    <a href={comp.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn Page" className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {comp.activeJobsCount || 0} Active Job(s)
                  </span>
                </div>

                <Link
                  href={`/companies/${comp.slug}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                >
                  <span>View Employer Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

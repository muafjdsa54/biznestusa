'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CompanyItem, TOP_CITIES } from '@/lib/data'
import { getAllCompanies } from '@/lib/company-service'
import Link from 'next/link'
import { 
  Building2, MapPin, Search, ShieldCheck, Star, ArrowRight, Briefcase, 
  Linkedin, Users, Filter, Globe, Plus
} from 'lucide-react'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [onlyVerified, setOnlyVerified] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const data = await getAllCompanies(false)
        setCompanies(data)
      } catch (err) {
        console.error('Error fetching companies:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <section className="bg-[#0F172A] text-white pt-12 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company and Employer Directory</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Top Hiring Companies & HR Departments
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Explore verified technology companies, corporate employers, healthcare institutions, and commercial organizations across the United States.
              </p>
            </div>

            <Link
              href="/add-company"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Company Profile</span>
            </Link>
          </div>

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
                <option value="Technology">Technology & IT</option>
                <option value="Construction">Construction & Building</option>
                <option value="Healthcare">Healthcare & Medical</option>
                <option value="Education">Education & Training</option>
                <option value="Finance">Finance & Banking</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <h2 className="text-xl font-extrabold text-slate-900">
            Hiring Companies ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading employer directory...</div>
        ) : filtered.length === 0 ? (
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
                      <a href={comp.linkedin} target="_blank" title="LinkedIn Page" className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">
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
      </main>

      <Footer />
    </div>
  )
}

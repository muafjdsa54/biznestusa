'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CompanyItem, JobItem, ProfessionalItem } from '@/lib/data'
import { getAllCompanies } from '@/lib/company-service'
import { getAllJobs, getMatchingCandidatesForJob } from '@/lib/job-service'
import { getPublicJobPath } from '@/lib/job-url'
import Link from 'next/link'
import { 
  Building2, Briefcase, Plus, ShieldCheck, MapPin, Users, Sparkles, 
  Edit3, CheckCircle2, AlertCircle, ArrowRight, Eye, Trash2
} from 'lucide-react'
import { toast } from 'sonner'

export default function EmployerDashboardPage() {
  const [company, setCompany] = useState<CompanyItem | null>(null)
  const [companyJobs, setCompanyJobs] = useState<JobItem[]>([])
  const [candidateMatches, setCandidateMatches] = useState<Array<{ candidate: ProfessionalItem; matchScore: number; matchReasons: string[] }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        const comps = await getAllCompanies(false)
        const selected = comps[0] || null
        setCompany(selected)

        if (selected) {
          const allJ = await getAllJobs(true)
          const cJobs = allJ.filter(j => j.companySlug === selected.slug || j.company.toLowerCase() === selected.name.toLowerCase())
          setCompanyJobs(cJobs)

          if (cJobs.length > 0) {
            const matches = await getMatchingCandidatesForJob(cJobs[0])
            setCandidateMatches(matches)
          }
        }
      } catch (err) {
        console.error('Error loading employer dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <section className="bg-slate-900 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Employer Recruitment Dashboard</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {company ? company.name : 'Employer Portal'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Manage job vacancies, company hiring profile, and candidate recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/post-job"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Job Vacancy</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Company Overview Cards */}
        {company && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">{company.name}</h2>
                  {company.verified && <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />}
                </div>
                <p className="text-xs font-bold text-blue-600">{company.industry} • {company.companySize}</p>
                <p className="text-[11px] text-slate-500">📍 {company.city} • HR: {company.hrName || company.companyEmail}</p>
              </div>
            </div>

            <Link
              href={`/companies/${company.slug}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              View Public Company Profile
            </Link>
          </div>
        )}

        {/* Job Listings Management */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Published Job Vacancies ({companyJobs.length})</span>
            </h2>
          </div>

          {companyJobs.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500 italic">No jobs published yet for your company profile.</p>
              <Link href="/post-job" className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">Post First Job</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {companyJobs.map((job) => (
                <div key={job.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">{job.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {job.status || 'approved'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      📍 {job.cities && job.cities.length > 1 ? job.cities.join(', ') : job.city} • {job.type} • {job.salary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={getPublicJobPath(job)} className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-300">
                      View Job
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Matching Suggestions Engine */}
        {candidateMatches.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/80 rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Candidate Match Recommendations ({candidateMatches.length})</span>
                </h2>
                <p className="text-xs text-slate-500">Candidates matched from the Professional network based on job skill requirements and city.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidateMatches.map(({ candidate, matchScore, matchReasons }) => (
                <div key={candidate.username} className="p-5 bg-white rounded-2xl border border-blue-100 shadow-xs space-y-3">
                  <div className="flex items-center gap-4">
                    <img src={candidate.avatar} alt={candidate.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <Link href={`/professionals/${candidate.username}`} className="font-extrabold text-sm text-slate-900 hover:text-blue-600 truncate">
                          {candidate.name}
                        </Link>
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          {matchScore}% Match
                        </span>
                      </div>
                      <p className="text-xs font-bold text-blue-600">{candidate.title}</p>
                      <p className="text-[11px] text-slate-500">📍 {candidate.city} • {candidate.experienceYears}y Exp</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 space-y-1 border border-slate-200/60">
                    {matchReasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/professionals/${candidate.username}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1"
                    >
                      <span>Inspect Candidate Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}

'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Briefcase, Building2, MapPin, CheckCircle2, Plus, Globe, Mail, AlertCircle, Info, ShieldCheck, ArrowRight, Sparkles, Trash2 } from 'lucide-react'
import { saveJobToDatabase } from '@/lib/job-service'
import { toast } from 'sonner'
import Link from 'next/link'
import { CITIES } from '@/lib/data'

export default function PostJobPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSlug, setSubmittedSlug] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [selectedCities, setSelectedCities] = useState<string[]>(['New York'])
  const [citySelectInput, setCitySelectInput] = useState('')
  const [category, setCategory] = useState('Technology & IT')
  const [type, setType] = useState('Full-time')
  const [salary, setSalary] = useState('$75,000 - $125,000 / year')
  const [experience, setExperience] = useState('2 - 4 Years')
  const [vacancies, setVacancies] = useState('1')
  const [description, setDescription] = useState('')
  
  // Popular cities quick list
  const POPULAR_CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Dallas', 'Miami', 'Seattle', 'Denver', 'Atlanta']

  const toggleCity = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      if (selectedCities.length > 1) {
        setSelectedCities(prev => prev.filter(c => c !== cityName))
      } else {
        toast.info('At least one city must be selected.')
      }
    } else {
      setSelectedCities(prev => [...prev, cityName])
    }
  }

  const addCity = (cityName: string) => {
    if (cityName && !selectedCities.includes(cityName)) {
      setSelectedCities(prev => [...prev, cityName])
      setCitySelectInput('')
    }
  }

  const removeCity = (cityName: string) => {
    if (selectedCities.length > 1) {
      setSelectedCities(prev => prev.filter(c => c !== cityName))
    } else {
      toast.info('At least one city must be selected.')
    }
  }

  const selectAllMajorHubs = () => {
    const hubs = ['New York', 'Los Angeles', 'Chicago', 'San Francisco']
    setSelectedCities(prev => Array.from(new Set([...prev, ...hubs])))
    toast.success('Major US tech hubs added!')
  }

  // Skills input
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React'])

  // Responsibilities & Requirements
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Lead product execution and collaborate with cross-functional teams.'
  ])
  const [respInput, setRespInput] = useState('')

  const [requirements, setRequirements] = useState<string[]>([
    'Relevant Bachelor degree or equivalent field experience.'
  ])
  const [reqInput, setReqInput] = useState('')

  // Application Method Fields
  const [applicationMethod, setApplicationMethod] = useState<'both' | 'website' | 'email' | 'biznest'>('both')
  const [applicationWebsite, setApplicationWebsite] = useState('')
  const [applicationEmail, setApplicationEmail] = useState('')
  const [appMethodError, setAppMethodError] = useState('')

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()])
      setSkillInput('')
    }
  }
  const removeSkill = (s: string) => setSkills(p => p.filter(item => item !== s))

  const addResp = () => {
    if (respInput.trim()) {
      setResponsibilities(p => [...p, respInput.trim()])
      setRespInput('')
    }
  }

  const addReq = () => {
    if (reqInput.trim()) {
      setRequirements(p => [...p, reqInput.trim()])
      setReqInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAppMethodError('')

    if (!title || !company || !salary || !description) {
      toast.error('Please fill in all mandatory job position fields.')
      return
    }

    if (selectedCities.length === 0) {
      toast.error('Please select at least one city for this job posting.')
      return
    }

    const cleanWeb = applicationWebsite.trim()
    const cleanMail = applicationEmail.trim()

    if (applicationMethod !== 'biznest' && !cleanWeb && !cleanMail) {
      const msg = 'Please provide at least an Application Website URL or an Application Email Address.'
      setAppMethodError(msg)
      toast.error(msg)
      return
    }

    setIsSubmitting(true)
    try {
      const primaryCity = selectedCities[0]
      const createdJob = await saveJobToDatabase({
        title,
        company,
        city: primaryCity,
        cities: selectedCities,
        category,
        type,
        employmentType: type,
        salary,
        experience,
        vacancies: Number(vacancies) || 1,
        description,
        skills,
        responsibilities,
        requirements,
        applicationWebsite: cleanWeb,
        applicationEmail: cleanMail,
        applicationMethod,
        applicationUrl: cleanWeb
      })

      setSubmittedSlug(createdJob.slug || createdJob.id)
      setSubmitted(true)
      toast.success('Job opening published successfully!')
    } catch (err) {
      toast.error('Failed to publish job opening.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <section className="bg-gradient-to-b from-blue-50/70 via-slate-50 to-[#F8FAFC] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enterprise Hiring Portal</span>
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Post a Job Opening in the USA</h1>
          <p className="text-slate-600 text-sm font-medium">
            Reach qualified American professionals. Candidate matches will be automatically suggested from the professional network.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {submitted ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Job Opening Published!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your job posting for <strong className="text-slate-900">{title}</strong> at {company} is now live on BizNest USA Jobs.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Offered Job Locations / Branch Cities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCities.map(c => (
                    <span key={c} className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[11px]">📍 {c}</span>
                  ))}
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200/80">
                <span className="font-bold text-slate-700 block">Candidate Application Channel:</span>
                {applicationWebsite && (
                  <div className="text-slate-600">
                    <span>Website: </span>
                    <a href={applicationWebsite} target="_blank" className="text-blue-600 font-bold underline">{applicationWebsite}</a>
                  </div>
                )}
                {applicationEmail && (
                  <div className="text-slate-600">
                    <span>Email: </span>
                    <span className="font-bold text-slate-900">{applicationEmail}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/jobs/${submittedSlug}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>View Job Page & Candidate Matches</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                Post Another Job
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900">Position Overview</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior React Developer, HR Manager"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Employer Name *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Home Services"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Job Locations / Multiple Cities Selection */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Job Locations / Branch Cities *</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select one or multiple cities if your company has multiple branches offering this vacancy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={selectAllMajorHubs}
                    className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 text-[11px] font-bold rounded-lg transition-colors border border-blue-200/60 shrink-0"
                  >
                    + Select Major Tech Hubs
                  </button>
                </div>

                {/* Selected Cities Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedCities.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <span>📍 {c}</span>
                      <button
                        type="button"
                        onClick={() => removeCity(c)}
                        className="hover:text-red-200 font-bold ml-1"
                        title={`Remove ${c}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {selectedCities.length > 1 && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Multiple Cities ({selectedCities.length})</span>
                    </span>
                  )}
                </div>

                {/* Popular Cities Toggle Chips */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Quick Add Popular Cities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_CITIES.map(c => {
                      const isSelected = selectedCities.includes(c)
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCity(c)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold border border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{c}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dropdown to pick any US city */}
                <div className="pt-2 flex gap-2">
                  <select
                    value={citySelectInput}
                    onChange={(e) => {
                      addCity(e.target.value)
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="">-- Add another city in the USA --</option>
                    {CITIES.filter(c => !selectedCities.includes(c)).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range *</label>
                  <input
                    type="text"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. $75,000 - $125,000 / year"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills Tagging</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add required skill (e.g. Next.js, Node.js)..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-200">
                      <span>{s}</span>
                      <button type="button" onClick={() => removeSkill(s)} className="text-red-600">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of the role, team environment, and daily objectives..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Application Methods */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-extrabold text-slate-900">Application Methods</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Careers / ATS URL</label>
                    <input
                      type="url"
                      value={applicationWebsite}
                      onChange={(e) => setApplicationWebsite(e.target.value)}
                      placeholder="https://company.com/careers/job"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Direct HR Email</label>
                    <input
                      type="email"
                      value={applicationEmail}
                      onChange={(e) => setApplicationEmail(e.target.value)}
                      placeholder="careers@company.com"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
                {appMethodError && <p className="text-red-500 text-[11px] font-bold">{appMethodError}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Job...' : 'Publish Job Opening'}</span>
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}

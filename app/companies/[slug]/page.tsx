import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getCompanyBySlug, getAllCompanies } from '@/lib/company-service'
import { getAllJobs } from '@/lib/job-service'
import { getPublicJobPath } from '@/lib/job-url'
import { 
  Building2, MapPin, ShieldCheck, Star, Mail, Phone, Award, ArrowLeft, 
  Linkedin, ExternalLink, Briefcase
} from 'lucide-react'

export const dynamicParams = true
export const revalidate = 0

export async function generateStaticParams() {
  const companies = await getAllCompanies()
  return companies.map((c) => ({
    slug: c.slug,
  }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params
  const slug = params.slug
  const company = await getCompanyBySlug(slug)

  const name = company ? company.name : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const title = `${name}${company?.city ? ` in ${company.city}` : ''} | BizNest USA Company Directory`
  const description = company ? `${company.description} Review the employer’s listed location, website, contacts, and current opportunities before applying or engaging.` : `Explore the company profile, location, contacts, and available opportunities for ${name} on the BizNest USA company directory.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://biznestusa.com/companies/${slug}/`,
    },
    openGraph: {
      title,
      description,
      siteName: 'BizNest USA',
      url: `https://biznestusa.com/companies/${slug}/`,
      locale: 'en_US',
      type: 'website',
      images: company?.logo ? [{ url: company.logo, alt: name }] : undefined,
    },
  }
}

export default async function CompanyDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = params.slug

  const company = await getCompanyBySlug(slug)

  if (!company) {
    return notFound()
  }

  const allJobs = await getAllJobs(false)
  const activeJobs = allJobs.filter(
    j => j.companySlug === company.slug || j.company.toLowerCase() === company.name.toLowerCase()
  )

  const allCompanies = await getAllCompanies(false)
  const similarCompanies = allCompanies.filter(c => c.slug !== company.slug).slice(0, 3)

  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    description: company.description,
    url: company.website || `https://biznestusa.com/companies/${company.slug}/`,
    logo: company.logo,
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.city,
      addressRegion: company.province || 'NY',
      addressCountry: company.country || 'US'
    },
    telephone: company.phone,
    email: company.companyEmail || company.hrEmail,
    sameAs: [company.linkedin, company.facebook, company.github, company.twitter].filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />
      <BreadcrumbSchema pathname={`/companies/${slug}`} />
      <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 text-xs text-slate-500"><Link href="/" className="hover:text-blue-700 underline">Home</Link><span className="mx-2">/</span><Link href="/companies" className="hover:text-blue-700 underline">Companies</Link><span className="mx-2">/</span><span>{company.name}</span></nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href="/companies" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Companies Directory</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white shrink-0">
                <Image
                  src={company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                  alt={company.name}
                  width={80}
                  height={80}
                  priority
                  sizes="80px"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{company.name}</h1>
                  {company.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified Employer</span>
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-blue-400">{company.industry} • {company.companyType}</p>
                <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{company.city}, {company.province || 'United States'}</span>
                  <span>•</span>
                  <span>{company.companySize}</span>
                  <span>•</span>
                  <span>Est. {company.establishedYear}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {company.linkedin && (
                <a
                  href={company.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Linkedin className="w-4 h-4 fill-white" />
                  <span>LinkedIn Page</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Company Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Company Overview & Culture</h2>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {company.description}
          </p>
        </div>

        {/* HR Contact & Headquarter Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Headquarters & Recruitment Contact</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block">HR Representative</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{company.hrName || 'Talent Acquisition Team'}</p>
              <p className="text-slate-600">{company.hrDesignation || 'HR Lead'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block">HR Contact Email</span>
              <p className="font-extrabold text-blue-600 mt-0.5">{company.hrEmail || company.companyEmail || 'Contact via BizNest USA'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block">Headquarters Address</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{company.address || company.headquarters}</p>
            </div>
          </div>
        </div>

        {/* Active Job Openings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span>Active Job Openings ({activeJobs.length})</span>
            </h2>
            <Link href="/post-job" className="text-xs font-bold text-blue-600 hover:underline">Post Job for {company.name}</Link>
          </div>

          {activeJobs.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No active job vacancies published at this time.</p>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <Link href={getPublicJobPath(job)} className="font-extrabold text-slate-900 text-sm hover:text-blue-600">
                      {job.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {job.city} • {job.type} • {job.salary}</p>
                  </div>
                  <Link
                    href={getPublicJobPath(job)}
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                  >
                    View & Apply
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Similar Hiring Companies */}
        {similarCompanies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Similar Hiring Companies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarCompanies.map((sim) => (
                <Link
                  key={sim.slug}
                  href={`/companies/${sim.slug}`}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group space-y-2 block"
                >
                  <div className="flex items-center gap-3">
                    <Image src={sim.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'} alt={sim.name} width={40} height={40} loading="lazy" sizes="40px" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-blue-600">{sim.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{sim.industry}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}

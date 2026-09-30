import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getProfessionalByUsername, getAllProfessionals } from '@/lib/professional-service'
import { 
  Users, MapPin, ShieldCheck, Star, Mail, Phone, Award, CheckCircle2, ArrowLeft, ArrowRight,
  Globe, Linkedin, Github, Facebook, Twitter, Instagram, Youtube, MessageCircle, ExternalLink, 
  Briefcase, Calendar, GraduationCap, Building2, Check, Sparkles
} from 'lucide-react'
import { ProfessionalHeroActions, ProfessionalReviewsSection, ProfessionalFaqsSection } from './professional-interactive-actions'

import { toCanonicalUrl, normalizeCitySlug, VERIFICATION_DISCLAIMER } from '@/lib/directory-helpers'

export const dynamicParams = true
export const revalidate = 0

export async function generateStaticParams() {
  const pros = await getAllProfessionals()
  return pros.map((p) => ({
    username: p.username,
  }))
}

export async function generateMetadata(props: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const params = await props.params
  const username = params.username
  const pro = await getProfessionalByUsername(username)

  const name = pro ? pro.name : username.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const profession = pro?.profession || pro?.title || 'Professional'
  const city = pro?.city || 'United States'
  const title = `${name} – ${profession} in ${city} | BizNestUSA`
  const description = pro ? `${pro.bio.slice(0, 160)}... Review credentials, portfolio, and contact details for ${name} on BizNestUSA.` : `View the profile, skills, credentials, and contact details for ${name} on BizNestUSA.`
  const canonicalUrl = toCanonicalUrl(`professionals/${username}`)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      siteName: 'BizNestUSA',
      url: canonicalUrl,
      locale: 'en_US',
      type: 'profile',
      images: pro?.avatar ? [{ url: pro.avatar, alt: name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ProfessionalDetailPage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params
  const username = params.username

  const pro = await getProfessionalByUsername(username)

  if (!pro) {
    return notFound()
  }

  const allPros = await getAllProfessionals(false)
  const similarPros = allPros.filter(p => p.username !== pro.username).slice(0, 3)
  const reviewsList = pro.reviews || []
  const canonicalUrl = toCanonicalUrl(`professionals/${username}`)
  const citySlug = normalizeCitySlug(pro.city)

  const socialLinks = [
    { label: 'LinkedIn (Primary Profile)', url: pro.linkedin, icon: Linkedin, color: 'text-blue-700 bg-blue-50 border-blue-300 font-extrabold ring-2 ring-blue-500/20' },
    { label: 'GitHub', url: pro.github, icon: Github, color: 'text-slate-900 bg-slate-100 border-slate-300' },
    { label: 'Portfolio', url: pro.portfolio || pro.website, icon: Globe, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { label: 'WhatsApp', url: pro.whatsapp ? `https://wa.me/${pro.whatsapp}` : undefined, icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Email', url: pro.email ? `mailto:${pro.email}` : undefined, icon: Mail, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Phone', url: pro.phone ? `tel:${pro.phone}` : undefined, icon: Phone, color: 'text-slate-800 bg-slate-100 border-slate-300' },
    { label: 'Twitter / X', url: pro.twitter, icon: Twitter, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { label: 'Instagram', url: pro.instagram, icon: Instagram, color: 'text-pink-600 bg-pink-50 border-pink-200' },
    { label: 'Facebook', url: pro.facebook, icon: Facebook, color: 'text-blue-800 bg-blue-50 border-blue-200' },
    { label: 'YouTube', url: pro.youtube, icon: Youtube, color: 'text-red-600 bg-red-50 border-red-200' },
  ].filter(link => Boolean(link.url))

  const jsonLdPerson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: pro.name,
    jobTitle: pro.title,
    description: pro.bio,
    url: canonicalUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: pro.city,
      addressRegion: (pro as any).state || pro.province || 'US',
      addressCountry: pro.country || 'US'
    },
    telephone: pro.phone,
    email: pro.email,
    sameAs: socialLinks.map(s => s.url)
  }

  const jsonLdProfilePage = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: canonicalUrl,
    mainEntity: jsonLdPerson
  }

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://biznestusa.com/' },
      { '@type': 'ListItem', position: 2, name: 'Professionals', item: 'https://biznestusa.com/professionals/' },
      { '@type': 'ListItem', position: 3, name: pro.city, item: toCanonicalUrl(`city/${citySlug}`) },
      { '@type': 'ListItem', position: 4, name: pro.name, item: canonicalUrl }
    ]
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />
      <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 text-xs text-slate-500 flex items-center flex-wrap gap-1.5">
        <Link href="/" className="hover:text-blue-700 underline">Home</Link>
        <span>/</span>
        <Link href="/professionals" className="hover:text-blue-700 underline">Professionals</Link>
        <span>/</span>
        <Link href={`/city/${citySlug}`} className="hover:text-blue-700 underline">{pro.city}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{pro.name}</span>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLdPerson, jsonLdProfilePage, jsonLdBreadcrumb]) }}
      />

      {/* Cover Header Banner (Clean Light / White Theme) */}
      <section className="relative bg-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/90 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <Link href="/professionals" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Professionals Network</span>
            </Link>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              {pro.availability || 'Open to Work'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 w-full lg:w-auto">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md ring-4 ring-slate-50 shrink-0">
                <Image
                  src={pro.avatar}
                  alt={pro.name}
                  width={112}
                  height={112}
                  priority
                  sizes="112px"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pro.name}</h1>
                  {pro.verified || pro.verificationStatus === 'VERIFIED' ? (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 shadow-2xs"
                      title={VERIFICATION_DISCLAIMER}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>✓ Verified Professional</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs"
                      title="This profile has not completed BizNest USA verification."
                    >
                      <span>Public Listing</span>
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-blue-600">{pro.title}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs text-slate-600 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{pro.city}{pro.state ? `, ${pro.state}` : ''}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{pro.rating} ({pro.reviewCount || reviewsList.length} reviews)</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {pro.experienceYears}+ Years Exp
                  </span>
                  {pro.gender && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {pro.gender}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {pro.linkedin && (
                <a
                  href={pro.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Linkedin className="w-4 h-4 fill-white" />
                  <span>Connect on LinkedIn</span>
                </a>
              )}

              <ProfessionalHeroActions proName={pro.name} proUsername={pro.username} />
            </div>
          </div>

        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {(pro.verified || pro.verificationStatus === 'VERIFIED') && (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Verified Profile:</strong> {VERIFICATION_DISCLAIMER}
            </p>
          </div>
        )}
        {/* UNVERIFIED PROFILE NOTICE */}
        {(!pro.verified && pro.verificationStatus !== 'VERIFIED') && (
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-50">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    Claim Profile
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">• Public Profile</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                  Are you {pro.name}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  Claim or manage this profile through your dashboard to update portfolio projects, skills, and availability.
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/professional`}
              className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Manage Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
        
        {/* Dedicated Social Links & Contact Card */}
        {socialLinks.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Public Social Links & Portfolios</span>
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer ${item.color}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Short Bio & Detailed About */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">About & Career Background</h2>
          <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 leading-relaxed">
            {pro.bio}
          </p>
          {pro.about && (
            <p className="text-xs text-slate-600 leading-relaxed space-y-2 whitespace-pre-line">
              {pro.about}
            </p>
          )}
        </div>

        {/* Verified Skills & Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Skills & Competencies</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {pro.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Services Offered</span>
            </h2>
            <div className="space-y-2 text-xs">
              {pro.servicesOffered && pro.servicesOffered.length > 0 ? (
                pro.servicesOffered.map((serv, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{serv}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">Custom professional consultation and project contracts.</p>
              )}
            </div>
          </div>
        </div>

        {/* Work Experience Timeline */}
        {Array.isArray(pro.previousExperience) && pro.previousExperience.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Work Experience Timeline</h2>
            <div className="space-y-4">
              {pro.previousExperience.map((exp: any, i: number) => {
                const title = typeof exp === 'string' ? exp : exp.title || 'Professional Role'
                const duration = typeof exp === 'string' ? '' : exp.duration || ''
                const company = typeof exp === 'string' ? '' : exp.company || ''
                const description = typeof exp === 'string' ? '' : exp.description || ''

                return (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="font-extrabold text-slate-900 text-sm">{title}</h3>
                      {duration && <span className="text-xs font-bold text-blue-600">{duration}</span>}
                    </div>
                    {company && <p className="text-xs font-semibold text-slate-600">{company}</p>}
                    {description && <p className="text-xs text-slate-500 pt-1 leading-relaxed">{description}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Similar Professionals Internal Linking */}
        {similarPros.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-base font-extrabold text-slate-900">Similar Verified Professionals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarPros.map((sim) => (
                <Link
                  key={sim.username}
                  href={`/professionals/${sim.username}`}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group space-y-2 block"
                >
                  <div className="flex items-center gap-3">
                    <Image src={sim.avatar} alt={sim.name} width={40} height={40} loading="lazy" sizes="40px" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-blue-600">{sim.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{sim.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Client Reviews Section */}
        <ProfessionalReviewsSection proName={pro.name} initialReviews={reviewsList} />

        {/* FAQs Section */}
        <ProfessionalFaqsSection faqs={pro.faqs || []} />

      </main>

      <Footer />
    </div>
  )
}

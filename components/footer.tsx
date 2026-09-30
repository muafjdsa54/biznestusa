import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, MapPin, Briefcase, Sparkles, Phone, Mail, HelpCircle, FileText, Globe } from 'lucide-react'
import UniversalHelpBanner from '@/components/universal-help-banner'

export default function Footer() {
  return (
    <>
      <UniversalHelpBanner />
      <footer className="bg-[#0B132B] text-white pt-16 pb-12 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Branding & NAP Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-12 border-b border-slate-800/80 gap-6">
          <div className="flex flex-col gap-3">
            <Link href="/" aria-label="BizNestUSA Home Page" className="inline-block group bg-white/95 px-3 py-1.5 rounded-xl shadow-sm self-start transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="BizNestUSA - United States Business Directory"
                width={150}
                height={40}
                loading="lazy"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              United States-focused business discovery connecting companies, employers, professionals, job seekers, and customers through category and city pages.
            </p>
            
            {/* Official NAP Display */}
            <div className="pt-2 space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span><strong>Serving:</strong> Businesses, professionals, and job seekers across the United States</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Coverage:</strong> All 50 states and Washington, D.C.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Business profiles</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>City-based discovery</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Active Job Portal</span>
            </div>
          </div>
        </div>

        {/* 5 Column Link Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-slate-800/80">
          
          {/* Section 1: Directory & Explore */}
          <div>
            <h3 className="font-bold text-white text-sm tracking-wider uppercase mb-4 text-blue-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Directory</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/business-directory" className="hover:text-blue-400 transition-colors">Business Directory Hub</Link></li>
              <li><Link href="/professional-directory" className="hover:text-blue-400 transition-colors">Professional Directory Hub</Link></li>
              <li><Link href="/categories" className="hover:text-blue-400 transition-colors">All Categories</Link></li>
              <li><Link href="/cities" className="hover:text-blue-400 transition-colors">All Cities</Link></li>
              <li><Link href="/search" className="hover:text-blue-400 transition-colors">Business Search</Link></li>
              <li><Link href="/add-business" className="hover:text-blue-400 transition-colors">Add Business</Link></li>
              <li><Link href="/professionals" className="hover:text-blue-400 transition-colors">Professional Profiles</Link></li>
              <li><Link href="/jobs" className="hover:text-blue-400 transition-colors">Jobs across the USA</Link></li>
              <li><Link href="/post-job" className="hover:text-blue-400 transition-colors">Post Job Opening</Link></li>
            </ul>
          </div>

          {/* Section 2: Major Cities */}
          <div>
            <h3 className="font-bold text-white text-sm tracking-wider uppercase mb-4 text-emerald-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Top Hubs</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/city/new-york" className="hover:text-emerald-400 transition-colors">New York Directory</Link></li>
              <li><Link href="/city/los-angeles" className="hover:text-emerald-400 transition-colors">Los Angeles Directory</Link></li>
              <li><Link href="/city/chicago" className="hover:text-emerald-400 transition-colors">Chicago Directory</Link></li>
              <li><Link href="/city/houston" className="hover:text-emerald-400 transition-colors">Houston Directory</Link></li>
              <li><Link href="/city/phoenix" className="hover:text-emerald-400 transition-colors">Phoenix Directory</Link></li>
              <li><Link href="/city/miami" className="hover:text-emerald-400 transition-colors">Miami Directory</Link></li>
              <li><Link href="/city/seattle" className="hover:text-emerald-400 transition-colors">Seattle Directory</Link></li>
            </ul>
          </div>

          {/* Section 3: Company & Trust */}
          <div>
            <h3 className="font-bold text-white text-sm tracking-wider uppercase mb-4 text-amber-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Company</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Guides &amp; Research</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/careers" className="hover:text-amber-400 transition-colors">Careers</Link></li>
              <li><Link href="/advertise-with-us" className="hover:text-amber-400 transition-colors">Advertise With Us</Link></li>
              <li><Link href="/html-sitemap" className="hover:text-amber-400 transition-colors">HTML Sitemap</Link></li>
            </ul>
          </div>

          {/* Section 4: Support & FAQs */}
          <div>
            <h3 className="font-bold text-white text-sm tracking-wider uppercase mb-4 text-sky-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Help & Support</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/help-center" className="hover:text-sky-400 transition-colors">Help Center</Link></li>
              <li><Link href="/support" className="hover:text-sky-400 transition-colors">Customer Support</Link></li>
              <li><Link href="/faqs" className="hover:text-sky-400 transition-colors">FAQs</Link></li>
              <li><Link href="/report-listing" className="hover:text-sky-400 transition-colors">Report a Listing</Link></li>
              <li><Link href="/report-abuse" className="hover:text-sky-400 transition-colors">Report Abuse</Link></li>
              <li><Link href="/accessibility" className="hover:text-sky-400 transition-colors">Accessibility Statement</Link></li>
            </ul>
          </div>

          {/* Section 5: Policies & Legal */}
          <div>
            <h3 className="font-bold text-white text-sm tracking-wider uppercase mb-4 text-purple-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Legal Policies</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-purple-400 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-purple-400 transition-colors">Disclaimer</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-purple-400 transition-colors">Editorial Policy</Link></li>
              <li><Link href="/community-guidelines" className="hover:text-purple-400 transition-colors">Community Guidelines</Link></li>
              <li><Link href="/business-listing-guidelines" className="hover:text-purple-400 transition-colors">Listing Guidelines</Link></li>
              <li><Link href="/verification-policy" className="hover:text-purple-400 transition-colors">Verification Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-purple-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p className="text-center md:text-left">
            © 2026 BizNestUSA. A USA directory for businesses, professionals, and jobs. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-slate-400 flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <span>•</span>
            <Link href="/cookie-policy" className="hover:text-white">Cookies</Link>
            <span>•</span>
            <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
    </>
  )
}

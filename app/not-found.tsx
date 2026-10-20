'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { FileQuestion, Home, ArrowLeft, Search, PlusCircle, Building2, MapPin } from 'lucide-react'

const TOP_USA_CATEGORIES = [
  { name: 'Home Services', href: '/category/home-services/' },
  { name: 'Professional Services', href: '/category/professional-services/' },
  { name: 'Health & Wellness', href: '/category/health-wellness/' },
  { name: 'Technology', href: '/category/technology/' },
  { name: 'Construction', href: '/category/construction/' },
  { name: 'Restaurants & Food', href: '/category/restaurants-food/' },
]

const POPULAR_USA_CITIES = [
  { name: 'Houston, TX', href: '/city/houston/' },
  { name: 'New York City, NY', href: '/city/new-york-city/' },
  { name: 'Los Angeles, CA', href: '/city/los-angeles/' },
  { name: 'Dallas, TX', href: '/city/dallas/' },
  { name: 'Chicago, IL', href: '/city/chicago/' },
  { name: 'Phoenix, AZ', href: '/city/phoenix/' },
]

export default function NotFound() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      router.push(`/business-directory/?search=${encodeURIComponent(q)}`)
    } else {
      router.push('/business-directory/')
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#f8fafc] min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(15,43,61,0.08)] border border-slate-100 max-w-2xl w-full text-center flex flex-col items-center relative overflow-hidden">
          {/* Decorative Glow Background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          {/* 404 Badge */}
          <div className="w-20 h-20 rounded-2xl bg-blue-50/80 flex items-center justify-center mb-6 relative">
            <FileQuestion className="w-10 h-10 text-blue-600" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f2b3d] tracking-tight mb-3">
            Page Not Found (404)
          </h1>

          {/* Description */}
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mb-6">
            The page you are looking for does not exist or has been permanently removed from BizNestUSA. Use the directory search or explore our popular USA categories and cities below.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="w-full max-w-md mb-8">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses, services, or locations..."
                className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-[#0f2b3d] hover:bg-[#1a3f57] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full justify-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f2b3d] hover:bg-[#1a3f57] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/add-business/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your Business
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          {/* Directory Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 w-full text-left">
            {/* Top USA Categories */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Top USA Categories</span>
              </div>
              <ul className="space-y-1.5">
                {TOP_USA_CATEGORIES.map((cat) => (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular USA Cities */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Popular USA Cities</span>
              </div>
              <ul className="space-y-1.5">
                {POPULAR_USA_CITIES.map((city) => (
                  <li key={city.href}>
                    <Link
                      href={city.href}
                      className="text-xs font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

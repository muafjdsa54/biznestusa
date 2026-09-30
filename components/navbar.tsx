'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Plus, Building2, Search, Briefcase, Users, MapPin, Grid, UserPlus, BookOpen } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Businesses', icon: Building2 },
  { href: '/professionals', label: 'Professionals', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/categories', label: 'Categories', icon: Grid },
  { href: '/cities', label: 'Locations', icon: MapPin },
  { href: '/blog', label: 'Guides', icon: BookOpen },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link href="/" aria-label="BizNestUSA Home Page" className="flex items-center gap-2 group py-1">
            <Image
              src="/logo.png"
              alt="BizNestUSA - USA Directory"
              width={160}
              height={44}
              priority
              className="h-9 sm:h-11 w-auto object-contain transition-transform duration-150 group-hover:opacity-90"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Search Directory"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>

            <Link
              href="/post-job"
              className="text-xs md:text-sm font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden xl:inline-block"
            >
              Post a Job
            </Link>

            <Link
              href="/add-professional"
              className="text-xs md:text-sm font-medium border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Create Profile</span>
            </Link>

            <Link
              href="/add-business"
              className="text-xs md:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Your Business</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-hamburger-btn"
              className="text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={open ? 'Close navigation sidebar' : 'Open navigation sidebar'}
              aria-expanded={open}
              aria-controls="mobile-nav-menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <nav
          id="mobile-nav-menu"
          className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 flex flex-col gap-1 shadow-lg animate-in slide-in-from-top-1"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium py-2.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {link.icon && <link.icon className="w-4 h-4 text-slate-500" />}
                  <span>{link.label}</span>
                </div>
              </Link>
            )
          })}
          
          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/post-job"
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
            >
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span>Post a Job</span>
            </Link>

            <Link
              href="/add-professional"
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Create Professional Profile</span>
            </Link>

            <Link
              href="/add-business"
              onClick={() => setOpen(false)}
              className="mt-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center shadow-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>List Your Business</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}

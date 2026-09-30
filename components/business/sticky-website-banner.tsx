'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Globe, MessageCircle, MessageSquare, X, ChevronDown, ChevronUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

interface StickyWebsiteBannerProps {
  businessName?: string
  className?: string
}

export default function StickyWebsiteBanner({ businessName, className = '' }: StickyWebsiteBannerProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return (
      <button
        type="button"
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 right-4 z-40 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
        title="Need a business website? Click here"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Need a Business Website?</span>
      </button>
    )
  }

  const defaultBizText = businessName?.trim() ? ` for "${businessName.trim()}"` : ''
  const contactUrl = `/contact?subject=${encodeURIComponent(
    `Website Consultation Request${defaultBizText}`
  )}`

  return (
    <aside aria-label="Website Assistance Banner" className={`sticky top-20 z-30 transition-all duration-300 ${className}`}>
      <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-lg shadow-slate-900/5">
        <div className="flex items-center justify-between gap-3">
          {/* Left info badge & message */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Globe className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Free Consultation</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  Don&apos;t have a website for your business?
                </span>
              </div>

              {!isMinimized && (
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug">
                  If your business doesn&apos;t have an official website yet, our team provides consultation and modern web design tailored for American service providers.
                </p>
              )}
            </div>
          </div>

          {/* Right action button & controls */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={contactUrl}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Website Help</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title={isMinimized ? 'Expand' : 'Collapse'}
            >
              {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

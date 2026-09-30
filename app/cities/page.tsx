import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { TOP_CITIES, US_STATES, STATE_CITIES } from '@/lib/data'
import Link from 'next/link'
import { MapPin, Building2, ChevronRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'USA Locations & Cities Directory | BizNestUSA',
  description: 'Explore business listings, professionals, and jobs across all 50 US states and major metropolitan cities on BizNestUSA.',
  alternates: { canonical: 'https://biznestusa.com/cities/' },
  openGraph: {
    title: 'USA Locations & Cities Directory | BizNestUSA',
    description: 'Explore business listings, professionals, and jobs across all 50 US states and major metropolitan cities on BizNestUSA.',
    url: 'https://biznestusa.com/cities/',
    type: 'website',
  },
}

export default function CitiesIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar />

      <section className="bg-white border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <MapPin className="w-3.5 h-3.5" />
            <span>United States Geographic Directory</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">Locations & Cities Across the USA</h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Discover local businesses, individual professionals, and career vacancies across all 50 states and metropolitan areas.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* Top Metropolitan Hubs */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Top Metropolitan Hubs</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TOP_CITIES.slice(0, 18).map((city) => (
              <Link
                key={city}
                href={`/city/${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all text-center space-y-2 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors truncate">
                  {city}
                </h3>
                <span className="text-[11px] font-medium text-emerald-600 block">Explore city &rarr;</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Directory by All 50 US States */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Directory by US State</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {US_STATES.map((state) => {
              const citiesInState = STATE_CITIES[state] || []
              return (
                <div key={state} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{state}</h3>
                    <Link
                      href={`/search?location=${encodeURIComponent(state)}`}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {citiesInState.slice(0, 5).map((city) => (
                      <Link
                        key={city}
                        href={`/city/${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors"
                      >
                        {city}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}

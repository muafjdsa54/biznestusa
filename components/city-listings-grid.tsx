// Presentational business grid for a city page — extracted verbatim
// from app/city/[slug]/page.tsx so the static server render (page 1)
// and the client paginated render (pages 2+, via
// CityListingsPaginated) share one markup source. Pure presentational:
// no hooks, so the server page can render it directly.
import Link from 'next/link'
import ListingLogo from '@/components/listing-logo'
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import type { PublicBusinessItem } from '@/lib/listings-api'

export default function CityListingsGrid({ businesses }: { businesses: PublicBusinessItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {businesses.map((biz) => (
        <div key={biz.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ListingLogo name={biz.name} src={biz.logo} size={48} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                <div>
                  <Link href={`/business/${biz.slug}`} className="font-bold text-slate-900 text-base flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                    <span>{biz.name}</span>
                    {biz.verified && (
                      <span title="Verified Business">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </span>
                    )}
                  </Link>
                  <p className="text-xs text-slate-500">{biz.category}</p>
                </div>
              </div>
              {biz.reviewCount > 0 && biz.rating > 0 ? (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                  ★ {biz.rating}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg shrink-0">
                  No reviews yet
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{biz.description}</p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            {biz.phone ? (
              <span className="text-slate-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{biz.phone}</span>
              </span>
            ) : (
              <span></span>
            )}
            <Link href={`/business/${biz.slug}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">
              <span>View Listing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

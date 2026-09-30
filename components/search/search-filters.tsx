'use client'

import { BUSINESS_CATEGORIES, PROFESSIONAL_CATEGORIES, TOP_CITIES, US_STATES } from '@/lib/data'
import { Filter, RotateCcw, ShieldCheck, Star } from 'lucide-react'

interface SearchFiltersProps {
  activeTab: 'businesses' | 'professionals' | 'jobs'
  selectedLocation: string
  selectedCategory: string
  onlyVerified: boolean
  minRating: number
  onLocationChange: (loc: string) => void
  onCategoryChange: (category: string) => void
  onVerifiedChange: (verified: boolean) => void
  onRatingChange: (rating: number) => void
  onReset: () => void
  totalCount: number
}

export default function SearchFilters({
  activeTab,
  selectedLocation,
  selectedCategory,
  onlyVerified,
  minRating,
  onLocationChange,
  onCategoryChange,
  onVerifiedChange,
  onRatingChange,
  onReset,
  totalCount
}: SearchFiltersProps) {
  const categoryOptions = activeTab === 'professionals'
    ? PROFESSIONAL_CATEGORIES.map(c => c.name)
    : BUSINESS_CATEGORIES.map(c => c.name)

  return (
    <aside className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {totalCount} results
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Verified Only Toggle */}
      <div>
        <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">Verified Only</span>
          </div>
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => onVerifiedChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
        </label>
      </div>

      {/* Location (State / City) Select */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-600">
          Location (City or State)
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All US Locations</option>
          <optgroup label="Top Metros">
            {TOP_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </optgroup>
          <optgroup label="US States">
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Category Select */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-600">
          {activeTab === 'professionals' ? 'Profession Category' : 'Category'}
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Rating (For businesses & professionals) */}
      {activeTab !== 'jobs' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600">
            Minimum Rating
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 4.0, 4.5, 4.8].map((rating) => (
              <button
                key={rating}
                onClick={() => onRatingChange(rating)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  minRating === rating
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{rating === 0 ? 'Any' : `${rating}+`}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

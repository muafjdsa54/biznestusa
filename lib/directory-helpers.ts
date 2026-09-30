import { CATEGORIES, CITIES, BusinessItem } from './data'

export const VERIFICATION_DISCLAIMER =
  "BizNestUSA verification indicates that the business or professional profile completed our basic validation process. Verification does not independently guarantee every claim made by the lister."

export const CANONICAL_DOMAIN = 'https://biznestusa.com'

export function toCanonicalUrl(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '')
  return clean ? `${CANONICAL_DOMAIN}/${clean}/` : `${CANONICAL_DOMAIN}/`
}

/**
 * Maps a business to its primary canonical category ID from CATEGORIES.
 */
export function normalizeBusinessCategoryId(biz: Pick<BusinessItem, 'categoryId' | 'category' | 'secondaryCategories'>): string {
  const rawCatId = (biz.categoryId || '').toLowerCase().trim()
  if (rawCatId) {
    if (rawCatId === 'restaurants') return 'restaurants-food'
    if (rawCatId === 'healthcare') return 'health-wellness'
    if (rawCatId === 'legal' || rawCatId === 'marketing') return 'professional-services'
    if (rawCatId === 'travel' || rawCatId === 'logistics') return 'local-services'
    if (CATEGORIES.some(c => c.id === rawCatId)) {
      return rawCatId
    }
  }

  const text = `${biz.category || ''} ${(biz.secondaryCategories || []).join(' ')}`.toLowerCase()
  if (text.includes('home service') || text.includes('plumb') || text.includes('roof') || text.includes('electri') || text.includes('hvac') || text.includes('handyman') || text.includes('remodel') || text.includes('landscap') || text.includes('pest control')) return 'home-services'
  if (text.includes('restaurant') || text.includes('food') || text.includes('cafe') || text.includes('dining') || text.includes('bakery') || text.includes('pizza') || text.includes('catering')) return 'restaurants-food'
  if (text.includes('health') || text.includes('medical') || text.includes('doctor') || text.includes('clinic') || text.includes('hospital') || text.includes('dentist') || text.includes('wellness') || text.includes('pharmacy')) return 'health-wellness'
  if (text.includes('technology') || text.includes('tech') || text.includes('software') || text.includes('it ') || text.includes('developer') || text.includes('cyber') || text.includes('saas') || text.includes('web design')) return 'technology'
  if (text.includes('real estate') || text.includes('property') || text.includes('realty') || text.includes('broker') || text.includes('leasing')) return 'real-estate'
  if (text.includes('construction') || text.includes('contractor') || text.includes('builder') || text.includes('masonry') || text.includes('architect')) return 'construction'
  if (text.includes('retail') || text.includes('shopping') || text.includes('store') || text.includes('shop') || text.includes('boutique') || text.includes('market')) return 'retail'
  if (text.includes('automotive') || text.includes('vehicle') || text.includes('car') || text.includes('auto') || text.includes('mechanic') || text.includes('tire') || text.includes('towing')) return 'automotive'
  if (text.includes('beauty') || text.includes('salon') || text.includes('barber') || text.includes('spa') || text.includes('skincare') || text.includes('nail')) return 'beauty-personal-care'
  if (text.includes('finance') || text.includes('banking') || text.includes('accountant') || text.includes('cpa') || text.includes('tax') || text.includes('insurance')) return 'finance'
  if (text.includes('education') || text.includes('school') || text.includes('college') || text.includes('university') || text.includes('training') || text.includes('academy') || text.includes('tutor')) return 'education'
  if (text.includes('legal') || text.includes('law') || text.includes('attorney') || text.includes('lawyer') || text.includes('professional') || text.includes('consult') || text.includes('agency') || text.includes('advisory')) return 'professional-services'
  return 'local-services'
}

export function normalizeCitySlug(city: string): string {
  return (city || '').trim().toLowerCase().replace(/\s+/g, '-')
}

export function getCityDisplayName(citySlug: string): string {
  const norm = citySlug.trim().toLowerCase()
  const found = CITIES.find(c => c.toLowerCase().replace(/\s+/g, '-') === norm)
  if (found) return found
  return citySlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function getCategoryDisplayName(catId: string): string {
  const found = CATEGORIES.find(c => c.id === catId)
  if (found) return found.name
  return catId
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Filter businesses for a category, using both categoryId and normalized category matching.
 */
export function filterBusinessesByCategory(businesses: BusinessItem[], categoryId: string): BusinessItem[] {
  return businesses.filter(b => normalizeBusinessCategoryId(b) === categoryId)
}

/**
 * Filter businesses for a city, checking main city, cities array, and branch locations.
 */
export function filterBusinessesByCity(businesses: BusinessItem[], citySlug: string): BusinessItem[] {
  const normCity = citySlug.toLowerCase()
  return businesses.filter(b => {
    const mainCitySlug = normalizeCitySlug(b.city)
    if (mainCitySlug === normCity) return true
    if (b.cities && b.cities.some(c => normalizeCitySlug(c) === normCity)) return true
    if (b.locations && b.locations.some(l => normalizeCitySlug(l.city) === normCity)) return true
    return false
  })
}

/**
 * Filter businesses for a category and city combination.
 */
export function filterBusinessesByCategoryAndCity(
  businesses: BusinessItem[],
  categoryId: string,
  citySlug: string
): BusinessItem[] {
  const inCat = filterBusinessesByCategory(businesses, categoryId)
  return filterBusinessesByCity(inCat, citySlug)
}

export interface PopulatedCategoryCityPair {
  categorySlug: string
  categoryName: string
  citySlug: string
  cityName: string
  count: number
}

/**
 * Returns all (category, city) pairs that have at least 1 real approved business listing.
 */
export function getPopulatedCategoryCityPairs(businesses: BusinessItem[]): PopulatedCategoryCityPair[] {
  const map = new Map<string, { categorySlug: string; citySlug: string; count: number }>()

  for (const b of businesses) {
    const catSlug = normalizeBusinessCategoryId(b)
    const cityList = new Set<string>()
    if (b.city) cityList.add(b.city)
    if (b.cities) b.cities.forEach(c => cityList.add(c))
    if (b.locations) b.locations.forEach(l => { if (l.city) cityList.add(l.city) })

    for (const rawCity of cityList) {
      const citySlug = normalizeCitySlug(rawCity)
      if (!citySlug || citySlug === 'usa' || citySlug === 'united-states' || citySlug === 'nationwide' || citySlug === 'all-usa') continue
      const key = `${catSlug}:::${citySlug}`
      const existing = map.get(key)
      if (existing) {
        existing.count += 1
      } else {
        map.set(key, { categorySlug: catSlug, citySlug, count: 1 })
      }
    }
  }

  const result: PopulatedCategoryCityPair[] = []
  for (const item of map.values()) {
    result.push({
      categorySlug: item.categorySlug,
      categoryName: getCategoryDisplayName(item.categorySlug),
      citySlug: item.citySlug,
      cityName: getCityDisplayName(item.citySlug),
      count: item.count
    })
  }

  return result.sort((a, b) => b.count - a.count || a.cityName.localeCompare(b.cityName))
}

/**
 * Returns distinct cities where a given category actually has listings.
 */
export function getCitiesWithListingsForCategory(businesses: BusinessItem[], categoryId: string): { citySlug: string; cityName: string; count: number }[] {
  const pairs = getPopulatedCategoryCityPairs(businesses)
  return pairs
    .filter(p => p.categorySlug === categoryId)
    .map(p => ({ citySlug: p.citySlug, cityName: p.cityName, count: p.count }))
}

/**
 * Returns distinct categories that have listings in a given city.
 */
export function getCategoriesWithListingsForCity(businesses: BusinessItem[], citySlug: string): { categorySlug: string; categoryName: string; count: number }[] {
  const normCity = citySlug.toLowerCase()
  const pairs = getPopulatedCategoryCityPairs(businesses)
  return pairs
    .filter(p => p.citySlug === normCity)
    .map(p => ({ categorySlug: p.categorySlug, categoryName: p.categoryName, count: p.count }))
}

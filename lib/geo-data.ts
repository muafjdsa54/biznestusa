// Geo data loader for the Census Gazetteer dataset served from /public/data.
// Client-safe plain TS — no Firestore imports. Fetches are lazy and cached:
// states.json loads once on demand; each state's cities file loads only after
// that state is chosen. On any fetch failure the loader rejects and callers
// fall back to the hardcoded lists in lib/data.ts — the form must never break.

export interface GeoState {
  code: string
  name: string
  geoid: string
  lat: number
  lng: number
  cityCount: number
}

export interface GeoCity {
  geoid: string
  name: string
  fullName: string
  slug: string
  state: string
  stateName: string
  type: 'incorporated' | 'CDP'
  lsad: string
  population: number | null
  populationYear: number | null
  lat: number
  lng: number
  landSqMi: number | null
}

let statesCache: GeoState[] | null = null
let statesPromise: Promise<GeoState[]> | null = null

/** Fetch /data/states.json once; later calls return the cached list. Rejects on failure. */
export async function loadStates(): Promise<GeoState[]> {
  if (statesCache) return statesCache
  if (!statesPromise) {
    statesPromise = fetch('/data/states.json')
      .then((res) => {
        if (!res.ok) throw new Error(`states.json: HTTP ${res.status}`)
        return res.json() as Promise<GeoState[]>
      })
      .then((list) => {
        statesCache = list
        return list
      })
      .catch((err) => {
        statesPromise = null
        throw err
      })
  }
  return statesPromise
}

const citiesCache = new Map<string, GeoCity[]>()
const citiesPromises = new Map<string, Promise<GeoCity[]>>()

/** Fetch /data/cities/{ST}.json once per state; later calls return the cached list. Rejects on failure. */
export async function loadCities(stateCode: string): Promise<GeoCity[]> {
  const code = stateCode.toUpperCase()
  const cached = citiesCache.get(code)
  if (cached) return cached
  const pending = citiesPromises.get(code)
  if (pending) return pending
  const p = fetch(`/data/cities/${code}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`cities/${code}.json: HTTP ${res.status}`)
      return res.json() as Promise<GeoCity[]>
    })
    .then((list) => {
      citiesCache.set(code, list)
      citiesPromises.delete(code)
      return list
    })
    .catch((err) => {
      citiesPromises.delete(code)
      throw err
    })
  citiesPromises.set(code, p)
  return p
}

/** State NAME (e.g. 'California') to code ('CA'), or null when not found. */
export function stateCodeForName(name: string, states: GeoState[]): string | null {
  const found = states.find((s) => s.name.toLowerCase() === name.trim().toLowerCase())
  return found ? found.code : null
}

/** Case-insensitive substring match on city name, capped at `limit` (default 50). */
export function searchCities(cities: GeoCity[], query: string, limit = 50): GeoCity[] {
  const q = query.trim().toLowerCase()
  if (!q) return cities.slice(0, limit)
  const out: GeoCity[] = []
  for (const c of cities) {
    if (c.name.toLowerCase().includes(q)) {
      out.push(c)
      if (out.length >= limit) break
    }
  }
  return out
}

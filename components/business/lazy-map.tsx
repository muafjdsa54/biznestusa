'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'

interface LazyMapProps {
  address: string
  city: string
  name: string
}

export default function LazyMap({ address, city, name }: LazyMapProps) {
  const [shouldLoadMap, setShouldLoadMap] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldLoadMap) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadMap(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (mapRef.current) {
      observer.observe(mapRef.current)
    }

    return () => observer.disconnect()
  }, [shouldLoadMap])

  const mapQuery = encodeURIComponent(`${address}, ${city}, United States`)
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed`
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  return (
    <div ref={mapRef} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span>Location & Directions</span>
        </h2>
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
        <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{address || `${name}, ${city}`}, United States</span>
      </p>

      <div className="relative w-full h-[280px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
        {shouldLoadMap ? (
          <iframe
            src={mapSrc}
            width="100%"
            height="280"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title={`Location map for ${name}`}
            className="w-full h-full rounded-xl"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">{name}</p>
              <p className="text-[11px] text-slate-500">{address}, {city}</p>
            </div>
            <button
              onClick={() => setShouldLoadMap(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Load Interactive Map</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

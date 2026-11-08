'use client'

import type { Dispatch, KeyboardEvent, SetStateAction } from 'react'
import { Check, ChevronDown, Globe, Mail, MapPin, MessageCircle, Phone, Plus, Users } from 'lucide-react'
import { STATE_CITIES, US_STATES } from '@/lib/data'
import { searchCities, stateCodeForName, type GeoState, GeoCity } from '@/lib/geo-data'
import { filterPersonNameInput, formatUsPhone } from '@/lib/validation'
import type { AddBusinessFormData } from './types'

interface StepLocationsPanelProps {
  ensureStateCities: (stateName: string) => void
  errors: Record<string, string>
  formData: AddBusinessFormData
  geoCitiesByCode: Record<string, GeoCity[]>
  geoLoadingCodes: Record<string, boolean>
  geoStates: GeoState[] | null
  handleAddLocation: () => void
  handleAddressKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void
  handleCustomCityNameChange: (index: number, name: string) => void
  handleLocationAddressChange: (index: number, address: string) => void
  handleLocationCitySearch: (index: number, query: string) => void
  handleLocationCitySelect: (index: number, city: string) => void
  handleLocationOtherCitySelect: (index: number) => void
  handleLocationZipChange: (index: number, value: string) => void
  handleRemoveLocation: (index: number) => void
  handleSetPrimaryLocation: (index: number) => void
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
  setFormData: Dispatch<SetStateAction<AddBusinessFormData>>
  toggleLocationCityDropdown: (index: number) => void
}

export default function StepLocationsPanel({ ensureStateCities, errors, formData, geoCitiesByCode, geoLoadingCodes, geoStates, handleAddLocation, handleAddressKeyDown, handleCustomCityNameChange, handleLocationAddressChange, handleLocationCitySearch, handleLocationCitySelect, handleLocationOtherCitySelect, handleLocationZipChange, handleRemoveLocation, handleSetPrimaryLocation, setErrors, setFormData, toggleLocationCityDropdown }: StepLocationsPanelProps) {
  return (
                        <div className="space-y-6 animate-in fade-in-50">
                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Step 2: Business Locations & Contact Channels</h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Add all physical branches, campuses, or store locations across cities. The first location is set as your Primary location.
                            </p>
                          </div>

                          {/* REPEATABLE LOCATIONS SECTION */}
                          <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                Business Locations ({formData.locations.length} {formData.locations.length === 1 ? 'Location' : 'Locations'})
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                Press <strong>Enter</strong> in address to add another location
                              </span>
                            </div>

                            {formData.locations.map((loc, index) => {
                              const stateCode = loc.state && geoStates ? stateCodeForName(loc.state, geoStates) : null
                              const geoList = stateCode ? geoCitiesByCode[stateCode] : undefined
                              const geoLoading = stateCode ? !!geoLoadingCodes[stateCode] : false
                              const fallbackCities = loc.state ? (STATE_CITIES[loc.state] || []) : []
                              const usingGeoCities = !!geoList && geoList.length > 0
                              const availableCities = usingGeoCities ? geoList.map(c => c.name) : fallbackCities
                              const filteredCities = usingGeoCities
                                ? searchCities(geoList, loc.citySearchQuery || '').map(c => c.name)
                                : availableCities.filter(c =>
                                    c.toLowerCase().includes((loc.citySearchQuery || '').toLowerCase().trim())
                                  )

                              return (
                                <div 
                                  key={index}
                                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                                    loc.isPrimary 
                                      ? 'bg-blue-50/40 border-blue-200 shadow-xs' 
                                      : 'bg-slate-50/60 border-slate-200'
                                  }`}
                                >
                                  <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-200/60">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                                        {index + 1}
                                      </span>
                                      <h4 className="text-sm font-extrabold text-slate-900">
                                        Location {index + 1}
                                      </h4>
                                      {loc.isPrimary ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                                          Primary Location
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleSetPrimaryLocation(index)}
                                          className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                                        >
                                          Set as Primary
                                        </button>
                                      )}
                                    </div>

                                    {formData.locations.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveLocation(index)}
                                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                      >
                                        Remove Location
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1.5">State *</label>
                                      <select
                                        id={`field-location-${index}-state`}
                                        value={loc.state}
                                        onChange={(e) => {
                                          ensureStateCities(e.target.value)
                                          setFormData(prev => ({
                                            ...prev,
                                            locations: prev.locations.map((item, i) => i === index ? {
                                              ...item,
                                              state: e.target.value,
                                              city: '',
                                              citySearchQuery: '',
                                              isCityDropdownOpen: false
                                            } : item)
                                          }))
                                          if (errors[`location_${index}_state`]) {
                                            setErrors(prev => {
                                              const next = { ...prev }
                                              delete next[`location_${index}_state`]
                                              return next
                                            })
                                          }
                                        }}
                                        className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                          errors[`location_${index}_state`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                        }`}
                                      >
                                        <option value="">Search or select a state</option>
                                        {(geoStates ? geoStates.map(s => s.name) : US_STATES).map((state) => <option key={state} value={state}>{state}</option>)}
                                      </select>
                                      {errors[`location_${index}_state`] && (
                                        <span className="text-xs font-semibold text-red-500 mt-1 block">
                                          {errors[`location_${index}_state`]}
                                        </span>
                                      )}
                                    </div>
                                    {/* City Selector for Location Block */}
                                    <div className="relative">
                                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        City *
                                      </label>
                                      <div className="relative">
                                        <button
                                          type="button"
                                          id={`field-location-${index}-city`}
                                          onClick={() => toggleLocationCityDropdown(index)}
                                          disabled={!loc.state}
                                          aria-disabled={!loc.state}
                                          className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition disabled:cursor-not-allowed disabled:bg-slate-50 ${
                                            errors[`location_${index}_city`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200 hover:border-slate-300'
                                          }`}
                                        >
                                          <span className={loc.city ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                                            {loc.isCustomCity
                                              ? (loc.customCityName ? `${loc.customCityName} (Custom)` : 'Other City (Type below)')
                                              : (loc.city ? loc.city : loc.state ? `-- Select City (${availableCities.length} Cities) --` : '-- Select a state first --')}
                                          </span>
                                          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${loc.isCityDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {loc.isCityDropdownOpen && (
                                          <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 duration-150">
                                            {geoLoading && (
                                              <div className="px-3 py-1.5 text-xs text-slate-400 bg-slate-50/80 border-b border-slate-100">Loading cities…</div>
                                            )}
                                            <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0">
                                              <input
                                                type="text"
                                                value={loc.citySearchQuery || ''}
                                                onChange={(e) => handleLocationCitySearch(index, e.target.value)}
                                                placeholder="Search city..."
                                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                autoFocus
                                              />
                                            </div>

                                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1">
                                              {filteredCities.length > 0 ? (
                                                filteredCities.map((city) => (
                                                  <button
                                                    key={city}
                                                    type="button"
                                                    onClick={() => handleLocationCitySelect(index, city)}
                                                    className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition ${
                                                      loc.city === city ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                  >
                                                    <span>{city}</span>
                                                    {loc.city === city && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                                  </button>
                                                ))
                                              ) : (
                                                <div className="p-3 text-center text-xs text-slate-500 space-y-2">
                                                  <p>City not in standard list.</p>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handleCustomCityNameChange(index, loc.citySearchQuery || '')
                                                      handleLocationOtherCitySelect(index)
                                                    }}
                                                    className="min-h-[44px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                                  >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Use &ldquo;{loc.citySearchQuery || 'Custom City'}&rdquo;</span>
                                                  </button>
                                                </div>
                                              )}
                                            </div>

                                            {/* Sticky Other City option */}
                                            <div className="p-1 border-t border-slate-100 bg-slate-50/90 sticky bottom-0">
                                              <button
                                                type="button"
                                                onClick={() => handleLocationOtherCitySelect(index)}
                                                className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition font-bold cursor-pointer ${
                                                  loc.isCustomCity ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'
                                                }`}
                                              >
                                                <span className="flex items-center gap-1.5">
                                                  <Plus className="w-3.5 h-3.5" />
                                                  <span>Other City (Not Listed)</span>
                                                </span>
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                                                  Specify custom
                                                </span>
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Custom City Input when Other City is selected */}
                                      {loc.isCustomCity && (
                                        <div className="mt-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-200 animate-in fade-in-50 duration-200">
                                          <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-blue-900">
                                              Specify City Name *
                                            </label>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setFormData(prev => {
                                                  const updated = [...prev.locations]
                                                  updated[index] = { ...updated[index], isCustomCity: false, customCityName: '', city: '' }
                                                  return { ...prev, locations: updated }
                                                })
                                              }}
                                              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                                            >
                                              Back to list
                                            </button>
                                          </div>
                                          <input
                                            type="text"
                                            id={`field-location-${index}-customCity`}
                                            value={loc.customCityName || ''}
                                            onChange={(e) => handleCustomCityNameChange(index, e.target.value)}
                                            placeholder="Enter your city name (e.g. Arlington, Plano, Scottsdale)..."
                                            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                              errors[`location_${index}_city`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-blue-300'
                                            }`}
                                            autoFocus
                                          />
                                        </div>
                                      )}
                                      {errors[`location_${index}_city`] && (
                                        <span className="text-xs font-semibold text-red-500 mt-1 block">
                                          {errors[`location_${index}_city`]}
                                        </span>
                                      )}
                                    </div>

                                    {/* Address Field */}
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Physical Address / Area *
                                      </label>
                                      <input
                                        type="text"
                                        id={`field-location-${index}-address`}
                                        value={loc.address}
                                        onChange={(e) => handleLocationAddressChange(index, e.target.value)}
                                        onKeyDown={(e) => handleAddressKeyDown(e, index)}
                                        placeholder="e.g. Suite 400, 1200 Broadway"
                                        className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                          errors[`location_${index}_address`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                        }`}
                                      />
                                      {errors[`location_${index}_address`] && (
                                        <span className="text-xs font-semibold text-red-500 mt-1 block">
                                          {errors[`location_${index}_address`]}
                                        </span>
                                      )}
                                    </div>

                                    {/* ZIP Code Field */}
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        ZIP Code *
                                      </label>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        id={`field-location-${index}-zip`}
                                        value={loc.zipCode || ''}
                                        maxLength={10}
                                        onChange={(e) => handleLocationZipChange(index, e.target.value)}
                                        placeholder="e.g. 90210"
                                        className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                          errors[`location_${index}_zip`] ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                        }`}
                                      />
                                      {errors[`location_${index}_zip`] && (
                                        <span className="text-xs font-semibold text-red-500 mt-1 block">
                                          {errors[`location_${index}_zip`]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}

                            <button
                              type="button"
                              onClick={handleAddLocation}
                              className="w-full py-3 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border-2 border-dashed border-blue-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span>+ Add Another Branch / City Location</span>
                            </button>
                          </div>

                          {/* Contact Info Channels */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Phone Number (Calls - USA Standard) *
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-phone"
                                  type="tel"
                                  maxLength={17}
                                  value={formData.phone}
                                  onChange={(e) => {
                                    setFormData({ ...formData, phone: formatUsPhone(e.target.value) })
                                    if (errors.phone) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.phone
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="+1 (555) 123-4567"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.phone ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.phone ? (
                                <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.phone}</span>
                              ) : (
                                <span className="text-xs text-slate-400 mt-1 block">USA format: +1 (XXX) XXX-XXXX (10 digits)</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                WhatsApp Number (Inquiries - USA Standard)
                              </label>
                              <div className="relative">
                                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-whatsapp"
                                  type="tel"
                                  maxLength={17}
                                  value={formData.whatsapp}
                                  onChange={(e) => {
                                    setFormData({ ...formData, whatsapp: formatUsPhone(e.target.value) })
                                    if (errors.whatsapp) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.whatsapp
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="+1 (555) 123-4567"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.whatsapp ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.whatsapp ? (
                                <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.whatsapp}</span>
                              ) : (
                                <span className="text-xs text-slate-400 mt-1 block">USA format: +1 (XXX) XXX-XXXX (10 digits)</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Business Email *
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value })
                                    if (errors.email) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.email
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="info@yourcompany.com"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.email ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.email ? (
                                <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.email}</span>
                              ) : (
                                <span className="text-xs text-slate-400 mt-1 block">We use this for listing contact and approval updates.</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Contact Person / Representative Name
                              </label>
                              <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-ownerName"
                                  type="text"
                                  value={formData.ownerName}
                                  onChange={(e) => {
                                    const cleaned = filterPersonNameInput(e.target.value)
                                    setFormData({ ...formData, ownerName: cleaned })
                                    if (errors.ownerName) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.ownerName
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="e.g. John Miller (Letters only)"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.ownerName ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                              </div>
                              {errors.ownerName ? (
                                <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.ownerName}</span>
                              ) : (
                                <span className="text-xs text-slate-400 mt-1 block">Authorized representative or owner name (letters only).</span>
                              )}
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Website (Optional)
                              </label>
                              <div className="relative">
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  id="field-website"
                                  type="url"
                                  value={formData.website}
                                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                  placeholder="https://yourcompany.com"
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>
                          </div>

                        </div>
  )
}

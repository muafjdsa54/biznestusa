'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Sparkles } from 'lucide-react'
import type { AddBusinessFormData } from './types'

interface StepHoursPanelProps {
  applyHoursPreset: (preset: 'standard' | 'retail' | '24_7' | 'mon_sat') => void
  formData: AddBusinessFormData
  operatingHoursState: Record<string, { isOpen: boolean; openTime: string; closeTime: string; is24Hours: boolean }>
  setFormData: Dispatch<SetStateAction<AddBusinessFormData>>
  setOperatingHoursState: Dispatch<SetStateAction<Record<string, { isOpen: boolean; openTime: string; closeTime: string; is24Hours: boolean }>>>
}

export default function StepHoursPanel({ applyHoursPreset, formData, operatingHoursState, setFormData, setOperatingHoursState }: StepHoursPanelProps) {
  return (
                        <div className="space-y-6 animate-in fade-in-50">
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              Step 3: Operating Hours
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                              Operating Hours &amp; Customer Availability
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Accurate business hours build customer confidence and help local buyers call or visit at the right time.
                            </p>
                          </div>

                          {/* QUICK PRESETS */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-700">Quick Hours Presets:</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <button
                                type="button"
                                onClick={() => applyHoursPreset('standard')}
                                className="min-h-[44px] px-3 py-2.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer text-center"
                              >
                                Standard (Mon-Fri 9-5)
                              </button>
                              <button
                                type="button"
                                onClick={() => applyHoursPreset('retail')}
                                className="min-h-[44px] px-3 py-2.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer text-center"
                              >
                                Retail (7 Days 8-8)
                              </button>
                              <button
                                type="button"
                                onClick={() => applyHoursPreset('mon_sat')}
                                className="min-h-[44px] px-3 py-2.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer text-center"
                              >
                                Mon-Sat (9-6)
                              </button>
                              <button
                                type="button"
                                onClick={() => applyHoursPreset('24_7')}
                                className="min-h-[44px] px-3 py-2.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer text-center"
                              >
                                Open 24/7 Service
                              </button>
                            </div>
                          </div>

                          {/* 7 DAYS SCHEDULE TABLE */}
                          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                              const sched = operatingHoursState[day] || { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM', is24Hours: false }
                              const TIME_OPTIONS = [
                                '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM',
                                '06:00 AM', '07:00 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
                                '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
                                '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
                                '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
                                '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '10:00 PM', '11:00 PM', '11:59 PM'
                              ]

                              return (
                                <div key={day} className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${sched.isOpen ? 'bg-white' : 'bg-slate-50/70'}`}>
                                  <div className="flex items-center gap-3 sm:w-36">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOperatingHoursState(prev => ({
                                          ...prev,
                                          [day]: { ...sched, isOpen: !sched.isOpen }
                                        }))
                                      }}
                                      className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-extrabold uppercase transition cursor-pointer ${
                                        sched.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                      }`}
                                    >
                                      {sched.isOpen ? 'Open' : 'Closed'}
                                    </button>
                                    <span className={`text-xs font-bold ${sched.isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                                      {day}
                                    </span>
                                  </div>

                                  {sched.isOpen ? (
                                    <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-start sm:justify-end">
                                      <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer mr-2">
                                        <input
                                          type="checkbox"
                                          checked={sched.is24Hours}
                                          onChange={(e) => {
                                            setOperatingHoursState(prev => ({
                                              ...prev,
                                              [day]: { ...sched, is24Hours: e.target.checked }
                                            }))
                                          }}
                                          className="w-3.5 h-3.5 text-blue-600 rounded"
                                        />
                                        <span>24 Hours</span>
                                      </label>

                                      {!sched.is24Hours && (
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={sched.openTime}
                                            onChange={(e) => {
                                              setOperatingHoursState(prev => ({
                                                ...prev,
                                                [day]: { ...sched, openTime: e.target.value }
                                              }))
                                            }}
                                            className="min-h-[44px] px-2.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                          >
                                            {TIME_OPTIONS.map(t => (
                                              <option key={t} value={t}>{t}</option>
                                            ))}
                                          </select>
                                          <span className="text-xs text-slate-400 font-semibold">to</span>
                                          <select
                                            value={sched.closeTime}
                                            onChange={(e) => {
                                              setOperatingHoursState(prev => ({
                                                ...prev,
                                                [day]: { ...sched, closeTime: e.target.value }
                                              }))
                                            }}
                                            className="min-h-[44px] px-2.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                          >
                                            {TIME_OPTIONS.map(t => (
                                              <option key={t} value={t}>{t}</option>
                                            ))}
                                          </select>
                                        </div>
                                      )}

                                      {sched.is24Hours && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                          Open 24 Hours
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 font-medium sm:text-right">
                                      Closed All Day
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* BRAND AUTHORITY & GOOGLE RANK BOOSTER (GBP & SOCIAL PROFILES) */}
                          <div className="pt-4 border-t border-slate-200/80 space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-200/70 space-y-1">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                  Brand Authority &amp; Google Rank Booster
                                </h3>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Connect your verified Google Business Profile, Facebook, Instagram, and LinkedIn. Linking authentic corporate profiles establishes direct brand authority, builds trust with visitors, and accelerates ranking on Google local search.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Google Business Profile (GBP / Maps URL)
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://maps.google.com/?cid=... or https://g.page/..."
                                  value={formData.googleBusinessProfile}
                                  onChange={(e) => setFormData({ ...formData, googleBusinessProfile: e.target.value })}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <p className="text-xs text-slate-400 mt-1">Strengthens local map citations and Google search visibility</p>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Facebook Page / Profile URL
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://facebook.com/yourbusiness"
                                  value={formData.facebookUrl}
                                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <p className="text-xs text-slate-400 mt-1">Official Facebook company page or business handle</p>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Instagram Profile URL
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://instagram.com/yourbusiness"
                                  value={formData.instagramUrl}
                                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <p className="text-xs text-slate-400 mt-1">Visual branding portfolio and customer engagement</p>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  LinkedIn Profile / Company Page
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://linkedin.com/company/yourbusiness"
                                  value={formData.linkedinUrl}
                                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <p className="text-xs text-slate-400 mt-1">B2B corporate authority and verified professional presence</p>
                              </div>
                            </div>
                          </div>
                        </div>
  )
}

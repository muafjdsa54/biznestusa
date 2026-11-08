'use client'

import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import Link from 'next/link'
import { Briefcase, Building2, ImageIcon, Upload, Users, X } from 'lucide-react'
import { BUSINESS_CATEGORIES } from '@/lib/data'
import type { AddBusinessFormData } from './types'

interface StepIdentityPanelProps {
  availableSubcategories: string[]
  customCategoryText: string
  customSubcategoryText: string
  errors: Record<string, string>
  formData: AddBusinessFormData
  handleCategorySelectChange: (val: string) => void
  handleCustomCategoryTextChange: (text: string) => void
  handleCustomSubcategoryTextChange: (text: string) => void
  handleGalleryFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleLogoFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleLogoUrlChange: (url: string) => void
  handleRemoveGalleryPhoto: (index: number) => void
  handleRemoveLogo: () => void
  handleSubcategorySelectChange: (val: string) => void
  isCustomCategory: boolean
  isCustomSubcategory: boolean
  logoPreview: string | null
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
  setFormData: Dispatch<SetStateAction<AddBusinessFormData>>
}

export default function StepIdentityPanel({ availableSubcategories, customCategoryText, customSubcategoryText, errors, formData, handleCategorySelectChange, handleCustomCategoryTextChange, handleCustomSubcategoryTextChange, handleGalleryFileChange, handleLogoFileChange, handleLogoUrlChange, handleRemoveGalleryPhoto, handleRemoveLogo, handleSubcategorySelectChange, isCustomCategory, isCustomSubcategory, logoPreview, setErrors, setFormData }: StepIdentityPanelProps) {
  return (
                        <div className="space-y-6 animate-in fade-in-50">
                          {/* Category Type Switcher Banner */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-700">What profile type are you creating on BizNest USA?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3 bg-white border-2 border-blue-600 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900">Business / Store</p>
                                  <p className="text-xs text-slate-500">Retail shops & vendors</p>
                                </div>
                              </div>

                              <Link
                                href="/add-professional"
                                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl flex items-center gap-3 transition-all hover:bg-blue-50/50 group cursor-pointer"
                              >
                                <div className="p-2 bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 rounded-lg shrink-0">
                                  <Users className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600">Professional</p>
                                  <p className="text-xs text-slate-500">Personal & Freelancer</p>
                                </div>
                              </Link>

                              <Link
                                href="/add-company"
                                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl flex items-center gap-3 transition-all hover:bg-blue-50/50 group cursor-pointer"
                              >
                                <div className="p-2 bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 rounded-lg shrink-0">
                                  <Briefcase className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600">Hiring Company / HR</p>
                                  <p className="text-xs text-slate-500">Employers & Jobs</p>
                                </div>
                              </Link>
                            </div>
                          </div>

                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Step 1: Business Identity & Category</h2>
                            <p className="text-xs text-slate-500 mt-1">Enter your registered or commercial trade name and industry taxonomy.</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Business Name *
                              </label>
                              <input
                                id="field-businessName"
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => {
                                  setFormData({ ...formData, businessName: e.target.value })
                                  if (errors.businessName) {
                                    setErrors(prev => {
                                      const next = { ...prev }
                                      delete next.businessName
                                      return next
                                    })
                                  }
                                }}
                                placeholder="e.g. Apex Global Solutions / Austin Creative Tech"
                                className={`w-full px-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                  errors.businessName ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                }`}
                              />
                              {errors.businessName && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.businessName}</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-xs font-bold text-slate-700">Industry Category *</label>
                                  {isCustomCategory && (
                                    <span className="text-xs text-blue-600 font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                                      Custom Industry
                                    </span>
                                  )}
                                </div>
                                <select
                                  id="field-category"
                                  value={isCustomCategory ? 'Other' : (BUSINESS_CATEGORIES.some(c => c.name === formData.category) ? formData.category : (formData.category ? 'Other' : ''))}
                                  onChange={(e) => handleCategorySelectChange(e.target.value)}
                                  className={`w-full px-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
                                    errors.category ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                >
                                  <option value="">-- Select Business Category --</option>
                                  {BUSINESS_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                  ))}
                                  <option value="Other">Other Category (Not Listed)</option>
                                </select>
                                {errors.category && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.category}</span>}

                                {isCustomCategory && (
                                  <div className="mt-2.5 space-y-1">
                                    <label className="block text-xs font-bold text-blue-900">
                                      Specify Your Custom Category / Industry *
                                    </label>
                                    <input
                                      id="field-customCategory"
                                      type="text"
                                      value={customCategoryText}
                                      onChange={(e) => handleCustomCategoryTextChange(e.target.value)}
                                      placeholder="e.g. Solar Energy, Biotechnology, Aerospace..."
                                      className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-xs font-bold text-slate-700">Subcategory Specialization</label>
                                  {isCustomSubcategory && (
                                    <span className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                                      Custom Specialty
                                    </span>
                                  )}
                                </div>

                                {isCustomCategory ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={formData.subcategory}
                                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                      placeholder="e.g. Solar Panel Fabrication, Research Lab..."
                                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <span className="text-xs text-slate-500 mt-1 block">
                                      Enter your specific service focus or primary commercial offering.
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <select
                                      value={isCustomSubcategory ? 'Other' : (availableSubcategories.includes(formData.subcategory) ? formData.subcategory : (formData.subcategory ? 'Other' : ''))}
                                      onChange={(e) => handleSubcategorySelectChange(e.target.value)}
                                      disabled={!formData.category}
                                      className={`w-full px-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-slate-200`}
                                    >
                                      <option value="">
                                        {formData.category ? `-- Select Subcategory Specialization --` : `-- Select Primary Category First --`}
                                      </option>
                                      {availableSubcategories.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                      ))}
                                      {formData.category && (
                                        <option value="Other">Other Subcategory / Specialization</option>
                                      )}
                                    </select>

                                    {isCustomSubcategory && (
                                      <div className="mt-2.5 space-y-1">
                                        <label className="block text-xs font-bold text-indigo-900">
                                          Specify Your Subcategory Specialization
                                        </label>
                                        <input
                                          type="text"
                                          value={customSubcategoryText}
                                          onChange={(e) => handleCustomSubcategoryTextChange(e.target.value)}
                                          placeholder="e.g. Tankless Water Heaters, EV Charger Install..."
                                          className="w-full px-4 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* BUSINESS LOGO UPLOAD SECTION */}
                            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                    <span>Business Logo / Brand Icon (Optional)</span>
                                  </label>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Upload your official logo or brand mark to make your listing stand out on BizNest USA.
                                  </p>
                                </div>
                                {logoPreview && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                {/* Preview Avatar Box */}
                                <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs group">
                                  {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                      <Building2 className="w-6 h-6 text-slate-400" />
                                      <span className="text-xs font-bold mt-0.5 text-slate-400">No Logo</span>
                                    </div>
                                  )}
                                </div>

                                {/* File Input & URL Input */}
                                <div className="flex-1 w-full space-y-2">
                                  <div className="flex items-center gap-2">
                                    <label className="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl cursor-pointer transition shadow-2xs flex items-center gap-2 hover:border-blue-300">
                                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                                      <span>{logoPreview ? 'Change Logo Image' : 'Choose Logo File (PNG, JPG, WebP)'}</span>
                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={handleLogoFileChange}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>

                                  <div className="relative">
                                    <input
                                      type="url"
                                      value={formData.logo || ''}
                                      onChange={(e) => handleLogoUrlChange(e.target.value)}
                                      placeholder="Or paste direct image URL / Google Drive link"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* BUSINESS PHOTO GALLERY (OPTIONAL, UP TO 5 PHOTOS) */}
                            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 space-y-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <ImageIcon className="w-4 h-4 text-blue-600" />
                                  <span>Business Photos — Gallery (Optional, up to 5) · $10 Plan Benefit</span>
                                </label>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Add up to 5 photos of your storefront, team, or work, in addition to your logo. The photo gallery is included with the $10 Authoritative plan — photos are only published on $10 listings.
                                </p>
                              </div>

                              {(formData.gallery || []).length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                  {(formData.gallery || []).map((photo, photoIdx) => (
                                    <div key={photoIdx} className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                                      <img src={photo} alt={`Business photo ${photoIdx + 1}`} className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveGalleryPhoto(photoIdx)}
                                        className="absolute top-1 right-1 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white/90 text-red-600 rounded-lg shadow-xs hover:bg-red-50 cursor-pointer"
                                        title="Remove photo"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {(formData.gallery || []).length < 5 && (
                                <label className="px-4 py-2.5 min-h-[44px] bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl cursor-pointer transition shadow-2xs inline-flex items-center gap-2 hover:border-blue-300">
                                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{(formData.gallery || []).length === 0 ? 'Add Photos (PNG, JPG, WebP — max 10MB each)' : `Add More Photos (${5 - (formData.gallery || []).length} left)`}</span>
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    multiple
                                    onChange={handleGalleryFileChange}
                                    className="hidden"
                                  />
                                </label>
                              )}
                              {errors.gallery && (
                                <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.gallery}</span>
                              )}
                            </div>
                          </div>
                        </div>
  )
}

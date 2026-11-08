'use client'

import type { Dispatch, SetStateAction } from 'react'
import { AlertCircle, HelpCircle, Plus } from 'lucide-react'
import type { AddBusinessFormData } from './types'

interface StepDetailsPanelProps {
  errors: Record<string, string>
  formData: AddBusinessFormData
  handleAddFaq: () => void
  handleFaqChange: (index: number, field: 'question' | 'answer', value: string) => void
  handleRemoveFaq: (index: number) => void
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
  setFormData: Dispatch<SetStateAction<AddBusinessFormData>>
}

export default function StepDetailsPanel({ errors, formData, handleAddFaq, handleFaqChange, handleRemoveFaq, setErrors, setFormData }: StepDetailsPanelProps) {
  return (
                        <div className="space-y-6 animate-in fade-in-50">
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              Step 4: Details &amp; FAQs
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                              Comprehensive Profile &amp; Business Narrative
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Detailed business listings with 150+ words index faster on Google search engines. (Minimum 30 words required).
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                  Business Overview (Min 30 Words) *
                                </label>
                                <span className={`text-xs font-bold ${
                                  (formData.description.trim().split(/\s+/).filter(Boolean).length >= 30)
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}>
                                  Word Count: {formData.description.trim() ? formData.description.trim().split(/\s+/).filter(Boolean).length : 0} / 30 words min (150+ recommended)
                                </span>
                              </div>
                              <textarea
                                id="field-description"
                                rows={6}
                                value={formData.description}
                                onChange={(e) => {
                                  setFormData({ ...formData, description: e.target.value })
                                  if (errors.description) {
                                    setErrors(prev => {
                                      const next = { ...prev }
                                      delete next.description
                                      return next
                                    })
                                  }
                                }}
                                placeholder="Describe your business background, offerings, why customers in the United States should choose you, years of experience, unique features, and customer guarantees..."
                                className={`w-full p-4 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed ${
                                  errors.description ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                }`}
                              ></textarea>
                              {errors.description && (
                                <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.description}</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Key Products / Services Offered (Comma Separated)
                              </label>
                              <input
                                type="text"
                                value={formData.services}
                                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                                placeholder="e.g. Fast Delivery, Custom Furniture, Corporate Packages, 24/7 Support"
                                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>

                            {/* YEAR ESTABLISHED / PRICE RANGE / SERVICE AREA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                  Year Established (Optional)
                                </label>
                                <input
                                  id="field-yearEstablished"
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={4}
                                  value={formData.yearEstablished}
                                  onChange={(e) => {
                                    setFormData({ ...formData, yearEstablished: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })
                                    if (errors.yearEstablished) {
                                      setErrors(prev => {
                                        const next = { ...prev }
                                        delete next.yearEstablished
                                        return next
                                      })
                                    }
                                  }}
                                  placeholder="e.g. 2015"
                                  className={`w-full px-4 py-3 bg-slate-50/80 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    errors.yearEstablished ? 'border-red-500 bg-red-50/30 ring-2 ring-red-400/20' : 'border-slate-200'
                                  }`}
                                />
                                {errors.yearEstablished && (
                                  <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.yearEstablished}</span>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                  Price Range (Optional)
                                </label>
                                <select
                                  id="field-priceRange"
                                  value={formData.priceRange}
                                  onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                                >
                                  <option value="">— Select price range —</option>
                                  <option value="$">$ — Budget-friendly</option>
                                  <option value="$$">$$ — Moderate</option>
                                  <option value="$$$">$$$ — Premium</option>
                                  <option value="$$$$">$$$$ — Luxury</option>
                                </select>
                                {errors.priceRange && (
                                  <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.priceRange}</span>
                                )}
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                  Service Area (Optional)
                                </label>
                                <input
                                  id="field-serviceArea"
                                  type="text"
                                  value={formData.serviceArea}
                                  onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                                  placeholder="e.g. Greater Austin area and Travis County"
                                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Frequently Asked Questions (Optional) */}
                            <div id="field-faqs" className="pt-6 border-t border-slate-200/80 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-bold text-slate-900">
                                      Frequently Asked Questions (Optional)
                                    </h3>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Direct FAQ answers capture visitor attention, answer buyer concerns immediately, and increase customer inquiries on your listing.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddFaq}
                                  className="min-h-[44px] px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Another FAQ</span>
                                </button>
                              </div>

                              {errors.faqs && (
                                <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                                  <span>{errors.faqs}</span>
                                </div>
                              )}

                              <div className="space-y-4">
                                {(formData.faqs || []).length === 0 && (
                                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                                    No FAQs added yet — click “Add FAQ” to add your own questions and answers. FAQs are optional.
                                  </p>
                                )}
                                {(formData.faqs || []).map((faq, faqIdx) => (
                                  <div
                                    key={faqIdx}
                                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-3 shadow-2xs"
                                  >
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                                      <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                          {faqIdx + 1}
                                        </span>
                                        FAQ Item #{faqIdx + 1}
                                      </span>
                                      {(
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveFaq(faqIdx)}
                                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                        >
                                          Remove FAQ
                                        </button>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Question
                                      </label>
                                      <input
                                        id={`field-faq-${faqIdx}-question`}
                                        type="text"
                                        value={faq.question}
                                        onChange={(e) => handleFaqChange(faqIdx, 'question', e.target.value)}
                                        placeholder="e.g. What are your turnaround times or service warranties?"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Answer
                                      </label>
                                      <textarea
                                        id={`field-faq-${faqIdx}-answer`}
                                        rows={3}
                                        value={faq.answer}
                                        onChange={(e) => handleFaqChange(faqIdx, 'answer', e.target.value)}
                                        placeholder="Provide a clear, detailed, and reassuring response to build customer confidence..."
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
  )
}

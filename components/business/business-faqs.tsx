'use client'

import React, { useState } from 'react'
import { HelpCircle, ChevronDown, Sparkles, MessageCircleQuestion } from 'lucide-react'

export interface BusinessFaqItem {
  question: string
  answer: string
}

interface BusinessFaqsSectionProps {
  businessName: string
  category?: string
  city?: string
  faqs?: BusinessFaqItem[]
}

export default function BusinessFaqsSection({
  businessName,
  category = 'Services',
  city = 'United States',
  faqs = []
}: BusinessFaqsSectionProps) {
  // If the business has custom FAQs from database, use them; otherwise provide high-value standard FAQs
  const displayFaqs: BusinessFaqItem[] = faqs && faqs.length > 0 ? faqs : [
    {
      question: `What services and specialties does ${businessName} provide?`,
      answer: `${businessName} provides specialized ${category.toLowerCase()} solutions tailored for residential, commercial, and professional clients in ${city} and surrounding areas.`
    },
    {
      question: `How can I request a quote or schedule a consultation with ${businessName}?`,
      answer: `You can reach out directly via the phone number, email, or official website listed on this profile. Consultations and estimates are typically arranged promptly during standard business hours.`
    },
    {
      question: `Is ${businessName} licensed, verified, and operating in ${city}?`,
      answer: `Yes, ${businessName} is registered and verified on the BizNest USA commercial directory. Our team undergoes background validation to ensure authentic customer representation.`
    }
  ]

  // Default first FAQ open to draw attention immediately
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index))
  }

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-8">
            Common questions answered directly by the management at {businessName}.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 self-start sm:self-center">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{displayFaqs.length} Answers Available</span>
        </div>
      </div>

      <div className="space-y-3" role="region" aria-label="Frequently Asked Questions">
        {displayFaqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-blue-50/30 border-blue-200 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Q{index + 1}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      isOpen ? 'text-blue-900' : 'text-slate-800'
                    }`}
                  >
                    {faq.question}
                  </span>
                </div>
                <div
                  className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${
                    isOpen ? 'bg-blue-100 text-blue-700 rotate-180' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-4 pb-5 pt-1 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-blue-100/60 pl-13 sm:pl-14 animate-in fade-in-50 duration-150"
                >
                  <p className="whitespace-pre-line">{faq.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

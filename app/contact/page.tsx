'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, MapPin, MessageSquare, MessageCircle, ShieldCheck, AlertCircle, ExternalLink, Sparkles } from 'lucide-react'
import { saveContactMessage } from '@/lib/db-service'
import { isValidPersonName, validatePersonName, filterPersonNameInput, isValidUsPhone, validateUsPhone, formatUsPhone, isValidEmail } from '@/lib/validation'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    subject: 'General Directory Support',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const nameVal = validatePersonName(formData.name)
    if (!nameVal.isValid) {
      const err = nameVal.error || 'Full Name must contain only alphabetic letters (no numbers like "232" or special symbols).'
      setFormError(err)
      toast.error(err)
      return
    }

    if (!isValidEmail(formData.email)) {
      const err = 'Please enter a valid email address.'
      setFormError(err)
      toast.error(err)
      return
    }

    if (formData.phone.trim()) {
      const phoneVal = validateUsPhone(formData.phone)
      if (!phoneVal.isValid) {
        const err = phoneVal.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX'
        setFormError(err)
        toast.error(err)
        return
      }
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      const err = 'Message must be at least 10 characters.'
      setFormError(err)
      toast.error(err)
      return
    }

    setIsSubmitting(true)
    try {
      await saveContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `${formData.subject} (${formData.city || 'USA'})`,
        message: formData.message
      })
      setIsSubmitting(false)
      setSubmitted(true)
      toast.success('Your message has been submitted successfully to directory administration.')
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      toast.error('An error occurred. Please try again.')
    }
  }

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Directory Administration | BizNestUSA',
    description: 'Contact platform support for business listings, professional profiles, job postings, and technical inquiries.',
    url: 'https://biznestusa.com/contact/',
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <main className="bg-slate-50 text-slate-900 font-sans pb-16">
        
        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-200 py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Support &amp; Inquiries</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto">
              Contact Directory Administration
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Need assistance with your business listing, profile editing, verification status, or technical support? We are here to assist you.
            </p>

            {/* FAST INQUIRY WHATSAPP HERO CTA */}
            <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
              <a
                href="https://wa.me/923345636230?text=Hello%20BizNest%20USA%2C%20I%20have%20an%20inquiry%20regarding%20my%20business%20listing."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Fast Inquiry: Chat on WhatsApp</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>
              <a
                href="mailto:support@biznestusa.com"
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>support@biznestusa.com</span>
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT METHODS GRID */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Email Support (ONLY support@biznestusa.com as requested) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Official Support Email</h3>
                    <p className="text-xs text-slate-500">For all business listings, billing &amp; general inquiries</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80">
                    <a
                      href="mailto:support@biznestusa.com"
                      className="text-sm font-extrabold text-blue-600 hover:text-blue-800 hover:underline block"
                    >
                      support@biznestusa.com
                    </a>
                    <span className="text-[11px] text-slate-500 mt-1 block">Replies usually within 2 to 4 business hours</span>
                  </div>
                </div>
                <a
                  href="mailto:support@biznestusa.com"
                  className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Direct Email</span>
                </a>
              </div>

              {/* Fast Inquiry WhatsApp (NUMBER HIDDEN FROM UI DISPLAY AS REQUESTED) */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                      Instant Chat
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Fast Inquiry on WhatsApp</h3>
                    <p className="text-xs text-slate-600">Quickest way to contact directory support &amp; track listings</p>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-emerald-200/60">
                    <p className="flex items-center gap-1.5 font-semibold text-emerald-950">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Direct Representative Access</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Available 7 Days • Instant response for priority assistance</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/923345636230?text=Hello%20BizNest%20USA%2C%20I%20have%20an%20inquiry%20regarding%20my%20business%20listing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              {/* Office Address */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Corporate Office</h3>
                    <p className="text-xs text-slate-500">United States Operations</p>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                    <p className="font-bold text-slate-800">BizNestUSA Directory Network</p>
                    <p>100 Wall Street, Suite 500</p>
                    <p>New York, NY 10005, United States</p>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-slate-400">
                  Business Hours: Mon – Fri 9:00 AM – 6:00 PM EST
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* INQUIRY FORM */}
        <section className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Send an Inquiry</h2>
              <p className="text-xs text-slate-500 mt-1">Submit your message directly to the directory administration team.</p>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Message Sent Successfully</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out. Your message has been logged in our support queue and our administrative team will respond promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Send another inquiry &rarr;
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: filterPersonNameInput(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Alphabetic letters only (no numbers like &quot;232&quot;).</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (USA Standard)</label>
                    <input
                      type="tel"
                      maxLength={17}
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatUsPhone(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / State</label>
                    <input
                      type="text"
                      placeholder="Austin, TX"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Business Listing Support">Business Listing Support</option>
                    <option value="Professional Profile Inquiry">Professional Profile Inquiry</option>
                    <option value="Job Posting Support">Job Posting Support</option>
                    <option value="Listing Verification Request">Listing Verification Request</option>
                    <option value="Report Listing Issue">Report Listing Issue</option>
                    <option value="Partnership & Advertising">Partnership & Advertising</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide details about your inquiry or listing..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* FLOATING FAST INQUIRY WHATSAPP BUTTON (Number hidden from UI, active behind icon) */}
        <a
          href="https://wa.me/923345636230?text=Hello%20BizNest%20USA%2C%20I%20have%20an%20inquiry%20regarding%20my%20business%20listing."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fast Inquiry on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all duration-200 group border-2 border-white/20 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white shrink-0" />
          <span className="font-extrabold text-xs tracking-wide">WhatsApp Fast Inquiry</span>
        </a>
      </main>
      <Footer />
    </>
  )
}

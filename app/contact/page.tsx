'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, Phone, MapPin, MessageSquare, ShieldCheck } from 'lucide-react'
import { saveContactMessage } from '@/lib/db-service'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields.')
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Support & Inquiries</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto">
              Contact Directory Administration
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Need assistance with your business profile, professional page, job posting, or directory verification? We are here to help.
            </p>
          </div>
        </section>

        {/* CONTACT METHODS GRID */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Email Support */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Email Support</h3>
                  <p className="text-xs text-slate-500">Fast response for listing and technical inquiries</p>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <li><strong>Support:</strong> support@biznestusa.com</li>
                  <li><strong>Listings:</strong> admin@biznestusa.com</li>
                  <li><strong>Recruitment:</strong> careers@biznestusa.com</li>
                </ul>
              </div>

              {/* Phone Assistance */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Direct Assistance</h3>
                  <p className="text-xs text-slate-500">Business verification and listing guidance</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <p><strong>Toll-Free Support:</strong> (800) 555-0199</p>
                  <p><strong>Operating Hours:</strong> Mon – Fri, 9:00 AM – 6:00 PM EST</p>
                </div>
              </div>

              {/* Office Address */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Corporate Office</h3>
                  <p className="text-xs text-slate-500">United States Operations</p>
                </div>
                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <p><strong>BizNestUSA Directory Network</strong></p>
                  <p>100 Wall Street, Suite 500</p>
                  <p>New York, NY 10005, United States</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
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
      </main>
      <Footer />
    </>
  )
}

import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Privacy Policy | BizNestUSA - United States Business, Professional & Jobs Directory',
  description: 'Read the BizNestUSA privacy policy. Learn how we collect, store, and protect your data, including Google AdSense advertising cookie disclosures, CCPA, and GDPR compliance.',
  alternates: {
    canonical: 'https://biznestusa.com/privacy/',
  },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f2b3d] mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8 border-b border-slate-200 pb-4">
          Last Updated: 2026 • BizNestUSA Digital Directory Platform
        </p>

        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            At <strong>BizNestUSA</strong> (accessible via <a href="https://biznestusa.com/" className="text-blue-600 hover:underline">https://biznestusa.com/</a>), the privacy and protection of our users, business owners, professionals, and visitors is of paramount importance. This Privacy Policy describes the types of personal and business information collected, recorded, and utilized by BizNestUSA, as well as the safeguards and rights available to you.
          </p>
          <p>
            If you have questions or require more information about our Privacy Policy, please contact our administrative team at <a href="mailto:privacy@biznestusa.com" className="text-blue-600 hover:underline">privacy@biznestusa.com</a>.
          </p>
          
          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">1. Information We Collect</h2>
          <p>
            We collect information from users through direct submissions, automated technologies, and interactions across the platform:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li><strong>Personal Contact Data:</strong> When registering an account, submitting a contact inquiry, or reporting a listing, we may collect your name, email address, telephone number, and optional verification credentials.</li>
            <li><strong>Public Business &amp; Professional Listings:</strong> When submitting a business, company, job vacancy, or professional talent profile, you voluntarily supply public data including trade names, addresses, contacts, job descriptions, service categories, logos, and business hours. This information is published publicly by design to enable customer discovery.</li>
            <li><strong>Automated Device &amp; Log Data:</strong> Like most online platforms, our servers automatically log technical information when you navigate the site, including your IP address, browser user-agent, operating system, referring/exit pages, date/time stamps, and interaction metrics.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">2. Use of Information</h2>
          <p>
            BizNestUSA utilizes the collected information for transparent, legitimate operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>To publish, index, and organize public business listings, professional profiles, and job opportunities across cities and states in the United States.</li>
            <li>To enable direct consumer-to-business communications via phone, email, and website links.</li>
            <li>To conduct administrative moderation, anti-spam validation, and credential verification.</li>
            <li>To monitor server performance, diagnose technical errors, and optimize search responsiveness.</li>
            <li>To detect, prevent, and mitigate fraudulent submissions, abusive behavior, and impersonation.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">3. Google AdSense &amp; Third-Party Advertising Policy</h2>
          <p>
            BizNestUSA may partner with third-party advertising companies, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website. These advertising networks may use cookies, web beacons, and related tracking technologies to collect non-personally identifiable information regarding your visits to this and other websites in order to provide relevant advertisements about goods and services of interest to you.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-sm text-slate-700">
            <h3 className="font-bold text-slate-900">Mandatory Google Advertising Disclosures:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.</li>
              <li><strong>Google Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
              <li><strong>Personalized Ads Opt-Out:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Google Ads Settings</a>.</li>
              <li><strong>Industry Opt-Out Portals:</strong> Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">www.aboutads.info</a> consumer choice page or the <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Your Online Choices</a> portal.</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">4. Cookies &amp; Web Beacons</h2>
          <p>
            BizNestUSA uses essential session cookies and user preference cookies. You can configure your web browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. For detailed technical information regarding the specific cookie categories utilized across our platform, please consult our dedicated <Link href="/cookie-policy" className="text-blue-600 underline">Cookie Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">5. California Consumer Privacy Act (CCPA) &amp; Global Rights</h2>
          <p>
            In compliance with the California Consumer Privacy Act (CCPA), the General Data Protection Regulation (GDPR), and related data protection standards, users possess defined legal rights:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li><strong>Right to Know:</strong> You may request disclosure of the personal data categories we collect and maintain.</li>
            <li><strong>Right to Rectification:</strong> You may request correction of inaccurate or incomplete listing details.</li>
            <li><strong>Right to Deletion:</strong> You may request deletion of your account or personal information.</li>
            <li><strong>Do Not Sell My Personal Information:</strong> BizNestUSA does not sell your personal data to third parties.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">6. Public Directory Listings &amp; Content Removal</h2>
          <p>
            Business listings, professional profiles, and job announcements on BizNestUSA are published for public business discovery. If you are the authorized owner of a business listed on BizNestUSA and wish to update, claim, or permanently remove your listing, you may:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>Click the &quot;Claim Business&quot; button on your business profile to verify ownership.</li>
            <li>Submit a ticket through our <Link href="/report-listing" className="text-blue-600 underline">Report Listing Portal</Link>.</li>
            <li>Email our compliance desk directly at <a href="mailto:privacy@biznestusa.com" className="text-blue-600 underline">privacy@biznestusa.com</a> for prompt review within 24–48 business hours.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">7. Data Security Safeguards</h2>
          <p>
            We implement administrative, technical, and physical security measures—including TLS encryption, role-based Firestore database rules, and strict administrative authentication—to safeguard your information.
          </p>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">8. Policy for Children</h2>
          <p>
            BizNestUSA does not knowingly collect or solicit personal identifiable information from children under the age of 13. If you believe a child under 13 has submitted personal information on our website, please notify us immediately at <a href="mailto:privacy@biznestusa.com" className="text-blue-600 underline">privacy@biznestusa.com</a> and we will swiftly remove such data.
          </p>

          <h2 className="text-xl font-bold text-[#0f2b3d] pt-4">9. Contact Information</h2>
          <p>
            For questions, data access requests, or policy inquiries, contact our data administration desk:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm space-y-1 text-slate-800">
            <p className="font-bold text-slate-900">BizNestUSA Administration &amp; Data Compliance</p>
            <p>Email: <a href="mailto:privacy@biznestusa.com" className="text-blue-600 underline">privacy@biznestusa.com</a></p>
            <p>Support Desk: <a href="mailto:support@biznestusa.com" className="text-blue-600 underline">support@biznestusa.com</a></p>
            <p>United States Business &amp; Professional Directory</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

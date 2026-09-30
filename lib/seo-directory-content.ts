export type DirectorySeoLink = {
  label: string
  href: string
}

export type DirectoryFaq = {
  question: string
  answer: string
}

export type DirectorySeoCopy = {
  title?: string
  intro: string
  whatIs?: string
  includedServices?: string[]
  whatToCompare?: string[]
  brandBenefit?: string
  ctaHeading?: string
  ctaText?: string
  faqs?: DirectoryFaq[]
  guidance: string
  links: DirectorySeoLink[]
}

const CATEGORY_COPY: Record<string, DirectorySeoCopy> = {
  'home-services': {
    title: 'Home Services & Skilled Trade Contractors Directory',
    intro: 'Find licensed residential and commercial contractors, plumbers, electricians, HVAC specialists, roofers, and remodelers across the United States.',
    whatIs: 'This directory connects American homeowners, commercial property managers, and facility supervisors with verified trade contractors operating in their local metropolitan area.',
    includedServices: [
      'Residential & Emergency Plumbing',
      'Electrical Panel Upgrades & Wiring',
      'HVAC Installation, Maintenance & Heat Pumps',
      'Roof Replacement & Storm Damage Repair',
      'Interior & Exterior Painting',
      'Kitchen & Bathroom Remodeling',
      'Landscaping, Tree Care & Hardscaping',
      'General Handyman & Appliance Repair'
    ],
    whatToCompare: [
      'State trade license verification and active bond status',
      'Commercial general liability insurance coverage',
      'Upfront transparent project estimates in writing',
      'Manufacturer warranty terms on installed equipment',
      'Direct contact phone numbers and local office addresses'
    ],
    brandBenefit: 'BizNest USA provides verified trade businesses with an independent public profile to showcase their verified licenses, specialties, service territory, and contact details without paying for pay-per-lead markups.',
    ctaHeading: 'Own a Home Service or Contracting Business?',
    ctaText: 'Create your verified business profile on BizNest USA to help local property owners discover your trade services and contact your team directly.',
    faqs: [
      {
        question: 'How do I verify a contractor\'s license in my state?',
        answer: 'You can verify active trade licenses through your state\'s licensing board (such as the California CSLB or Texas TDLR) using the license number displayed on the business profile.'
      },
      {
        question: 'What should I ask before hiring a plumber or electrician?',
        answer: 'Always ask for proof of general liability insurance, their state trade license number, whether they pull required municipal permits, and an itemized written estimate covering materials and labor.'
      },
      {
        question: 'Are contractor listings on BizNest USA reviewed?',
        answer: 'Yes. Every business listing submitted to BizNest USA undergoes human compliance review to verify business identity, physical location, and contact information before approval.'
      }
    ],
    guidance: 'Confirm active trade licenses, state registration, insurance coverage, and direct contact details before commissioning home repairs or major remodels.',
    links: [
      { label: 'Find Skilled Trades Professionals', href: '/professionals?category=Skilled%20Trades%20%26%20Craft' },
      { label: 'Browse Home Services in Texas', href: '/category/home-services/dallas' },
      { label: 'List Your Contracting Business', href: '/add-business' },
    ],
  },
  'professional-services': {
    title: 'Professional Services, Legal & Financial Advisory Directory',
    intro: 'Discover certified public accountants (CPAs), legal counsel, management consultants, and insurance agencies operating throughout the USA.',
    whatIs: 'A curated directory connecting business founders, executives, and individuals with licensed attorneys, tax specialists, accounting firms, and corporate advisors.',
    includedServices: [
      'Corporate Tax Planning & Preparation',
      'Certified Public Accounting (CPA) & Auditing',
      'Business Formation, Contracts & IP Law',
      'Commercial & Personal Insurance Brokerage',
      'Wealth Management & Fiduciary Planning',
      'Management Consulting & Strategy',
      'Real Estate Brokerage & Property Advisory'
    ],
    whatToCompare: [
      'State Bar or State Accountancy Board registration',
      'Specific industry focus and client portfolio size',
      'Fee structure (hourly, fixed retainer, or milestone)',
      'Direct peer recommendations and verified track record'
    ],
    brandBenefit: 'BizNest USA gives certified professionals and corporate advisory practices an authoritative digital profile to highlight credentials, publications, and consultation channels.',
    ctaHeading: 'Are You an Accountant, Attorney, or Consultant?',
    ctaText: 'Publish your professional practice on BizNest USA to expand your client reach and establish local credibility across American business networks.',
    faqs: [
      {
        question: 'How can I verify a CPA or attorney\'s standing?',
        answer: 'Attorneys can be verified through the respective State Bar association portal. CPAs can be confirmed through state accountancy boards or CPAverify.org.'
      },
      {
        question: 'What is the difference between a bookkeeper and a CPA?',
        answer: 'A bookkeeper manages daily transactions and ledger recording, while a CPA is a state-licensed accountant qualified to conduct audits, represent clients before the IRS, and provide complex tax strategies.'
      }
    ],
    guidance: 'Evaluate credentials, professional standing, state bar or CPA board licenses, and direct client references when seeking corporate advisory or tax assistance.',
    links: [
      { label: 'Explore Finance & Business Pros', href: '/professionals?category=Business%20%26%20Finance' },
      { label: 'Explore Legal Specialists', href: '/professionals?category=Legal' },
      { label: 'List Professional Practice', href: '/add-business' },
    ],
  },
  'technology': {
    title: 'Technology Companies, Software Agencies & IT Services Directory',
    intro: 'Explore software engineering firms, managed IT service providers, cybersecurity experts, and digital product agencies across the United States.',
    whatIs: 'A comprehensive directory featuring verified US software companies, systems integrators, cloud consultants, and technology providers for modern enterprises.',
    includedServices: [
      'Custom Software & Web Application Development',
      'Managed IT Services (MSP) & Helpdesk Support',
      'Cybersecurity & Compliance Auditing (SOC 2, HIPAA)',
      'Cloud Architecture & DevOps Engineering',
      'Mobile App Development (iOS & Android)',
      'Artificial Intelligence & Data Analytics Solutions'
    ],
    whatToCompare: [
      'Core technology stack expertise and framework specializations',
      'Demonstrated portfolio of shipped applications and case studies',
      'Security compliance certifications and service level agreements (SLAs)',
      'US office location and dedicated engineering communication channels'
    ],
    brandBenefit: 'BizNest USA enables tech agencies and IT providers to showcase technical competencies, portfolio highlights, and open technical roles to commercial clients nationwide.',
    ctaHeading: 'Lead a Technology Firm or Software Agency?',
    ctaText: 'List your technology business on BizNest USA to showcase technical capabilities and connect with companies seeking software and IT solutions.',
    faqs: [
      {
        question: 'How do I choose between an agency and an independent contractor?',
        answer: 'Agencies provide multi-disciplinary teams (engineers, designers, QA, project managers) for full-lifecycle delivery, whereas independent contractors are ideal for targeted domain expertise or augmenting existing internal teams.'
      },
      {
        question: 'What certifications should a managed IT provider have?',
        answer: 'Look for partnerships with major cloud providers (AWS, Microsoft Azure, Google Cloud), CompTIA certifications, and adherence to NIST or ISO security standards.'
      }
    ],
    guidance: 'Compare provider profiles by technical specializations, verified client work, physical location, and hiring credentials. Review case studies and contact details directly before engaging.',
    links: [
      { label: 'Browse Tech Professionals', href: '/professionals?category=Technology' },
      { label: 'Browse Tech Jobs', href: '/jobs?category=Software%20Development' },
      { label: 'List Your Tech Company', href: '/add-business' },
    ],
  },
  'health-wellness': {
    title: 'Healthcare Practices, Medical Clinics & Wellness Centers Directory',
    intro: 'Locate certified physicians, dental practices, physical therapy clinics, optometrists, and personal fitness centers across the US.',
    whatIs: 'A trusted healthcare directory helping patients discover licensed medical practitioners, specialty clinics, dental offices, and wellness providers in their community.',
    includedServices: [
      'Primary Care & Family Medicine',
      'General & Cosmetic Dentistry',
      'Orthopedic & Physical Therapy Clinics',
      'Optometry & Comprehensive Eye Care',
      'Mental Health Counseling & Psychology',
      'Chiropractic & Sports Rehabilitation'
    ],
    whatToCompare: [
      'State medical board licensing and specialty board certifications',
      'Accepted insurance carriers and private payment terms',
      'Clinic physical facility accessibility and appointment scheduling',
      'Patient consultation options including in-person and telehealth'
    ],
    brandBenefit: 'BizNest USA provides medical practices and clinics with an accurate, verified public profile ensuring patients find verified office addresses, hours, and direct contact numbers.',
    ctaHeading: 'Manage a Medical, Dental, or Wellness Practice?',
    ctaText: 'Register your healthcare practice on BizNest USA to provide patients with verified practice information, specialty listings, and appointment contact options.',
    faqs: [
      {
        question: 'How do I verify a medical practitioner\'s license?',
        answer: 'Every US state maintains an online medical board registry where you can search a doctor\'s full name or NPI number to verify active licensure and check for disciplinary actions.'
      }
    ],
    guidance: 'Verify active state medical board certifications, facility accreditation, patient consultation policies, and verified physical clinic addresses.',
    links: [
      { label: 'Healthcare Professionals', href: '/professionals?category=Healthcare' },
      { label: 'Healthcare Job Openings', href: '/jobs?category=Healthcare%20%26%20Medical' },
      { label: 'List Healthcare Practice', href: '/add-business' },
    ],
  },
  'restaurants-food': {
    title: 'Food, Dining Establishments & Catering Directory',
    intro: 'Discover local dining establishments, independent cafes, bakeries, food trucks, and commercial catering companies in your city.',
    whatIs: 'An authentic food and culinary directory connecting diners, event hosts, and corporate planners with verified local eateries and culinary businesses.',
    includedServices: [
      'Dine-in Restaurants & Regional Cuisines',
      'Artisanal Cafes & Specialty Coffee Roasters',
      'Bakery & Custom Pastry Services',
      'Corporate & Wedding Event Catering',
      'Food Trucks & Mobile Concessions'
    ],
    whatToCompare: [
      'Verified physical dining address and operating hours',
      'Menu specialties and dietary accommodation options',
      'Catering capacity and private event bookings',
      'Direct reservation channels and customer contact options'
    ],
    brandBenefit: 'BizNest USA gives independent restaurants and caterers a verified profile to present authentic operating details without third-party reservation fees or platform commission deductions.',
    ctaHeading: 'Own a Restaurant, Cafe, or Catering Business?',
    ctaText: 'List your culinary establishment on BizNest USA to help local patrons and event organizers discover your menus, hours, and direct booking channels.',
    faqs: [
      {
        question: 'How do I find caterers for corporate events?',
        answer: 'Browse food service listings, filter by location, and check the services section for corporate catering packages, minimum guest counts, and lead-time requirements.'
      }
    ],
    guidance: 'Check operational hours, menu offerings, physical storefront addresses, and verified direct reservation or contact lines before visiting.',
    links: [
      { label: 'Explore Food & Dining', href: '/category/restaurants-food/' },
      { label: 'List Your Restaurant or Cafe', href: '/add-business' },
    ],
  },
  'automotive': {
    title: 'Automotive Services, Auto Repair & Dealerships Directory',
    intro: 'Find certified auto repair shops, vehicle dealerships, collision centers, tire services, and commercial towing providers across the United States.',
    whatIs: 'A dedicated automotive directory connecting vehicle owners with licensed mechanics, diagnostic specialists, body shops, and certified vehicle maintenance centers.',
    includedServices: [
      'Engine Diagnostics & Mechanical Repair',
      'Brake Service, Rotors & Suspension',
      'Transmission Service & Fluid Exchanges',
      'Collision Repair, Dent Removal & Painting',
      'Tire Sales, Mounting, Balancing & Alignment',
      '24/7 Roadside Assistance & Towing'
    ],
    whatToCompare: [
      'ASE (Automotive Service Excellence) technician certifications',
      'Warranty coverage on replacement parts and labor',
      'Written diagnostic estimates before service commencement',
      'Verified physical facility address and customer review history'
    ],
    brandBenefit: 'BizNest USA helps reputable auto service shops showcase their diagnostic capabilities, certifications, and service warranties directly to local drivers.',
    ctaHeading: 'Own an Auto Repair or Vehicle Service Center?',
    ctaText: 'Add your automotive shop to BizNest USA to help local motorists find your facility when they need reliable maintenance, diagnostics, or repairs.',
    faqs: [
      {
        question: 'What is an ASE certification?',
        answer: 'ASE certification is administered by the National Institute for Automotive Service Excellence. It tests and certifies automotive technicians on specialized vehicle systems to ensure technical competence.'
      }
    ],
    guidance: 'Check ASE certifications, warranty coverage on parts and labor, upfront diagnostic estimates, and verified customer reviews.',
    links: [
      { label: 'Explore Automotive Services', href: '/category/automotive/' },
      { label: 'Mechanics & Skilled Trades', href: '/professionals?category=Skilled%20Trades%20%26%20Craft' },
      { label: 'List Auto Business', href: '/add-business' },
    ],
  },
  'beauty-personal-care': {
    title: 'Beauty, Wellness Therapy & Personal Care Directory',
    intro: 'Connect with reputable hair salons, barbershops, skin care estheticians, spas, and personal wellness specialists in your area.',
    whatIs: 'A verified local directory for finding licensed cosmetologists, master barbers, estheticians, and personal care studios.',
    includedServices: [
      'Precision Haircuts, Coloring & Styling',
      'Traditional Barbershop Services & Beard Grooming',
      'Esthetics, Facials & Advanced Skin Care',
      'Nail Care, Manicures & Pedicures',
      'Therapeutic Massage & Day Spa Services'
    ],
    whatToCompare: [
      'State board cosmetology or barber licensing',
      'Specialized styling techniques and portfolio images',
      'Sanitation standards and appointment booking policies',
      'Direct phone number and salon studio address'
    ],
    brandBenefit: 'BizNest USA provides personal care professionals and salon owners with an elegant profile to display service menus, location details, and direct booking links.',
    ctaHeading: 'Manage a Salon, Barbershop, or Wellness Studio?',
    ctaText: 'List your salon or personal care practice on BizNest USA to reach clients searching for trusted beauty and wellness specialists in your community.',
    faqs: [
      {
        question: 'Are barbers and hair stylists state licensed?',
        answer: 'Yes, barbers and cosmetologists in the United States must hold active licenses issued by their state licensing board after completing accredited training hours and passing practical examinations.'
      }
    ],
    guidance: 'Review portfolio photos, state licensing credentials, and customer feedback before booking personal care appointments.',
    links: [
      { label: 'Browse Beauty & Wellness', href: '/category/beauty-personal-care' },
      { label: 'List Your Salon or Studio', href: '/add-business' }
    ]
  }
}

const CITY_COPY: Record<string, DirectorySeoCopy> = {
  'new-york-city': {
    intro: 'Explore verified local businesses, licensed professionals, and career openings across New York City and the surrounding metro area.',
    guidance: 'NYC business searches often focus on borough and neighborhood proximity. Check operating hours, verified office addresses, and direct contact options.',
    links: [
      { label: 'Browse NYC Businesses', href: '/search?city=New%20York%20City' },
      { label: 'Find NYC Professionals', href: '/professionals?city=New%20York%20City' },
      { label: 'NYC Jobs', href: '/jobs?city=New%20York%20City' },
    ],
  },
  'los-angeles': {
    intro: 'Discover verified companies, independent creative and tech professionals, and employment opportunities across Greater Los Angeles, California.',
    guidance: 'LA searches span technology, entertainment, healthcare, and trades. Verify local service territories and direct operational lines.',
    links: [
      { label: 'Browse LA Businesses', href: '/search?city=Los%20Angeles' },
      { label: 'Find LA Professionals', href: '/professionals?city=Los%20Angeles' },
      { label: 'LA Jobs', href: '/jobs?city=Los%20Angeles' },
    ],
  },
  'chicago': {
    intro: 'Connect with reputable businesses, licensed contractors, certified professionals, and open positions across Chicago, Illinois.',
    guidance: 'Compare Chicagoland service providers by specialized capabilities, licensing credentials, and verified physical addresses.',
    links: [
      { label: 'Browse Chicago Businesses', href: '/search?city=Chicago' },
      { label: 'Chicago Professionals', href: '/professionals?city=Chicago' },
      { label: 'Chicago Career Openings', href: '/jobs?city=Chicago' },
    ],
  },
  'houston': {
    intro: 'Explore commercial enterprises, energy and tech firms, skilled specialists, and job listings in Houston, Texas.',
    guidance: 'Houston spans a large geographical footprint. Verify whether providers service your specific metro area and confirm direct contact channels.',
    links: [
      { label: 'Browse Houston Businesses', href: '/search?city=Houston' },
      { label: 'Houston Professionals', href: '/professionals?city=Houston' },
      { label: 'Houston Jobs', href: '/jobs?city=Houston' },
    ],
  },
  'austin': {
    intro: 'Discover innovative technology startups, creative agencies, local service contractors, and open tech roles in Austin, Texas.',
    guidance: 'Silicon Hills hosts a fast-growing community of engineers, designers, and specialized trades. Check public portfolios and contact links.',
    links: [
      { label: 'Browse Austin Businesses', href: '/search?city=Austin' },
      { label: 'Austin Tech Professionals', href: '/professionals?city=Austin' },
      { label: 'Austin Tech Jobs', href: '/jobs?city=Austin' },
    ],
  },
  'dallas': {
    intro: 'Find verified corporate headquarters, commercial contractors, finance professionals, and career vacancies across Dallas, Texas.',
    guidance: 'Evaluate Dallas-Fort Worth providers based on direct company profiles, verified locations, and demonstrated industry track record.',
    links: [
      { label: 'Browse Dallas Businesses', href: '/search?city=Dallas' },
      { label: 'Dallas Professionals', href: '/professionals?city=Dallas' },
      { label: 'Dallas Jobs', href: '/jobs?city=Dallas' },
    ],
  },
  'seattle': {
    intro: 'Connect with Pacific Northwest tech companies, engineering consultants, local service contractors, and career opportunities in Seattle, Washington.',
    guidance: 'Compare cloud and software specialists, tradespeople, and local agencies by viewing direct public portfolio pages and contact details.',
    links: [
      { label: 'Browse Seattle Businesses', href: '/search?city=Seattle' },
      { label: 'Seattle Professionals', href: '/professionals?city=Seattle' },
      { label: 'Seattle Jobs', href: '/jobs?city=Seattle' },
    ],
  },
  'miami': {
    intro: 'Explore local businesses, bilingual professionals, international trade agencies, and hiring companies across Miami, Florida.',
    guidance: 'South Florida businesses often service both local and international markets. Verify direct phone lines and registered corporate addresses.',
    links: [
      { label: 'Browse Miami Businesses', href: '/search?city=Miami' },
      { label: 'Miami Professionals', href: '/professionals?city=Miami' },
      { label: 'Miami Jobs', href: '/jobs?city=Miami' },
    ],
  },
}

export function getCategorySeoCopy(categoryId: string): DirectorySeoCopy | null {
  return CATEGORY_COPY[categoryId] || null
}

export function getCitySeoCopy(citySlug: string): DirectorySeoCopy | null {
  return CITY_COPY[citySlug.toLowerCase()] || null
}

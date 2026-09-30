export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
] as const

export const STATE_CITIES: Record<string, string[]> = {
  Alabama: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Auburn'],
  Alaska: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla'],
  Arizona: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Flagstaff'],
  Arkansas: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'Rogers', 'Conway'],
  California: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Irvine'],
  Colorado: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Boulder'],
  Connecticut: ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury'],
  Delaware: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Bear'],
  Florida: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Fort Lauderdale', 'Tallahassee', 'Cape Coral', 'Pembroke Pines'],
  Georgia: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell'],
  Hawaii: ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe'],
  Idaho: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Caldwell', 'Pocatello', 'Coeur d\'Alene'],
  Illinois: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria'],
  Indiana: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington'],
  Iowa: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Ames'],
  Kansas: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee'],
  Kentucky: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown'],
  Louisiana: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City'],
  Maine: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford'],
  Maryland: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Hagerstown', 'Annapolis'],
  Massachusetts: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy', 'Lynn'],
  Michigan: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Dearborn'],
  Minnesota: ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth'],
  Mississippi: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Tupelo', 'Meridian'],
  Missouri: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon'],
  Montana: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell'],
  Nebraska: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings'],
  Nevada: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'],
  'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover', 'Rochester', 'Salem'],
  'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Trenton'],
  'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington'],
  'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson'],
  Ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton'],
  Oklahoma: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton', 'Moore'],
  Oregon: ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford'],
  Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Reading', 'Erie', 'Upper Darby', 'Scranton', 'Harrisburg'],
  'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport'],
  'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville'],
  'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton'],
  Tennessee: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin'],
  Texas: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Irving', 'Frisco'],
  Utah: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George'],
  Vermont: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier', 'Winooski', 'St. Albans'],
  Virginia: ['Virginia Beach', 'Chesapeake', 'Norfolk', 'Richmond', 'Newport News', 'Alexandria', 'Arlington', 'Hampton'],
  Washington: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Weirton', 'Fairmont'],
  Wisconsin: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha'],
  Wyoming: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan'],
  'District of Columbia': ['Washington']
}

export const CITIES = Array.from(new Set(
  Object.values(STATE_CITIES).flat()
)).sort()

export const TOP_CITIES = [
  'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Seattle', 'Denver', 'Washington',
  'Boston', 'Nashville', 'Portland', 'Las Vegas', 'Miami',
  'Atlanta', 'San Francisco', 'Charlotte', 'Orlando'
]

// -------------------------------------------------------------
// USA BUSINESS CATEGORIES ARCHITECTURE (Scalable System)
// -------------------------------------------------------------
export interface CategoryDefinition {
  id: string
  name: string
  icon: string
  desc: string
  color: string
  subcategories: string[]
  count?: number
}

export const BUSINESS_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'home-services',
    name: 'Home Services',
    icon: 'home-services',
    desc: 'Licensed local contractors, plumbers, electricians, HVAC experts, and home remodelers',
    color: '#0284c7',
    subcategories: [
      'Plumber', 'Roofer', 'Electrician', 'HVAC Contractor', 'General Contractor',
      'Handyman', 'Landscaper', 'Pest Control', 'Cleaning Service', 'Moving Company',
      'Locksmith', 'Appliance Repair', 'Garage Door Service', 'Flooring Contractor',
      'Painting Contractor', 'Roofing Contractor', 'Remodeling Contractor'
    ]
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: 'briefcase',
    desc: 'Certified accountants, attorneys, real estate agencies, and consulting firms',
    color: '#4f46e5',
    subcategories: [
      'Accountant', 'Attorney', 'Insurance Agency', 'Real Estate Agency', 'Financial Advisor',
      'Tax Consultant', 'Marketing Agency', 'SEO Agency', 'Web Development Agency',
      'IT Services', 'Consulting Firm'
    ]
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    icon: 'healthcare',
    desc: 'Doctors, dentists, physical therapists, optometrists, pharmacies, and fitness centers',
    color: '#ef4444',
    subcategories: [
      'Dentist', 'Doctor', 'Chiropractor', 'Physical Therapist', 'Therapist',
      'Optometrist', 'Medical Clinic', 'Pharmacy', 'Fitness Center', 'Personal Trainer'
    ]
  },
  {
    id: 'restaurants-food',
    name: 'Food & Restaurants',
    icon: 'restaurant',
    desc: 'Local dining, cafes, bakeries, catering, food trucks, and regional cuisines',
    color: '#f59e0b',
    subcategories: [
      'Restaurant', 'Cafe', 'Bakery', 'Pizza', 'Fast Food', 'Catering',
      'Food Truck', 'Barbecue', 'Mexican Restaurant', 'Italian Restaurant',
      'Indian Restaurant', 'Chinese Restaurant'
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: 'automotive',
    desc: 'Trusted auto repair shops, car dealerships, tire services, and towing providers',
    color: '#14b8a6',
    subcategories: [
      'Auto Repair', 'Car Dealership', 'Auto Parts', 'Car Wash', 'Tire Shop',
      'Towing Service', 'Auto Detailing', 'Body Shop'
    ]
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    icon: 'beauty',
    desc: 'Hair salons, barbershops, nail care, spas, wellness therapy, and makeup artists',
    color: '#d946ef',
    subcategories: [
      'Hair Salon', 'Barber', 'Beauty Salon', 'Nail Salon', 'Spa', 'Massage', 'Makeup Artist'
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'education',
    desc: 'Schools, colleges, specialized academies, tutors, and career training centers',
    color: '#8b5cf6',
    subcategories: [
      'School', 'College', 'University', 'Training Center', 'Tutoring',
      'Driving School', 'Online Education'
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: 'technology',
    desc: 'Software companies, SaaS products, cybersecurity, IT support, and web agencies',
    color: '#3b82f6',
    subcategories: [
      'Software Company', 'IT Company', 'SaaS Company', 'Cybersecurity',
      'Computer Repair', 'Web Design', 'App Development'
    ]
  },
  {
    id: 'real-estate',
    name: 'Real Estate & Properties',
    icon: 'real-estate',
    desc: 'Commercial & residential real estate brokers, property managers, appraisal, and leasing agents',
    color: '#059669',
    subcategories: [
      'Real Estate Agency', 'Commercial Real Estate', 'Property Management', 'Apartment Rentals',
      'Mortgage Broker', 'Home Inspector', 'Title & Escrow Services', 'Real Estate Appraisal',
      'Vacation Rental Management'
    ]
  },
  {
    id: 'construction',
    name: 'Construction & Contractors',
    icon: 'construction',
    desc: 'Commercial builders, general contractors, architectural firms, and heavy civil construction',
    color: '#ea580c',
    subcategories: [
      'General Contractor', 'Commercial Construction', 'Architectural Design', 'Remodeling & Renovation',
      'Masonry & Concrete', 'Roofing & Siding', 'Demolition & Excavation', 'Steel Framing',
      'Custom Home Builder'
    ]
  },
  {
    id: 'retail',
    name: 'Retail & Shopping',
    icon: 'retail',
    desc: 'Local stores, clothing boutiques, electronics, furniture, grocery, and specialty retailers',
    color: '#e11d48',
    subcategories: [
      'Clothing & Apparel', 'Electronics & Computers', 'Grocery & Supermarket', 'Furniture & Home Decor',
      'Jewelry & Watches', 'Sporting Goods', 'Department Store', 'Specialty Boutiques',
      'Hardware & Tools', 'Bookstore & Stationery'
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Insurance',
    icon: 'finance',
    desc: 'Certified financial planners, insurance brokerages, CPAs, wealth management, and banking',
    color: '#2563eb',
    subcategories: [
      'Accounting & CPA', 'Tax Preparation', 'Insurance Agency', 'Financial Planning',
      'Wealth Management', 'Commercial Banking', 'Mortgage Lending', 'Bookkeeping Services'
    ]
  },
  {
    id: 'local-services',
    name: 'Local & Other Services',
    icon: 'briefcase',
    desc: 'Event planning, photography, storage solutions, security, and travel services',
    color: '#64748b',
    subcategories: [
      'Photography', 'Event Planner', 'Wedding Services', 'Printing', 'Storage',
      'Security Services', 'Travel Agency', 'Pet Services', 'Funeral Services'
    ]
  }
]

// Backward compatibility alias
export const CATEGORIES = BUSINESS_CATEGORIES.map(c => ({
  id: c.id,
  name: c.name,
  icon: c.icon,
  desc: c.desc,
  color: c.color,
  count: 0
}))

// -------------------------------------------------------------
// USA PROFESSIONAL DIRECTORY CATEGORIES (Individual People)
// -------------------------------------------------------------
export interface ProfessionalCategoryDefinition {
  id: string
  name: string
  desc: string
  color: string
  professions: string[]
}

export const PROFESSIONAL_CATEGORIES: ProfessionalCategoryDefinition[] = [
  {
    id: 'technology',
    name: 'Technology',
    desc: 'Engineers, developers, cloud architects, and data specialists',
    color: '#2563eb',
    professions: [
      'Software Developer', 'Web Developer', 'Frontend Developer', 'Backend Developer',
      'Full Stack Developer', 'Mobile App Developer', 'DevOps Engineer', 'Cloud Engineer',
      'Network Administrator', 'System Administrator', 'Cybersecurity Specialist',
      'Data Analyst', 'Data Scientist', 'AI Engineer', 'Machine Learning Engineer',
      'Database Administrator', 'QA Engineer', 'Software Engineer'
    ]
  },
  {
    id: 'design-creative',
    name: 'Design & Creative',
    desc: 'Designers, creative directors, illustrators, and visual storytellers',
    color: '#ec4899',
    professions: [
      'UI/UX Designer', 'Web Designer', 'Graphic Designer', 'Product Designer',
      'Motion Designer', 'Video Editor', 'Photographer', 'Illustrator', '3D Designer', 'Animator'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    desc: 'Digital strategists, SEO specialists, copywriters, and growth leaders',
    color: '#f97316',
    professions: [
      'Digital Marketer', 'SEO Specialist', 'Content Writer', 'Copywriter',
      'Social Media Manager', 'PPC Specialist', 'Email Marketing Specialist', 'Brand Strategist'
    ]
  },
  {
    id: 'business-finance',
    name: 'Business & Finance',
    desc: 'Certified public accountants, analysts, consultants, and project leaders',
    color: '#059669',
    professions: [
      'Accountant', 'Bookkeeper', 'Financial Analyst', 'Business Consultant',
      'Project Manager', 'Business Analyst', 'HR Specialist', 'Recruiter'
    ]
  },
  {
    id: 'legal',
    name: 'Legal',
    desc: 'Attorneys, legal consultants, and certified paralegals',
    color: '#4f46e5',
    professions: [
      'Attorney', 'Lawyer', 'Legal Consultant', 'Paralegal'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    desc: 'Licensed physicians, registered nurses, therapists, and medical specialists',
    color: '#dc2626',
    professions: [
      'Doctor', 'Dentist', 'Nurse', 'Pharmacist', 'Therapist', 'Physical Therapist', 'Medical Assistant'
    ]
  },
  {
    id: 'education',
    name: 'Education',
    desc: 'Teachers, academic professors, specialized tutors, and career coaches',
    color: '#7c3aed',
    professions: [
      'Teacher', 'Tutor', 'Professor', 'Academic Advisor', 'Career Coach'
    ]
  },
  {
    id: 'skilled-professionals',
    name: 'Skilled Trades & Craft',
    desc: 'Licensed electricians, plumbers, carpenters, mechanics, and HVAC technicians',
    color: '#d97706',
    professions: [
      'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Mechanic', 'HVAC Technician',
      'Roofer', 'Painter', 'Mason', 'Construction Worker'
    ]
  }
]

// -------------------------------------------------------------
// USA JOB CATEGORIES
// -------------------------------------------------------------
export const JOB_CATEGORIES = [
  'Software Development',
  'IT & Systems',
  'Design & Creative',
  'Marketing & Growth',
  'Sales & Business Development',
  'Finance & Accounting',
  'Healthcare & Medical',
  'Education & Training',
  'Legal & Compliance',
  'Administration & Office',
  'Customer Support & Service',
  'Construction & Architecture',
  'Skilled Trades & Maintenance',
  'Hospitality & Tourism',
  'Retail & Commerce',
  'Transportation & Logistics',
  'Human Resources & Talent',
  'Executive & Management'
]

// -------------------------------------------------------------
// INTERFACES & SCHEMAS
// -------------------------------------------------------------
export interface BusinessLocation {
  id?: string
  state?: string
  city: string
  zipCode?: string
  address: string
  isPrimary?: boolean
  phone?: string
  lat?: number
  lng?: number
}

export interface BusinessPaymentDetails {
  plan?: BusinessPlan
  method?: string
  paymentMethod?: string
  referenceNumber?: string
  transactionRef?: string
  amount: number
  screenshotUrl?: string
  paymentScreenshot?: string
  paymentDate?: string
  verifiedAt?: string
  verifiedBy?: string
  notes?: string
}

export type BusinessPlan = 'review_1' | 'priority_5'

export interface BusinessPlanInfo {
  id: BusinessPlan
  name: string
  price: number
  badge: string
  tagline: string
  features: string[]
  postsAllowed: number
}

export const BUSINESS_PLANS: Record<BusinessPlan, BusinessPlanInfo> = {
  review_1: {
    id: 'review_1',
    name: '$1 Business Review',
    price: 1,
    badge: 'Standard Quality Review',
    tagline: 'Standard queue verification & data quality audit for US businesses',
    features: [
      'Comprehensive business information review',
      'Data quality & address consistency verification',
      'Correction suggestions before final approval',
      'Standard review queue processing',
      'Public verified business profile page',
      'Direct customer phone & email discovery'
    ],
    postsAllowed: 0
  },
  priority_5: {
    id: 'priority_5',
    name: '$5 Business Priority',
    price: 5,
    badge: 'Priority Review + 5 Posts',
    tagline: 'Expedited processing, promotional exposure & 5 business blog posts',
    features: [
      'Expedited priority review queue processing',
      'Priority listing placement in directory results',
      'Promotional / editorial exposure opportunity',
      'Submit up to 5 business blog / content articles',
      'Articles connected directly to your business profile',
      'Featured business profile trust badge'
    ],
    postsAllowed: 5
  }
}

export type BusinessPaymentStatus = 
  | 'PENDING' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'NEEDS_CHANGES' 
  | 'FREE' 
  | 'UNPAID'

export interface UserBlogPost {
  id: string
  userId: string
  businessId: string
  businessName: string
  businessSlug: string
  title: string
  slug: string
  content: string
  excerpt: string
  keywords?: string[]
  status: 'draft' | 'pending_review' | 'published' | 'rejected'
  createdAt: string
  updatedAt?: string
  publishedAt?: string
  seoTitle?: string
  metaDescription?: string
  authorName: string
}

export interface BusinessDetailedService {
  title: string
  description: string
}

export interface BusinessCustomSection {
  heading: string
  level?: 'h2' | 'h3'
  content?: string
  items?: string[]
  subSections?: Array<{
    heading: string
    content?: string
    items?: string[]
    [key: string]: any
  }>
  [key: string]: any
}

export interface BusinessItem {
  id: string
  userId?: string
  slug: string
  name: string
  metaTitle?: string
  metaDescription?: string
  canonical?: string
  introduction?: string
  category: string
  categoryId: string
  subCategory?: string
  subcategory?: string
  secondaryCategories?: string[]
  schemaType?: string | string[]
  state?: string
  city: string
  cities?: string[]
  zipCode?: string
  province?: string // Legacy fallback mapping to state
  rating: number
  reviewCount: number
  verified: boolean
  isClaimed: boolean
  isFeatured?: boolean
  status?: 'pending' | 'approved' | 'rejected' | 'needs_changes'
  listingFee?: number
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  ownerName?: string
  phone: string
  whatsapp?: string
  email: string
  website: string
  address: string
  locations?: BusinessLocation[]
  coverImage: string
  logo: string
  description: string
  services: string[]
  detailedServices?: BusinessDetailedService[]
  sections?: BusinessCustomSection[]
  operatingHours: { [key: string]: string }
  features: string[]
  // Plan & Payment Details
  plan?: BusinessPlan
  planName?: string
  planPrice?: number
  paymentDetails?: BusinessPaymentDetails
  paymentScreenshot?: string
  transactionRef?: string
  paymentStatus?: BusinessPaymentStatus
  paymentSubmittedAt?: string
  paymentVerifiedAt?: string
  paymentVerifiedBy?: string
  adminNotes?: string
  // Explicit Server-Side Blog Entitlement Fields
  blog_post_entitled?: boolean
  blog_posts_allowed?: number
  blog_posts_used?: number
  blog_post_feature_enabled?: boolean
  blog_post_feature_enabled_at?: string
  enabled_by_admin_id?: string
  reviews: {
    id: string
    userName: string
    rating: number
    date: string
    comment: string
    avatar?: string
  }[]
  faqs: { question: string; answer: string }[]
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  createdAt: string
  status: 'unread' | 'read'
}

export interface CompanyItem {
  id: string
  slug: string
  name: string
  category: string
  industry?: string
  companySize?: string
  employeeCount?: string
  establishedYear?: string
  registrationNumber?: string
  companyType?: string
  headquarters?: string
  state?: string
  city: string
  province?: string
  country?: string
  zipCode?: string
  branchLocations?: string[]
  careersUrl?: string
  website?: string
  phone?: string
  whatsapp?: string
  email?: string
  companyEmail?: string
  hrName?: string
  hrDesignation?: string
  hrEmail?: string
  address?: string
  logo?: string
  coverImage?: string
  description?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  youtube?: string
  github?: string
  customSocialLinks?: any[]
  rating?: number
  reviewCount?: number
  googleMapUrl?: string
  status?: 'pending' | 'approved' | 'rejected'
  verified?: boolean
  isClaimed?: boolean
  isFeatured?: boolean
  activeJobsCount?: number
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  rejectionReason?: string
  services?: string[]
  operatingHours?: Record<string, string>
  features?: string[]
  reviews?: any[]
  faqs?: any[]
  [key: string]: any
}

export interface JobItem {
  id: string
  slug?: string
  title: string
  company: string
  companyId?: string
  companySlug?: string
  companyLogo: string
  category: string
  department?: string
  type: string // 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary'
  employmentType?: string
  workplaceType?: 'Remote' | 'Hybrid' | 'On-site'
  state?: string
  province?: string
  city: string
  cities?: string[]
  zipCode?: string
  country?: string
  salary: string
  experience: string
  education?: string
  vacancies?: number | string
  genderPreference?: string
  ageRequirement?: string
  deadline?: string
  joiningDate?: string
  workingHours?: string
  shiftType?: string
  benefits?: string[]
  description: string
  responsibilities?: string[]
  requirements?: string[]
  preferredQualifications?: string[]
  skills: string[]
  applicationUrl?: string
  applicationEmail?: string
  applicationWebsite?: string
  applicationMethod?: string
  postedDate?: string
  postedAt?: string
  expiresAt?: string
  verified?: boolean
  isFeatured?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  [key: string]: any
}

export interface ProfessionalVerificationPaymentDetails {
  method?: string
  paymentMethod?: string
  amount: number
  referenceNumber?: string
  transactionRef?: string
  paymentScreenshot?: string
  paymentDate?: string
  submittedAt?: string
  verifiedAt?: string
  verifiedBy?: string
}

export interface ProfessionalVerificationRequest {
  id: string
  professionalProfileId: string
  username: string
  proName: string
  profession: string
  state?: string
  city: string
  avatar: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  approvedAt?: string
  amount?: number
  paymentMethod?: string
  paymentReference?: string
  transactionRef?: string
  paymentScreenshot?: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export interface JobApplication {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
  applicantEmail: string
  applicantName?: string
  applicantUsername?: string
  applicantPhone?: string
  applicantProfession?: string
  applicantCity?: string
  applicantState?: string
  coverNote?: string
  resumeUrl?: string
  appliedAt: string
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected'
  [key: string]: any
}

export interface ProfessionalInquiry {
  id: string
  proUsername: string
  proName: string
  senderName: string
  senderEmail: string
  senderPhone?: string
  senderWhatsApp?: string
  message: string
  createdAt: string
  status?: 'new' | 'replied' | 'archived'
}

export interface ProfessionalItem {
  id: string
  userId?: string
  username: string
  slug?: string
  name: string
  fullName?: string
  title: string
  profession: string
  category: string
  specialization?: string
  state?: string
  city: string
  cities?: string[]
  zipCode?: string
  country?: string
  province?: string
  address?: string
  googleMapUrl?: string
  gender?: string
  rating: number
  reviewCount: number
  hourlyRate: string
  availability: string
  openToWork?: boolean
  avatar: string
  coverImage: string
  bio: string
  about?: string
  description?: string
  skills: string[]
  experienceYears: number
  education?: string | any[]
  certifications?: string[] | any[]
  servicesOffered?: string[]
  currentCompany?: string
  languages?: string[]
  previousExperience?: any[]
  portfolio?: string
  linkedin?: string
  github?: string
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  behance?: string
  dribbble?: string
  stackoverflow?: string
  medium?: string
  fiverr?: string
  upwork?: string
  freelancer?: string
  kaggle?: string
  researchgate?: string
  orcid?: string
  googleScholar?: string
  customSocialLinks?: any[]
  dynamicFields?: Record<string, any>
  resumeUrl?: string
  phone?: string
  whatsapp?: string
  email?: string
  verified: boolean
  isFeatured?: boolean
  status: 'pending' | 'approved' | 'rejected'
  profileStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_REQUESTED' | 'APPROVED'
  verificationRequestStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_REQUESTED' | 'APPROVED'
  verificationPaymentDetails?: any
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  faqs?: any[]
  reviews?: any[]
  [key: string]: any
}

// -------------------------------------------------------------
// FRESH DATABASE EMPTY STATES (No fake records)
// -------------------------------------------------------------
export const MOCK_BUSINESSES: BusinessItem[] = []
export const MOCK_COMPANIES: CompanyItem[] = []
export const MOCK_JOBS: JobItem[] = []
export const MOCK_PROFESSIONALS: ProfessionalItem[] = []
export const MOCK_VERIFICATION_REQUESTS: ProfessionalVerificationRequest[] = []

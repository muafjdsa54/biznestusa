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
  California: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Irvine', 'Arroyo Grande', 'La Verne', 'Mountain View', 'San Clemente', 'Solvang', 'Thousand Palms', 'Yountville'],
  Colorado: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Boulder'],
  Connecticut: ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury'],
  Delaware: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Bear'],
  Florida: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Fort Lauderdale', 'Tallahassee', 'Cape Coral', 'Pembroke Pines', 'Boca Raton', 'Daytona Beach', 'Heathrow', 'Naples', 'Winter Garden'],
  Georgia: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Chamblee', 'Gainesville'],
  Hawaii: ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe'],
  Idaho: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Caldwell', 'Pocatello', 'Coeur d\'Alene'],
  Illinois: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria', 'Elmhurst', 'Lake Forest', 'Northlake', 'Oak Brook', 'River Forest'],
  Indiana: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington'],
  Iowa: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Ames'],
  Kansas: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee'],
  Kentucky: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown'],
  Louisiana: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City'],
  Maine: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford'],
  Maryland: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Hagerstown', 'Annapolis'],
  Massachusetts: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy', 'Lynn', 'Chelmsford', 'Marblehead', 'Pittsfield'],
  Michigan: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Dearborn', 'Cadillac', 'Mt. Clemens', 'West Bloomfield Township'],
  Minnesota: ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'Edina', 'Richfield'],
  Mississippi: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Tupelo', 'Meridian'],
  Missouri: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon', 'Chesterfield', 'Des Peres', 'Fenton', 'Rolla'],
  Montana: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Columbia Falls'],
  Nebraska: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings'],
  Nevada: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'],
  'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover', 'Rochester', 'Salem', 'Alton', 'Exeter'],
  'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Trenton', 'Camden', 'Paramus', 'Princeton', 'Teaneck'],
  'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Brooklyn', 'Commack', 'Holbrook', 'Howard Beach', 'Plattsburgh'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'Buies Creek', 'Matthews'],
  'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Horace'],
  Ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Dublin', 'Monroe', 'Oberlin', 'West Chester'],
  Oklahoma: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton', 'Moore'],
  Oregon: ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford'],
  Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Reading', 'Erie', 'Upper Darby', 'Scranton', 'Harrisburg', 'Audubon', 'Blue Bell', 'Chester', 'Coraopolis', 'Fort Washington', 'Mechanicsburg', 'Trevose'],
  'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport'],
  'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Easley'],
  'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton'],
  Tennessee: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin'],
  Texas: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Irving', 'Frisco', 'Bedford', 'League City', 'Prosper', 'Valley View', 'Waco', 'Westlake'],
  Utah: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George'],
  Vermont: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier', 'Winooski', 'St. Albans'],
  Virginia: ['Virginia Beach', 'Chesapeake', 'Norfolk', 'Richmond', 'Newport News', 'Alexandria', 'Arlington', 'Hampton', 'Blacksburg', 'Fredericksburg', 'McLean'],
  Washington: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley', 'Redmond'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Weirton', 'Fairmont'],
  Wisconsin: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Arcadia', 'La Crosse', 'Menomonee Falls', 'Prairie du Sac'],
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
      'Plumber', 'Roofer', 'Electrician', 'HVAC Contractor',
      'Handyman', 'Landscaper', 'Pest Control', 'Cleaning Service', 'Moving Company',
      'Locksmith', 'Appliance Repair', 'Garage Door Service', 'Flooring Contractor',
      'Painting Contractor', 'Roofing Contractor', 'Remodeling Contractor'
    ]
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: 'briefcase',
    desc: 'Certified accountants, attorneys, management consultants, and advisory firms',
    color: '#4f46e5',
    subcategories: [
      'Accountant', 'Attorney', 'Financial Advisor',
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
      'Photography', 'Wedding Services', 'Printing', 'Storage',
      'Security Services', 'Travel Agency', 'Funeral Services'
    ]
  },
  {
    id: 'pets-animals',
    name: 'Pet Services & Animals',
    icon: 'paw',
    desc: 'Licensed veterinarians, emergency animal hospitals, dog groomers, boarding kennels, and pet trainers',
    color: '#10b981',
    subcategories: [
      'Veterinarian', 'Animal Hospital', 'Dog Groomer', 'Pet Boarding & Daycare',
      'Dog Trainer', 'Mobile Pet Grooming', 'Pet Sitter & Dog Walker', 'Cat Groomer',
      'Exotic Pet Care', 'Pet Supplies Store'
    ]
  },
  {
    id: 'legal-services',
    name: 'Legal & Attorney Services',
    icon: 'legal',
    desc: 'Top-rated personal injury attorneys, criminal defense, family law, immigration, and business lawyers',
    color: '#6366f1',
    subcategories: [
      'Personal Injury Attorney', 'Criminal Defense Lawyer', 'Family & Divorce Lawyer',
      'Immigration Attorney', 'Business Lawyer', 'Estate Planning Attorney',
      'Real Estate Attorney', 'Bankruptcy Lawyer', 'Civil Litigation'
    ]
  },
  {
    id: 'cleaning-maintenance',
    name: 'Cleaning & Janitorial',
    icon: 'cleaning',
    desc: 'Residential house cleaning, maid services, commercial janitorial, carpet cleaning, and pressure washing',
    color: '#06b6d4',
    subcategories: [
      'House Cleaning', 'Maid Service', 'Commercial Janitorial', 'Carpet Cleaning',
      'Pressure Washing', 'Window Cleaning', 'Move-Out Cleaning', 'Post-Construction Cleaning',
      'Junk Removal'
    ]
  },
  {
    id: 'events-weddings',
    name: 'Events & Weddings',
    icon: 'events',
    desc: 'Premier wedding venues, event planners, party rentals, DJs, caterers, and florists',
    color: '#ec4899',
    subcategories: [
      'Wedding Venue', 'Event Planner', 'Wedding Photographer', 'Party Rentals',
      'DJ & Entertainment', 'Florist', 'Bridal Shop', 'Banquet Hall', 'Photo Booth Rental'
    ]
  },
  {
    id: 'business-finance-professionals',
    name: 'Business & Finance',
    icon: 'finance',
    desc: 'Certified accountants, bookkeepers, financial analysts, consultants, and project leaders',
    color: '#059669',
    subcategories: [
      'Bookkeeper', 'Business Analyst', 'Business Consultant',
      'Financial Analyst', 'HR Specialist', 'Project Manager', 'Recruiter'
    ]
  },
  {
    id: 'design-creative',
    name: 'Design & Creative',
    icon: 'beauty',
    desc: 'Graphic designers, UX designers, video editors, 3D artists, and creative professionals',
    color: '#ec4899',
    subcategories: [
      '3D Designer', 'Animator', 'Graphic Designer', 'Illustrator',
      'Motion Designer', 'Photographer', 'Product Designer', 'UI/UX Designer',
      'Video Editor', 'Web Designer'
    ]
  },
  {
    id: 'education-professionals',
    name: 'Education Professionals',
    icon: 'education',
    desc: 'Certified teachers, college professors, specialized tutors, and career coaches',
    color: '#7c3aed',
    subcategories: [
      'Academic Advisor', 'Career Coach', 'Professor', 'Teacher', 'Tutor'
    ]
  },
  {
    id: 'healthcare-professionals',
    name: 'Healthcare Professionals',
    icon: 'healthcare',
    desc: 'Licensed physicians, registered nurses, dentists, therapists, and medical specialists',
    color: '#dc2626',
    subcategories: [
      'Medical Assistant', 'Nurse', 'Pharmacist'
    ]
  },
  {
    id: 'legal-professionals',
    name: 'Legal Professionals',
    icon: 'legal',
    desc: 'Licensed attorneys, trial lawyers, certified paralegals, and legal consultants',
    color: '#4f46e5',
    subcategories: [
      'Lawyer', 'Legal Consultant', 'Paralegal'
    ]
  },
  {
    id: 'marketing-professionals',
    name: 'Marketing & Digital',
    icon: 'technology',
    desc: 'Digital strategists, SEO specialists, copywriters, and performance marketers',
    color: '#f97316',
    subcategories: [
      'Brand Strategist', 'Content Writer', 'Copywriter', 'Digital Marketer',
      'Email Marketing Specialist', 'PPC Specialist', 'SEO Specialist', 'Social Media Manager'
    ]
  },
  {
    id: 'skilled-trades',
    name: 'Skilled Trades & Craft',
    icon: 'construction',
    desc: 'Licensed electricians, master plumbers, HVAC technicians, carpenters, and roofers',
    color: '#d97706',
    subcategories: [
      'Carpenter', 'Construction Worker', 'HVAC Technician',
      'Mason', 'Mechanic', 'Painter', 'Welder'
    ]
  },
  {
    id: 'technology-professionals',
    name: 'Technology Professionals',
    icon: 'technology',
    desc: 'Software engineers, cloud architects, cybersecurity specialists, and AI researchers',
    color: '#2563eb',
    subcategories: [
      'AI Engineer', 'Backend Developer', 'Cloud Engineer', 'Cybersecurity Specialist',
      'Data Analyst', 'Data Scientist', 'Database Administrator', 'DevOps Engineer',
      'Frontend Developer', 'Full Stack Developer', 'Machine Learning Engineer',
      'Mobile App Developer', 'Network Administrator', 'QA Engineer', 'Software Developer',
      'Software Engineer', 'System Administrator', 'Web Developer'
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
  transactionId?: string
  customerNote?: string
  amount: number
  screenshotUrl?: string
  paymentScreenshot?: string
  paymentDate?: string
  verifiedAt?: string
  verifiedBy?: string
  notes?: string
}

export type BusinessPlan = 'review_1' | 'priority_5' | 'authoritative_10'

export interface BusinessPlanInfo {
  id: BusinessPlan
  name: string
  price: number
  badge: string
  tagline: string
  features: string[]
  postsAllowed: number
  hasSinglePage: boolean
  canEditProfile: boolean
  hasBacklinks: boolean
  supportType: string
  turnaroundTime: string
}

export const BUSINESS_PLANS: Record<BusinessPlan, BusinessPlanInfo> = {
  review_1: {
    id: 'review_1',
    name: '$1 Basic Plan',
    price: 1,
    badge: 'Basic — Submit Only',
    tagline: 'Dedicated business page, submit only — no edits, no blog posts, no gallery',
    features: [
      'Dedicated standalone single page created (/business/your-slug)',
      'Listed in both List View and Grid View on subcategory directory',
      'Submit only — no dashboard edit access',
      'No blog posts included',
      'No photo gallery included'
    ],
    postsAllowed: 0,
    hasSinglePage: true,
    canEditProfile: false,
    hasBacklinks: false,
    supportType: 'Email Support',
    turnaroundTime: 'Standard queue'
  },
  priority_5: {
    id: 'priority_5',
    name: '$5 Standard Plan',
    price: 5,
    badge: 'Recommended — Full Ownership',
    tagline: 'Dedicated business profile page with ownership and dashboard edit access',
    features: [
      'Dedicated standalone single page created (/business/your-slug)',
      'Full business ownership and comprehensive company profile',
      'Dashboard Edit Access: edit profile details & business info (applied after review)',
      'Listed in both List View and Grid View on subcategory directory',
      'Submit up to 5 business articles / blog posts',
      'Verified business badge & customer review enablement',
      'Priority directory placement above basic listings'
    ],
    postsAllowed: 5,
    hasSinglePage: true,
    canEditProfile: true,
    hasBacklinks: false,
    supportType: 'Email Support',
    turnaroundTime: 'Priority queue'
  },
  authoritative_10: {
    id: 'authoritative_10',
    name: '$10 Authoritative Plan',
    price: 10,
    badge: 'Authoritative — Maximum SEO & Exposure',
    tagline: '10 blog posts per 60 days & high DA backlinks',
    features: [
      'Priority review queue & admin approval',
      'Search engine submission for your listing page',
      'Dedicated standalone single page created (/business/your-slug)',
      'Dashboard Edit Access: edit profile & business details (applied after review)',
      '10 Blog Posts per 60-day rolling cycle (dynamic quota tracking)',
      'Add & update listing photos — photo gallery (up to 5 photos)',
      'Directory syndication & high DA backlinks for Google ranking',
      'VIP Priority Support via Email & WhatsApp',
      'Featured placement at top of category List & Grid views'
    ],
    postsAllowed: 10,
    hasSinglePage: true,
    canEditProfile: true,
    hasBacklinks: true,
    supportType: 'Priority Email & WhatsApp Support',
    turnaroundTime: 'Priority queue'
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
  | 'PENDING_PAYMENT'
  | 'PAYMENT_VERIFICATION_PENDING'
  | 'PAID'
  | 'REFUNDED'

export type PaymentStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_VERIFICATION_PENDING'
  | 'PAID'
  | 'REJECTED'
  | 'REFUNDED'

export interface PaymentRecord {
  id: string
  user_id: string
  user_email?: string
  business_id: string
  business_name: string
  business_slug?: string
  customer_name?: string
  customer_email?: string
  plan_id: BusinessPlan
  plan_name: string
  amount: number
  currency: string
  payment_reference: string
  payment_provider: 'payoneer'
  payment_status: PaymentStatus
  payoneer_transaction_id?: string | null
  payment_screenshot_url?: string | null
  customer_note?: string | null
  created_at: string
  screenshot_submitted_at?: string | null
  verified_at?: string | null
  rejected_at?: string | null
  verified_by?: string | null
  rejection_reason?: string | null
  admin_notes?: string | null
}

export interface PaymentAuditLog {
  id: string
  payment_id: string
  payment_reference: string
  business_id: string
  action: 'created' | 'screenshot_submitted' | 'approved' | 'rejected' | 'refunded'
  admin_id?: string | null
  notes?: string | null
  created_at: string
}

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
  status: 'draft' | 'pending' | 'pending_review' | 'published' | 'rejected'
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
  /** Denormalized canonical city slugs (see computeCitySlugs in lib/directory-helpers.ts) — groundwork for future Firestore cursor pagination. Recomputed at read time; no filter reads it yet. */
  citySlugs?: string[]
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
  // Brand Authority & Google Ranking Profiles
  googleBusinessProfile?: string
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  address: string
  locations?: BusinessLocation[]
  coverImage: string
  logo: string
  gallery?: string[]
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
  hasSinglePage?: boolean
  canEditProfile?: boolean
  // Seed Directory & Data Provenance Fields
  source_type?: 'seed_research' | 'user_submission' | 'claim' | string
  claim_status?: 'unclaimed' | 'claimed' | 'pending_verification' | string
  ownership_status?: 'directory_seed' | 'claimed_owner' | 'unclaimed' | string
  account_id?: string | null
  created_by?: string
  source_urls?: string[]
  official_source_url?: string
  secondary_source_urls?: string[]
  source_checked_date?: string
  source_notes?: string
  data_quality_notes?: string
  verification_confidence?: string
  professional_title?: string | null
  organization?: string | null
  year_established?: number | string | null
  service_area?: string | null
  social_profiles?: string[] | null
  main_category?: string
  main_category_slug?: string
  subcategory_slug?: string
  state_code?: string | null
  country?: string | null
  zip?: string | null
  hours?: string | Record<string, string> | null
  priceRange?: string | null
  short_description?: string | null
  longer_factual_description?: string | null
  created_at?: string
  updated_at?: string
  business_name?: string
  business_slug?: string
  editRequests?: {
    id: string
    requestedAt: string
    status: 'pending' | 'applied' | 'rejected'
    appliedAt?: string
    notes?: string
    changes: Record<string, any>
  }[]
  lastEditedAt?: string
  paymentDetails?: BusinessPaymentDetails
  paymentScreenshot?: string
  transactionRef?: string
  payment_reference?: string
  payment_provider?: string
  payoneer_transaction_id?: string
  customer_note?: string
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
  /** Denormalized canonical city slugs (see computeCitySlugs in lib/directory-helpers.ts) — groundwork for future Firestore cursor pagination. Recomputed at read time; no filter reads it yet. */
  citySlugs?: string[]
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
  /** Denormalized canonical city slugs (see computeCitySlugs in lib/directory-helpers.ts) — groundwork for future Firestore cursor pagination. Recomputed at read time; no filter reads it yet. */
  citySlugs?: string[]
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
export const MOCK_COMPANIES: CompanyItem[] = [
  {
    "id": "comp-apple",
    "slug": "apple",
    "name": "Apple",
    "category": "Technology",
    "industry": "Technology",
    "companyType": "Public",
    "headquarters": "Cupertino, California",
    "city": "Cupertino",
    "state": "California",
    "province": "California",
    "country": "United States",
    "website": "https://www.apple.com",
    "logo": "",
    "coverImage": "",
    "description": "Technology company — consumer electronics, software, and online services.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-microsoft",
    "slug": "microsoft",
    "name": "Microsoft",
    "category": "Technology",
    "industry": "Technology",
    "companyType": "Public",
    "headquarters": "Redmond, Washington",
    "city": "Redmond",
    "state": "Washington",
    "province": "Washington",
    "country": "United States",
    "website": "https://www.microsoft.com",
    "logo": "",
    "coverImage": "",
    "description": "Technology company — software, cloud computing, and personal computing devices.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-amazon",
    "slug": "amazon",
    "name": "Amazon",
    "category": "Technology",
    "industry": "Technology",
    "companyType": "Public",
    "headquarters": "Seattle, Washington",
    "city": "Seattle",
    "state": "Washington",
    "province": "Washington",
    "country": "United States",
    "website": "https://www.amazon.com",
    "logo": "",
    "coverImage": "",
    "description": "Technology and e-commerce company — online retail, cloud computing, and logistics.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-google",
    "slug": "google",
    "name": "Google",
    "category": "Technology",
    "industry": "Technology",
    "companyType": "Public",
    "headquarters": "Mountain View, California",
    "city": "Mountain View",
    "state": "California",
    "province": "California",
    "country": "United States",
    "website": "https://www.google.com",
    "logo": "",
    "coverImage": "",
    "description": "Technology company — internet search, online advertising, and cloud services.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-walmart",
    "slug": "walmart",
    "name": "Walmart",
    "category": "Retail",
    "industry": "Retail",
    "companyType": "Public",
    "headquarters": "Bentonville, Arkansas",
    "city": "Bentonville",
    "state": "Arkansas",
    "province": "Arkansas",
    "country": "United States",
    "website": "https://www.walmart.com",
    "logo": "",
    "coverImage": "",
    "description": "Retail company — hypermarkets, discount department stores, and grocery stores.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-jpmorgan-chase",
    "slug": "jpmorgan-chase",
    "name": "JPMorgan Chase",
    "category": "Banking & Finance",
    "industry": "Banking & Finance",
    "companyType": "Public",
    "headquarters": "New York, New York",
    "city": "New York",
    "state": "New York",
    "province": "New York",
    "country": "United States",
    "website": "https://www.jpmorganchase.com",
    "logo": "",
    "coverImage": "",
    "description": "Banking and financial services company — investment banking, asset management, and retail banking.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-bank-of-america",
    "slug": "bank-of-america",
    "name": "Bank of America",
    "category": "Banking & Finance",
    "industry": "Banking & Finance",
    "companyType": "Public",
    "headquarters": "Charlotte, North Carolina",
    "city": "Charlotte",
    "state": "North Carolina",
    "province": "North Carolina",
    "country": "United States",
    "website": "https://www.bankofamerica.com",
    "logo": "",
    "coverImage": "",
    "description": "Banking and financial services company — consumer banking, wealth management, and investment banking.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-berkshire-hathaway",
    "slug": "berkshire-hathaway",
    "name": "Berkshire Hathaway",
    "category": "Banking & Finance",
    "industry": "Conglomerate",
    "companyType": "Public",
    "headquarters": "Omaha, Nebraska",
    "city": "Omaha",
    "state": "Nebraska",
    "province": "Nebraska",
    "country": "United States",
    "website": "https://www.berkshirehathaway.com",
    "logo": "",
    "coverImage": "",
    "description": "Holding company — insurance, railroads, utilities, and manufacturing businesses.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-exxon-mobil",
    "slug": "exxon-mobil",
    "name": "Exxon Mobil",
    "category": "Energy",
    "industry": "Energy",
    "companyType": "Public",
    "headquarters": "Spring, Texas",
    "city": "Spring",
    "state": "Texas",
    "province": "Texas",
    "country": "United States",
    "website": "https://www.exxonmobil.com",
    "logo": "",
    "coverImage": "",
    "description": "Energy company — oil and natural gas exploration, production, and refining.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-johnson-johnson",
    "slug": "johnson-johnson",
    "name": "Johnson & Johnson",
    "category": "Healthcare",
    "industry": "Healthcare",
    "companyType": "Public",
    "headquarters": "New Brunswick, New Jersey",
    "city": "New Brunswick",
    "state": "New Jersey",
    "province": "New Jersey",
    "country": "United States",
    "website": "https://www.jnj.com",
    "logo": "",
    "coverImage": "",
    "description": "Healthcare company — pharmaceuticals, medical devices, and consumer health products.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-pfizer",
    "slug": "pfizer",
    "name": "Pfizer",
    "category": "Healthcare",
    "industry": "Healthcare",
    "companyType": "Public",
    "headquarters": "New York, New York",
    "city": "New York",
    "state": "New York",
    "province": "New York",
    "country": "United States",
    "website": "https://www.pfizer.com",
    "logo": "",
    "coverImage": "",
    "description": "Pharmaceutical company — prescription medicines and vaccines.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-coca-cola",
    "slug": "coca-cola",
    "name": "Coca-Cola",
    "category": "Food & Beverage",
    "industry": "Food & Beverage",
    "companyType": "Public",
    "headquarters": "Atlanta, Georgia",
    "city": "Atlanta",
    "state": "Georgia",
    "province": "Georgia",
    "country": "United States",
    "website": "https://www.coca-colacompany.com",
    "logo": "",
    "coverImage": "",
    "description": "Beverage company — soft drinks, juices, and bottled water.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-pepsico",
    "slug": "pepsico",
    "name": "PepsiCo",
    "category": "Food & Beverage",
    "industry": "Food & Beverage",
    "companyType": "Public",
    "headquarters": "Purchase, New York",
    "city": "Purchase",
    "state": "New York",
    "province": "New York",
    "country": "United States",
    "website": "https://www.pepsico.com",
    "logo": "",
    "coverImage": "",
    "description": "Food and beverage company — snacks, soft drinks, and packaged foods.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-procter-gamble",
    "slug": "procter-gamble",
    "name": "Procter & Gamble",
    "category": "Consumer Goods",
    "industry": "Consumer Goods",
    "companyType": "Public",
    "headquarters": "Cincinnati, Ohio",
    "city": "Cincinnati",
    "state": "Ohio",
    "province": "Ohio",
    "country": "United States",
    "website": "https://www.pg.com",
    "logo": "",
    "coverImage": "",
    "description": "Consumer goods company — household, personal care, and cleaning products.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-mcdonalds",
    "slug": "mcdonalds",
    "name": "McDonald's",
    "category": "Restaurants",
    "industry": "Restaurants",
    "companyType": "Public",
    "headquarters": "Chicago, Illinois",
    "city": "Chicago",
    "state": "Illinois",
    "province": "Illinois",
    "country": "United States",
    "website": "https://www.mcdonalds.com",
    "logo": "",
    "coverImage": "",
    "description": "Restaurant company — fast-food restaurants and franchising.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-starbucks",
    "slug": "starbucks",
    "name": "Starbucks",
    "category": "Restaurants",
    "industry": "Restaurants",
    "companyType": "Public",
    "headquarters": "Seattle, Washington",
    "city": "Seattle",
    "state": "Washington",
    "province": "Washington",
    "country": "United States",
    "website": "https://www.starbucks.com",
    "logo": "",
    "coverImage": "",
    "description": "Coffee company — coffeehouses and roasted coffee products.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-nike",
    "slug": "nike",
    "name": "Nike",
    "category": "Apparel & Footwear",
    "industry": "Apparel & Footwear",
    "companyType": "Public",
    "headquarters": "Beaverton, Oregon",
    "city": "Beaverton",
    "state": "Oregon",
    "province": "Oregon",
    "country": "United States",
    "website": "https://www.nike.com",
    "logo": "",
    "coverImage": "",
    "description": "Apparel and footwear company — athletic shoes, clothing, and equipment.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-home-depot",
    "slug": "home-depot",
    "name": "Home Depot",
    "category": "Home Improvement",
    "industry": "Home Improvement",
    "companyType": "Public",
    "headquarters": "Atlanta, Georgia",
    "city": "Atlanta",
    "state": "Georgia",
    "province": "Georgia",
    "country": "United States",
    "website": "https://www.homedepot.com",
    "logo": "",
    "coverImage": "",
    "description": "Home improvement retail company — tools, building materials, and garden supplies.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-fedex",
    "slug": "fedex",
    "name": "FedEx",
    "category": "Logistics",
    "industry": "Logistics",
    "companyType": "Public",
    "headquarters": "Memphis, Tennessee",
    "city": "Memphis",
    "state": "Tennessee",
    "province": "Tennessee",
    "country": "United States",
    "website": "https://www.fedex.com",
    "logo": "",
    "coverImage": "",
    "description": "Logistics company — package delivery, freight, and supply chain services.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-ups",
    "slug": "ups",
    "name": "UPS",
    "category": "Logistics",
    "industry": "Logistics",
    "companyType": "Public",
    "headquarters": "Atlanta, Georgia",
    "city": "Atlanta",
    "state": "Georgia",
    "province": "Georgia",
    "country": "United States",
    "website": "https://www.ups.com",
    "logo": "",
    "coverImage": "",
    "description": "Logistics company — package delivery, freight, and supply chain services.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-delta-air-lines",
    "slug": "delta-air-lines",
    "name": "Delta Air Lines",
    "category": "Airlines",
    "industry": "Airlines",
    "companyType": "Public",
    "headquarters": "Atlanta, Georgia",
    "city": "Atlanta",
    "state": "Georgia",
    "province": "Georgia",
    "country": "United States",
    "website": "https://www.delta.com",
    "logo": "",
    "coverImage": "",
    "description": "Airline — domestic and international passenger air transport.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-netflix",
    "slug": "netflix",
    "name": "Netflix",
    "category": "Entertainment",
    "industry": "Entertainment",
    "companyType": "Public",
    "headquarters": "Los Gatos, California",
    "city": "Los Gatos",
    "state": "California",
    "province": "California",
    "country": "United States",
    "website": "https://www.netflix.com",
    "logo": "",
    "coverImage": "",
    "description": "Entertainment company — streaming television, films, and original programming.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-meta",
    "slug": "meta",
    "name": "Meta",
    "category": "Technology",
    "industry": "Technology",
    "companyType": "Public",
    "headquarters": "Menlo Park, California",
    "city": "Menlo Park",
    "state": "California",
    "province": "California",
    "country": "United States",
    "website": "https://www.meta.com",
    "logo": "",
    "coverImage": "",
    "description": "Technology company — social media platforms and virtual reality.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-nvidia",
    "slug": "nvidia",
    "name": "NVIDIA",
    "category": "Technology",
    "industry": "Technology",
    "companyType": "Public",
    "headquarters": "Santa Clara, California",
    "city": "Santa Clara",
    "state": "California",
    "province": "California",
    "country": "United States",
    "website": "https://www.nvidia.com",
    "logo": "",
    "coverImage": "",
    "description": "Technology company — graphics processors and artificial intelligence computing.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  },
  {
    "id": "comp-tesla",
    "slug": "tesla",
    "name": "Tesla",
    "category": "Automotive",
    "industry": "Automotive",
    "companyType": "Public",
    "headquarters": "Austin, Texas",
    "city": "Austin",
    "state": "Texas",
    "province": "Texas",
    "country": "United States",
    "website": "https://www.tesla.com",
    "logo": "",
    "coverImage": "",
    "description": "Automotive and energy company — electric vehicles, batteries, and solar products.",
    "status": "approved",
    "verified": false,
    "isClaimed": false,
    "isFeatured": false
  }
]
export const MOCK_JOBS: JobItem[] = [
  {
    "id": "job-seed-a-01",
    "slug": "lead-associate-kansas-city",
    "title": "Lead Associate",
    "company": "Amazon",
    "companySlug": "amazon",
    "companyLogo": "",
    "category": "Transportation & Logistics",
    "department": "Operations",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Missouri",
    "province": "Missouri",
    "city": "Kansas City",
    "cities": [
      "Kansas City"
    ],
    "country": "United States",
    "salary": "$24.50 - $26.50 per hour",
    "experience": "1+ years of experience with Microsoft Office products and applications",
    "education": "High school or equivalent",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "As a Lead Associate, you'll be at the core of Amazon's fastest delivery operation, enhancing customer shopping experience. The ideal candidate possesses strong attention to detail, efficiently prioritizes tasks, demonstrates a willingness to learn, and maintains a commitment to delighting customers.",
    "responsibilities": [
      "Support, motivate, and model desired behavior for the rest of the team",
      "Manage operational processes, safety, quality, performance, and customer delivery promises following the Regional Area Manager guidance",
      "Maintain a clean, sanitary, safe, and organized workspace",
      "Provide ongoing training in areas including system and equipment knowledge, quality training, and general operations"
    ],
    "requirements": [
      "At least 18 years old, and authorized to work in the United States",
      "Able to lift up to 49 pounds, stand/walk during shifts lasting up to 12 hours, and be able to frequently push, pull, squat, bend, and reach",
      "Able to use carts, dollies, hand trucks, and other gear to move items around",
      "Work 40 hours/week, and overtime as required"
    ],
    "preferredQualifications": [],
    "skills": [
      "Microsoft Office",
      "Inventory management systems",
      "Team leadership",
      "Training",
      "Customer service",
      "Problem solving"
    ],
    "applicationUrl": "https://www.amazon.jobs/en/jobs/10560757/lead-associate",
    "applicationWebsite": "https://www.amazon.jobs/en/jobs/10560757/lead-associate",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-02",
    "slug": "staff-technology-operations-bentonville",
    "title": "Staff, Technology Operations",
    "company": "Walmart",
    "companySlug": "walmart",
    "companyLogo": "",
    "category": "IT & Systems",
    "department": "Technology Operations",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Arkansas",
    "province": "Arkansas",
    "city": "Bentonville",
    "cities": [
      "Bentonville"
    ],
    "country": "United States",
    "salary": "$90,000 - $180,000 per year",
    "experience": "4+ years of experience in project management, program management, program operations, or a related area (or 6 years of experience without a bachelor's degree)",
    "education": "Bachelor's degree in computer science, management information systems, industrial engineering, engineering management, business, information systems, project/program management, information technology, finance, management, or related area",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "As a Staff member in Technology Operations, you will lead the management and execution of complex programs, scale MCS performance through foundational improvements, expansion, and differentiated service capabilities. The Multichannel Solutions Team advances Walmart's shared-inventory fulfillment across various channels and business models.",
    "responsibilities": [
      "Enable and define the path for future launches",
      "Lead cross-functional launch readiness and performance-improvement mechanisms",
      "Manage and monitor program budgets, providing accurate financial inputs for business cases and operating plans",
      "Oversee program progress against milestones, leading cross-functional meetings to address schedule, risks, and dependencies"
    ],
    "requirements": [
      "Bachelor's degree in a related area and 4 years' experience in project management, program management, program operations, or related area (or 6 years' experience)",
      "Proven expertise in program and financial management, including budgeting, cost monitoring, and ROI projection",
      "Strong skills in program estimation, risk assessment, and mitigation for projects of small to medium complexity",
      "Proficiency in stakeholder management, influencing, and building consensus through clear, concise communication"
    ],
    "preferredQualifications": [],
    "skills": [
      "Program management",
      "Budgeting",
      "Risk assessment",
      "Data analysis",
      "Stakeholder management",
      "Technology strategy"
    ],
    "applicationUrl": "https://careers.walmart.com/us/en/jobs/R-2644581",
    "applicationWebsite": "https://careers.walmart.com/us/en/jobs/R-2644581",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-03",
    "slug": "package-handler-cedar-rapids",
    "title": "Package Handler",
    "company": "FedEx",
    "companySlug": "fedex",
    "companyLogo": "",
    "category": "Transportation & Logistics",
    "department": "Operations",
    "type": "Part-time",
    "workplaceType": "On-site",
    "state": "Iowa",
    "province": "Iowa",
    "city": "Cedar Rapids",
    "cities": [
      "Cedar Rapids"
    ],
    "country": "United States",
    "salary": "$18.40 - $22.00 per hour",
    "experience": "1 - 3 Years",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Federal Express Corporation (FEC) is part of the rapidly growing warehouse and transportation sector that helps keep America, and our economy, moving. Warehouse duties include loading, unloading, and sorting of packages of various sizes.",
    "responsibilities": [
      "Load, unload, and sort packages of various sizes",
      "Perform fast-paced, physical warehouse work",
      "Work shifts that vary based on package volume, generally 3 to 6 hours a day for part-time employees and 6 to 10 hours a day for full-time employees"
    ],
    "requirements": [
      "Able to perform fast-paced, physical warehouse work",
      "Flexible scheduling availability, including shift work based on package volume",
      "Able to work overtime after 40 hours a week as needed"
    ],
    "preferredQualifications": [],
    "skills": [
      "Package handling",
      "Sorting",
      "Loading and unloading",
      "Warehouse operations"
    ],
    "applicationUrl": "https://careers.fedex.com/package-handler-part-time-warehouse-like/job/P25-95381-51",
    "applicationWebsite": "https://careers.fedex.com/package-handler-part-time-warehouse-like/job/P25-95381-51",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-04",
    "slug": "senior-software-engineer-discover-feed-recommendations-mountain-view",
    "title": "Senior Software Engineer, Discover Feed Recommendations",
    "company": "Google",
    "companySlug": "google",
    "companyLogo": "",
    "category": "Software Development",
    "department": "Engineering",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "California",
    "province": "California",
    "city": "Mountain View",
    "cities": [
      "Mountain View"
    ],
    "country": "United States",
    "salary": "$174,000 - $252,000 per year",
    "experience": "5 years of experience with software development in one or more programming languages",
    "education": "Bachelor's degree or equivalent practical experience",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Google's software engineers develop the next-generation technologies that change how billions of users connect, explore, and interact with information and one another. Discover is Google's personalized interest feed, connecting users globally with the best content from across the web in real time.",
    "responsibilities": [
      "Research and deploy ML models that identify content by combining multimodal LLM understanding, uncertainty estimation, and causal modeling to maximize exploration ROI at scale",
      "Drive projects from problem formulation and experimentation design through model training, real-time serving architecture, and production launches",
      "Partner to align semantic applicant retrieval, ranking incentives, and warm-start handoffs so promising new content seamlessly activates the organic recommendation flywheel",
      "Lead zero-history discovery for Discover's top formats, making dynamically generated AI content a citizen across the stack and surfacing breaking news within minutes of publication"
    ],
    "requirements": [
      "Bachelor's degree or equivalent practical experience",
      "5 years of experience with software development in one or more programming languages",
      "3 years of experience with end-to-end Machine Learning (e.g., model deployment, model evaluation, data processing, debugging)",
      "3 years of experience building and deploying recommendation systems models (retrieval, prediction, ranking, personalization, search quality, embedding) in production, and experience building architecture"
    ],
    "preferredQualifications": [],
    "skills": [
      "Machine Learning",
      "Recommendation systems",
      "Generative AI",
      "Data pipelines",
      "System design",
      "Personalization algorithms"
    ],
    "applicationUrl": "https://www.google.com/about/careers/applications/jobs/results/84408490079986374-senior-software-engineer-discover-feed-recommendations?src=Online/LinkedIn/linkedin_us&utm_source=linkedin&utm_medium=jobposting&utm_campaign=contract",
    "applicationWebsite": "https://www.google.com/about/careers/applications/jobs/results/84408490079986374-senior-software-engineer-discover-feed-recommendations?src=Online/LinkedIn/linkedin_us&utm_source=linkedin&utm_medium=jobposting&utm_campaign=contract",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-05",
    "slug": "flight-attendant-atlanta",
    "title": "Flight Attendant",
    "company": "Delta Air Lines",
    "companySlug": "delta-air-lines",
    "companyLogo": "",
    "category": "Transportation & Logistics",
    "department": "In-Flight Services",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Georgia",
    "province": "Georgia",
    "city": "Atlanta",
    "cities": [
      "Atlanta"
    ],
    "country": "United States",
    "salary": "Competitive Package",
    "experience": "1 - 3 Years",
    "education": "High school diploma, GED or equivalent",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Delta is now accepting flight attendant applications for its upcoming 2027 hiring classes, with opportunities available for both English-speaking and bilingual candidates. The top priority for every Delta flight attendant is to ensure the safety and comfort of all customers while providing memorable moments.",
    "responsibilities": [
      "Ensure the safety and comfort of all customers while providing memorable moments",
      "Fly domestic and international routes, including overnights, weekends, holidays and irregular hours to support Delta's global network of 300+ destinations",
      "Complete the required pre-employment process, including a background check and a drug screening, prior to the first day of work"
    ],
    "requirements": [
      "Be at least 21 years old at the time of application",
      "Have a high school diploma, GED or equivalent",
      "Be legally authorized to work in the U.S.",
      "Speak, read and write English fluently"
    ],
    "preferredQualifications": [],
    "skills": [
      "Customer service",
      "Communication",
      "Teamwork",
      "Flexibility"
    ],
    "applicationUrl": "https://www.delta.com/us/en/careers/flight-attendant-careers",
    "applicationWebsite": "https://www.delta.com/us/en/careers/flight-attendant-careers",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-06",
    "slug": "front-desk-agent-fort-myers",
    "title": "Front Desk Agent",
    "company": "Concord Hospitality",
    "companySlug": "concord-hospitality",
    "companyLogo": "",
    "category": "Hospitality & Tourism",
    "department": "Front Desk",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Florida",
    "province": "Florida",
    "city": "Fort Myers",
    "cities": [
      "Fort Myers"
    ],
    "country": "United States",
    "salary": "Competitive Package",
    "experience": "Marriott experience preferred",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Working at the Front Desk means you are THE hub of hotel activity and manage more guest interactions than any other member of the staff. We are looking for people that have a passion for excellent customer care; this position is extremely hands on, providing public area cleaning and laundry support while covering the front desk.",
    "responsibilities": [
      "Assist guests efficiently, courteously and professionally at all times",
      "Promptly and effectively manage guest concerns or issues and see all are met to satisfaction in a timely manner",
      "Post guest charges, collect payments and follow all cash handling procedures",
      "Respond quickly to incoming calls, lobby visitors and team members needing front desk assistance"
    ],
    "requirements": [
      "Marriott experience preferred",
      "Have full knowledge of hotel safety and emergency procedures",
      "Be knowledgeable of the hotel brand and various programs (travel programs, special offers)",
      "Be a great communicator to various departments and management on guest comments and concerns"
    ],
    "preferredQualifications": [],
    "skills": [
      "Customer service",
      "Communication",
      "Cash handling",
      "Lightspeed"
    ],
    "applicationUrl": "https://careers.marriott.com/front-desk-agent-studiores-by-marriott-fort-myers/job/DAE9E44477D9CC7A99099E3F79D5E70B",
    "applicationWebsite": "https://careers.marriott.com/front-desk-agent-studiores-by-marriott-fort-myers/job/DAE9E44477D9CC7A99099E3F79D5E70B",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-07",
    "slug": "sales-associate-inside-lawn-garden-auburndale",
    "title": "Sales Associate - Inside Lawn & Garden",
    "company": "Lowe's",
    "companySlug": "lowes",
    "companyLogo": "",
    "category": "Retail & Commerce",
    "department": "Store Operations",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Florida",
    "province": "Florida",
    "city": "Auburndale",
    "cities": [
      "Auburndale"
    ],
    "country": "United States",
    "salary": "Competitive Package",
    "experience": "6 months of retail and/or customer service experience",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "As a Customer Service Associate, you combine top-notch customer service skills with genuine care for people to help customers feel comfortable while shopping at Lowe's. As a Customer Service Associate, you will welcome customers to Lowe's and help them find the right products and services for their home improvement needs.",
    "responsibilities": [
      "Welcome customers to Lowe's and help them find the right products and services for their home improvement needs",
      "Work in the Inside Lawn & Garden department, based on hiring needs and skillsets",
      "Help customers feel comfortable while shopping at Lowe's and solve their home improvement challenges"
    ],
    "requirements": [
      "6 months experience using a computer, including inputting, accessing, modifying, or outputting information",
      "6 months of retail and/or customer service experience",
      "Certification in trade related to department (e.g., hardware, kitchen, plumbing, electrical, lawn and garden, and lumber/building materials)"
    ],
    "preferredQualifications": [],
    "skills": [
      "Customer service",
      "Computer skills",
      "Retail sales",
      "Communication"
    ],
    "applicationUrl": "https://talent.lowes.com/us/en/job/JR-02687735/Full-Time-Sales-Associate-Inside-Lawn-Garden-Opening",
    "applicationWebsite": "https://talent.lowes.com/us/en/job/JR-02687735/Full-Time-Sales-Associate-Inside-Lawn-Garden-Opening",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-08",
    "slug": "relationship-banker-hendersonville",
    "title": "Relationship Banker",
    "company": "Bank of America",
    "companySlug": "bank-of-america",
    "companyLogo": "",
    "category": "Finance & Accounting",
    "department": "Financial Center",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "North Carolina",
    "province": "North Carolina",
    "city": "Hendersonville",
    "cities": [
      "Hendersonville"
    ],
    "country": "United States",
    "salary": "Competitive Package",
    "experience": "1 year of demonstrated successful sales experience in a salary plus incentive environment with individual sales goals (desired); 6 months of cash handling experience (desired)",
    "education": "High School Diploma / GED / Secondary School or equivalent",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "This job is responsible for engaging clients in the lobby to educate and assist with conducting transactions through self-service resources, such as mobile banking, online banking, or ATM. Job expectations include having deep conversations with clients to gain in-depth knowledge of the financial and life priorities and connecting clients to solutions that meet the financial goals.",
    "responsibilities": [
      "Accurately and efficiently process cash transactions for clients as needed",
      "Build relationships with clients to meet financial needs",
      "Manage financial center traffic, appointments, and outbound calls effectively",
      "Grow business knowledge and network by partnering with experts in small business, lending, and investments"
    ],
    "requirements": [
      "Is an enthusiastic, highly motivated self-starter with a strong work ethic and intense focus on results",
      "Communicates effectively and confidently and is comfortable engaging all clients",
      "Has the ability to learn and adapt to new information and technology platforms",
      "Must be able to work weekends and/or extended hours, which may include being scheduled at any financial center location within a reasonable distance"
    ],
    "preferredQualifications": [],
    "skills": [
      "Adaptability",
      "Business Acumen",
      "Customer and Client Focus",
      "Oral Communications",
      "Problem Solving",
      "Relationship Building"
    ],
    "applicationUrl": "https://careers.bankofamerica.com/en-us/job-detail/26038976/relationship-banker-hendersonville-financial-center-hendersonville-north-carolina-united-states",
    "applicationWebsite": "https://careers.bankofamerica.com/en-us/job-detail/26038976/relationship-banker-hendersonville-financial-center-hendersonville-north-carolina-united-states",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-09",
    "slug": "customer-service-representative-las-vegas",
    "title": "Customer Service Representative",
    "company": "UnitedHealth Group",
    "companySlug": "unitedhealth-group",
    "companyLogo": "",
    "category": "Customer Support & Service",
    "department": "Customer Service",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Nevada",
    "province": "Nevada",
    "city": "Las Vegas",
    "cities": [
      "Las Vegas"
    ],
    "country": "United States",
    "salary": "$16 - $29 per hour",
    "experience": "6+ months of experience in a customer service / call center OR healthcare environment (preferred)",
    "education": "High School Diploma / GED OR equivalent work experience",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Working in a call center environment under supervision to receive and process inbound calls from patients, providers and other medical staff. Optum is a global organization that delivers care, aided by technology to help millions of people live healthier lives.",
    "responsibilities": [
      "Answer a minimum of 9 calls per hour resolving moderate to complex issues",
      "Schedule and verify appointments in clinical information system",
      "Verify and update patient demographic and insurance information",
      "Review and process medication refills"
    ],
    "requirements": [
      "High School Diploma / GED OR equivalent work experience",
      "Must be 18 years of age OR older",
      "Ability to work full-time, with flexibility to work any 8-hour shift schedule during business hours of 7:00 am - 8:00 pm Monday-Friday and 8:00 am - 5:00 pm Saturday and Sunday",
      "6+ months of experience in a customer service / call center OR healthcare environment (preferred)"
    ],
    "preferredQualifications": [],
    "skills": [
      "Customer service",
      "Telephone etiquette",
      "Data entry",
      "Problem solving",
      "Medical terminology",
      "Microsoft Excel"
    ],
    "applicationUrl": "https://careers.unitedhealthgroup.com/job/las-vegas/customer-service-representative/34088/102870453936",
    "applicationWebsite": "https://careers.unitedhealthgroup.com/job/las-vegas/customer-service-representative/34088/102870453936",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-10",
    "slug": "pharmacy-technician-huntersville",
    "title": "Pharmacy Technician",
    "company": "Walgreens",
    "companySlug": "walgreens",
    "companyLogo": "",
    "category": "Healthcare & Medical",
    "department": "Pharmacy",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "North Carolina",
    "province": "North Carolina",
    "city": "Huntersville",
    "cities": [
      "Huntersville"
    ],
    "country": "United States",
    "salary": "$17 - $23.25 per hour",
    "experience": "6 months of experience in a retail environment (preferred)",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "In accordance with state and federal regulations, assists the pharmacist, under direct supervision, in the practice of pharmacy. Responsible for using pharmacy systems to obtain patient and drug information and process prescriptions.",
    "responsibilities": [
      "Use pharmacy systems to enter patient and drug information, ensuring information is entered correctly",
      "Fill prescriptions by retrieving, counting and pouring pharmaceutical drugs, verifying medicine is correct, and checking for possible interactions",
      "Engage customers and patients by greeting them and offering assistance with products and services",
      "Assist with pharmacy inventory management, such as ordering, unpacking, checking and storing shipment of pharmaceuticals"
    ],
    "requirements": [
      "Must be fluent in reading, writing, and speaking English",
      "Requires willingness to work flexible schedule, including evening and weekend hours",
      "Earns and maintains PTCB or ExCPT certification through the designated PTCB training program and/or state required certification/registration"
    ],
    "preferredQualifications": [],
    "skills": [
      "Pharmacy systems",
      "Prescription processing",
      "Customer service",
      "Inventory management",
      "Math skills",
      "Computer skills"
    ],
    "applicationUrl": "https://jobs.walgreens.com/en/job/huntersville/pharmacy-technician/1242/97164352048",
    "applicationWebsite": "https://jobs.walgreens.com/en/job/huntersville/pharmacy-technician/1242/97164352048",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-11",
    "slug": "crew-member-fort-lauderdale",
    "title": "Crew Member",
    "company": "Chipotle",
    "companySlug": "chipotle",
    "companyLogo": "",
    "category": "Hospitality & Tourism",
    "department": "Restaurant Operations",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Florida",
    "province": "Florida",
    "city": "Fort Lauderdale",
    "cities": [
      "Fort Lauderdale"
    ],
    "country": "United States",
    "salary": "Competitive Package",
    "experience": "1 - 3 Years",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "We prepare real food by hand every day in our restaurants. No freezers, microwaves or can openers to be found. We provide exceptional training and a clear career path - over 80% of our managers were promoted from Crew.",
    "responsibilities": [
      "Work at any station - grill, cashier, prep, salsa and expo",
      "Create the friendly atmosphere that our customers expect and enjoy",
      "Prepare real food by hand every day in our restaurants",
      "Help serve customers and deliver exceptional customer service as part of the restaurant team"
    ],
    "requirements": [
      "A friendly, enthusiastic attitude",
      "Passion for helping and serving others (both customers and team members)",
      "Desire to learn how to cook (a lot)",
      "Be at least 16 years old"
    ],
    "preferredQualifications": [],
    "skills": [
      "Customer service",
      "Teamwork",
      "Communication",
      "Food preparation"
    ],
    "applicationUrl": "https://jobs.chipotle.com/job/fort-lauderdale/crew-member/282/70599294576",
    "applicationWebsite": "https://jobs.chipotle.com/job/fort-lauderdale/crew-member/282/70599294576",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-12",
    "slug": "dermatology-health-science-specialist-honolulu",
    "title": "Dermatology Health & Science Specialist AA",
    "company": "Pfizer",
    "companySlug": "pfizer",
    "companyLogo": "",
    "category": "Sales & Business Development",
    "department": "US/PR Commercial Sales",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Hawaii",
    "province": "Hawaii",
    "city": "Honolulu",
    "cities": [
      "Honolulu"
    ],
    "country": "United States",
    "salary": "$108,600 - $250,700 per year",
    "experience": "Minimum of 3 years in pharmaceutical, biotech, or medical device sales, marketing, or aligned therapeutic-specific healthcare provider experience",
    "education": "Bachelor's degree (or associate's degree with 8+ years of work experience, or high school diploma with 10+ years of work experience)",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "The Specialty Care - Dermatology Health & Science Specialist is a field-based specialty sales role responsible for driving adoption of dermatology therapies through strategic, compliant engagement with healthcare providers. Pfizer's Dermatology organization exists to improve the lives of people living with serious skin disease by connecting scientific innovation to the clinicians and systems that deliver care.",
    "responsibilities": [
      "Execute territory and account strategies to drive demand and achieve sales objectives within a specialty dermatology market",
      "Build trusted relationships with dermatologists, APPs, and office stakeholders through high-impact in-person and virtual engagements",
      "Deliver clear, compelling clinical and product messaging using approved promotional materials to influence prescribing behavior",
      "Navigate formulary access, reimbursement pathways, and patient support resources to improve appropriate patient access"
    ],
    "requirements": [
      "Bachelor's degree (or associate's degree with 8+ years of work experience, or high school diploma with 10+ years of work experience)",
      "Minimum of 3 years in pharmaceutical, biotech, or medical device sales, marketing, or aligned therapeutic-specific healthcare provider experience",
      "Valid US driver's license and driving record in compliance with company standards",
      "Ability to travel to all accounts/office locations within territory"
    ],
    "preferredQualifications": [],
    "skills": [
      "Specialty sales",
      "Dermatology",
      "Clinical messaging",
      "Reimbursement navigation",
      "Data-driven decision making",
      "Digital engagement"
    ],
    "applicationUrl": "https://www.pfizer.com/about/careers/job/4964899",
    "applicationWebsite": "https://www.pfizer.com/about/careers/job/4964899",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-a-13",
    "slug": "cardiovascular-specialist-columbus",
    "title": "Cardiovascular Specialist, Health and Science Professional",
    "company": "Pfizer",
    "companySlug": "pfizer",
    "companyLogo": "",
    "category": "Sales & Business Development",
    "department": "Cardiology",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Ohio",
    "province": "Ohio",
    "city": "Columbus",
    "cities": [
      "Columbus"
    ],
    "country": "United States",
    "salary": "$76,000 - $199,600 per year",
    "experience": "Minimum 2 years of experience in professional sales, marketing, customer service, account management, relevant healthcare/scientific roles, education, or full-time military experience",
    "education": "Bachelor's Degree (or associate's degree with 6+ years of experience, or high school diploma with 8+ years of relevant experience)",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "The CARD Health & Science Professional (HSP) is responsible for increasing territory sales and relationship development with assigned customers and accounts by engaging in product promotion and determining the best strategies to manage their business. Pfizer has a deep heritage and leadership in cardiovascular disease, and we are committed to providing breakthroughs that change patients' lives.",
    "responsibilities": [
      "Drive sales in assigned territory",
      "Engage with customers both face to face and virtually",
      "Develop and implement effective business and territory call plans",
      "Build rapport and relationships with customers in both live and virtual environments"
    ],
    "requirements": [
      "Bachelor's Degree (or associate's degree with 6+ years of experience, or high school diploma with 8+ years of relevant experience)",
      "Minimum 2 years of experience in professional sales, marketing, customer service, account management, relevant healthcare/scientific roles, education, or full-time military experience",
      "Must live within 25 miles of the border of the territory",
      "Valid US driver's license and driving record in compliance with company standards"
    ],
    "preferredQualifications": [],
    "skills": [
      "Sales",
      "Territory management",
      "Customer engagement",
      "Product knowledge",
      "Communication",
      "Teamwork"
    ],
    "applicationUrl": "https://www.pfizer.com/about/careers/job/4966197",
    "applicationWebsite": "https://www.pfizer.com/about/careers/job/4966197",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-01",
    "slug": "registered-nurse-oncology-chemotherapy-rochester",
    "title": "Registered Nurse - Oncology Chemotherapy Treatment Unit",
    "company": "Mayo Clinic",
    "companySlug": "mayo-clinic",
    "companyLogo": "",
    "category": "Healthcare & Medical",
    "department": "Nursing",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Minnesota",
    "province": "Minnesota",
    "city": "Rochester",
    "cities": [
      "Rochester"
    ],
    "country": "United States",
    "salary": "$35.84 - $58.84 per hour",
    "experience": "One year of RN experience required",
    "education": "Graduate of an ACEN, CCNE, or NLN CNEA-accredited nursing program; baccalaureate degree in nursing within five years for entry-level associate degree RNs",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "As a Chemotherapy Infusion RN in Mayo Clinic's 53-chair outpatient oncology treatment unit (Gonda 10E) in Rochester, you will administer chemotherapy, immunotherapy, and advanced cancer therapies while supporting patients through education and emotional care. Mayo Clinic is offering a starting bonus of up to $15,000 for joining the Chemotherapy unit.",
    "responsibilities": [
      "Administer chemotherapy, immunotherapy, and advanced cancer therapies",
      "Support patients through education, therapeutic communication, and emotional care",
      "Coordinate nursing care, including direct patient care, patient/family education and transitions of care",
      "Collaborate with a multidisciplinary team on innovative treatments and research"
    ],
    "requirements": [
      "Graduate of a nursing program accredited by ACEN, CCNE, or NLN CNEA",
      "One year of RN experience required",
      "Current RN license as required by the applicable state",
      "BLS certification valid for 90 days post start date"
    ],
    "preferredQualifications": [],
    "skills": [
      "Chemotherapy administration",
      "Patient education",
      "Electronic medical records",
      "Communication skills",
      "Critical thinking",
      "Teamwork"
    ],
    "applicationUrl": "https://jobs.mayoclinic.org/job/rochester/registered-nurse-oncology-chemotherapy-treatment-unit-up-to-15-000-sign-on-bonus-rn/33647/98583242272",
    "applicationWebsite": "https://jobs.mayoclinic.org/job/rochester/registered-nurse-oncology-chemotherapy-treatment-unit-up-to-15-000-sign-on-bonus-rn/33647/98583242272",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-03",
    "slug": "seasonal-package-delivery-driver-dekalb",
    "title": "Seasonal Package Delivery Driver",
    "company": "UPS",
    "companySlug": "ups",
    "companyLogo": "",
    "category": "Transportation & Logistics",
    "department": "Operations",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Illinois",
    "province": "Illinois",
    "city": "DeKalb",
    "cities": [
      "DeKalb"
    ],
    "country": "United States",
    "salary": "$24.84 per hour",
    "experience": "1 - 3 Years",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Join the team behind one of the most recognized logistics companies in the world. As a seasonal package delivery driver, you'll drive one of UPS's iconic brown trucks, delivering packages to homes and businesses while providing reliable and friendly service.",
    "responsibilities": [
      "Drive a UPS package delivery truck on a pre-determined route",
      "Deliver and pick up packages at residential and commercial addresses",
      "Load and unload packages and interact with customers along the route",
      "Work 8 to 10 hour shifts, Monday-Friday or Tuesday-Saturday"
    ],
    "requirements": [
      "Must be at least 21 years old",
      "Valid driver's license issued by your state of residence (no CDL required)",
      "Must pass a Department of Transportation (DOT) physical",
      "Must pass a UPS driving test and be able to lift up to 70 pounds"
    ],
    "preferredQualifications": [],
    "skills": [
      "Safe driving",
      "Customer service",
      "Route navigation",
      "Physical stamina"
    ],
    "applicationUrl": "https://www.jobs-ups.com/us/en/package-delivery-driver",
    "applicationWebsite": "https://www.jobs-ups.com/us/en/package-delivery-driver",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-04",
    "slug": "courier-dot-memphis",
    "title": "Courier/DOT",
    "company": "FedEx",
    "companySlug": "fedex",
    "companyLogo": "",
    "category": "Transportation & Logistics",
    "department": "Driver",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Tennessee",
    "province": "Tennessee",
    "city": "Memphis",
    "cities": [
      "Memphis"
    ],
    "country": "United States",
    "salary": "$22.10 per hour",
    "experience": "1 - 3 Years",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Driver/operator of company vehicles who provides courteous and efficient delivery and pick-up of packages in Memphis, checking shipments for conformance to FedEx features of service and providing related customer service functions.",
    "responsibilities": [
      "Provide courteous and efficient delivery and pick-up of packages",
      "Check shipments for conformance to FedEx features of service",
      "Provide related customer service functions",
      "Operate company vehicles on an assigned route"
    ],
    "requirements": [
      "Must be at least 21 years of age",
      "Must be licensed for the type of vehicle assigned",
      "Ability to lift 50 lbs. and maneuver heavier packages with equipment or assistance"
    ],
    "preferredQualifications": [],
    "skills": [
      "Safe driving",
      "Customer service",
      "Package handling",
      "Time management"
    ],
    "applicationUrl": "https://careers.fedex.com/courier-dot/job/P25-381911-1",
    "applicationWebsite": "https://careers.fedex.com/courier-dot/job/P25-381911-1",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-05",
    "slug": "manager-project-management-chicago",
    "title": "Manager, Project Management",
    "company": "McDonald's",
    "companySlug": "mcdonalds",
    "companyLogo": "",
    "category": "Executive & Management",
    "department": "U.S. National Operations",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Illinois",
    "province": "Illinois",
    "city": "Chicago",
    "cities": [
      "Chicago"
    ],
    "country": "United States",
    "salary": "$115,872 - $144,840 per year",
    "experience": "Previous Project Management experience required",
    "education": "Bachelor's degree in Business, Operations, Communications, Project Management, or a related field",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "The Manager, Project Management sits on the Business Integration team within U.S. National Operations, guiding complex, restaurant-impacting initiatives from intake and concept through testing, approval, readiness, deployment, and stabilization across the U.S. system.",
    "responsibilities": [
      "Guide complex, restaurant-impacting work end-to-end from intake through deployment and stabilization",
      "Lead governance pathways and ensure decisions are supported by evidence and stakeholder alignment",
      "Build and maintain integrated plans covering milestones, dependencies, resources, approvals, testing, training, and communications",
      "Evaluate sequencing, cumulative impact, execution risk, and calendar congestion to simplify solutions"
    ],
    "requirements": [
      "Previous Project Management experience required",
      "Bachelor's degree in Business, Operations, Communications, Project Management, or a related field",
      "Proven experience leading complex, multi-workstream initiatives across the full lifecycle",
      "Experience designing, operating, or navigating stage-gate, portfolio, or executive decision processes"
    ],
    "preferredQualifications": [],
    "skills": [
      "Project management",
      "Governance",
      "Stakeholder management",
      "Microsoft 365",
      "Smartsheet",
      "Business acumen",
      "Executive communication"
    ],
    "applicationUrl": "https://careers.mcdonalds.com/manager-project-management/job/BE98051FAC4A48125166C2D96DD206B2",
    "applicationWebsite": "https://careers.mcdonalds.com/manager-project-management/job/BE98051FAC4A48125166C2D96DD206B2",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-06",
    "slug": "registered-private-wealth-client-associate-charlotte",
    "title": "Registered Private Wealth Client Associate",
    "company": "Bank of America",
    "companySlug": "bank-of-america",
    "companyLogo": "",
    "category": "Finance & Accounting",
    "department": "Merrill Wealth Management",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "North Carolina",
    "province": "North Carolina",
    "city": "Charlotte",
    "cities": [
      "Charlotte"
    ],
    "country": "United States",
    "salary": "Competitive Package",
    "experience": "1 - 3 Years",
    "education": "High School Diploma / GED / Secondary School or equivalent (minimum); Bachelor's degree desired",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "This job provides client service support to potentially multiple Financial Advisors on the McDade Group, a Private Wealth Management team based in Charlotte, serving as the most frequent point of contact within Merrill to address all service needs of their clients.",
    "responsibilities": [
      "Provide excellent client service by educating clients on all of the bank's service and banking offerings",
      "Ensure timeliness, accuracy, and completeness in client materials and follow up on all client and Financial Advisor requests",
      "Identify, deepen, and maintain client relationships while promoting incorporation of banking into day-to-day practices",
      "Support day-to-day team activities, including covering roles in times of absence or seasonal need increases"
    ],
    "requirements": [
      "Currently holds FINRA Securities Industry Essentials (SIE), Series 7, and Series 66 (63 and 65 accepted in lieu of 66)",
      "Possesses advanced industry knowledge and an understanding of investment products",
      "Minimum education: High School Diploma / GED or equivalent",
      "Strong computer application skills, including Microsoft Word, Excel, PowerPoint, and Salesforce"
    ],
    "preferredQualifications": [],
    "skills": [
      "Account Management",
      "Client Management",
      "Customer and Client Focus",
      "Issue Management",
      "Oral Communications",
      "Business Development",
      "Pipeline Management",
      "Written Communications"
    ],
    "applicationUrl": "https://careers.bankofamerica.com/en-us/job-detail/26040414/private-wealth-client-associate-charlotte-north-carolina-united-states",
    "applicationWebsite": "https://careers.bankofamerica.com/en-us/job-detail/26040414/private-wealth-client-associate-charlotte-north-carolina-united-states",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-07",
    "slug": "claims-adjuster-senior-litigation-houston",
    "title": "Claims Adjuster Senior - Litigation",
    "company": "Progressive",
    "companySlug": "progressive",
    "companyLogo": "",
    "category": "Finance & Accounting",
    "department": "Claims",
    "type": "Full-time",
    "workplaceType": "Hybrid",
    "state": "Texas",
    "province": "Texas",
    "city": "Houston",
    "cities": [
      "Houston"
    ],
    "country": "United States",
    "salary": "$77,000 - $93,500 per year",
    "experience": "Five years of relevant work experience with two years in claims handling, OR two years in claims handling and a bachelor's degree, OR four years of relevant work experience with two years in claims handling and an associate degree",
    "education": "Bachelor's degree (in lieu of additional experience) or associate degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "As a senior claims specialist on Progressive's team, you will play a critical role in resolving complex and high-risk injury claims that may be attorney represented or have additional litigation features, consulting with police officers, medical professionals, claimants and others involved in the accident.",
    "responsibilities": [
      "Investigate complex and high-risk injury claims, including attorney-represented and litigated cases",
      "Consult with police officers, medical professionals, claimants and others involved in the accident",
      "Manage complex commercial claim investigations, interpret coverage, and investigate liability",
      "Resolve injury claims efficiently while working a Monday-Friday, 8:00AM-5:00PM schedule"
    ],
    "requirements": [
      "Five years of relevant work experience with two years in claims handling, OR two years in claims handling and a bachelor's degree",
      "Attorney-represented and litigated bodily injury claim experience",
      "Must be authorized to work for any employer in the U.S. without current or future sponsorship"
    ],
    "preferredQualifications": [],
    "skills": [
      "Claims handling",
      "Litigation",
      "Investigation",
      "Liability analysis",
      "Negotiation",
      "Communication"
    ],
    "applicationUrl": "https://careers.progressive.com/jobs/18305730-claims-adjuster-senior-litigation",
    "applicationWebsite": "https://careers.progressive.com/jobs/18305730-claims-adjuster-senior-litigation",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-08",
    "slug": "manufacturing-engineer-cnc-programmer-east-peoria",
    "title": "Manufacturing Engineer - CNC Programmer",
    "company": "Caterpillar",
    "companySlug": "caterpillar",
    "companyLogo": "",
    "category": "Executive & Management",
    "department": "Manufacturing",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Illinois",
    "province": "Illinois",
    "city": "East Peoria",
    "cities": [
      "East Peoria"
    ],
    "country": "United States",
    "salary": "$97,530 - $146,290 per year",
    "experience": "1 - 3 Years",
    "education": "A degree or equivalent practical experience is desired",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "As a Manufacturing Engineer - CNC Programmer in East Peoria, Illinois, you will provide technical expertise that improves the safety, quality, cost, reliability, and efficiency of complex manufacturing operations, combining hands-on manufacturing support with lean manufacturing, process improvement, and project execution.",
    "responsibilities": [
      "Develop, optimize, and sustain safe, efficient manufacturing and tooling processes for machining complex components",
      "Create, validate, and maintain CNC programs for multi-axis machining and turning centers",
      "Design, engineer, and specify tooling, workholding, fixtures, jigs, and machine setup requirements",
      "Lead root cause analysis, troubleshooting, and continuous improvement initiatives"
    ],
    "requirements": [
      "A degree or equivalent practical experience is desired",
      "Working knowledge of manufacturing engineering methods, equipment, specifications, standards, and practices",
      "Ability to create, evaluate, and optimize manufacturing processes and CNC programs",
      "Working knowledge of lean principles, waste reduction, and lean assessment tools"
    ],
    "preferredQualifications": [],
    "skills": [
      "Manufacturing engineering",
      "CNC programming",
      "Lean manufacturing",
      "Problem-solving",
      "Project management",
      "Creo",
      "NX NC programming"
    ],
    "applicationUrl": "https://careers.caterpillar.com/en/jobs/r0000403354/manufacturing-engineer-cnc-programmer/",
    "applicationWebsite": "https://careers.caterpillar.com/en/jobs/r0000403354/manufacturing-engineer-cnc-programmer/",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-09",
    "slug": "operating-room-nurse-nashville",
    "title": "Operating Room Nurse",
    "company": "HCA Healthcare",
    "companySlug": "hca-healthcare",
    "companyLogo": "",
    "category": "Healthcare & Medical",
    "department": "Nursing",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Tennessee",
    "province": "Tennessee",
    "city": "Nashville",
    "cities": [
      "Nashville"
    ],
    "country": "United States",
    "salary": "Competitive Package",
    "experience": "OR Circulating experience REQUIRED",
    "education": "Associate Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Join TriStar Skyline Medical Center in Nashville as an Operating Room Nurse, evaluating patients prior to surgery, providing patient and family education around the procedure, and delivering high-quality, patient-centered peri-operative care at Tennessee's first comprehensive stroke center.",
    "responsibilities": [
      "Evaluate patients prior to surgery and assume responsibility for patient preparation, including IV therapy, preoperative medications, and surgical site verification",
      "Provide patient and family education surrounding the procedure and peri-operative process",
      "Participate in surgical site verification, including briefing, time out, debriefing, and universal protocols",
      "Recognize and respond to patient emergencies and assess patient condition throughout the shift"
    ],
    "requirements": [
      "Associate Degree",
      "OR Circulating experience REQUIRED",
      "Basic Cardiac Life Support, CPR, APRN, or RN certification must be obtained within 30 days of employment start date"
    ],
    "preferredQualifications": [],
    "skills": [
      "Peri-operative care",
      "Patient education",
      "Surgical site verification",
      "Emergency response",
      "Critical thinking",
      "Teamwork"
    ],
    "applicationUrl": "https://careers.hcahealthcare.com/jobs/18083192-operating-room-nurse",
    "applicationWebsite": "https://careers.hcahealthcare.com/jobs/18083192-operating-room-nurse",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-10",
    "slug": "front-office-associate-phoenix",
    "title": "Front Office Associate",
    "company": "Hyatt",
    "companySlug": "hyatt",
    "companyLogo": "",
    "category": "Hospitality & Tourism",
    "department": "Front Office",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "Arizona",
    "province": "Arizona",
    "city": "Phoenix",
    "cities": [
      "Phoenix"
    ],
    "country": "United States",
    "salary": "$20.00 per hour",
    "experience": "1 - 3 Years",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Front Office associates are responsible for the guest registration process and communication of hotel services and promotions. You'll be the face of Hyatt as a Front Office Associate, with a direct impact on creating the guest experience.",
    "responsibilities": [
      "Handle the guest registration process and communicate hotel services and promotions",
      "Process forms of payment and respond to guest inquiries",
      "Assist with luggage and occasionally cars",
      "Create a positive guest experience through casual conversation and attentive service"
    ],
    "requirements": [
      "Interest in hotel clerk jobs or prior experience as a front desk clerk welcomed",
      "Ability to provide efficient service and meaningful guest experiences"
    ],
    "preferredQualifications": [],
    "skills": [
      "Customer service",
      "Guest registration",
      "Payment processing",
      "Communication"
    ],
    "applicationUrl": "https://careers.hyatt.com/en-US/careers/jobdetails/10780/PHO004646",
    "applicationWebsite": "https://careers.hyatt.com/en-US/careers/jobdetails/10780/PHO004646",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  },
  {
    "id": "job-seed-b-11",
    "slug": "general-manager-charleston",
    "title": "General Manager",
    "company": "Chipotle",
    "companySlug": "chipotle",
    "companyLogo": "",
    "category": "Hospitality & Tourism",
    "department": "Restaurant Operations",
    "type": "Full-time",
    "workplaceType": "On-site",
    "state": "South Carolina",
    "province": "South Carolina",
    "city": "Charleston",
    "cities": [
      "Charleston"
    ],
    "country": "United States",
    "salary": "$55,000 - $77,500 per year",
    "experience": "Previous restaurant management experience required, including scheduling, P&L management, food safety, sales forecasting, and recruiting",
    "education": "Bachelor Degree",
    "vacancies": 1,
    "genderPreference": "Any",
    "ageRequirement": "N/A",
    "deadline": "Open until filled",
    "joiningDate": "Immediate",
    "description": "Chipotle is growing fast and needs leaders to grow with it. General Managers lead from the front: hiring and developing great people, building a winning culture, and running a strong business at the Charleston restaurant.",
    "responsibilities": [
      "Be responsible for the full employee lifecycle, including recruitment and hiring, people processes and performance management",
      "Be accountable for the day-to-day operational business of the restaurant, including scheduling, P&L control, and sales forecasting",
      "Be accountable for overall financial success of the restaurant, achieving annual sales and cash flow plan",
      "Uphold food safety, operational, and compliance standards and ensure the dining room remains clean and guest-ready"
    ],
    "requirements": [
      "Previous restaurant management experience required, including scheduling, P&L management, food safety, sales forecasting, and recruiting",
      "Ability to stand and walk around the restaurant for 10 hours a day and lift 50 lbs.",
      "Work a schedule that includes lunch, dinner, and weekend shifts"
    ],
    "preferredQualifications": [],
    "skills": [
      "Restaurant management",
      "P&L management",
      "Recruiting",
      "Food safety",
      "Sales forecasting",
      "Team leadership"
    ],
    "applicationUrl": "https://jobs.chipotle.com/job/amsterdam/general-manager/282/102862085856",
    "applicationWebsite": "https://jobs.chipotle.com/job/amsterdam/general-manager/282/102862085856",
    "applicationMethod": "website",
    "status": "approved",
    "verified": true,
    "isFeatured": false
  }
]

export const MOCK_PROFESSIONALS: ProfessionalItem[] = []
export const MOCK_VERIFICATION_REQUESTS: ProfessionalVerificationRequest[] = []

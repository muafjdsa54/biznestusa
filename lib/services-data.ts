import { BUSINESS_CATEGORIES } from '@/lib/data'

export interface ServiceFaq {
  question: string
  answer: string
}

export interface ServiceDefinition {
  slug: string
  title: string
  singularTitle: string
  parentCategoryId: string
  parentCategoryName: string
  metaTitle: string
  metaDescription: string
  h1: string
  badge: string
  heroDescription: string
  typicalCost: string
  licensingRequirements: string
  searchKeywords: string[]
  commonServices: string[]
  faqs: ServiceFaq[]
  relatedSlugs: string[]
}

export const POPULAR_SERVICES: ServiceDefinition[] = [
  // -------------------------------------------------------------
  // HOME SERVICES SUB-CATEGORIES
  // -------------------------------------------------------------
  {
    slug: 'plumbers',
    title: 'Plumbers',
    singularTitle: 'Plumber',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Plumbers in USA | Licensed Local Plumbing Contractors | BizNestUSA',
    metaDescription: 'Find verified and licensed professional plumbers across the United States. Compare customer ratings, emergency leak repairs, residential plumbing services, and free estimates on BizNestUSA.',
    h1: 'Verified Professional Plumbers in the United States',
    badge: 'State-Licensed & Insured Plumbing Specialists',
    heroDescription: 'Connect with licensed, bonded, and insured master plumbers across all 50 states. From 24/7 emergency water pipe repair and drain clearing to full tankless water heater installation and commercial plumbing.',
    typicalCost: '$85 - $175 per hour (Average repair: $175 - $450)',
    licensingRequirements: 'State or municipal Master Plumber license, proof of general liability insurance, and plumbing contractor surety bond.',
    searchKeywords: ['plumber', 'plumbing', 'pipe', 'leak', 'drain', 'water heater', 'sewer'],
    commonServices: [
      '24/7 Emergency Leak Repairs',
      'Drain Cleaning & Hydro-Jetting',
      'Tankless & Standard Water Heater Installation',
      'Sewer Line Inspection & Trenchless Replacement',
      'Bathroom & Kitchen Fixture Replacements',
      'Gas Line Inspection & Piping'
    ],
    faqs: [
      {
        question: 'How much do professional plumbers charge per hour in the USA?',
        answer: 'In the United States, licensed plumbers typically charge between $85 and $175 per hour, depending on the state and whether it is during normal business hours or an emergency call. Many standard repairs, like unclogging a drain or replacing a toilet valve, are offered at flat project rates ranging from $150 to $450.'
      },
      {
        question: 'How do I verify if a plumber is licensed in my state?',
        answer: 'You can verify a plumber’s credentials through your state’s contractor licensing board (for example, the Texas State Board of Plumbing Examiners or California CSLB). On BizNestUSA, verified listings have completed credential verification checks including state registration and business documentation.'
      },
      {
        question: 'What is the difference between a Journeyman and Master Plumber?',
        answer: 'A Journeyman plumber has completed a 4- to 5-year apprenticeship and can perform plumbing installations independently. A Master Plumber has additional years of field experience, passed rigorous state licensing exams, can pull commercial building permits, and owns or supervises a plumbing business.'
      },
      {
        question: 'What should I do during an active plumbing leak emergency?',
        answer: 'First, locate and immediately shut off the main water valve to your home or commercial building. Next, shut off power to your water heater to prevent element damage. Then, call a verified emergency plumbing contractor listed on BizNestUSA for immediate dispatch.'
      }
    ],
    relatedSlugs: ['roofers', 'electricians', 'hvac-contractors', 'general-contractors', 'handyman-services']
  },
  {
    slug: 'roofers',
    title: 'Roofers',
    singularTitle: 'Roofer',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Roofers in USA | Licensed Roofing Contractors & Repair | BizNestUSA',
    metaDescription: 'Explore top-rated professional roofing contractors in the USA. Certified commercial and residential roof replacement, storm damage inspection, asphalt shingle, and metal roofing on BizNestUSA.',
    h1: 'Licensed Roofing Contractors in the United States',
    badge: 'Certified Commercial & Residential Roofing Specialists',
    heroDescription: 'Locate certified residential and commercial roofing contractors. Services include storm and hail damage restoration, complete roof replacement, architectural shingles, metal roofs, and flat roof waterproofing.',
    typicalCost: '$5,500 - $14,000 for standard residential roof replacement ($350 - $900 per square)',
    licensingRequirements: 'State Roofing Contractor License, OSHA safety compliance certification, and commercial general liability insurance.',
    searchKeywords: ['roofer', 'roofing', 'shingles', 'roof replacement', 'storm damage', 'gutter'],
    commonServices: [
      'Complete Architectural Shingle Replacement',
      'Commercial Flat Roof Waterproofing & TPO',
      'Hail & Storm Damage Insurance Inspections',
      'Emergency Roof Tarping & Leak Repair',
      'Metal Roofing & Tile Roof Restorations',
      'Seamless Gutter & Downspout Installation'
    ],
    faqs: [
      {
        question: 'How long does a typical residential roof last in the USA?',
        answer: 'Standard architectural asphalt shingles generally last 25 to 30 years. Metal roofs last 40 to 70 years, while slate and tile roofs can exceed 50 to 100 years with regular maintenance and proper attic ventilation.'
      },
      {
        question: 'Does homeowner insurance cover roof replacements?',
        answer: 'Homeowners insurance usually covers sudden damage caused by severe weather such as hail storms, high winds, or falling tree limbs. General wear and tear or neglect are typically not covered. Most verified roofing contractors on BizNestUSA provide free insurance claim damage reports.'
      },
      {
        question: 'How do I know if my roof needs repair or complete replacement?',
        answer: 'Signs that indicate a replacement is needed include widespread curling or missing shingles, excessive granules in your gutters, visible daylight in your attic, persistent leaks across multiple areas, and a roof that is over 20 years old.'
      }
    ],
    relatedSlugs: ['plumbers', 'general-contractors', 'landscapers', 'hvac-contractors']
  },
  {
    slug: 'electricians',
    title: 'Electricians',
    singularTitle: 'Electrician',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Licensed Electricians Near Me | USA Electrical Contractors Directory | BizNestUSA',
    metaDescription: 'Find certified master electricians near you across all 50 US states. Compare 24/7 emergency wiring, panel upgrades, EV chargers, and verified customer reviews. Electrical business owners: list your company in our national directory.',
    h1: 'Verified Licensed Electricians & Electrical Contractors in the USA',
    badge: 'State-Licensed & NEC Compliant Electrical Contractors',
    heroDescription: 'Connect with verified master electricians and licensed electrical contractors across the United States. Find emergency 24/7 service near you, from residential 200-amp breaker panel replacements and Level 2 EV chargers to full whole-home rewiring and commercial installations.',
    typicalCost: '$75 - $150 per hour (Average repair: $160 - $450 | Panel upgrade: $1,800 - $3,500)',
    licensingRequirements: 'State Master/Journeyman Electrician License, National Electrical Code (NEC) compliance, $1M+ general liability, and surety bonding.',
    searchKeywords: ['electrician', 'electricians near me', 'emergency electrician', 'electrical contractor', 'electrical repair', 'panel upgrade', 'breaker', 'ev charger', 'wiring', 'electrician directory'],
    commonServices: [
      '24/7 Emergency Outage & Circuit Repair',
      '200-Amp Electrical Panel Upgrades & Replacements',
      'Level 2 Residential EV Charger Station Installation',
      'Whole-Home Rewiring & Aluminum/Knob-and-Tube Replacement',
      'Whole-House Surge Protection & Standby Generator Hookups',
      'Recessed LED Lighting, Dimmers & Smart Home Switches',
      'Commercial Electrical Code Compliance & Safety Inspections'
    ],
    faqs: [
      {
        question: 'How do I find licensed and verified electricians near me in the USA?',
        answer: 'BizNestUSA connects you with state-licensed and background-checked electrical contractors near your location. You can filter by city or state, view verified state licensing credentials, check active insurance, read authentic customer ratings, and call local contractors directly with no middleman fees.'
      },
      {
        question: 'How can electrical business owners list their company in the BizNestUSA directory?',
        answer: 'Electrical contractors and company owners can click "List Your Business" on BizNestUSA to publish their company profile. A verified listing showcases your service areas, master electrician license, phone number, operating hours, and customer reviews to homeowners and commercial clients actively searching for electricians.'
      },
      {
        question: 'What is the average hourly rate for a licensed electrician in the United States?',
        answer: 'In the US, licensed journeymen and master electricians typically charge between $75 and $150 per hour. For after-hours emergency calls, weekend dispatch, or storm damage, emergency rates can range from $150 to $225 per hour plus an initial trip fee.'
      },
      {
        question: 'When should I upgrade my home electrical panel?',
        answer: 'You should consider upgrading your electrical panel if your home has an older 60- or 100-amp service, if your breakers constantly trip, if you are adding high-draw appliances like an EV charger or central heat pump, or if your panel uses outdated and recalled brands like Federal Pacific or Zinsco.'
      },
      {
        question: 'Why should I always hire a licensed electrician instead of DIY?',
        answer: 'DIY or unlicensed electrical work poses severe fire and shock hazards, violates local municipal building codes, and can cause homeowners insurance claims to be denied. Licensed master electricians adhere to the National Electrical Code and guarantee permitted, safe installations.'
      }
    ],
    relatedSlugs: ['hvac-contractors', 'plumbers', 'general-contractors', 'handyman-services']
  },
  {
    slug: 'hvac-contractors',
    title: 'HVAC Contractors',
    singularTitle: 'HVAC Technician',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'HVAC Contractors in USA | Heating, Cooling & AC Repair | BizNestUSA',
    metaDescription: 'Discover verified HVAC contractors in the USA for central air conditioning repair, high-efficiency heat pump installation, furnace maintenance, and duct cleaning on BizNestUSA.',
    h1: 'Verified Heating & Air Conditioning Contractors in the USA',
    badge: 'EPA Certified Heating & Cooling Specialists',
    heroDescription: 'Stay comfortable year-round with licensed heating, ventilation, and air conditioning professionals. Specialists in central AC, ductless mini-splits, heat pumps, furnaces, and indoor air purification.',
    typicalCost: '$75 - $150 per hour (New central AC or heat pump: $4,500 - $11,000)',
    licensingRequirements: 'EPA Section 608 Universal Certification, State Mechanical / HVAC Contractor License, and bonded insurance.',
    searchKeywords: ['hvac', 'ac repair', 'air conditioning', 'heating', 'heat pump', 'furnace', 'duct'],
    commonServices: [
      'Central Air Conditioning Repair & Recharge',
      'High-Efficiency Heat Pump Installations',
      'Furnace & Boiler Safety Tune-Ups',
      'Ductless Mini-Split Zoning Systems',
      'Ductwork Sealing & Sanitization',
      'Whole-Home Dehumidifiers & UV Air Filters'
    ],
    faqs: [
      {
        question: 'How often should my HVAC system be serviced in the USA?',
        answer: 'HVAC systems should be professionally serviced twice a year: once in spring for your cooling system and once in autumn for your heating system. Routine maintenance prolongs equipment lifespan and lowers utility bills.'
      },
      {
        question: 'What SEER rating should I choose for a new air conditioner?',
        answer: 'Under current US Department of Energy standards, new air conditioners must meet a minimum SEER2 rating (typically 13.4 to 15.2 depending on region). High-efficiency units range from 16 to 24+ SEER2 and qualify for federal Inflation Reduction Act tax credits.'
      }
    ],
    relatedSlugs: ['electricians', 'plumbers', 'general-contractors', 'appliance-repair']
  },
  {
    slug: 'general-contractors',
    title: 'General Contractors',
    singularTitle: 'General Contractor',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'General Contractors in USA | Building & Remodeling Services | BizNestUSA',
    metaDescription: 'Find licensed general contractors in the USA for custom home builds, kitchen and bathroom remodeling, commercial buildouts, and structural renovations on BizNestUSA.',
    h1: 'Licensed General Contractors & Home Builders in the USA',
    badge: 'Bonded Building & Remodeling Contractors',
    heroDescription: 'Comprehensive project management for new construction, major residential additions, full kitchen renovations, and commercial tenant buildouts across all 50 states.',
    typicalCost: '10% - 20% of total project cost (Cost-plus or fixed-bid contracts)',
    licensingRequirements: 'State General Contractor Board License, Builders Risk Insurance, and surety bonding.',
    searchKeywords: ['general contractor', 'contractor', 'builder', 'remodeling', 'renovation', 'kitchen remodel'],
    commonServices: [
      'Whole-Home Design & Build Construction',
      'Kitchen & Master Bathroom Remodeling',
      'Room Additions & Second-Story Expansions',
      'Commercial Tenant Improvement Build-Outs',
      'Structural Load-Bearing Wall Removals',
      'Permit Management & Architectural Blueprints'
    ],
    faqs: [
      {
        question: 'What does a general contractor do?',
        answer: 'A general contractor oversees construction projects from conception to completion. They manage subcontractors (plumbers, electricians, framers), procure materials, pull municipal permits, and ensure building code compliance.'
      }
    ],
    relatedSlugs: ['roofers', 'electricians', 'plumbers', 'flooring-contractors', 'painting-contractors']
  },
  {
    slug: 'handyman-services',
    title: 'Handyman Services',
    singularTitle: 'Handyman',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Handyman Services in USA | Local Home Repair | BizNestUSA',
    metaDescription: 'Browse reliable local handyman services across the United States. Drywall repair, door and lock installations, furniture assembly, fixture hanging, and small repairs.',
    h1: 'Verified Local Handyman Services in the USA',
    badge: 'Trusted Residential & Small Commercial Handyman Pros',
    heroDescription: 'Fast, skilled assistance for everyday property maintenance, drywall patching, minor carpentry, fixture mounting, door repairs, and seasonal home upkeep.',
    typicalCost: '$50 - $100 per hour (Typical service call: $120 - $300)',
    licensingRequirements: 'State Handyman / Minor Repair License where required, and liability insurance.',
    searchKeywords: ['handyman', 'home repair', 'drywall', 'furniture assembly', 'carpentry', 'maintenance'],
    commonServices: [
      'Drywall Patching & Texture Matching',
      'Interior Door & Trim Repair',
      'TV Mounting & Ceiling Fan Installation',
      'Caulking, Grouting & Minor Tile Repairs',
      'Deck Power Washing & Staining'
    ],
    faqs: [
      {
        question: 'When should I hire a handyman vs a specialized contractor?',
        answer: 'A handyman is ideal for minor repairs, painting touch-ups, door adjustments, and fixture installations that do not require building permits. For major electrical rewiring, main sewer line work, or structural roof replacements, a specialized licensed contractor is recommended.'
      }
    ],
    relatedSlugs: ['plumbers', 'electricians', 'painting-contractors', 'appliance-repair']
  },
  {
    slug: 'landscapers',
    title: 'Landscapers',
    singularTitle: 'Landscaper',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Landscapers in USA | Lawn Care & Hardscaping | BizNestUSA',
    metaDescription: 'Connect with expert landscapers in the USA for lawn care, sprinkler repair, hardscaping, paver patios, tree care, and outdoor design on BizNestUSA.',
    h1: 'Professional Landscaping & Lawn Care Services in the USA',
    badge: 'Landscape Architects & Turf Care Experts',
    heroDescription: 'Enhance your outdoor living spaces with licensed landscaping and hardscaping contractors. Services include paver patios, automatic irrigation, sod installation, and seasonal turf care.',
    typicalCost: '$45 - $80 per maintenance visit ($3,500 - $15,000 for hardscape projects)',
    licensingRequirements: 'State Landscape Contractor License (for projects exceeding statutory thresholds) and pesticide applicator license.',
    searchKeywords: ['landscaper', 'landscaping', 'lawn care', 'lawn mowing', 'hardscaping', 'sprinkler', 'irrigation'],
    commonServices: [
      'Custom Paver Patios & Retaining Walls',
      'Automatic Sprinkler Installation & Winterization',
      'Sod Installation & Hydroseeding',
      'Tree Trimming & Arborist Care',
      'Outdoor Kitchens & Landscape Lighting'
    ],
    faqs: [
      {
        question: 'What is the best season to install new sod in the US?',
        answer: 'For cool-season grasses (Kentucky Bluegrass, Fescue), early autumn is optimal. For warm-season grasses (Bermuda, St. Augustine, Zoysia), late spring to early summer provides the best root establishment temperatures.'
      }
    ],
    relatedSlugs: ['general-contractors', 'handyman-services', 'pest-control']
  },
  {
    slug: 'pest-control',
    title: 'Pest Control',
    singularTitle: 'Exterminator',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Pest Control Services in USA | Exterminators & Wildlife Removal | BizNestUSA',
    metaDescription: 'Find licensed pest control exterminators in the USA. Termite treatment, bed bug eradication, rodent exclusion, and eco-friendly quarterly pest defense on BizNestUSA.',
    h1: 'Certified Pest Control & Exterminators in the USA',
    badge: 'EPA Certified Structural Pest Control Technicians',
    heroDescription: 'Eliminate unwanted pests and protect your property with certified exterminators. Treatments for termites, bed bugs, ants, rodents, mosquitoes, and humane wildlife relocation.',
    typicalCost: '$150 - $350 initial inspection ($40 - $75/mo ongoing pest defense)',
    licensingRequirements: 'State Department of Agriculture Structural Pest Control Operator License.',
    searchKeywords: ['pest control', 'exterminator', 'termite', 'bed bug', 'rodent', 'mice', 'ant'],
    commonServices: [
      'Termite Liquid Barrier & Bait Stations',
      'Thermal Heat Bed Bug Eradication',
      'Rodent Proofing & Attic Sanitation',
      'Mosquito Reduction Misting Systems',
      'Commercial Food Facility Pest Defense'
    ],
    faqs: [
      {
        question: 'Are modern pest control chemicals safe for children and pets?',
        answer: 'Reputable pest control companies use EPA-registered products and integrated pest management (IPM) practices designed to target specific pests while remaining safe for families and pets once dried.'
      }
    ],
    relatedSlugs: ['landscapers', 'cleaning-services', 'home-services']
  },
  {
    slug: 'cleaning-services',
    title: 'Cleaning Services',
    singularTitle: 'Cleaner',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Cleaning Services in USA | Residential & Commercial Maid Services | BizNestUSA',
    metaDescription: 'Discover vetted cleaning services in the United States. Deep house cleaning, move-in/move-out maid service, office janitorial cleaning, and carpet sanitization.',
    h1: 'Top-Rated Cleaning & Maid Services in the USA',
    badge: 'Bonded & Insured Residential & Commercial Cleaners',
    heroDescription: 'Keep your home or commercial workspace spotless. Reliable maid teams, deep sanitization, move-out turnovers, post-construction cleans, and commercial janitorial services.',
    typicalCost: '$120 - $280 per residential clean ($0.10 - $0.25 per sq ft for commercial)',
    licensingRequirements: 'Local business registration, bonding, and general liability insurance.',
    searchKeywords: ['cleaning', 'maid service', 'house cleaning', 'deep clean', 'janitorial', 'carpet cleaning'],
    commonServices: [
      'Recurring Weekly & Bi-Weekly Maid Visits',
      'Move-In / Move-Out Deep Cleans',
      'Post-Construction Dust & Debris Clean-Up',
      'Commercial Office Janitorial Services',
      'Carpet Steam Cleaning & Upholstery Care'
    ],
    faqs: [
      {
        question: 'What is included in a deep house cleaning?',
        answer: 'A deep clean includes detailed scrubbing of baseboards, inside the oven and refrigerator, behind heavy appliances, bathroom tile grout descaling, window tracks, and door frame sanitization.'
      }
    ],
    relatedSlugs: ['handyman-services', 'pest-control', 'moving-companies']
  },
  {
    slug: 'moving-companies',
    title: 'Moving Companies',
    singularTitle: 'Mover',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Moving Companies in USA | Local & Long Distance Movers | BizNestUSA',
    metaDescription: 'Compare verified moving companies in the USA. Professional packing, interstate long-distance relocations, residential moving, and secure storage solutions.',
    h1: 'Licensed Moving Companies & Relocation Pros in the USA',
    badge: 'FMCSA & DOT Registered Interstate Movers',
    heroDescription: 'Stress-free residential and corporate relocations across town or across the country. Fully equipped moving crews with dedicated trucks, packing supplies, and transit insurance.',
    typicalCost: '$400 - $1,500 local move ($2,500 - $7,000+ long distance)',
    licensingRequirements: 'US DOT and FMCSA (Federal Motor Carrier Safety Administration) licensing for interstate moves, and state PUC authority for local moves.',
    searchKeywords: ['moving', 'movers', 'relocation', 'long distance moving', 'packing', 'storage'],
    commonServices: [
      'Local Residential Apartment & Home Moves',
      'Interstate Cross-Country Relocations',
      'Professional Packing & Unpacking Services',
      'Piano, Heavy Safe & Antiques Handling',
      'Climate-Controlled Storage Solutions'
    ],
    faqs: [
      {
        question: 'How can I avoid moving scams in the USA?',
        answer: 'Always verify that an interstate moving company has a valid USDOT number on the FMCSA mover database (fmcsa.dot.gov). Legitimate movers provide binding in-home or virtual estimates and do not demand large cash-only deposits before loading.'
      }
    ],
    relatedSlugs: ['cleaning-services', 'handyman-services', 'storage']
  },
  {
    slug: 'locksmiths',
    title: 'Locksmiths',
    singularTitle: 'Locksmith',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Locksmiths in USA | 24/7 Emergency Lock & Key Services | BizNestUSA',
    metaDescription: 'Connect with verified locksmiths across the USA for 24/7 emergency lockouts, smart lock installation, commercial rekeying, and automotive key programming on BizNestUSA.',
    h1: 'Certified Emergency Locksmiths in the United States',
    badge: 'ALOA Certified Security & Locksmith Technicians',
    heroDescription: 'Fast, reliable lockout assistance and physical security upgrades. Residential rekeying, high-security deadbolts, smart biometric locks, master key systems, and automotive transponder programming.',
    typicalCost: '$75 - $200 per service call (Smart lock installation: $150 - $300)',
    licensingRequirements: 'State Locksmith License (where required) and background-checked technicians.',
    searchKeywords: ['locksmith', 'lockout', 'rekey', 'deadbolt', 'key replacement', 'smart lock'],
    commonServices: [
      '24/7 Emergency Residential & Car Lockout Assistance',
      'Whole-Home Lock Rekeying & Cylinder Changes',
      'Commercial High-Security Master Key Systems',
      'Smart Door Lock & Keyless Entry Installation',
      'Broken Key Extraction & Automotive Transponders'
    ],
    faqs: [
      {
        question: 'Is it cheaper to rekey locks or replace them entirely?',
        answer: 'Rekeying existing locks is typically 50% to 70% cheaper than replacing the entire lock hardware, provided your existing lock mechanisms are in good mechanical condition.'
      }
    ],
    relatedSlugs: ['electricians', 'handyman-services', 'home-services']
  },
  {
    slug: 'flooring-contractors',
    title: 'Flooring Contractors',
    singularTitle: 'Flooring Specialist',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Flooring Contractors in USA | Hardwood, Tile & Vinyl | BizNestUSA',
    metaDescription: 'Find verified flooring contractors across the USA. Hardwood refinishing, luxury vinyl plank (LVP), custom tile, and commercial carpet installations on BizNestUSA.',
    h1: 'Top Flooring Installation & Refinishing Specialists in the USA',
    badge: 'NWFA Certified Hardwood & Tile Specialists',
    heroDescription: 'Expert installation and refinishing for luxury vinyl plank, solid hardwood, porcelain tile, laminate, and commercial carpeting for homes and businesses.',
    typicalCost: '$6 - $14 per square foot (materials + labor)',
    licensingRequirements: 'State Specialty Flooring Contractor License and insured teams.',
    searchKeywords: ['flooring', 'hardwood', 'tile', 'vinyl plank', 'lvp', 'carpet', 'refinishing'],
    commonServices: [
      'Hardwood Floor Sanding & Dustless Refinishing',
      'Luxury Vinyl Plank (LVP) & Laminate Installation',
      'Porcelain & Ceramic Bathroom / Kitchen Tile',
      'Commercial Epoxy Flooring Systems',
      'Subfloor Leveling & Moisture Barrier Application'
    ],
    faqs: [
      {
        question: 'Why is Luxury Vinyl Plank (LVP) so popular in the US?',
        answer: 'LVP offers the aesthetic appearance of authentic hardwood at a fraction of the cost, is 100% waterproof, highly scratch-resistant for pets, and simple to clean.'
      }
    ],
    relatedSlugs: ['general-contractors', 'painting-contractors', 'handyman-services']
  },
  {
    slug: 'painting-contractors',
    title: 'Painting Contractors',
    singularTitle: 'Painter',
    parentCategoryId: 'home-services',
    parentCategoryName: 'Home Services',
    metaTitle: 'Professional Painting Contractors in USA | Interior & Exterior House Painters | BizNestUSA',
    metaDescription: 'Discover top-rated interior and exterior painters in the USA. Precision cabinet painting, commercial coatings, drywall repair, and color consultations on BizNestUSA.',
    h1: 'Licensed Interior & Exterior Painters in the United States',
    badge: 'EPA Lead-Safe Certified Painting Contractors',
    heroDescription: 'Transform your residential or commercial space with professional painting teams. Detailed surface preparation, cabinet refinishing, exterior weather-resistant coatings, and stain applications.',
    typicalCost: '$1.50 - $4.00 per sq ft of wall space ($2,500 - $6,500 for whole-home exterior)',
    licensingRequirements: 'State Painting Contractor License and EPA Lead-Safe Certification for pre-1978 homes.',
    searchKeywords: ['painter', 'painting', 'interior painting', 'exterior painting', 'cabinet painting', 'paint'],
    commonServices: [
      'Interior Walls, Ceilings, & Baseboard Painting',
      'Exterior Siding, Stucco, & Brick Coating',
      'Kitchen Cabinet Spray Painting & Refinishing',
      'Drywall Patching & Surface Smoothing',
      'Deck & Fence Pressure Washing & Staining'
    ],
    faqs: [
      {
        question: 'How often should an exterior home be repainted in the US?',
        answer: 'On average, every 5 to 10 years depending on your local climate, sun exposure, and siding material (wood siding typically needs repainting every 5-7 years, stucco every 7-10 years).'
      }
    ],
    relatedSlugs: ['general-contractors', 'flooring-contractors', 'handyman-services']
  },

  // -------------------------------------------------------------
  // PROFESSIONAL & FINANCIAL SERVICES
  // -------------------------------------------------------------
  {
    slug: 'accountants',
    title: 'Accountants & CPAs',
    singularTitle: 'Accountant / CPA',
    parentCategoryId: 'professional-services',
    parentCategoryName: 'Professional Services',
    metaTitle: 'Certified Public Accountants (CPA) in USA | Corporate Tax & Bookkeeping | BizNestUSA',
    metaDescription: 'Connect with certified public accountants (CPAs) in the USA for corporate tax filings, IRS audits, payroll management, and fractional CFO advisory on BizNestUSA.',
    h1: 'Certified Public Accountants & Tax Advisors in the USA',
    badge: 'AICPA Registered CPAs & Tax Fiduciaries',
    heroDescription: 'Strategic accounting, tax planning, and fractional financial leadership for business owners, LLCs, medical practices, and high-net-worth individuals.',
    typicalCost: '$150 - $350 per hour (Corporate annual tax return: $800 - $2,500)',
    licensingRequirements: 'State Board of Accountancy CPA License and active peer review standing.',
    searchKeywords: ['accountant', 'cpa', 'tax return', 'bookkeeping', 'irs audit', 'payroll', 'tax planning'],
    commonServices: [
      'Federal & Multi-State Corporate Tax Preparation',
      'Monthly Bookkeeping & Financial Reporting',
      'IRS Audit Defense & Penalty Abatement',
      'Fractional CFO & Budget Forecasting',
      'QuickBooks & Cloud Accounting Integrations'
    ],
    faqs: [
      {
        question: 'What is the advantage of hiring a CPA over a regular tax preparer?',
        answer: 'A CPA has passed rigorous uniform board exams, completed 150 hours of higher education, and has unlimited representation rights before the IRS, meaning they can represent you during audits, appeals, and collections.'
      }
    ],
    relatedSlugs: ['financial-advisors', 'lawyers', 'real-estate-agents']
  },
  {
    slug: 'lawyers',
    title: 'Attorneys & Lawyers',
    singularTitle: 'Lawyer / Attorney',
    parentCategoryId: 'professional-services',
    parentCategoryName: 'Professional Services',
    metaTitle: 'Attorneys & Lawyers in USA | Top Rated Legal Counsel | BizNestUSA',
    metaDescription: 'Find experienced attorneys in the United States. Commercial litigation, corporate formation, estate planning, employment law, and personal injury counsel on BizNestUSA.',
    h1: 'Verified Attorneys & Legal Counsel in the United States',
    badge: 'State Bar Certified Legal Counsel',
    heroDescription: 'Protect your business and personal interests with experienced legal advisors. Practice areas include business incorporation, commercial contracts, intellectual property, and civil disputes.',
    typicalCost: '$250 - $650 per hour (or contingency fee for personal injury)',
    licensingRequirements: 'State Bar Association active license, J.D. from an accredited law school, and legal malpractice insurance.',
    searchKeywords: ['lawyer', 'attorney', 'legal counsel', 'litigation', 'corporate law', 'contracts', 'estate planning'],
    commonServices: [
      'Business Entity Formation (LLC, S-Corp, C-Corp)',
      'Commercial Contract Drafting & Review',
      'Employment Law Defense & Compliance',
      'Estate Planning, Wills & Living Trusts',
      'Civil & Commercial Litigation Representation'
    ],
    faqs: [
      {
        question: 'How do I choose the right attorney for my business in the USA?',
        answer: 'Look for attorneys who specialize specifically in business transactions or commercial litigation within your industry, have good standing with the state bar, and offer clear fee structures (flat fee vs hourly).'
      }
    ],
    relatedSlugs: ['accountants', 'financial-advisors', 'real-estate-agents']
  },
  {
    slug: 'real-estate-agents',
    title: 'Real Estate Agents',
    singularTitle: 'Real Estate Agent',
    parentCategoryId: 'real-estate',
    parentCategoryName: 'Real Estate',
    metaTitle: 'Real Estate Agents & Brokers in USA | Buy, Sell & Lease Properties | BizNestUSA',
    metaDescription: 'Connect with top-rated real estate agents and commercial brokers across the USA. Residential homes, luxury estates, and commercial leasing on BizNestUSA.',
    h1: 'Top-Rated Real Estate Agents & Brokers in the USA',
    badge: 'National Association of Realtors (NAR) Members',
    heroDescription: 'Navigate the US real estate market with trusted local experts. Comprehensive neighborhood valuation, property marketing, buyer representation, and investment analysis.',
    typicalCost: '4.5% - 6% total sales commission (split between buyer and listing brokers)',
    licensingRequirements: 'State Real Estate Commission Broker/Salesperson License and E&O insurance.',
    searchKeywords: ['real estate', 'realtor', 'real estate agent', 'broker', 'buy home', 'commercial leasing'],
    commonServices: [
      'Residential Home Purchases & Listings',
      'Commercial Property Leasing & Sales',
      'Comparative Market Valuations (CMA)',
      'Real Estate Investment Portfolio Advisory',
      'First-Time Homebuyer Guidance'
    ],
    faqs: [
      {
        question: 'What is the role of a buyer’s agent in a US home purchase?',
        answer: 'A buyer’s agent advocates solely for the homebuyer, helping find suitable listings, conducting market analysis, drafting purchase offers, negotiating repair contingencies, and guiding the closing process.'
      }
    ],
    relatedSlugs: ['general-contractors', 'lawyers', 'accountants']
  },

  // -------------------------------------------------------------
  // HEALTH & WELLNESS
  // -------------------------------------------------------------
  {
    slug: 'dentists',
    title: 'Dentists',
    singularTitle: 'Dentist',
    parentCategoryId: 'health-wellness',
    parentCategoryName: 'Health & Wellness',
    metaTitle: 'Dentists & Dental Clinics in USA | Family & Cosmetic Dentistry | BizNestUSA',
    metaDescription: 'Find verified dentists across the United States. Routine cleanings, dental implants, teeth whitening, porcelain veneers, and emergency dental care on BizNestUSA.',
    h1: 'Top Dental Clinics & Family Dentists in the USA',
    badge: 'American Dental Association (ADA) Members',
    heroDescription: 'Comprehensive oral healthcare for individuals and families. Preventative teeth cleanings, emergency toothache relief, porcelain crowns, dental implants, and orthodontic aligners.',
    typicalCost: '$100 - $250 for cleaning/exam ($1,500 - $4,500 per dental implant)',
    licensingRequirements: 'State Dental Board License (DDS or DMD degree) and DEA registration.',
    searchKeywords: ['dentist', 'dental', 'teeth cleaning', 'implant', 'teeth whitening', 'cosmetic dentist', 'cavity'],
    commonServices: [
      'Comprehensive Exams, X-Rays & Cleanings',
      'Emergency Tooth Extraction & Root Canals',
      'Dental Implants & Implant-Supported Bridges',
      'Porcelain Veneers & Professional Teeth Whitening',
      'Clear Orthodontic Aligners'
    ],
    faqs: [
      {
        question: 'How often should adults visit the dentist?',
        answer: 'The American Dental Association recommends visiting your dentist every six months for a routine examination and professional cleaning to catch cavities and gum disease early.'
      }
    ],
    relatedSlugs: ['doctors', 'health-wellness']
  },
  {
    slug: 'doctors',
    title: 'Doctors & Physicians',
    singularTitle: 'Doctor',
    parentCategoryId: 'health-wellness',
    parentCategoryName: 'Health & Wellness',
    metaTitle: 'Doctors & Physicians in USA | Board-Certified Medical Specialists | BizNestUSA',
    metaDescription: 'Discover board-certified doctors, internists, pediatricians, and medical practices across the USA on BizNestUSA. Book primary care and specialist consultations.',
    h1: 'Board-Certified Doctors & Medical Practices in the USA',
    badge: 'AMA & State Medical Board Certified Physicians',
    heroDescription: 'Connect with reputable primary care doctors, internal medicine physicians, pediatricians, cardiologists, and walk-in medical specialists across all 50 states.',
    typicalCost: '$100 - $350 per standard consultation without insurance (often $20 - $50 co-pay with insurance)',
    licensingRequirements: 'State Medical Board License (MD or DO degree) and board certification.',
    searchKeywords: ['doctor', 'physician', 'medical clinic', 'primary care', 'internist', 'pediatrician'],
    commonServices: [
      'Annual Wellness & Physical Examinations',
      'Chronic Disease Management (Hypertension, Diabetes)',
      'Diagnostic Bloodwork & Rapid Screenings',
      'Telehealth Remote Virtual Consultations',
      'Specialist Referrals & Prescription Management'
    ],
    faqs: [
      {
        question: 'What is the difference between an MD and a DO in the United States?',
        answer: 'Both MDs (Medical Doctors) and DOs (Doctors of Osteopathic Medicine) are fully licensed physicians in the United States who complete 4 years of medical school and residency training. DOs also receive specialized training in the musculoskeletal system.'
      }
    ],
    relatedSlugs: ['dentists', 'health-wellness']
  },

  // -------------------------------------------------------------
  // AUTOMOTIVE & TECHNOLOGY
  // -------------------------------------------------------------
  {
    slug: 'auto-repair',
    title: 'Auto Repair Shops',
    singularTitle: 'Mechanic',
    parentCategoryId: 'automotive',
    parentCategoryName: 'Automotive',
    metaTitle: 'Auto Repair Shops in USA | Certified Mechanics & Car Service | BizNestUSA',
    metaDescription: 'Find ASE-certified auto repair shops and mechanics across the USA. Engine diagnostics, brake service, transmission repair, oil changes, and hybrid/EV maintenance on BizNestUSA.',
    h1: 'ASE-Certified Auto Repair Shops in the United States',
    badge: 'ASE Certified Master Auto Mechanics',
    heroDescription: 'Keep your vehicle operating safely and reliably. Complete computer diagnostics, scheduled factory maintenance, brake pad replacements, suspension work, and transmission repairs.',
    typicalCost: '$90 - $160 per labor hour (Brake pad replacement: $180 - $350 per axle)',
    licensingRequirements: 'ASE certification and municipal auto repair shop licenses.',
    searchKeywords: ['auto repair', 'mechanic', 'car repair', 'brakes', 'oil change', 'engine diagnostics', 'transmission'],
    commonServices: [
      'Computer OBD-II Engine Diagnostics',
      'Brake Pad & Rotor Replacement',
      'Factory Scheduled Maintenance (30k/60k/90k)',
      'Transmission Flush & Rebuilds',
      'Heating & AC System Service'
    ],
    faqs: [
      {
        question: 'What does the "Check Engine" light usually indicate?',
        answer: 'A Check Engine light can signal anything from a loose gas cap or faulty oxygen sensor to catalytic converter deterioration or engine misfires. Having an ASE technician scan the OBD-II diagnostic codes will isolate the exact fault.'
      }
    ],
    relatedSlugs: ['towing-services', 'automotive']
  },
  {
    slug: 'software-developers',
    title: 'Software Developers & Tech Firms',
    singularTitle: 'Software Engineer',
    parentCategoryId: 'technology',
    parentCategoryName: 'Technology',
    metaTitle: 'Software Developers & IT Firms in USA | Custom Web & App Engineering | BizNestUSA',
    metaDescription: 'Connect with verified software developers, full-stack engineers, and cloud architects in the USA for custom web platforms, mobile apps, and enterprise SaaS on BizNestUSA.',
    h1: 'Top Software Developers & Tech Agencies in the USA',
    badge: 'Verified US Software Engineers & Cloud Architects',
    heroDescription: 'Build modern, high-performance web applications, mobile apps, and scalable cloud architectures with verified US software development specialists.',
    typicalCost: '$75 - $175 per hour ($15,000 - $75,000+ for custom app development)',
    licensingRequirements: 'Verified technical credentials, portfolio validation, and US entity registration.',
    searchKeywords: ['software developer', 'web developer', 'app development', 'cloud architect', 'react', 'next.js', 'typescript'],
    commonServices: [
      'Full-Stack Web App Development (React, Next.js, Node.js)',
      'iOS & Android Mobile App Engineering',
      'Cloud Architecture & DevOps (AWS, GCP, Azure)',
      'REST & GraphQL API Integrations',
      'Database Optimization & Scalability Hardening'
    ],
    faqs: [
      {
        question: 'Why choose US-based software developers?',
        answer: 'US-based engineers offer real-time timezone collaboration, native English communication, deep familiarity with US regulatory standards (HIPAA, SOC 2, CCPA), and strong intellectual property protection under US law.'
      }
    ],
    relatedSlugs: ['technology', 'cybersecurity']
  },
  {
    slug: 'insurance-agencies',
    title: 'Insurance Agencies & Brokers',
    singularTitle: 'Insurance Agent',
    parentCategoryId: 'professional-services',
    parentCategoryName: 'Professional Services',
    metaTitle: 'Insurance Agencies Near Me | Licensed Commercial & Personal Brokers | BizNestUSA',
    metaDescription: 'Find verified independent insurance agencies in the USA. Compare quotes for commercial liability, auto, home, workers comp, and life insurance. Register your insurance agency in our verified US directory.',
    h1: 'Licensed Independent Insurance Agencies & Brokers in the USA',
    badge: 'State Insurance Commissioner Licensed Brokers',
    heroDescription: 'Protect your family and commercial enterprise with verified independent insurance agents. Compare coverage options for commercial general liability, commercial auto, workers compensation, homeowners, and umbrella policies across all 50 states.',
    typicalCost: '$450 - $1,200/yr for commercial liability ($800 - $2,200/yr for home/auto packages)',
    licensingRequirements: 'State Department of Insurance Producer License, active Errors & Omissions (E&O) coverage, and carrier appointments.',
    searchKeywords: ['insurance', 'insurance agency', 'insurance near me', 'insurance broker', 'commercial insurance', 'liability insurance', 'workers comp', 'auto insurance', 'business insurance'],
    commonServices: [
      'Commercial General Liability & Property Packages (BOP)',
      'Workers Compensation & Employers Liability Policies',
      'Commercial & Personal Auto Fleet Coverage',
      'Homeowners, Condominium & Flood Insurance',
      'Cyber Liability & Professional Errors and Omissions (E&O)',
      'Group Health Benefits & Key-Person Life Insurance'
    ],
    faqs: [
      {
        question: 'Why should I work with an independent insurance agency instead of a captive agent?',
        answer: 'Independent insurance agencies represent dozens of top-rated national carriers (like Travelers, Liberty Mutual, and Hartford) rather than just one brand. They shop the competitive market on your behalf to find the best policy limits and premiums for your risk profile.'
      },
      {
        question: 'How do insurance agencies list their business on BizNestUSA?',
        answer: 'Licensed insurance brokers and agency owners can click "List Your Business" to add their profile. A verified listing highlights your licensed states, appointed lines of authority, commercial specialties, and direct phone lines to commercial and personal insurance shoppers.'
      },
      {
        question: 'What insurance is legally required for small businesses in the United States?',
        answer: 'Most US states require employers to maintain Workers Compensation insurance as soon as they hire their first employee. Commercial auto coverage is legally required for company-owned vehicles, and commercial leases almost universally require general liability certificates of insurance (COI).'
      }
    ],
    relatedSlugs: ['accountants', 'lawyers', 'financial-advisors']
  },
  {
    slug: 'financial-advisors',
    title: 'Financial Advisors & Wealth Managers',
    singularTitle: 'Financial Advisor',
    parentCategoryId: 'professional-services',
    parentCategoryName: 'Professional Services',
    metaTitle: 'Financial Advisors & Fiduciary Wealth Planners in USA | BizNestUSA',
    metaDescription: 'Connect with certified financial planners (CFP) and fiduciary wealth managers in the USA. Retirement planning, tax minimization, 401(k) rollovers, and investment advisory.',
    h1: 'Certified Financial Planners & Wealth Advisors in the USA',
    badge: 'SEC / FINRA Registered Fiduciary Advisors',
    heroDescription: 'Achieve financial freedom and long-term security. Connect with fee-only fiduciary financial planners and certified wealth managers for retirement portfolios, 401(k) rollovers, estate preservation, and executive tax planning.',
    typicalCost: '0.50% - 1.25% of Assets Under Management (AUM) or $1,500 - $4,500 flat financial plan fee',
    licensingRequirements: 'Series 65/66 registration, CFP Board certification or SEC Registered Investment Advisor (RIA) standing.',
    searchKeywords: ['financial advisor', 'wealth management', 'financial planner', 'cfp', 'retirement planning', 'investment advisor', 'fiduciary'],
    commonServices: [
      'Comprehensive Retirement Income & Drawdown Planning',
      'Fiduciary Portfolio Asset Allocation & Rebalancing',
      '401(k), IRA & Pension Rollover Advisory',
      'Tax-Advantaged Wealth Preservation Strategies',
      'College Savings (529 Plan) Structuring'
    ],
    faqs: [
      {
        question: 'What is the fiduciary standard for US financial advisors?',
        answer: 'A fiduciary is legally and ethically bound to act strictly in the client’s best interest at all times. Fiduciary advisors must eliminate or disclose conflicts of interest, whereas non-fiduciary brokers only have to meet the lower "suitability" standard.'
      }
    ],
    relatedSlugs: ['accountants', 'insurance-agencies', 'lawyers']
  },
  {
    slug: 'marketing-agencies',
    title: 'Marketing & SEO Agencies',
    singularTitle: 'Digital Marketer',
    parentCategoryId: 'professional-services',
    parentCategoryName: 'Professional Services',
    metaTitle: 'Top Marketing Agencies & SEO Firms in USA | Digital Growth | BizNestUSA',
    metaDescription: 'Discover verified digital marketing and SEO agencies across the United States. Search engine optimization, PPC advertising, brand strategy, and social media management on BizNestUSA.',
    h1: 'Verified Digital Marketing & SEO Agencies in the USA',
    badge: 'Certified Google & Meta Growth Partners',
    heroDescription: 'Scale your business revenue with top-tier American marketing agencies. Experts in high-ROI local SEO, Google Ads management, paid social funnels, content marketing, and conversion rate optimization.',
    typicalCost: '$1,500 - $6,500 per month retainer (or $100 - $225 per hour)',
    licensingRequirements: 'Verified business entity registration, Google Partner certification, and proven case study portfolio.',
    searchKeywords: ['marketing agency', 'seo agency', 'digital marketing', 'ppc agency', 'social media agency', 'seo', 'advertising'],
    commonServices: [
      'Local & National Search Engine Optimization (SEO)',
      'Google Ads (PPC) & Bing Ads Campaign Management',
      'Paid Social Ads (Meta, LinkedIn, TikTok, YouTube)',
      'Conversion Rate Optimization (CRO) & Funnel Design',
      'B2B Content Strategy & Email Marketing Automation'
    ],
    faqs: [
      {
        question: 'How long does SEO take to produce measurable ROI in the USA?',
        answer: 'For established websites, targeted SEO improvements often yield traffic and lead increases within 3 to 6 months. For new brands or highly competitive national niches, consistent optimization over 6 to 12 months is typical to capture top Google organic rankings.'
      }
    ],
    relatedSlugs: ['software-developers', 'consulting-firms', 'technology']
  },
  {
    slug: 'chiropractors',
    title: 'Chiropractors & Spinal Clinics',
    singularTitle: 'Chiropractor',
    parentCategoryId: 'health-wellness',
    parentCategoryName: 'Health & Wellness',
    metaTitle: 'Chiropractors Near Me | Licensed Spine & Wellness Specialists | BizNestUSA',
    metaDescription: 'Find licensed chiropractors and sports medicine clinics in the USA. Back pain relief, spinal adjustments, neck rehabilitation, and sciatica treatment.',
    h1: 'Top-Rated Licensed Chiropractors in the United States',
    badge: 'NBCE Certified Doctors of Chiropractic (DC)',
    heroDescription: 'Alleviate chronic back pain, restore joint mobility, and heal sports injuries with board-certified Doctors of Chiropractic across all 50 states.',
    typicalCost: '$65 - $160 per adjustment visit ($100 - $250 initial exam and spinal X-rays)',
    licensingRequirements: 'Doctor of Chiropractic (DC) degree from an accredited CCE college, NBCE national board pass, and state license.',
    searchKeywords: ['chiropractor', 'chiropractors near me', 'spine adjustment', 'back pain', 'sciatica', 'neck pain', 'sports medicine'],
    commonServices: [
      'Gentle Manual & Instrument-Assisted Spinal Adjustments',
      'Sciatica Nerve Pain & Herniated Disc Decompression',
      'Post-Auto Accident Whiplash Treatment',
      'Myofascial Soft Tissue Therapy & Trigger Point Release',
      'Postural Ergonomics & Corrective Exercise Training'
    ],
    faqs: [
      {
        question: 'Is chiropractic treatment safe for neck and back pain?',
        answer: 'Yes, when performed by a licensed Doctor of Chiropractic, spinal manipulation is widely recognized by medical research as a safe, effective, and non-invasive treatment for acute back pain and neck strain.'
      }
    ],
    relatedSlugs: ['doctors', 'physical-therapists', 'dentists']
  },
  {
    slug: 'physical-therapists',
    title: 'Physical Therapists & Rehab Centers',
    singularTitle: 'Physical Therapist',
    parentCategoryId: 'health-wellness',
    parentCategoryName: 'Health & Wellness',
    metaTitle: 'Physical Therapy Clinics Near Me | Licensed PT Rehabilitation | BizNestUSA',
    metaDescription: 'Connect with licensed physical therapists in the USA. Post-surgical rehab, sports injury recovery, orthopedic mobility training, and pain management.',
    h1: 'Licensed Physical Therapy & Rehabilitation Clinics in the USA',
    badge: 'APTA Certified Doctors of Physical Therapy (DPT)',
    heroDescription: 'Recover peak physical strength, balance, and range of motion. Verified physical therapy clinics providing orthopedic rehabilitation, post-operative recovery, and neurological movement therapy.',
    typicalCost: '$75 - $180 per session without insurance ($20 - $50 co-pay with insurance)',
    licensingRequirements: 'Doctor of Physical Therapy (DPT) accredited degree, NPTE board pass, and state PT licensing board credential.',
    searchKeywords: ['physical therapy', 'physical therapist', 'pt near me', 'rehab clinic', 'sports therapy', 'orthopedic rehab'],
    commonServices: [
      'Post-Surgical Joint Replacement Recovery (Knee, Hip, Shoulder)',
      'Athletic Sports Injury Reconditioning & Return-to-Play',
      'Manual Joint Mobilization & Dry Needling',
      'Vestibular Balance & Vertigo Rehabilitation',
      'Chronic Low Back & Pelvic Floor Physical Therapy'
    ],
    faqs: [
      {
        question: 'Do I need a doctor’s referral to see a physical therapist in the US?',
        answer: 'All 50 US states now offer some level of "Direct Access," allowing patients to be evaluated and treated by a licensed physical therapist without a prior prescription from a physician.'
      }
    ],
    relatedSlugs: ['chiropractors', 'doctors']
  },
  {
    slug: 'towing-services',
    title: 'Towing & Roadside Assistance',
    singularTitle: 'Tow Truck Operator',
    parentCategoryId: 'automotive',
    parentCategoryName: 'Automotive',
    metaTitle: '24/7 Towing Services & Roadside Assistance Near Me | BizNestUSA',
    metaDescription: 'Emergency 24/7 towing services and roadside assistance across the United States. Flatbed towing, jump starts, lockout service, and tire changes.',
    h1: 'Verified 24/7 Towing Services & Roadside Help in the USA',
    badge: 'TRAA Certified Rapid Roadside Dispatch',
    heroDescription: 'Fast, dependable 24/7 emergency roadside assistance and flatbed towing. Heavy duty towing, accident recovery, dead battery jump starts, roadside fuel delivery, and lockout aid.',
    typicalCost: '$75 - $125 hookup fee + $3 - $7 per towed mile',
    licensingRequirements: 'Commercial Drivers License (CDL), state DOT carrier registration, and $750k+ commercial auto liability.',
    searchKeywords: ['towing', 'tow truck', 'towing near me', 'roadside assistance', 'flatbed towing', 'jump start', 'lockout'],
    commonServices: [
      '24/7 Emergency Local & Long-Distance Vehicle Towing',
      'Flatbed Towing for Luxury, AWD & Electric Vehicles',
      'Dead Battery Boost & On-Site Jump Start Dispatch',
      'Emergency Flat Tire Change & Roadside Air Inflation',
      'Accident Winch-Out & Ditch Recovery'
    ],
    faqs: [
      {
        question: 'How quickly do tow trucks arrive for emergency calls?',
        answer: 'Average response times in major metropolitan areas range between 20 and 45 minutes, depending on highway traffic and weather conditions.'
      }
    ],
    relatedSlugs: ['auto-repair', 'automotive']
  },
  {
    slug: 'hair-salons',
    title: 'Hair Salons & Stylists',
    singularTitle: 'Hair Stylist',
    parentCategoryId: 'beauty-personal-care',
    parentCategoryName: 'Beauty & Personal Care',
    metaTitle: 'Top Hair Salons & Stylists Near Me | Cuts, Color & Balayage | BizNestUSA',
    metaDescription: 'Find top-rated hair salons and master stylists in the USA. Precision haircuts, balayage, highlights, blowouts, and bridal styling on BizNestUSA.',
    h1: 'Top Hair Salons & Master Stylists in the United States',
    badge: 'State Board of Cosmetology Licensed Stylists',
    heroDescription: 'Elevate your look with certified hair professionals. Trendsetting balayage, precision scissor cuts, keratin treatments, hair extensions, and bridal party styling.',
    typicalCost: '$45 - $120 for haircut & style ($150 - $350+ for balayage or highlights)',
    licensingRequirements: 'State Board of Cosmetology License and salon facility health inspection certificate.',
    searchKeywords: ['hair salon', 'hair salons near me', 'hairstylist', 'haircut', 'balayage', 'hair color', 'blowout', 'highlights'],
    commonServices: [
      'Precision Women’s & Men’s Scissor Haircuts',
      'Custom Balayage, Ombre & Foil Highlights',
      'Full Color, Root Touch-Ups & Gloss Treatments',
      'Keratin Smoothing & Brazilian Blowouts',
      'Bridal Hair Styling & Formal Event Updos'
    ],
    faqs: [
      {
        question: 'How do hair stylists and salons register on BizNestUSA?',
        answer: 'Salon owners and independent booth renters can click "List Your Business" to add their salon location, services menu, pricing, portfolio photos, and booking links to attract new clients.'
      }
    ],
    relatedSlugs: ['barbershops', 'beauty-personal-care']
  },
  {
    slug: 'barbershops',
    title: 'Barbershops & Grooming',
    singularTitle: 'Master Barber',
    parentCategoryId: 'beauty-personal-care',
    parentCategoryName: 'Beauty & Personal Care',
    metaTitle: 'Best Barbershops Near Me | Classic Fades & Beard Trims | BizNestUSA',
    metaDescription: 'Discover top-rated barbershops across the United States. Modern skin fades, classic scissor cuts, hot towel shaves, and precision beard sculpting.',
    h1: 'Top-Rated Barbershops & Master Barbers in the USA',
    badge: 'Licensed Master Barbers & Grooming Experts',
    heroDescription: 'Experience classic craftsmanship and modern grooming. Skin fades, hot lather straight-razor shaves, beard sculpting, taper cuts, and relaxing scalp massages across all 50 states.',
    typicalCost: '$30 - $65 for precision haircut ($45 - $85 for haircut + hot towel shave)',
    licensingRequirements: 'State Barber Board License and sanitation compliance.',
    searchKeywords: ['barber', 'barbershop', 'barbershop near me', 'haircut', 'skin fade', 'beard trim', 'straight razor shave'],
    commonServices: [
      'Skin Fades, Tapers & Scissor Crop Cuts',
      'Traditional Hot Lather Straight-Razor Shaves',
      'Beard Shaping, Trimming & Conditioning Oils',
      'Line-Ups, Edge-Ups & Hair Art Designs',
      'Scalp Rejuvenation & Charcoal Facial Masks'
    ],
    faqs: [
      {
        question: 'What is the difference between a barber and a cosmetologist?',
        answer: 'Barbers are traditionally trained and licensed in short-hair cutting techniques, skin fades, and straight-razor shaving of the face and neck, whereas cosmetologists focus more broadly on longer hair styling, coloring, and chemical processing.'
      }
    ],
    relatedSlugs: ['hair-salons', 'beauty-personal-care']
  },
  {
    slug: 'restaurants',
    title: 'Restaurants & Dining',
    singularTitle: 'Restaurateur',
    parentCategoryId: 'restaurants-food',
    parentCategoryName: 'Food & Restaurants',
    metaTitle: 'Best Restaurants Near Me | Local Dining & Cuisines in USA | BizNestUSA',
    metaDescription: 'Explore top-rated restaurants, bistros, and regional dining across the United States. Fine dining, casual eateries, family restaurants, and food reviews on BizNestUSA.',
    h1: 'Verified Restaurants & Local Dining in the United States',
    badge: 'Department of Health Inspected & Certified Eateries',
    heroDescription: 'Discover exceptional dining experiences across the USA. Explore regional farm-to-table cuisine, authentic international flavors, fine dining, family-friendly eateries, and local chef specialties.',
    typicalCost: '$15 - $40 per person casual dining ($75 - $175+ fine dining)',
    licensingRequirements: 'Municipal Food Service Establishment Permit, ServSafe food manager certification, and state liquor license where applicable.',
    searchKeywords: ['restaurant', 'restaurants near me', 'dining', 'food', 'bistro', 'cafe', 'eatery', 'dinner'],
    commonServices: [
      'Dine-In Table Reservations & Private Event Rooms',
      'Curbside Pick-Up & Online Food Ordering',
      'Chef Tasting Menus & Seasonal Pairings',
      'Outdoor Patio & Dog-Friendly Dining',
      'Full Bar, Craft Cocktails & Regional Wine Lists'
    ],
    faqs: [
      {
        question: 'How can restaurant owners claim or list their venue on BizNestUSA?',
        answer: 'Restaurant owners can click "List Your Business" to submit their venue profile with address, hours, cuisine type, menu links, dietary options, reservation links, and phone numbers to reach hungry local diners.'
      }
    ],
    relatedSlugs: ['catering-services', 'restaurants-food']
  },
  {
    slug: 'catering-services',
    title: 'Catering Services',
    singularTitle: 'Caterer',
    parentCategoryId: 'restaurants-food',
    parentCategoryName: 'Food & Restaurants',
    metaTitle: 'Event & Corporate Catering Services in USA | BizNestUSA',
    metaDescription: 'Hire professional catering services for corporate events, weddings, private parties, and celebrations across the United States.',
    h1: 'Professional Event & Wedding Caterers in the United States',
    badge: 'Licensed Commercial Caterers & Banquet Staff',
    heroDescription: 'Delight your guests with premier catering services. From plated wedding receptions and corporate luncheons to cocktail buffets and outdoor barbecues, find verified US caterers for any occasion.',
    typicalCost: '$25 - $75 per guest for casual buffets ($85 - $200+ per guest for formal plated dinners)',
    licensingRequirements: 'Commercial kitchen food service license, health department certification, and liquor liability coverage.',
    searchKeywords: ['catering', 'caterer', 'catering near me', 'wedding catering', 'corporate catering', 'event food'],
    commonServices: [
      'Full-Service Wedding Banquet Catering & Staffing',
      'Corporate Executive Breakfast & Boxed Lunch Drop-Offs',
      'Cocktail Party Hors d’Oeuvres & Passed Appetizers',
      'Live Chef Stations, Raw Bars & Outdoor BBQ Grilling',
      'Custom Dietary Menus (Gluten-Free, Vegan, Kosher, Halal)'
    ],
    faqs: [
      {
        question: 'How far in advance should I book an event caterer in the US?',
        answer: 'For weddings and large holiday corporate galas, booking 6 to 12 months in advance is recommended. For smaller corporate luncheons or private family gatherings, 2 to 4 weeks notice is generally sufficient.'
      }
    ],
    relatedSlugs: ['restaurants', 'restaurants-food']
  },
  {
    slug: 'optometrists',
    title: 'Optometrists & Eye Doctors',
    singularTitle: 'Optometrist',
    parentCategoryId: 'health-wellness',
    parentCategoryName: 'Health & Wellness',
    metaTitle: 'Optometrists Near Me | Licensed Eye Doctors & Vision Clinics | BizNestUSA',
    metaDescription: 'Find licensed optometrists and eye care clinics near you across the USA. Comprehensive eye exams, prescription glasses, contact lens fittings, and pediatric vision care.',
    h1: 'Verified Optometrists & Eye Care Clinics in the USA',
    badge: 'American Optometric Association (AOA) Members',
    heroDescription: 'Protect your vision with licensed Doctors of Optometry across all 50 states. Routine eye examinations, glaucoma screenings, designer eyeglasses, prescription contact lenses, and dry eye therapy.',
    typicalCost: '$100 - $250 for comprehensive eye exam without insurance ($10 - $40 co-pay with vision plans)',
    licensingRequirements: 'Doctor of Optometry (OD) degree, NBEO national board examination pass, and state optometry license.',
    searchKeywords: ['optometrist', 'eye doctor', 'optometrist near me', 'eye exam', 'glasses', 'contact lenses', 'vision clinic'],
    commonServices: [
      'Comprehensive Adult & Pediatric Eye Exams',
      'Prescription Eyeglasses & Designer Frames',
      'Custom Soft, Toric & Scleral Contact Lens Fittings',
      'Glaucoma, Cataract & Macular Degeneration Screenings',
      'Dry Eye Treatment & Computer Vision Syndrome Therapy'
    ],
    faqs: [
      {
        question: 'What is the difference between an Optometrist and an Ophthalmologist?',
        answer: 'An Optometrist (OD) is an eye doctor who performs exams, diagnoses vision issues, prescribes corrective lenses, and manages eye diseases. An Ophthalmologist (MD) is a medical doctor who also performs surgical eye operations like LASIK or cataract removal.'
      },
      {
        question: 'How often should adults get an eye exam?',
        answer: 'The American Optometric Association recommends an annual comprehensive eye exam for adults to monitor vision changes and detect early signs of systemic conditions like diabetes and hypertension.'
      }
    ],
    relatedSlugs: ['doctors', 'dentists', 'health-wellness']
  },
  {
    slug: 'mental-health-therapists',
    title: 'Therapists & Mental Health Counselors',
    singularTitle: 'Licensed Therapist',
    parentCategoryId: 'health-wellness',
    parentCategoryName: 'Health & Wellness',
    metaTitle: 'Therapists Near Me | Licensed Counselors & Psychologists | BizNestUSA',
    metaDescription: 'Connect with licensed therapists, LMFTs, LCSWs, and psychologists near you. In-person and online therapy for anxiety, depression, couples counseling, and trauma.',
    h1: 'Licensed Mental Health Therapists & Counselors in the USA',
    badge: 'State Board Licensed Professional Counselors',
    heroDescription: 'Compassionate, confidential psychological support. Verified therapists offering cognitive behavioral therapy (CBT), couples and family counseling, trauma recovery, and telehealth across all 50 states.',
    typicalCost: '$100 - $250 per 50-minute session (sliding scale often available)',
    licensingRequirements: 'Master’s or Doctorate in Counseling/Psychology, state board license (LMFT, LCSW, LPC, or PsyD), and HIPAA compliance.',
    searchKeywords: ['therapist', 'therapists near me', 'counselor', 'psychologist', 'mental health', 'couples therapy', 'anxiety counseling'],
    commonServices: [
      'Individual Cognitive Behavioral Therapy (CBT)',
      'Marriage, Couples & Family Relationship Counseling',
      'Anxiety, Depression & Stress Management',
      'EMDR & Trauma Recovery Therapy',
      'Secure Telehealth Virtual Video Sessions'
    ],
    faqs: [
      {
        question: 'Does insurance cover mental health therapy in the US?',
        answer: 'Under the federal Mental Health Parity Act, most US health insurance plans provide coverage for mental health services comparable to physical medical care, often requiring only a specialist co-pay.'
      }
    ],
    relatedSlugs: ['doctors', 'health-wellness']
  },
  {
    slug: 'gyms-fitness-centers',
    title: 'Gyms & Fitness Centers',
    singularTitle: 'Fitness Trainer',
    parentCategoryId: 'health-wellness',
    parentCategoryName: 'Health & Wellness',
    metaTitle: 'Gyms & Fitness Centers Near Me | Personal Training & Health Clubs | BizNestUSA',
    metaDescription: 'Discover top gyms, 24/7 fitness clubs, and certified personal trainers near you in the USA. Free weights, cardio machines, HIIT group classes, and personal coaching.',
    h1: 'Top-Rated Gyms & Fitness Centers in the United States',
    badge: 'NASM / ACE Certified Fitness Professionals',
    heroDescription: 'Achieve your wellness and athletic goals at top-tier fitness facilities. Modern strength equipment, cardio decks, Olympic lifting zones, boutique group fitness, and certified one-on-one personal training.',
    typicalCost: '$30 - $120 per month gym membership ($50 - $110 per private training hour)',
    licensingRequirements: 'Commercial facility occupancy permit, CPR/AED certified staff, and certified trainers (NASM, ACE, ACSM).',
    searchKeywords: ['gym', 'gyms near me', 'fitness center', 'personal trainer', 'workout', 'health club', 'weight lifting'],
    commonServices: [
      'Strength Training & Olympic Free Weight Zones',
      'High-Intensity Interval Training (HIIT) & Spin Classes',
      'One-on-One Custom Personal Training Programs',
      'Sauna, Steam Rooms & HydroMassage Recovery',
      'Nutritional Guidance & Body Composition Scanning'
    ],
    faqs: [
      {
        question: 'How do fitness center owners list their gym on BizNestUSA?',
        answer: 'Gym owners and private personal trainers can click "List Your Business" to add their facility, membership tiers, photos, equipment amenities, and class schedules.'
      }
    ],
    relatedSlugs: ['physical-therapists', 'chiropractors', 'health-wellness']
  },
  {
    slug: 'cafes-coffee-shops',
    title: 'Cafes & Coffee Shops',
    singularTitle: 'Cafe Owner',
    parentCategoryId: 'restaurants-food',
    parentCategoryName: 'Food & Restaurants',
    metaTitle: 'Best Cafes & Coffee Shops Near Me | Artisan Espresso & Bakeries | BizNestUSA',
    metaDescription: 'Find top specialty coffee shops and cozy cafes near you in the USA. Specialty pour-overs, cold brew, artisan espresso, fresh pastries, and free Wi-Fi workspaces.',
    h1: 'Top Specialty Cafes & Coffee Shops in the USA',
    badge: 'Specialty Coffee Association (SCA) Baristas',
    heroDescription: 'Discover community coffee shops and artisan roasteries across America. Single-origin espresso, cold brew on tap, loose-leaf teas, fresh baked goods, and laptop-friendly atmospheres.',
    typicalCost: '$4 - $8 per specialty drink / pastry',
    licensingRequirements: 'Municipal Health Department Food Establishment Permit and Food Handler certification.',
    searchKeywords: ['cafe', 'coffee shop', 'coffee near me', 'espresso', 'bakery cafe', 'cold brew', 'latte'],
    commonServices: [
      'Single-Origin Pour-Over & Drip Coffee',
      'Artisan Espresso, Cappuccinos & Lattes',
      'Cold Brew & Nitro Draft Coffee',
      'Freshly Baked Croissants, Bagels & Pastries',
      'Free High-Speed Wi-Fi & Laptop Friendly Seating'
    ],
    faqs: [
      {
        question: 'How can cafe owners attract more local customers via BizNestUSA?',
        answer: 'Listing your cafe on BizNestUSA puts your menu, Wi-Fi amenities, hours, and location directly in front of remote workers, coffee enthusiasts, and local residents searching for nearby coffee shops.'
      }
    ],
    relatedSlugs: ['restaurants', 'catering-services', 'restaurants-food']
  },
  {
    slug: 'pizzerias',
    title: 'Pizzerias & Italian Dining',
    singularTitle: 'Pizzaiolo',
    parentCategoryId: 'restaurants-food',
    parentCategoryName: 'Food & Restaurants',
    metaTitle: 'Best Pizza Near Me | Authentic NY, Chicago & Neapolitan Pizzerias | BizNestUSA',
    metaDescription: 'Find the best pizza restaurants near you across the United States. Wood-fired Neapolitan, authentic New York thin crust, Chicago deep dish, and fast delivery.',
    h1: 'Top-Rated Pizzerias & Artisan Pizza Restaurants in the USA',
    badge: 'Authentic Hand-Tossed & Wood-Fired Specialists',
    heroDescription: 'Satisfy your pizza cravings with award-winning local pizzerias. From crispy New York slices and deep-dish Chicago pies to blistered wood-fired Neapolitan pizzas and fresh calzones.',
    typicalCost: '$14 - $28 per large specialty pizza',
    licensingRequirements: 'Local health department permit, food manager certification, and commercial kitchen compliance.',
    searchKeywords: ['pizza', 'pizza near me', 'pizzeria', 'italian restaurant', 'calzone', 'delivery', 'wood fired pizza'],
    commonServices: [
      'Hand-Tossed New York Style Pizza',
      'Wood-Fired Artisanal Neapolitan Pies',
      'Authentic Chicago Deep Dish & Pan Pizza',
      'Fast Local Delivery & Curbside Pick-Up',
      'Gluten-Free & Cauliflower Crust Options'
    ],
    faqs: [
      {
        question: 'What styles of pizza are most popular in the USA?',
        answer: 'The most popular American styles are New York thin crust (foldable, wide slices), Chicago deep dish (thick cornmeal crust with sauce on top), Detroit style (square with crispy caramelized cheese edges), and traditional Neapolitan.'
      }
    ],
    relatedSlugs: ['restaurants', 'catering-services', 'restaurants-food']
  },
  {
    slug: 'car-dealerships',
    title: 'Car Dealerships & Auto Sales',
    singularTitle: 'Auto Dealer',
    parentCategoryId: 'automotive',
    parentCategoryName: 'Automotive',
    metaTitle: 'Car Dealerships Near Me | New & Used Auto Dealers in USA | BizNestUSA',
    metaDescription: 'Find trusted new and pre-owned car dealerships near you in the USA. Browse certified pre-owned inventories, auto financing options, trade-in valuations, and warranties.',
    h1: 'Verified Car Dealerships & Vehicle Sales in the USA',
    badge: 'NIADA & State Motor Vehicle Dealer Licensed',
    heroDescription: 'Shop with confidence for your next vehicle. Connect with licensed new and used auto dealerships offering certified pre-owned inspections, transparent financing, CARFAX history reports, and trade-in appraisals.',
    typicalCost: '$15,000 - $45,000+ average vehicle purchase',
    licensingRequirements: 'State Motor Vehicle Dealer License, surety bond, and dealer garage liability insurance.',
    searchKeywords: ['car dealership', 'car dealerships near me', 'used cars', 'new cars', 'auto dealer', 'car sales', 'buy car'],
    commonServices: [
      'Certified Pre-Owned (CPO) Inspected Vehicles',
      'New Car Franchised Dealership Inventory',
      'Competitive Auto Financing & Lease Pre-Approvals',
      'Fair-Market Vehicle Trade-In Appraisals',
      'Extended Powertrain & Bumper-to-Bumper Warranties'
    ],
    faqs: [
      {
        question: 'What is the advantage of buying a Certified Pre-Owned (CPO) vehicle?',
        answer: 'A CPO vehicle undergoes a rigorous 100+ point mechanical inspection by factory technicians and includes an extended manufacturer-backed warranty, roadside assistance, and verified vehicle history.'
      }
    ],
    relatedSlugs: ['auto-repair', 'towing-services', 'automotive']
  },
  {
    slug: 'auto-detailing',
    title: 'Auto Detailing & Ceramic Coating',
    singularTitle: 'Auto Detailer',
    parentCategoryId: 'automotive',
    parentCategoryName: 'Automotive',
    metaTitle: 'Auto Detailing Near Me | Mobile Car Wash & Ceramic Coating | BizNestUSA',
    metaDescription: 'Discover top auto detailing and mobile car wash specialists near you. Paint correction, multi-year ceramic coating, interior steam extraction, and mobile fleet detailing.',
    h1: 'Professional Auto Detailing & Paint Protection in the USA',
    badge: 'IDA Certified Master Detailers',
    heroDescription: 'Restore showroom shine and protect your vehicle’s exterior. Professional paint correction, 9H ceramic coatings, hydrophobic glass protection, deep interior steam extraction, and mobile detailing units.',
    typicalCost: '$150 - $350 full interior/exterior detail ($700 - $2,000 ceramic coating)',
    licensingRequirements: 'Business registration, IDA certification, and garage-keepers liability insurance.',
    searchKeywords: ['auto detailing', 'car detailing near me', 'car wash', 'ceramic coating', 'mobile detailing', 'paint correction'],
    commonServices: [
      'Multi-Stage Paint Correction & Scratch Removal',
      'Professional Multi-Year Ceramic Coating & Graphene Protection',
      'Deep Interior Steam Cleaning, Leather Conditioning & Ozone Odor Removal',
      'Headlight Restoration & UV Protection',
      'On-Site Mobile Detailing at Your Home or Office'
    ],
    faqs: [
      {
        question: 'How often should a car be professionally detailed?',
        answer: 'Most automotive experts recommend a full detail every 4 to 6 months to protect the paint clear-coat from UV degradation, environmental contaminants, and road salt, and to keep the interior sanitised.'
      }
    ],
    relatedSlugs: ['auto-repair', 'car-dealerships', 'automotive']
  },
  {
    slug: 'nail-salons',
    title: 'Nail Salons & Spas',
    singularTitle: 'Nail Technician',
    parentCategoryId: 'beauty-personal-care',
    parentCategoryName: 'Beauty & Personal Care',
    metaTitle: 'Nail Salons Near Me | Manicures, Pedicures & Acrylics | BizNestUSA',
    metaDescription: 'Find top-rated nail salons near you in the USA. Gel manicures, spa pedicures, acrylic full sets, dip powder, custom nail art, and organic non-toxic polishes.',
    h1: 'Top-Rated Nail Salons & Nail Spas in the United States',
    badge: 'State Board Licensed Nail Technicians',
    heroDescription: 'Pamper yourself with premium nail care. Certified manicurists offering Russian manicures, gel extensions, dipping powder, luxury pedicure foot baths, and custom hand-painted nail designs.',
    typicalCost: '$30 - $60 standard manicure/pedicure ($65 - $120+ for acrylics or nail art)',
    licensingRequirements: 'State Board of Cosmetology / Nail Specialty License and autoclave medical-grade tool sterilization.',
    searchKeywords: ['nail salon', 'nail salons near me', 'manicure', 'pedicure', 'acrylic nails', 'gel nails', 'dip powder'],
    commonServices: [
      'Luxury Spa Pedicures with Callus Removal & Scrub',
      'Long-Lasting Gel & Shellac Manicures',
      'Full-Set Acrylics & Hard Gel Extensions',
      'SNS Dipping Powder & Strengthening Overlays',
      'Custom Hand-Painted 3D Nail Art & Chrome Finishes'
    ],
    faqs: [
      {
        question: 'What is the longest-lasting manicure type?',
        answer: 'Dipping powder (SNS) and structured builder gel typically last 3 to 4 weeks without chipping, outlasting standard gel polish (2 to 3 weeks) and traditional lacquer (5 to 7 days).'
      }
    ],
    relatedSlugs: ['hair-salons', 'barbershops', 'beauty-personal-care']
  },
  {
    slug: 'web-design-agencies',
    title: 'Web Design & UI/UX Agencies',
    singularTitle: 'Web Designer',
    parentCategoryId: 'technology',
    parentCategoryName: 'Technology',
    metaTitle: 'Top Web Design Agencies in USA | Custom UI/UX & Website Development | BizNestUSA',
    metaDescription: 'Connect with award-winning web design and UI/UX agencies in the USA. Modern responsive websites, Shopify e-commerce, Webflow, and high-converting conversion optimization.',
    h1: 'Premier Web Design & UI/UX Development Agencies in the USA',
    badge: 'Verified American Web Design & UX Specialists',
    heroDescription: 'Elevate your online brand with bespoke digital experiences. Mobile-first responsive web design, interactive UX wireframing, e-commerce storefronts, and conversion-optimized landing pages.',
    typicalCost: '$3,500 - $15,000 for standard business website ($15,000 - $50,000+ for enterprise e-commerce)',
    licensingRequirements: 'Registered corporate entity, verified design portfolio, and technical warranty agreements.',
    searchKeywords: ['web design', 'web designer', 'web design agency', 'ui ux design', 'website design near me', 'ecommerce web design'],
    commonServices: [
      'Custom Responsive UI/UX Website Design',
      'Shopify & WooCommerce E-Commerce Storefronts',
      'Webflow, WordPress & Next.js Website Builds',
      'Brand Identity, Style Guides & Typography Systems',
      'Website Speed & Mobile Usability Optimization'
    ],
    faqs: [
      {
        question: 'How long does a custom web design project take?',
        answer: 'A custom small-to-medium business website typically takes 4 to 8 weeks from initial discovery and wireframes to final design, development, and live deployment.'
      }
    ],
    relatedSlugs: ['software-developers', 'marketing-agencies', 'technology']
  },
  {
    slug: 'property-management',
    title: 'Property Management Companies',
    singularTitle: 'Property Manager',
    parentCategoryId: 'real-estate',
    parentCategoryName: 'Real Estate & Properties',
    metaTitle: 'Property Management Companies Near Me | Rental & HOA Managers | BizNestUSA',
    metaDescription: 'Discover licensed property management companies in the USA. Full-service residential leasing, tenant screening, rent collection, 24/7 maintenance, and HOA management.',
    h1: 'Licensed Property Management Companies in the United States',
    badge: 'NARPM Certified Residential Property Managers',
    heroDescription: 'Maximize rental income and protect your investment real estate. Full-service property management handling tenant marketing, rigorous background screening, 24/7 emergency maintenance, and financial reporting.',
    typicalCost: '8% - 12% of monthly rental revenue (plus 50% - 100% of one month’s rent for tenant placement)',
    licensingRequirements: 'State Real Estate Broker License (in states requiring broker oversight) and property management liability coverage.',
    searchKeywords: ['property management', 'property manager', 'rental management', 'tenant placement', 'hoa management', 'landlord service'],
    commonServices: [
      'Aggressive Rental Marketing & 3D Virtual Tours',
      'Comprehensive Credit, Criminal & Eviction Tenant Screening',
      'Automated Online Rent Collection & Owner Direct Deposits',
      '24/7 Coordinated Emergency Maintenance & Repairs',
      'HOA Governance & Community Association Management'
    ],
    faqs: [
      {
        question: 'Why should real estate investors hire a property manager?',
        answer: 'Property managers save landlords hundreds of hours, reduce costly vacancies through professional marketing, enforce prompt lease compliance, navigate complex state eviction laws, and negotiate discounted contractor repair rates.'
      }
    ],
    relatedSlugs: ['real-estate-agents', 'general-contractors', 'real-estate']
  },
  {
    slug: 'tutoring-services',
    title: 'Tutoring & Academic Services',
    singularTitle: 'Academic Tutor',
    parentCategoryId: 'education',
    parentCategoryName: 'Education',
    metaTitle: 'Private Tutors & Academic Tutoring Near Me | K-12 & College | BizNestUSA',
    metaDescription: 'Find certified private tutors and learning centers near you in the USA. Math, science, reading, SAT/ACT prep, and college admissions coaching.',
    h1: 'Certified Private Tutors & Learning Centers in the USA',
    badge: 'NTA Certified Professional Academic Tutors',
    heroDescription: 'Empower students to excel academically. Verified private tutors and learning centers offering personalized 1-on-1 instruction for elementary through college students, AP coursework, and standardized test prep.',
    typicalCost: '$35 - $85 per hour (SAT/ACT specialty tutoring: $65 - $150/hr)',
    licensingRequirements: 'Degree in education or specialized subject matter, background check verification, and teaching credentials.',
    searchKeywords: ['tutoring', 'tutor near me', 'math tutor', 'sat prep', 'private tutor', 'reading tutor', 'act prep'],
    commonServices: [
      'K-12 Math, Algebra, Geometry & Calculus Tutoring',
      'Reading Comprehension, Phonics & Writing Mastery',
      'SAT, ACT, AP & GRE Standardized Test Preparation',
      'Special Education, ADHD & Executive Function Coaching',
      'In-Person In-Home or Interactive Virtual Video Lessons'
    ],
    faqs: [
      {
        question: 'How can tutors register and find students on BizNestUSA?',
        answer: 'Tutors and tutoring centers can click "List Your Business" or "Create Profile" to showcase their degrees, subjects, student testimonials, and hourly rates to local parents and students.'
      }
    ],
    relatedSlugs: ['education']
  },
  {
    slug: 'photographers',
    title: 'Photographers & Video Studios',
    singularTitle: 'Photographer',
    parentCategoryId: 'local-services',
    parentCategoryName: 'Local & Other Services',
    metaTitle: 'Photographers Near Me | Wedding, Portrait & Commercial Photography | BizNestUSA',
    metaDescription: 'Connect with award-winning photographers across the USA. Wedding photography, family portraits, corporate headshots, real estate drone media, and event videography.',
    h1: 'Professional Photographers & Video Studios in the USA',
    badge: 'PPA Certified Professional Photographers',
    heroDescription: 'Capture life’s unforgettable moments and elevate commercial brands. Award-winning photographers specializing in weddings, family portraits, corporate executive headshots, real estate media, and drone videography.',
    typicalCost: '$250 - $600 for portrait / headshot session ($2,000 - $5,500+ for full-day wedding coverage)',
    licensingRequirements: 'Business registration, FAA Part 107 commercial drone license (for aerial photography), and equipment liability insurance.',
    searchKeywords: ['photographer', 'photographers near me', 'wedding photographer', 'portrait photographer', 'headshots', 'drone photography'],
    commonServices: [
      'Full-Day Wedding Photography & Cinematic Videography',
      'Professional Corporate Executive Headshots & Branding',
      'Family, Newborn, Maternity & Senior Portrait Sessions',
      'Real Estate HDR Photography & FAA-Licensed Drone Video',
      'High-Resolution Retouching & Private Online Client Galleries'
    ],
    faqs: [
      {
        question: 'How far in advance should I book a wedding photographer in the US?',
        answer: 'Wedding photographers should ideally be booked 9 to 12 months in advance, especially for popular spring and autumn wedding dates.'
      }
    ],
    relatedSlugs: ['local-services', 'catering-services']
  },
  {
    slug: 'veterinarians',
    title: 'Veterinarians & Animal Hospitals',
    singularTitle: 'Veterinarian',
    parentCategoryId: 'pets-animals',
    parentCategoryName: 'Pet Services & Animals',
    metaTitle: 'Veterinarians Near Me | Top Animal Hospitals & Vet Clinics | BizNestUSA',
    metaDescription: 'Find licensed veterinarians and emergency animal hospitals near you across all 50 US states. Pet vaccinations, wellness exams, pet dental, diagnostics, and 24/7 emergency care.',
    h1: 'Verified Veterinarians & Emergency Animal Hospitals in the USA',
    badge: 'AAHA Accredited & Licensed Doctors of Veterinary Medicine (DVM)',
    heroDescription: 'Compassionate, state-of-the-art medical care for dogs, cats, and exotic pets. Comprehensive puppy and kitten wellness plans, surgical care, dental cleanings, microchipping, and 24/7 urgent animal hospitals.',
    typicalCost: '$65 - $150 per routine vet exam ($500 - $3,000+ for emergency diagnostics / surgery)',
    licensingRequirements: 'Doctor of Veterinary Medicine (DVM / VMD) accredited degree, NAVLE national board pass, and state veterinary medical board license.',
    searchKeywords: ['veterinarian', 'vet near me', 'animal hospital', 'emergency vet', 'dog vet', 'cat vet', 'pet clinic', 'vaccinations'],
    commonServices: [
      'Comprehensive Annual Pet Wellness Exams & Vaccinations',
      '24/7 Emergency Trauma & Critical Veterinary Care',
      'Veterinary Soft Tissue & Orthopedic Surgery',
      'Ultrasonic Pet Dental Cleaning & Extractions',
      'In-House Digital X-Rays, Ultrasound & Bloodwork Diagnostics',
      'Microchipping, Flea, Tick & Heartworm Prevention'
    ],
    faqs: [
      {
        question: 'How often should dogs and cats visit the vet in the USA?',
        answer: 'Healthy adult dogs and cats should visit the veterinarian once a year for an annual physical exam and vaccine boosters. Senior pets (over 7 years old) and puppies/kittens should be evaluated every six months.'
      },
      {
        question: 'What constitutes a true pet medical emergency?',
        answer: 'True pet emergencies include difficulty breathing, suspected poisoning/toxin ingestion, bloated or distended abdomen, sudden collapse or inability to walk, severe vomiting/diarrhea with blood, or trauma from an auto accident.'
      },
      {
        question: 'How do veterinary clinics list their practice on BizNestUSA?',
        answer: 'Veterinary hospital directors and practice managers can click "List Your Business" to add their clinic address, emergency hours, boarding amenities, and direct phone lines to help local pet owners find care.'
      }
    ],
    relatedSlugs: ['dog-groomers', 'pet-boarding', 'pets-animals']
  },
  {
    slug: 'dog-groomers',
    title: 'Dog & Pet Groomers',
    singularTitle: 'Pet Groomer',
    parentCategoryId: 'pets-animals',
    parentCategoryName: 'Pet Services & Animals',
    metaTitle: 'Dog Groomers Near Me | Professional Pet Grooming & Baths | BizNestUSA',
    metaDescription: 'Discover top-rated dog groomers and mobile pet grooming salons near you in the USA. Full haircuts, soothing de-shedding baths, nail trims, ear cleaning, and breed styling.',
    h1: 'Certified Dog Groomers & Pet Styling Salons in the USA',
    badge: 'NDGAA Certified Master Groomers',
    heroDescription: 'Keep your furry companions looking and feeling their best. Professional salon and mobile grooming vans offering luxury bubble baths, sanitary trims, hand-scissored breed cuts, de-shedding treatments, and pawdicures.',
    typicalCost: '$50 - $110 standard dog bath & haircut ($85 - $160+ for mobile grooming or large doodle breeds)',
    licensingRequirements: 'Pet grooming certification (NDGAA or accredited school), pet first aid/CPR certification, and commercial grooming liability insurance.',
    searchKeywords: ['dog groomer', 'dog grooming near me', 'pet groomer', 'mobile dog grooming', 'dog bath', 'nail trim', 'cat groomer'],
    commonServices: [
      'Full Breed-Specific Hand Scissoring & Styling',
      'Hydro-Surge Warm Water Bath & Organic Shampoo Massage',
      'Low-Stress Mobile Grooming Vans at Your Driveway',
      'FURminator Deep De-Shedding & Undercoat Removal',
      'Gentle Nail Grinding, Paw Balm & Ear Cleaning',
      'Teeth Brushing & Breath Freshening Sprays'
    ],
    faqs: [
      {
        question: 'How often should dogs be professionally groomed?',
        answer: 'Most dog breeds benefit from professional grooming every 4 to 8 weeks. Long-haired breeds and doodles require 4-to-6 week appointments to prevent painful coat matting, while short-haired dogs benefit from seasonal de-shedding baths every 8 to 12 weeks.'
      }
    ],
    relatedSlugs: ['veterinarians', 'pet-boarding', 'pets-animals']
  },
  {
    slug: 'pet-boarding',
    title: 'Pet Boarding & Dog Daycare',
    singularTitle: 'Pet Boarding Host',
    parentCategoryId: 'pets-animals',
    parentCategoryName: 'Pet Services & Animals',
    metaTitle: 'Pet Boarding & Dog Daycare Near Me | Luxury Kennels & Suites | BizNestUSA',
    metaDescription: 'Find safe, luxury pet boarding kennels and dog daycare facilities near you in the USA. Climate-controlled suites, supervised group play, webcam access, and medication administration.',
    h1: 'Top Pet Boarding Facilities & Dog Daycares in the USA',
    badge: 'IBPSA Certified Pet Care Facilities',
    heroDescription: 'Give your pets a vacation of their own. Safe, climate-controlled overnight dog boarding, luxury cat condos, spacious outdoor turf play yards, live webcams, and caring 24/7 staff across all 50 states.',
    typicalCost: '$45 - $90 per overnight boarding stay ($25 - $45 per full day of dog daycare)',
    licensingRequirements: 'Municipal Kennel / Boarding License, state Department of Agriculture inspection, and commercial boarding liability insurance.',
    searchKeywords: ['pet boarding', 'dog boarding near me', 'dog daycare', 'cat boarding', 'kennel near me', 'dog hotel', 'pet resort'],
    commonServices: [
      'Private Climate-Controlled Luxury Dog Suites with Kuranda Beds',
      'Supervised Indoor & Outdoor Grass Playgroups',
      'Multi-Level Quiet Cat Condos Away from Canine Areas',
      'Live HD Streaming Pet Cams for Owner Peace of Mind',
      'Prescription Diet & Medication Administration by Certified Staff'
    ],
    faqs: [
      {
        question: 'What vaccinations are required for pet boarding in the USA?',
        answer: 'Reputable boarding facilities require current Rabies, DHPP (Distemper/Parvovirus), and Bordetella (kennel cough) vaccines for dogs, plus Canine Influenza in many states. Cats typically require Rabies and FVRCP.'
      }
    ],
    relatedSlugs: ['veterinarians', 'dog-groomers', 'pets-animals']
  }
]

// -------------------------------------------------------------
// Subcategory Name -> Clean URL Slug Mapping
// -------------------------------------------------------------
export const SUBCATEGORY_TO_SERVICE_SLUG: Record<string, string> = {
  // Home Services
  'plumber': 'plumbers',
  'roofer': 'roofers',
  'roofing contractor': 'roofers',
  'electrician': 'electricians',
  'hvac contractor': 'hvac-contractors',
  'general contractor': 'general-contractors',
  'remodeling contractor': 'general-contractors',
  'handyman': 'handyman-services',
  'landscaper': 'landscapers',
  'pest control': 'pest-control',
  'cleaning service': 'cleaning-services',
  'moving company': 'moving-companies',
  'locksmith': 'locksmiths',
  'flooring contractor': 'flooring-contractors',
  'painting contractor': 'painting-contractors',
  'appliance repair': 'appliance-repair',
  'garage door service': 'garage-door-services',

  // Professional Services
  'accountant': 'accountants',
  'accounting & cpa': 'accountants',
  'attorney': 'lawyers',
  'lawyer': 'lawyers',
  'insurance agency': 'insurance-agencies',
  'real estate agency': 'real-estate-agents',
  'financial advisor': 'financial-advisors',
  'tax consultant': 'accountants',
  'tax preparation': 'accountants',
  'marketing agency': 'marketing-agencies',
  'seo agency': 'marketing-agencies',
  'web development agency': 'software-developers',
  'it services': 'software-developers',
  'it company': 'software-developers',
  'consulting firm': 'marketing-agencies',

  // Pets & Animals (HIGH-GROWTH ONLINE CATEGORY)
  'veterinarian': 'veterinarians',
  'animal hospital': 'veterinarians',
  'dog groomer': 'dog-groomers',
  'cat groomer': 'dog-groomers',
  'mobile pet grooming': 'dog-groomers',
  'pet boarding & daycare': 'pet-boarding',
  'dog trainer': 'pet-boarding',
  'pet sitter & dog walker': 'pet-boarding',
  'pet services': 'veterinarians',
  'exotic pet care': 'veterinarians',

  // Legal Services
  'personal injury attorney': 'lawyers',
  'criminal defense lawyer': 'lawyers',
  'family & divorce lawyer': 'lawyers',
  'immigration attorney': 'lawyers',
  'business lawyer': 'lawyers',
  'estate planning attorney': 'lawyers',
  'bankruptcy lawyer': 'lawyers',

  // Cleaning & Janitorial
  'house cleaning': 'cleaning-services',
  'maid service': 'cleaning-services',
  'commercial janitorial': 'cleaning-services',
  'carpet cleaning': 'cleaning-services',
  'pressure washing': 'cleaning-services',
  'window cleaning': 'cleaning-services',
  'move-out cleaning': 'cleaning-services',

  // Events & Weddings
  'wedding venue': 'catering-services',
  'wedding photographer': 'photographers',
  'dj & entertainment': 'photographers',
  'florist': 'catering-services',
  'party rentals': 'catering-services',

  // Health & Wellness
  'dentist': 'dentists',
  'doctor': 'doctors',
  'medical clinic': 'doctors',
  'chiropractor': 'chiropractors',
  'physical therapist': 'physical-therapists',
  'optometrist': 'optometrists',
  'therapist': 'mental-health-therapists',
  'fitness center': 'gyms-fitness-centers',
  'personal trainer': 'gyms-fitness-centers',

  // Automotive
  'auto repair': 'auto-repair',
  'car dealership': 'car-dealerships',
  'tire shop': 'auto-repair',
  'towing service': 'towing-services',
  'auto detailing': 'auto-detailing',
  'body shop': 'auto-repair',
  'car wash': 'auto-detailing',

  // Beauty & Personal Care
  'hair salon': 'hair-salons',
  'beauty salon': 'hair-salons',
  'barber': 'barbershops',
  'nail salon': 'nail-salons',
  'spa': 'hair-salons',
  'massage': 'chiropractors',

  // Food & Dining
  'restaurant': 'restaurants',
  'cafe': 'cafes-coffee-shops',
  'bakery': 'cafes-coffee-shops',
  'pizza': 'pizzerias',
  'fast food': 'restaurants',
  'catering': 'catering-services',

  // Technology
  'software company': 'software-developers',
  'saas company': 'software-developers',
  'web design': 'web-design-agencies',
  'app development': 'software-developers',
  'cybersecurity': 'software-developers',

  // Real Estate
  'commercial real estate': 'real-estate-agents',
  'property management': 'property-management',
  'apartment rentals': 'property-management',
  'mortgage broker': 'financial-advisors',
  'home inspector': 'general-contractors',

  // Construction
  'commercial construction': 'general-contractors',
  'architectural design': 'web-design-agencies',
  'masonry & concrete': 'general-contractors',
  'roofing & siding': 'roofers',

  // Education
  'tutoring': 'tutoring-services',
  'driving school': 'tutoring-services',
  'training center': 'tutoring-services',

  // Local Services
  'photography': 'photographers',
  'event planner': 'catering-services',
  'wedding services': 'photographers',
  'storage': 'moving-companies'
}

/**
 * Returns the canonical indexable URL for a subcategory chip on the homepage.
 */
export function getSubcategoryHref(subcategoryName: string, parentCatId?: string): string {
  const normalized = subcategoryName.toLowerCase().trim()
  const mappedSlug = SUBCATEGORY_TO_SERVICE_SLUG[normalized]
  if (mappedSlug) {
    return `/services/${mappedSlug}`
  }
  // If clean slug exists in POPULAR_SERVICES directly
  const directSlug = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (POPULAR_SERVICES.some(s => s.slug === directSlug)) {
    return `/services/${directSlug}`
  }
  // Otherwise link to clean slug under services
  return `/services/${directSlug}`
}

export function getServiceBySlug(slug: string): ServiceDefinition | null {
  const norm = (slug || '').toLowerCase().trim()
  const found = POPULAR_SERVICES.find(s => s.slug === norm)
  if (found) return found

  // Dynamic fallback: Generate high-fidelity SEO ServiceDefinition for any unlisted slug
  const titleWords = norm.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1))
  const cleanTitle = titleWords.join(' ')
  const singular = cleanTitle.endsWith('s') ? cleanTitle.slice(0, -1) : cleanTitle

  // Auto-detect the matching parent category from BUSINESS_CATEGORIES
  let matchedParentCatId = 'home-services'
  let matchedParentCatName = 'Local Services'
  for (const cat of BUSINESS_CATEGORIES) {
    const hasMatch = cat.subcategories.some(sub => {
      const subNorm = sub.toLowerCase().replace(/[^a-z0-9]/g, '')
      const slugNorm = norm.replace(/[^a-z0-9]/g, '')
      return subNorm.includes(slugNorm) || slugNorm.includes(subNorm)
    })
    if (hasMatch) {
      matchedParentCatId = cat.id
      matchedParentCatName = cat.name
      break
    }
  }

  return {
    slug: norm,
    title: `${cleanTitle} Services`,
    singularTitle: singular,
    parentCategoryId: matchedParentCatId,
    parentCategoryName: matchedParentCatName,
    metaTitle: `${cleanTitle} Services Near Me | Licensed USA Directory | BizNestUSA`,
    metaDescription: `Find verified ${cleanTitle.toLowerCase()} services near you across all 50 US states. Compare local company ratings, credentials, and free project quotes. Add your company profile to BizNestUSA today.`,
    h1: `Verified ${cleanTitle} Services & Contractors in the USA`,
    badge: 'Verified US Service Providers & Licensed Contractors',
    heroDescription: `Connect with vetted and verified ${cleanTitle.toLowerCase()} providers across the United States. Compare customer reviews, business licenses, service coverage areas, and get direct contact details with zero fees.`,
    typicalCost: '$75 - $150 per hour / standard project estimate',
    licensingRequirements: 'State or municipal business registration, applicable trade licenses, and general liability coverage.',
    searchKeywords: [norm.replace(/-/g, ' '), cleanTitle.toLowerCase(), `${cleanTitle.toLowerCase()} near me`, 'contractor', 'licensed'],
    commonServices: [
      `Residential & Commercial ${cleanTitle} Solutions`,
      'Emergency Dispatch & Rapid On-Site Response',
      'Licensed Safety Inspections & Project Consultations',
      'Preventative Maintenance & Equipment Service',
      'Code Compliance & Permitted Installation Work'
    ],
    faqs: [
      {
        question: `How do I find certified ${cleanTitle.toLowerCase()} near me on BizNestUSA?`,
        answer: `BizNestUSA connects consumers with verified US businesses specializing in ${cleanTitle.toLowerCase()}. You can search by your city or state, view verified badges, compare reviews, and call the service provider directly.`
      },
      {
        question: `How can business owners list their ${cleanTitle.toLowerCase()} company on BizNestUSA?`,
        answer: `Company owners and independent contractors can click "List Your Business" to add their profile. A verified listing helps local customers discover your contact information, credentials, and services.`
      }
    ],
    relatedSlugs: ['electricians', 'plumbers', 'general-contractors', 'hvac-contractors']
  }
}

export function getServicesByCategory(categoryId: string): ServiceDefinition[] {
  return POPULAR_SERVICES.filter(s => s.parentCategoryId === categoryId)
}


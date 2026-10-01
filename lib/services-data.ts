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
    metaTitle: 'Professional Electricians in USA | Licensed Electrical Contractors | BizNestUSA',
    metaDescription: 'Connect with master licensed electricians in the United States. Commercial electrical wiring, smart home installations, breaker panel upgrades, EV chargers, and 24/7 emergency service.',
    h1: 'Licensed Master Electricians in the United States',
    badge: 'NEC Compliant Electrical Contractors & Wiremen',
    heroDescription: 'Find certified electrical contractors for residential rewiring, EV charger installations, 200-amp electrical panel upgrades, commercial lighting, backup generators, and safety inspections.',
    typicalCost: '$75 - $150 per hour (Panel upgrade: $1,800 - $3,500)',
    licensingRequirements: 'State Master Electrician License, National Electrical Code (NEC) compliance, and worker compensation insurance.',
    searchKeywords: ['electrician', 'electrical', 'wiring', 'panel upgrade', 'breaker', 'ev charger', 'generator'],
    commonServices: [
      '200-Amp Electrical Panel Upgrades',
      'Level 2 EV Charging Station Installation',
      'Whole-Home Rewiring & Knob-and-Tube Replacement',
      'Whole-House Surge Protection & Generators',
      'Recessed LED Lighting & Smart Switches',
      'Commercial Electrical Code Compliance'
    ],
    faqs: [
      {
        question: 'When should I upgrade my home electrical panel?',
        answer: 'You should consider upgrading your electrical panel if you have an older 60- or 100-amp service, if your breakers constantly trip, if you are adding high-draw appliances like an EV charger or central heat pump, or if your panel uses outdated and recalled brands like Federal Pacific or Zinsco.'
      },
      {
        question: 'Why should I always hire a licensed electrician?',
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
  }
]

export function getServiceBySlug(slug: string): ServiceDefinition | null {
  const norm = (slug || '').toLowerCase().trim()
  return POPULAR_SERVICES.find(s => s.slug === norm) || null
}

export function getServicesByCategory(categoryId: string): ServiceDefinition[] {
  return POPULAR_SERVICES.filter(s => s.parentCategoryId === categoryId)
}

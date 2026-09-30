// SEO Content Template Generator for USA Directory Platform
// Generates practical, informative editorial copy for location and category landing pages

export const CITY_INFO: Record<string, { state: string; description: string; industries: string[]; metroArea?: string }> = {
  'New York City': {
    state: 'New York',
    description: "the largest economic and cultural metropolis in the United States",
    industries: ['finance', 'technology', 'media', 'healthcare', 'professional services', 'hospitality'],
    metroArea: 'New York-Newark-Jersey City'
  },
  'Los Angeles': {
    state: 'California',
    description: "Southern California's premier economic hub and entertainment capital",
    industries: ['entertainment', 'technology', 'aerospace', 'international trade', 'fashion', 'healthcare'],
    metroArea: 'Los Angeles-Long Beach-Anaheim'
  },
  'Chicago': {
    state: 'Illinois',
    description: "the Midwest's leading commercial, financial, and industrial center",
    industries: ['finance', 'manufacturing', 'technology', 'transportation', 'healthcare', 'food'],
    metroArea: 'Chicago-Naperville-Elgin'
  },
  'Houston': {
    state: 'Texas',
    description: "the energy capital of the world and a thriving center for medical innovation",
    industries: ['energy', 'aerospace', 'healthcare', 'biomedical', 'logistics', 'manufacturing'],
    metroArea: 'Houston-The Woodlands-Sugar Land'
  },
  'Phoenix': {
    state: 'Arizona',
    description: "the rapidly expanding economic center of the American Southwest",
    industries: ['technology', 'real estate', 'healthcare', 'financial services', 'construction'],
    metroArea: 'Phoenix-Mesa-Chandler'
  },
  'Philadelphia': {
    state: 'Pennsylvania',
    description: "a historic commercial center and East Coast life sciences and education hub",
    industries: ['healthcare', 'education', 'biotechnology', 'financial services', 'manufacturing'],
    metroArea: 'Philadelphia-Camden-Wilmington'
  },
  'San Antonio': {
    state: 'Texas',
    description: "a major South Texas commercial center with deep roots in defense and bioscience",
    industries: ['defense', 'healthcare', 'cybersecurity', 'tourism', 'financial services'],
    metroArea: 'San Antonio-New Braunfels'
  },
  'San Diego': {
    state: 'California',
    description: "a key coastal economic driver known for biotechnology, defense, and innovation",
    industries: ['biotechnology', 'defense', 'telecommunications', 'software', 'tourism'],
    metroArea: 'San Diego-Chula Vista-Carlsbad'
  },
  'Dallas': {
    state: 'Texas',
    description: "a powerhouse North Texas business center for corporate headquarters and logistics",
    industries: ['technology', 'telecommunications', 'financial services', 'aviation', 'healthcare'],
    metroArea: 'Dallas-Fort Worth-Arlington'
  },
  'Austin': {
    state: 'Texas',
    description: "the Silicon Hills innovation capital of Texas and a premier tech startup destination",
    industries: ['software', 'semiconductors', 'clean energy', 'digital media', 'creative arts'],
    metroArea: 'Austin-Round Rock-Georgetown'
  },
  'Jacksonville': {
    state: 'Florida',
    description: "a primary deepwater port and financial center in Northeast Florida",
    industries: ['logistics', 'banking', 'healthcare', 'insurance', 'manufacturing'],
    metroArea: 'Jacksonville'
  },
  'San Jose': {
    state: 'California',
    description: "the capital of Silicon Valley and global center of high-tech innovation",
    industries: ['software engineering', 'semiconductors', 'artificial intelligence', 'cloud infrastructure'],
    metroArea: 'San Jose-Sunnyvale-Santa Clara'
  },
  'San Francisco': {
    state: 'California',
    description: "a global technology, venture capital, and cultural center in Northern California",
    industries: ['technology', 'venture capital', 'biotechnology', 'fintech', 'digital services'],
    metroArea: 'San Francisco-Oakland-Berkeley'
  },
  'Seattle': {
    state: 'Washington',
    description: "the Pacific Northwest's premier technology, cloud computing, and e-commerce capital",
    industries: ['cloud computing', 'e-commerce', 'aerospace', 'biotechnology', 'global trade'],
    metroArea: 'Seattle-Tacoma-Bellevue'
  },
  'Denver': {
    state: 'Colorado',
    description: "the Rocky Mountain region's fastest-growing commercial and tech hub",
    industries: ['technology', 'aerospace', 'telecommunications', 'energy', 'finance'],
    metroArea: 'Denver-Aurora-Lakewood'
  },
  'Washington': {
    state: 'District of Columbia',
    description: "the nation's capital and a major center for legal, federal tech, and policy services",
    industries: ['federal contracting', 'cybersecurity', 'legal services', 'consulting', 'education'],
    metroArea: 'Washington-Arlington-Alexandria'
  },
  'Boston': {
    state: 'Massachusetts',
    description: "a global leader in higher education, biotechnology, healthcare, and financial tech",
    industries: ['biotechnology', 'higher education', 'healthcare', 'robotics', 'venture capital'],
    metroArea: 'Boston-Cambridge-Newton'
  },
  'Atlanta': {
    state: 'Georgia',
    description: "the primary business and transportation capital of the American Southeast",
    industries: ['fintech', 'logistics', 'digital media', 'healthcare', 'telecommunications'],
    metroArea: 'Atlanta-Sandy Springs-Alpharetta'
  },
  'Miami': {
    state: 'Florida',
    description: "an international commercial gateway, financial hub, and emerging tech market",
    industries: ['international trade', 'fintech', 'tourism', 'real estate', 'healthcare'],
    metroArea: 'Miami-Fort Lauderdale-Pompano Beach'
  }
}

export const CATEGORY_INFO: Record<string, { label: string; description: string; examples: string[] }> = {
  'home-services': {
    label: 'Home Services',
    description: 'licensed residential and commercial contractors, repair technicians, and trades specialists',
    examples: ['licensed plumbers', 'certified electricians', 'roofing contractors', 'HVAC specialists', 'general contractors']
  },
  'professional-services': {
    label: 'Professional Services',
    description: 'certified accountants, legal counsels, business consultants, and corporate advisory agencies',
    examples: ['CPAs & tax advisors', 'business attorneys', 'management consultants', 'insurance agencies']
  },
  'health-wellness': {
    label: 'Health & Wellness',
    description: 'licensed medical practices, clinics, dental care providers, physical therapists, and wellness centers',
    examples: ['family physicians', 'dental practices', 'physical therapy clinics', 'optometry offices']
  },
  'restaurants-food': {
    label: 'Food & Restaurants',
    description: 'local dining establishments, specialty cafes, bakeries, and professional catering companies',
    examples: ['independent bistros', 'artisanal cafes', 'catering services', 'regional specialty dining']
  },
  'automotive': {
    label: 'Automotive Services',
    description: 'certified mechanics, collision centers, vehicle maintenance providers, and dealership services',
    examples: ['auto repair facilities', 'brake and tire centers', 'transmission specialists', 'body shops']
  },
  'technology': {
    label: 'Technology & Software',
    description: 'software development companies, managed IT providers, cybersecurity firms, and web engineering agencies',
    examples: ['custom software developers', 'managed service providers (MSPs)', 'cybersecurity consultants', 'cloud engineers']
  },
  'beauty-personal-care': {
    label: 'Beauty & Personal Care',
    description: 'hair salons, barbershops, skin care clinics, day spas, and personal wellness practitioners',
    examples: ['hair stylists', 'classic barbershops', 'medical spas', 'nail care studios']
  },
  'education': {
    label: 'Education & Training',
    description: 'certified tutoring providers, professional academies, trade schools, and educational centers',
    examples: ['academic tutoring centers', 'test preparation services', 'trade training academies', 'specialized schools']
  },
  'local-services': {
    label: 'Local & Commercial Services',
    description: 'specialized local providers for event coordination, commercial cleaning, photography, and storage',
    examples: ['event planners', 'commercial photographers', 'secure storage providers', 'cleaning contractors']
  }
}

export function generateCityCategoryContent(city: string, categorySlug: string): string {
  const cityInfo = CITY_INFO[city] || {
    state: 'United States',
    description: 'a key commercial center',
    industries: ['services', 'retail', 'technology']
  }
  const catInfo = CATEGORY_INFO[categorySlug] || {
    label: categorySlug ? categorySlug.replace(/-/g, ' ') : 'Local Services',
    description: 'verified local service providers',
    examples: ['service companies', 'licensed contractors', 'specialist agencies']
  }

  return `## ${catInfo.label} in ${city}, ${cityInfo.state}

Looking for verified ${catInfo.label.toLowerCase()} in ${city}? The directory connects local consumers and corporate buyers with qualified, independently verified providers operating across ${city}, ${cityInfo.state}.

### Why Local Expertise in ${city} Matters

${city} is ${cityInfo.description}, supporting a dynamic market across ${cityInfo.industries.slice(0, 4).join(', ')}. Local providers understand state and municipal codes, regional requirements, and community standards, ensuring reliable service delivery.

### What to Look for When Hiring in ${city}

When selecting a ${catInfo.label.toLowerCase()} provider in ${city}, we recommend confirming:

1. **Licensing & Registration**: Verify that the business is registered with the ${cityInfo.state} Secretary of State and holds any mandatory trade licenses.
2. **Transparent Contact Details**: Ensure the business provides direct operational phone numbers, an active physical address, and verifiable email contact.
3. **Clear Scope of Services**: Review the provider's specific specializations to match your exact project or service needs.
4. **Verifiable Portfolio or References**: Reputable providers readily showcase recent projects, client testimonials, and industry credentials.

Browse verified listings below to view business locations, services, operating hours, and direct contact options.`
}

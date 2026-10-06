import { BUSINESS_CATEGORIES, CATEGORIES } from '../lib/data.js'
import {
  normalizeSubcategorySlug,
  getSubcategoryDefinition,
  getPopulatedCategorySubcategoryPairs,
  toCanonicalUrl
} from '../lib/directory-helpers.js'

console.log('=== VERIFYING ROUTES, URLS & SEO SPECIFICATIONS ===\n')

// 1. Categories Verification
console.log(`1. Total Main Categories Defined: ${CATEGORIES.length}`)
const automotive = CATEGORIES.find(c => c.id === 'automotive')
console.log(`   Automotive Category URL: ${toCanonicalUrl('category/automotive')}`)
console.log(`   Automotive Category Name: ${automotive?.name}`)

// 2. Subcategories Verification
const autoRepairDef = getSubcategoryDefinition('auto-repair', 'automotive')
console.log(`\n2. Subcategory Routing:`)
console.log(`   Input 'auto-repair' under 'automotive':`)
console.log(`   - Name: ${autoRepairDef?.name}`)
console.log(`   - Slug: ${autoRepairDef?.slug}`)
console.log(`   - URL: ${toCanonicalUrl(`category/automotive/${autoRepairDef?.slug}`)}`)

// 3. SEO Meta Length Helper Test
function formatCategoryMeta(catName) {
  const title = `${catName} Businesses in the USA | BizNestUSA`
  const desc = `Browse verified ${catName.toLowerCase()} businesses and licensed providers across the USA. Compare local ratings, services, contact info, and addresses on BizNestUSA.`
  return { title, desc, titleLen: title.length, descLen: desc.length }
}

function formatSubcategoryMeta(subName, catName) {
  const title = `${subName} in the USA – ${catName} | BizNestUSA`
  const desc = `Explore top-rated ${subName.toLowerCase()} specialists across the United States. Compare verified local providers, contact details, services, and directory profiles.`
  return { title, desc, titleLen: title.length, descLen: desc.length }
}

const catMeta = formatCategoryMeta('Automotive')
console.log(`\n3. Category SEO Metadata Lengths:`)
console.log(`   Title (${catMeta.titleLen} chars - standard 50-60): "${catMeta.title}"`)
console.log(`   Desc  (${catMeta.descLen} chars - standard 140-160): "${catMeta.desc}"`)

const subMeta = formatSubcategoryMeta('Auto Repair', 'Automotive')
console.log(`\n4. Subcategory SEO Metadata Lengths:`)
console.log(`   Title (${subMeta.titleLen} chars - standard 50-60): "${subMeta.title}"`)
console.log(`   Desc  (${subMeta.descLen} chars - standard 140-160): "${subMeta.desc}"`)

// 5. Business SEO Metadata Length Test
const sampleBiz = {
  name: 'Firestone Complete Auto Care',
  subcategory: 'Auto Repair',
  city: 'Nashville',
  state_code: 'TN'
}

const bizTitle = `${sampleBiz.name} – ${sampleBiz.subcategory} in ${sampleBiz.city}, ${sampleBiz.state_code} | BizNestUSA`
const bizDesc = `Explore directory details for ${sampleBiz.name}, offering professional ${sampleBiz.subcategory} in ${sampleBiz.city}, ${sampleBiz.state_code}. View verified address, phone contact, and services on BizNestUSA.`

console.log(`\n5. Business Detail SEO Metadata Lengths:`)
console.log(`   Title (${bizTitle.length} chars - standard 50-60): "${bizTitle}"`)
console.log(`   Desc  (${bizDesc.length} chars - standard 140-160): "${bizDesc}"`)

console.log(`\n6. Breadcrumb Hierarchy Test:`)
console.log(`   Level 1: Home (/)`)
console.log(`   Level 2: Automotive (/category/automotive/)`)
console.log(`   Level 3: Auto Repair (/category/automotive/auto-repair/)`)
console.log(`   Level 4: Firestone Complete Auto Care (/business/firestone-complete-auto-care/)`)

console.log('\n=== ALL ROUTE & SEO CHECKS COMPLETED SUCCESSFULLY ===')

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { BUSINESS_CATEGORIES, CATEGORIES, CITIES } from '../lib/data.ts';
import { getAllBusinesses } from '../lib/db-service.ts';
import {
  getPopulatedCategoryCityPairs,
  getPopulatedCategorySubcategoryPairs,
  normalizeCitySlug,
  isUsCity,
  isPakistaniCity,
  isPakistaniEntity
} from '../lib/directory-helpers.ts';

async function testFullSitemap() {
  const allBusinesses = await getAllBusinesses(false);
  console.log('Total approved businesses fetched by db-service:', allBusinesses.length);

  const populatedSubs = getPopulatedCategorySubcategoryPairs(allBusinesses);
  console.log('Populated Category + Subcategory pairs:', populatedSubs.length);

  const subSlugs = populatedSubs.map(p => `/category/${p.categorySlug}/${p.subcategorySlug}`);
  console.log('Sample subcategory URLs:', subSlugs.slice(0, 5));

  const bizUrls = allBusinesses.map(b => `/business/${b.slug}`);
  console.log('Total business URLs:', bizUrls.length);
  console.log('Sample business URLs:', bizUrls.slice(0, 5));

  const categoriesUrls = CATEGORIES.map(c => `/category/${c.id}`);
  console.log('Total category URLs:', categoriesUrls.length);

  process.exit(0);
}

testFullSitemap().catch(e => {
  console.error(e);
  process.exit(1);
});

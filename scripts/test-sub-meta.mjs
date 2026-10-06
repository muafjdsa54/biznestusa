import { BUSINESS_CATEGORIES, CATEGORIES } from '../lib/data.ts';

export function formatSubcategoryTitle(sub, catName) {
  const candidates = [
    `${sub} in USA – ${catName} Directory | BizNestUSA`,
    `${sub} Services in USA – ${catName} | BizNestUSA`,
    `${sub} in the USA – ${catName} Directory | BizNestUSA`,
    `${sub} in the United States – ${catName} | BizNestUSA`,
    `Verified ${sub} in USA – ${catName} | BizNestUSA`,
    `${sub} Directory in the United States | BizNestUSA`,
    `${sub} in the USA – ${catName} | BizNestUSA Directory`,
    `${sub} Services in the USA | BizNestUSA Directory`,
    `Verified ${sub} Directory in USA | BizNestUSA`,
    `${sub} in USA – ${catName} | BizNestUSA`,
    `${sub} in USA | BizNestUSA Directory`
  ];

  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c;
  }

  for (const c of candidates) {
    if (c.length > 60) {
      const truncated = `${sub} in USA – ${catName}`.slice(0, 46).trim() + ' | BizNestUSA';
      if (truncated.length >= 50 && truncated.length <= 60) return truncated;
    }
  }

  const padded = `Top Verified ${sub} in the USA | BizNestUSA Directory`;
  if (padded.length >= 50 && padded.length <= 60) return padded;

  return `${sub} in USA – Official Business Directory | BizNestUSA`.slice(0, 60);
}

export function formatSubcategoryDescription(sub, catName) {
  const templates = [
    `Find verified ${sub.toLowerCase()} providers in the USA. Compare local business locations, contact numbers, services, and official profiles on BizNestUSA.`,
    `Discover verified ${sub.toLowerCase()} services in the USA. Explore local business addresses, phone numbers, customer details, and profiles on BizNestUSA.`,
    `Explore top-rated ${sub.toLowerCase()} in the USA. Compare local business locations, verified phone numbers, specialized services, and profiles on BizNestUSA.`,
    `Browse licensed ${sub.toLowerCase()} specialists across the USA. View verified business addresses, phone contacts, service options, and profiles on BizNestUSA.`,
    `Find verified ${sub.toLowerCase()} in the USA. Compare top local locations, contact details, services, and directory profiles on BizNestUSA.`
  ];

  for (const t of templates) {
    if (t.length >= 140 && t.length <= 160) return t;
  }

  for (const t of templates) {
    if (t.length > 160) {
      const trimmed = t.slice(0, 156);
      const lastSpace = trimmed.lastIndexOf(' ');
      return trimmed.slice(0, lastSpace) + '...';
    }
  }

  // If slightly short, pad with standard phrase
  const shortT = `Find verified ${sub.toLowerCase()} providers and specialists in the USA. Compare local business locations, contact details, and profiles on BizNestUSA.`;
  if (shortT.length >= 140 && shortT.length <= 160) return shortT;

  return templates[0];
}

let titleOutliers = 0;
let descOutliers = 0;

for (const cat of BUSINESS_CATEGORIES) {
  for (const sub of cat.subcategories) {
    const title = formatSubcategoryTitle(sub, cat.name);
    const desc = formatSubcategoryDescription(sub, cat.name);
    if (title.length < 50 || title.length > 60) {
      titleOutliers++;
      console.log(`Sub Title Outlier (${title.length}): ${title}`);
    }
    if (desc.length < 140 || desc.length > 160) {
      descOutliers++;
      console.log(`Sub Desc Outlier (${desc.length}): ${desc}`);
    }
  }
}

console.log('Subcategory Title outliers (outside 50-60 chars):', titleOutliers);
console.log('Subcategory Desc outliers (outside 140-160 chars):', descOutliers);

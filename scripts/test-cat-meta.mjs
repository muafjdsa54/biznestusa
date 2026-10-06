import { CATEGORIES } from '../lib/data.ts';

function formatCategoryTitle(name) {
  const candidates = [
    `${name} Businesses in the USA | BizNestUSA`,
    `${name} Directory & Businesses in USA | BizNestUSA`,
    `${name} Businesses & Directory in USA | BizNestUSA`,
    `${name} in the United States | BizNestUSA Directory`,
    `Verified ${name} Businesses in USA | BizNestUSA`,
    `${name} Directory | BizNestUSA Directory`,
    `${name} | BizNestUSA Business Directory`
  ];

  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c;
  }
  for (const c of candidates) {
    if (c.length > 60) {
      const truncated = `${name} Businesses in the USA`.slice(0, 46).trim() + ' | BizNestUSA';
      if (truncated.length >= 50 && truncated.length <= 60) return truncated;
    }
  }
  return `${name} – Official Directory | BizNestUSA`.slice(0, 60);
}

function formatCategoryDescription(name) {
  const templates = [
    `Browse verified ${name.toLowerCase()} businesses across the USA. Compare top local companies, service specialties, contact details, and addresses on BizNestUSA.`,
    `Find verified ${name.toLowerCase()} providers across the USA. Explore local company ratings, verified contact numbers, addresses, and profiles on BizNestUSA.`,
    `Discover top-rated ${name.toLowerCase()} companies across the USA. Compare verified local business profiles, services, phone contacts, and details on BizNestUSA.`
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
  return templates[0];
}

let titleOutliers = 0;
let descOutliers = 0;

for (const cat of CATEGORIES) {
  const title = formatCategoryTitle(cat.name);
  const desc = formatCategoryDescription(cat.name);
  if (title.length < 50 || title.length > 60) {
    titleOutliers++;
    console.log(`Cat Title Outlier (${title.length}): ${title}`);
  }
  if (desc.length < 140 || desc.length > 160) {
    descOutliers++;
    console.log(`Cat Desc Outlier (${desc.length}): ${desc}`);
  }
}

console.log('Category Title outliers (outside 50-60 chars):', titleOutliers);
console.log('Category Desc outliers (outside 140-160 chars):', descOutliers);

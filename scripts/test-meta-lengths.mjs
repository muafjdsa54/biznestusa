import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('biznestusa-seed-businesses.json', 'utf8'));

export function formatBusinessTitle(biz, fallbackName) {
  const name = (biz?.business_name || biz?.name || fallbackName || '').trim();
  const subOrCat = (biz?.subcategory || biz?.subCategory || biz?.category || 'Services').trim();
  const loc = (biz?.city ? `${biz.city}${biz?.state_code || biz?.state ? `, ${biz.state_code || biz.state}` : ''}` : 'USA').trim();

  // Try various suffix and branding combinations
  const brandings = [
    ' | BizNestUSA',
    ' – BizNestUSA',
    ' | BizNest USA',
    ' on BizNestUSA',
    ' – Directory'
  ];

  // Candidates sorted by priority
  const candidates = [
    // 1. Name + Subcategory + Location + Branding
    `${name} – ${subOrCat} in ${loc} | BizNestUSA`,
    `${name} – ${subOrCat} Services in ${loc} | BizNestUSA`,
    `${name} – ${subOrCat} in ${loc} – BizNestUSA`,
    `${name} – ${subOrCat} in ${loc} on BizNestUSA`,
    
    // 2. Name + Subcategory + Branding
    `${name} – ${subOrCat} Services | BizNestUSA`,
    `${name} – ${subOrCat} | BizNestUSA`,
    `${name} – ${subOrCat} Directory | BizNestUSA`,
    `${name} – ${subOrCat} Profile | BizNestUSA`,

    // 3. Name + Location + Branding
    `${name} in ${loc} | BizNestUSA Directory`,
    `${name} in ${loc} – BizNestUSA Directory`,
    `${name} in ${loc} | BizNestUSA`,

    // 4. Name + Directory Branding
    `${name} – Official Business Profile | BizNestUSA`,
    `${name} – Directory Profile | BizNestUSA`,
    `${name} – Verified Business | BizNestUSA`,
    `${name} | BizNestUSA Business Directory`,
    `${name} | BizNestUSA Directory Profile`,
    `${name} – Local Business Directory | BizNestUSA`
  ];

  // First pass: exact 50-60 range
  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c;
  }

  // Second pass: if slightly under 50, pad nicely
  for (const c of candidates) {
    if (c.length >= 40 && c.length < 50) {
      // Add filler
      const withUSA = c.replace(' | BizNestUSA', ' in the USA | BizNestUSA');
      if (withUSA.length >= 50 && withUSA.length <= 60) return withUSA;

      const withOfficial = c.replace(`${name} – `, `${name} – Official `);
      if (withOfficial.length >= 50 && withOfficial.length <= 60) return withOfficial;

      const withVerified = c.replace(`${name} – `, `${name} – Verified `);
      if (withVerified.length >= 50 && withVerified.length <= 60) return withVerified;

      const withDirectory = c.replace(' | BizNestUSA', ' | BizNestUSA Directory');
      if (withDirectory.length >= 50 && withDirectory.length <= 60) return withDirectory;
    }
  }

  // If still not matching (e.g. very long name), trim cleanly
  for (const c of candidates) {
    if (c.length > 60) {
      // Find a truncation before 60
      const brand = ' | BizNestUSA';
      const maxPrefixLen = 60 - brand.length; // 47
      if (name.length <= maxPrefixLen) {
        const title = `${name} – ${subOrCat}`.slice(0, maxPrefixLen).trim() + brand;
        if (title.length >= 50 && title.length <= 60) return title;
      } else {
        const title = name.slice(0, maxPrefixLen - 3).trim() + '...' + brand;
        if (title.length >= 50 && title.length <= 60) return title;
      }
    }
  }

  // Fallback guaranteed 50-60 chars
  const base = `${name} | BizNestUSA Directory`;
  if (base.length >= 50 && base.length <= 60) return base;
  if (base.length < 50) {
    return `${name} – Official USA Business Profile | BizNestUSA`.slice(0, 60);
  }
  return base.slice(0, 46).trim() + ' | BizNestUSA';
}

export function formatBusinessDescription(biz, fallbackName) {
  const name = (biz?.business_name || biz?.name || fallbackName || '').trim();
  const subOrCat = (biz?.subcategory || biz?.subCategory || biz?.category || 'services').trim();
  const loc = biz?.city ? `in ${biz.city}${biz?.state_code || biz?.state ? `, ${biz.state_code || biz.state}` : ''}` : 'in the USA';

  const templates = [
    `Explore directory details for ${name}, offering professional ${subOrCat} ${loc}. View verified address, phone contact, and services on BizNestUSA.`,
    `Find ${name} ${loc}. View public contact details, address, ${subOrCat} services, and directory listing information on BizNestUSA.`,
    `Discover ${name} offering trusted ${subOrCat} ${loc}. Access verified address, phone number, operating details, and public profile on BizNestUSA.`,
    `Looking for ${subOrCat} ${loc}? Browse directory profile, verified address, phone number, and services for ${name} on BizNestUSA.`,
    `Connect with ${name} for ${subOrCat} ${loc}. View verified business contact numbers, address, operating hours, and profile on BizNestUSA.`
  ];

  for (const t of templates) {
    if (t.length >= 140 && t.length <= 160) return t;
  }

  // If longer than 160, trim cleanly at word boundary
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

raw.forEach(b => {
  const title = formatBusinessTitle(b, b.business_name);
  const desc = formatBusinessDescription(b, b.business_name);
  if (title.length < 50 || title.length > 60) {
    titleOutliers++;
    console.log(`[TITLE OUTLIER: ${title.length}] ${title}`);
  }
  if (desc.length < 140 || desc.length > 160) {
    descOutliers++;
    console.log(`[DESC OUTLIER: ${desc.length}] ${desc}`);
  }
});

console.log(`\nTested ${raw.length} records:`);
console.log(`Title outliers (outside 50-60 chars): ${titleOutliers}`);
console.log(`Desc outliers (outside 140-160 chars): ${descOutliers}`);

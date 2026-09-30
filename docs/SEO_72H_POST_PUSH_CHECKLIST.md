# SEO 72-Hour Post-Push Checklist

Use this checklist immediately after deployment to accelerate indexing, improve CTR, and validate business listing visibility.

## 0-24 Hours (Critical)

- [ ] Deploy latest `main` branch to production.
- [ ] Confirm redirects work:
  - [ ] `/add-bussiness` -> `/add-business`
  - [ ] `/category/{slug}` -> `/categories/{slug}`
  - [ ] `/businesses/{city}/{category}` -> `/locations/{city}/{category}`
- [ ] Open `https://www.listpak.com/sitemap.xml` and verify it loads.
- [ ] Submit sitemap in Google Search Console.
- [ ] Inspect and request indexing for:
  - [ ] Home page (`/`)
  - [ ] Top 5 category pages (`/categories/{slug}`)
  - [ ] Top 10 location-category pages (`/locations/{city}/{category}`)
  - [ ] 10 high-quality business profile pages
- [ ] Validate robots file allows crawling of `/categories`, `/locations`, `/cities`, and business pages.
- [ ] Manual QA: submit 1 new business and verify it appears on:
  - [ ] `/categories/{category}`
  - [ ] `/locations/{city}/{category}`
  - [ ] `/{business-slug}`

## 24-48 Hours (Visibility Push)

- [ ] Publish at least 20 fresh/updated business listings across multiple cities.
- [ ] Add internal links from homepage sections to highest-priority categories.
- [ ] Ensure each top category page links to at least 10 location-category pages.
- [ ] Ensure each business page links to:
  - [ ] Parent category page
  - [ ] Parent city page
  - [ ] Related businesses
- [ ] Verify no orphan pages in crawl (Screaming Frog or GSC pages report).
- [ ] Check Coverage report for new indexed pages.
- [ ] Check Performance report for impression growth on new URLs.

## 48-72 Hours (CTR + Scale)

- [ ] Update title/meta on low-CTR pages (target clear commercial intent).
- [ ] Add FAQ blocks on top category and location pages.
- [ ] Add/verify JSON-LD on major templates:
  - [ ] `BreadcrumbList`
  - [ ] `ItemList`
  - [ ] `LocalBusiness` for business pages
- [ ] Publish 10 more city-category pages with unique intro content.
- [ ] Re-submit sitemap after content updates.
- [ ] Re-request indexing for highest-priority newly updated pages.

## Daily KPI Tracking (First 7 Days)

- [ ] Impressions/day
- [ ] Clicks/day
- [ ] CTR by page group (home, category, location, business)
- [ ] New pages indexed
- [ ] New business submissions

## Quick Success Criteria

- [ ] New business records appear instantly in matching category/location pages.
- [ ] Category and location pages are indexable and internally linked within 3 clicks.
- [ ] GSC starts showing rising impressions on `/categories/*` and `/locations/*` pages.
- [ ] Organic clicks trend up with improved titles/meta and richer snippets.

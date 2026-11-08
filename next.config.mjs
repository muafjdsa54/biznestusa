/** @type {import('next').NextConfig} */

// Content-Security-Policy value, shared by the enforced header and the
// Report-Only header below so the two can never drift apart. Kept
// permissive by design — see the trace comment on the enforced header.
const CSP_VALUE = "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: wss:; font-src 'self' https: data:; frame-src https:; object-src 'none'; base-uri 'self'; form-action 'self'"

const nextConfig = {
  trailingSlash: true,
  compress: true,
  reactStrictMode: true,
  // Perf: drop the X-Powered-By response header (saves bytes per response,
  // no functional effect).
  poweredByHeader: false,

  // Perf: strip console.log/info/debug calls from the production client
  // bundle (9 call sites in app/lib/components today). console.error and
  // console.warn are kept so real errors still surface in production.
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'recharts',
      'date-fns',
    ],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.imrandigitals.com',
      },
      {
        protocol: 'https',
        hostname: 'imrandigitals.com',
      },
    ],
  },

  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return []
    }
    return [
      {
        source: '/:path*\\.(png|jpg|jpeg|webp|avif|svg|ico|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/((?!_next|api).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Strict-Transport-Security: force HTTPS for 1 year, including
          // subdomains, and opt into preload eligibility. Only sent in
          // production (this headers() already returns [] outside it).
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content-Security-Policy — PERMISSIVE BY DESIGN (see below).
          // script/style allow 'unsafe-inline' + any https: origin because
          // the app loads Firebase, Google Fonts and Microsoft Clarity
          // from third-party CDNs and uses inline scripts/styles; a
          // strict nonce/hash CSP would break those integrations today.
          // It still blocks the dangerous cases a directory site cares
          // about: no http: scripts, no data:/blob: scripts, no
          // object/embed, no form posts off-site, and frames only over
          // https:. Tightening to an allow-list of exact hosts is a
          // follow-up once every third-party origin is inventoried.
          // TRACED 2026-11-08 (round-2 hardening worker) — tightening
          // was evaluated and DELIBERATELY NOT done, because each
          // permissive piece is forced by live code, not habit:
          // (a) script-src 'unsafe-inline' is forced by 53 inline
          // <script> tags — JSON-LD blocks on ~every page via
          // dangerouslySetInnerHTML (e.g. app/layout.tsx:98-101, plus
          // app/page.tsx:180, app/blog/[slug]/page.tsx:158-169,
          // app/business/[slug]/page.tsx:428-439) — plus the inline
          // Clarity bootstrap (app/layout.tsx:102-110) and the inline
          // gtag config (app/layout.tsx:120-127). Removing it needs a
          // per-request nonce plumbed through middleware AND a nonce
          // attribute on every JSON-LD script — a refactor, not a
          // config tweak — and a blocked JSON-LD/Clarity/GA failure is
          // silent, so it cannot be verified without running the app.
          // (b) style-src 'unsafe-inline' is forced by React inline
          // style={{}} attributes (CSP blocks style attributes without
          // it): app/add-business/add-business-client.tsx:2461,
          // components/ui/progress.tsx:25, components/ui/chart.tsx:294,
          // components/business/lazy-map.tsx:69, plus the runtime
          // <style> block in components/ui/chart.tsx:82-83.
          // (c) The https: wildcard cannot be narrowed to an allow-list
          // without a runtime inventory: external script/connect origins
          // span www.clarity.ms (layout.tsx:106, injected dynamically),
          // www.googletagmanager.com (layout.tsx:117) + GA beacons,
          // challenges.cloudflare.com (components/turnstile-widget.tsx:28,
          // dynamically injected Turnstile api.js), and the Firebase
          // client SDK endpoints (firestore.googleapis.com,
          // identitytoolkit.googleapis.com, securetoken.googleapis.com,
          // firebasestorage.googleapis.com). A missed origin silently
          // breaks Turnstile/Clarity/GA/Firebase. Revisit only with a
          // running app + CSP-Report-Only pass first.
          {
            key: 'Content-Security-Policy',
            value: CSP_VALUE,
          },
          // Content-Security-Policy-Report-Only — REPORT-ONLY PASS
          // (2026-11-08, round 3). Same policy as the enforced header,
          // but violations are only REPORTED, never blocked: nothing
          // breaks and no page behavior changes. What it would flag:
          // every request that WOULD be blocked if this policy were
          // enforced — the inline <script> blocks (53 JSON-LD /
          // Clarity / gtag bootstraps) and React inline style={{}}
          // attributes under 'unsafe-inline', plus any load from an
          // origin outside the policy. No report-uri / report-to
          // endpoint is configured, so violations surface in the
          // browser console (DevTools → Console / Issues); add a
          // report-uri endpoint before relying on collected reports.
          // Prerequisite for ENFORCEMENT (do NOT flip this to enforced
          // without both): (1) a per-request nonce plumbed through
          // middleware + a nonce attribute on every JSON-LD script
          // (app/layout.tsx, app/page.tsx, blog/business detail pages)
          // and the Clarity/gtag bootstraps, replacing script-src
          // 'unsafe-inline'; (2) a runtime origin inventory (Clarity,
          // GTM/GA, Turnstile, Firebase endpoints) so the https:
          // wildcard can be narrowed to an allow-list — a missed origin
          // silently breaks Turnstile/Clarity/GA/Firebase. Read the
          // console reports first, then decide.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: CSP_VALUE,
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/category/electricians/',
        destination: '/services/electricians/',
        permanent: true,
      },
      {
        source: '/category/electricians',
        destination: '/services/electricians/',
        permanent: true,
      },
      {
        source: '/category/plumbers/',
        destination: '/services/plumbers/',
        permanent: true,
      },
      {
        source: '/category/plumbers',
        destination: '/services/plumbers/',
        permanent: true,
      },
      {
        source: '/category/roofers/',
        destination: '/services/roofers/',
        permanent: true,
      },
      {
        source: '/category/roofers',
        destination: '/services/roofers/',
        permanent: true,
      },
      // Issue 1: Canonical 301 redirects for duplicate subcategories
      {
        source: '/category/home-services/general-contractor/:path*',
        destination: '/category/construction/general-contractor/',
        permanent: true,
      },
      {
        source: '/category/professional-services/insurance-agency/:path*',
        destination: '/category/finance/insurance-agency/',
        permanent: true,
      },
      {
        source: '/category/professional-services/real-estate-agency/:path*',
        destination: '/category/real-estate/real-estate-agency/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/physical-therapist/:path*',
        destination: '/category/health-wellness/physical-therapist/',
        permanent: true,
      },
      {
        source: '/category/local-services/event-planner/:path*',
        destination: '/category/events-weddings/event-planner/',
        permanent: true,
      },
      {
        source: '/category/skilled-trades/plumber/:path*',
        destination: '/category/home-services/plumber/',
        permanent: true,
      },
      {
        source: '/category/skilled-trades/roofer/:path*',
        destination: '/category/home-services/roofer/',
        permanent: true,
      },
      {
        source: '/category/skilled-trades/electrician/:path*',
        destination: '/category/home-services/electrician/',
        permanent: true,
      },
      {
        source: '/category/business-finance-professionals/accountant/:path*',
        destination: '/category/professional-services/accountant/',
        permanent: true,
      },
      {
        source: '/category/legal-professionals/attorney/:path*',
        destination: '/category/professional-services/attorney/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/dentist/:path*',
        destination: '/category/health-wellness/dentist/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/doctor/:path*',
        destination: '/category/health-wellness/doctor/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/therapist/:path*',
        destination: '/category/health-wellness/therapist/',
        permanent: true,
      },
      // Issue 7: Dead URL redirection
      {
        source: '/business/verified-business/:path*',
        destination: '/business-directory/',
        permanent: true,
      },
    ]
  },

  async rewrites() {
    return [
      {
        source: '/businesses/:slug/',
        destination: '/business/:slug/',
      },
      {
        source: '/businesses/:slug',
        destination: '/business/:slug/',
      },
    ]
  },
}

export default nextConfig

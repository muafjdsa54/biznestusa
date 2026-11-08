import Script from 'next/script'

/**
 * Google Tag Manager — BizNestUSA container.
 *
 * Container ID is a PUBLIC page-source identifier (not a secret), so the
 * id ships as a code default with an env override:
 *   NEXT_PUBLIC_GTM_ID — set in the Vercel dashboard env to override.
 * No GA4 measurement ID is invented or loaded here: the GA4 tag (if any)
 * lives INSIDE the GTM container. Do NOT add direct gtag loading
 * alongside GTM — it would double-count if the container already
 * fires GA4.
 *
 * Renders:
 *  - <head>: the standard GTM snippet (dataLayer init + async gtm.js).
 *  - <body> top: the standard <noscript> iframe fallback.
 * Both parts must be rendered (head part via <GoogleTagManager />,
 * body part via <GoogleTagManagerNoscript /> immediately after <body>).
 */
const DEFAULT_GTM_ID = 'GTM-TC32SRS6'

export function getGtmId(): string {
  return (process.env.NEXT_PUBLIC_GTM_ID || DEFAULT_GTM_ID).trim()
}

export function GoogleTagManager() {
  const id = getGtmId()
  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${id}');
      `}
    </Script>
  )
}

export function GoogleTagManagerNoscript() {
  const id = getGtmId()
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

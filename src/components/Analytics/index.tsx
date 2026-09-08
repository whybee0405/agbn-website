'use client'

import Script from 'next/script'
import React, { useEffect, useState } from 'react'
import { CONSENT_EVENT, ConsentValue, getConsent } from '@/lib/consent'

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID

export const Analytics: React.FC = () => {
  const [consent, setConsentState] = useState<ConsentValue | null>(null)

  useEffect(() => {
    setConsentState(getConsent())
    const onChange = (e: Event) => setConsentState((e as CustomEvent<ConsentValue>).detail)
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  return (
    <>
      {/* Plausible is cookieless, so it loads unconditionally once configured. */}
      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.outbound-links.js"
          strategy="afterInteractive"
        />
      )}

      {/* GA4 sets cookies, so it only loads once the visitor has accepted. */}
      {GA4_ID && consent === 'accepted' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}');
            `}
          </Script>
        </>
      )}
    </>
  )
}

export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  const plausible = (window as unknown as { plausible?: (n: string, o?: object) => void })
    .plausible
  if (plausible) plausible(name, { props })
}

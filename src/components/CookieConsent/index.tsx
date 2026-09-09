'use client'

import React from 'react'
import { setConsent } from '@/lib/consent'
import { useConsent } from '@/hooks/useConsent'

// Plausible is cookieless, so it needs no consent gate. This banner only
// appears when GA4 (which does use cookies) is actually configured —
// per Brand DNA / Section 9, never ship a banner for tracking that isn't running.
const GA4_ENABLED = Boolean(process.env.NEXT_PUBLIC_GA4_ID)

export const CookieConsent: React.FC = () => {
  const consent = useConsent()
  if (!GA4_ENABLED || consent !== null) return null

  const decide = (value: 'accepted' | 'declined') => {
    setConsent(value)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline-dark bg-surface-brand p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-on-dark"
    >
      <div className="container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="measure text-body-s text-on-dark-muted">
          We use Google Analytics cookies to understand how visitors use this site. You can
          accept or decline.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide('declined')}
            className="h-11 rounded-md border border-white/32 px-5 text-body-s text-white transition-colors hover:border-gold hover:bg-white/10 active:translate-y-px"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide('accepted')}
            className="h-11 rounded-md bg-gold px-5 text-body-s font-semibold text-navy transition-colors hover:bg-ember active:translate-y-px"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

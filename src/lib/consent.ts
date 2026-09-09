export const CONSENT_KEY = 'agbn-cookie-consent'
export const CONSENT_EVENT = 'agbn-consent-changed'

export type ConsentValue = 'accepted' | 'declined'
let transientConsent: ConsentValue | null = null

export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(CONSENT_KEY)
    return value === 'accepted' || value === 'declined' ? value : transientConsent
  } catch { return transientConsent }
}

export function setConsent(value: ConsentValue) {
  transientConsent = value
  try { window.localStorage.setItem(CONSENT_KEY, value) } catch { /* Session consent still works when storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}

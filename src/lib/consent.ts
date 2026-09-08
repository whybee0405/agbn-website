export const CONSENT_KEY = 'agbn-cookie-consent'
export const CONSENT_EVENT = 'agbn-consent-changed'

export type ConsentValue = 'accepted' | 'declined'

export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(CONSENT_KEY) as ConsentValue | null
}

export function setConsent(value: ConsentValue) {
  window.localStorage.setItem(CONSENT_KEY, value)
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}

'use client'
import { useSyncExternalStore } from 'react'
import { CONSENT_EVENT, getConsent, type ConsentValue } from '@/lib/consent'

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => { window.removeEventListener(CONSENT_EVENT, callback); window.removeEventListener('storage', callback) }
}
const serverSnapshot = () => 'pending' as const
export function useConsent() { return useSyncExternalStore<ConsentValue | null | 'pending'>(subscribe, getConsent, serverSnapshot) }

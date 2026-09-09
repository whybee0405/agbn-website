'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { XIcon } from 'lucide-react'

/**
 * Shows a persistent join prompt once the visitor is past the hero on mobile.
 *
 * The previous version ran `window.addEventListener('scroll')` and wrote to
 * React state on every frame, re-rendering the tree throughout the scroll. This
 * uses a zero-height sentinel and an IntersectionObserver instead: the browser
 * tells us once when the sentinel leaves the viewport, and nothing runs in
 * between.
 */
export const StickyMobileCTA: React.FC = () => {
  const pathname = usePathname()
  return pathname === '/' ? <HomeStickyCTA /> : null
}

const HomeStickyCTA: React.FC = () => {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [pastHero, setPastHero] = useState(false)
  const [coveredBySection, setCoveredBySection] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const el = document.getElementById('home-hero') || sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sections = ['how-it-works', 'home-app-preview']
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
    if (sections.length === 0) return

    const visible = new Set<HTMLElement>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target as HTMLElement)
          else visible.delete(entry.target as HTMLElement)
        })
        setCoveredBySection(visible.size > 0)
      },
      { threshold: 0.12 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const visible = pastHero && !coveredBySection && !dismissed
  const hiddenFromAT = !visible

  return (
    <>
      {/* Sits roughly one hero-height down the page and is never painted. */}
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute top-[480px] h-px w-px" />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out lg:hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={hiddenFromAT}
      >
        <div className="flex items-center gap-3 border-t border-hairline-dark bg-surface-brand px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(6_20_38/0.35)]">
          <p className="flex-1 text-body-s font-medium text-white">Turn your network into income.</p>
          <Link
            href="/join"
            tabIndex={hiddenFromAT ? -1 : undefined}
            className="inline-flex h-11 shrink-0 items-center rounded-md bg-gold px-4 text-body-s font-semibold text-navy active:translate-y-px"
          >
            Join AGBN
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            tabIndex={hiddenFromAT ? -1 : undefined}
            onClick={() => setDismissed(true)}
            /* Was `text-slate-500` on navy: about 2.6:1, effectively invisible.
               Slate 200 held back with opacity keeps it subordinate and legible. */
            className="-mr-1 flex size-11 shrink-0 items-center justify-center text-on-dark-muted transition-colors hover:text-white"
          >
            <XIcon size={18} />
          </button>
        </div>
      </div>
    </>
  )
}

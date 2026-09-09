'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/utilities/ui'

type Props = {
  children: React.ReactNode
  /** Stagger offset in ms. Keep the ladder short: 60-80ms per item reads best. */
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'section'
}

/**
 * A single-purpose client leaf for entrance motion.
 *
 * Content renders visible on the server and is only hidden once this island
 * has hydrated, so the page is never blank for users without JS. Uses
 * IntersectionObserver rather than a scroll listener: no per-frame React
 * state, nothing to throttle, and it disconnects after firing once.
 *
 * Brand DNA §5.7 asks for one orchestrated moment per page, so this is used
 * on the section that carries the page's argument, not on everything.
 */
export const Reveal: React.FC<Props> = ({ children, delay = 0, className, as: Tag = 'div' }) => {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const setState = (state: 'pending' | 'shown') => { el.dataset.reveal = state }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState('shown')
      return
    }

    // Already in view on first paint (above the fold): show without waiting
    // for a scroll that may never come.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.9) {
      setState('pending')
      const raf = requestAnimationFrame(() => setState('shown'))
      return () => cancelAnimationFrame(raf)
    }

    setState('pending')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('shown')
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    )
    observer.observe(el)

    // Safety net. If the observer never fires (an ancestor was display:none
    // when we started observing, a headless renderer that does not scroll, a
    // print stylesheet), the content reveals itself anyway. Entrance motion is
    // never allowed to be the reason something is unreadable.
    const failsafe = window.setTimeout(() => {
      setState('shown')
      observer.disconnect()
    }, 2500)

    return () => {
      window.clearTimeout(failsafe)
      observer.disconnect()
    }
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={className && cn(className)}
    >
      {children}
    </Tag>
  )
}

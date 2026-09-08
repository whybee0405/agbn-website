'use client'

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/**
 * Counts a figure up to its real value when it scrolls into view.
 *
 * Brand DNA §5.7 asks that motion mean something. A number climbing to its
 * value reads as accumulation, which is what these figures describe. It is
 * also now the page's one orchestrated moment: the hero's self-drawing network
 * map was replaced by a static image, so that slot was free.
 *
 * The hard requirement on a trust section is that it must never display a
 * number that is not the real one. Three things enforce that:
 *
 *  - the server renders the FINAL value, so no-JS, print, and crawlers all see
 *    the true figure and never a zero,
 *  - the reset to zero happens in a layout effect, before paint, so the real
 *    value is never briefly shown and then snatched away,
 *  - a failsafe timer forces the final value if the observer never fires
 *    (an ancestor hidden at observe time, a headless renderer that never
 *    scrolls). Being stuck on "0 members" would be worse than no animation.
 */

// useLayoutEffect warns when React renders a client component on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Slower than feels necessary on paper. This band sits high enough that it is
 * usually already on screen when the page loads, so the count runs while the
 * hero images are still settling and the visitor's eye is elsewhere. A 1.1s
 * count finished before anyone looked at it.
 */
const DURATION_MS = 1600

/** Lets the page settle before the figures start moving. */
const START_DELAY_MS = 400

const FAILSAFE_MS = 3600

/** Splits "$128,000" into prefix/number/suffix so only the digits animate. */
function parse(value: string | number) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { prefix: '', target: value, suffix: '', decimals: 0 } : null
  }
  const match = value.trim().match(/^(\D*?)(\d[\d,\s]*(?:\.\d+)?)(.*)$/s)
  if (!match) return null

  const [, prefix, digits, suffix] = match
  const target = Number(digits.replace(/[,\s]/g, ''))
  if (!Number.isFinite(target)) return null

  const dot = digits.indexOf('.')
  return { prefix, target, suffix, decimals: dot === -1 ? 0 : digits.length - dot - 1 }
}

// Explicit locale: a locale-dependent format would differ between the server
// render and the client and trip a hydration mismatch.
const format = (n: number, decimals: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)

type Props = {
  value: string | number
  /** Stagger offset in ms, so the figures do not all move as one block. */
  delay?: number
  /**
   * Appended after the figure, e.g. "+". Kept as a prop rather than baked in
   * so a stat that is an exact count can opt out — see the note in page.tsx.
   */
  suffix?: string
  className?: string
}

export const StatCounter: React.FC<Props> = ({ value, delay = 0, suffix = '', className }) => {
  // Memoised deliberately. Parsing inline returns a fresh object on every
  // render, and this value is an effect dependency — so each animation frame
  // re-ran the effect, which reset the display back to zero. The counter sat
  // on 0 permanently.
  const parsed = useMemo(() => parse(value), [value])
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState<number | null>(parsed ? parsed.target : null)

  const target = parsed?.target ?? 0
  const decimals = parsed?.decimals ?? 0

  useIsomorphicLayoutEffect(() => {
    if (!parsed) return
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return

    let raf = 0
    let startTimer = 0
    let done = false
    const finish = () => {
      done = true
      window.clearTimeout(startTimer)
      cancelAnimationFrame(raf)
      setDisplay(target)
    }

    // Before paint, so the final value is never visibly replaced by zero.
    setDisplay(0)

    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        if (done) return
        const p = Math.min(1, (now - start) / DURATION_MS)
        // ease-out-expo, matching --ease-out-expo used elsewhere on the site
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
        setDisplay(target * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
        else done = true
      }
      raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect()
            startTimer = window.setTimeout(run, START_DELAY_MS + delay)
          }
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)

    const failsafe = window.setTimeout(finish, FAILSAFE_MS + delay)

    return () => {
      window.clearTimeout(failsafe)
      window.clearTimeout(startTimer)
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [parsed, target, delay])

  // Anything that isn't a recognisable number (a range, a word) is shown
  // verbatim rather than guessed at.
  if (!parsed || display === null) {
    return (
      <span className={className}>
        {value}
        {suffix}
      </span>
    )
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {format(display, decimals)}
      {parsed.suffix}
      {suffix}
    </span>
  )
}

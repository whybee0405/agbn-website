'use client'

import { useEffect } from 'react'

/**
 * Fallback parallax driver for browsers without scroll-driven CSS animations.
 *
 * The effect is defined in `globals.css` and runs off the main thread wherever
 * `animation-timeline: scroll()` is supported (Chromium, Safari 26+). Firefox
 * does not ship it by default, so without this those visitors saw a completely
 * static hero — which is what "I don't see any changes" looks like if you are
 * not on Chrome.
 *
 * This mounts nothing and renders nothing. It only attaches a listener when
 * the CSS path is unavailable, so supporting browsers pay nothing for it.
 *
 * Values are kept in sync with the keyframes by hand. They are expressed as a
 * fraction of the layer's own height, exactly like the percentage translations
 * in the CSS, so the two paths stay visually identical.
 */

const RANGE_PX = 672 // matches `animation-range: 0 42rem`

// [from, to] as a fraction of element height — mirrors the CSS keyframes.
const LAYERS: { selector: string; from: number; to: number; scale?: number; fade?: boolean }[] = [
  { selector: '.agbn-hero-back', from: 0, to: 0.11, scale: 1.26 },
  { selector: '.agbn-hero-mid', from: 0, to: 0.045 },
  { selector: '.agbn-hero-fore', from: 0, to: -0.14, fade: true },
]

export const HeroParallax: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Supporting browsers already run this off the main thread. Do not double-drive it.
    if (window.CSS?.supports?.('animation-timeline', 'scroll()')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = LAYERS.map((l) => ({
      ...l,
      el: document.querySelector<HTMLElement>(l.selector),
    })).filter((t): t is typeof t & { el: HTMLElement } => t.el !== null)

    if (targets.length === 0) return

    let raf = 0
    const apply = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / RANGE_PX))
      for (const t of targets) {
        const offset = (t.from + (t.to - t.from) * p) * t.el.offsetHeight
        t.el.style.transform = t.scale
          ? `scale(${t.scale}) translate3d(0, ${offset}px, 0)`
          : `translate3d(0, ${offset}px, 0)`
        if (t.fade) {
          // Held opaque until 38%, matching the keyframe.
          t.el.style.opacity = String(p <= 0.38 ? 1 : Math.max(0, 1 - (p - 0.38) / 0.62))
        }
      }
    }

    // Coalesced into one rAF per frame; the listener itself does no layout work.
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    document.documentElement.dataset.parallax = 'js'

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      for (const t of targets) {
        t.el.style.transform = ''
        t.el.style.opacity = ''
      }
      delete document.documentElement.dataset.parallax
    }
  }, [])

  return null
}

import React from 'react'
import Image from 'next/image'

import { cn } from '@/utilities/ui'

interface Props {
  className?: string
  /** 'gold' for navy/midnight backgrounds, 'navy' for light backgrounds (Brand DNA §5.6) */
  variant?: 'gold' | 'navy'
  /** Set on the one instance that appears above the fold (the header). */
  priority?: boolean
}

/**
 * The real AGBN emblem, taken from the organisation's existing site, paired
 * with a typeset wordmark — the lockup Brand DNA §5.6 describes.
 *
 * This replaces a hand-drawn SVG stand-in built from the network motif. That
 * placeholder was never the organisation's mark.
 *
 * The emblem carries its own navy field inside a gold ring, so it holds up on
 * both light and dark surfaces without needing a second asset. Only the
 * wordmark changes colour, which is what §5.6 actually asks for: never place
 * the gold wordmark on a light background.
 *
 * The emblem itself already contains "AFRICA AND GLOBAL BUSINESS NETWORK" in
 * its banner, but that type is unreadable at header size, so the wordmark
 * beside it does the naming work.
 */
export const Logo = ({ className, variant = 'gold', priority = false }: Props) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <Image
      src="/brand/agbn-emblem.webp"
      alt=""
      aria-hidden="true"
      width={160}
      height={160}
      priority={priority}
      className="h-full w-auto"
    />
    <span
      className={cn(
        'font-display text-[1.35em] font-semibold leading-none tracking-[0.01em]',
        variant === 'gold' ? 'text-gold' : 'text-navy',
      )}
    >
      AGBN
    </span>
    {/* The visible wordmark is an abbreviation; screen readers get the full
        organisation name instead. */}
    <span className="sr-only">Africa and Global Business Network</span>
  </span>
)

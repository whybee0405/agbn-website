import Link from 'next/link'
import React from 'react'
import { ArrowLeft } from 'lucide-react'

import { Media } from '@/components/Media'
import { Section } from '@/components/Section'
import type { Media as MediaType } from '@/payload-types'

type Props = {
  title: string
  image?: MediaType | string | number | null
  imageAlt?: string
  /** Sector, country, pillar, date. Rendered as a spaced row, not dot-joined. */
  meta?: (string | null | undefined)[]
  backHref: string
  backLabel: string
}

const MetaRow: React.FC<{ items: Props['meta'] }> = ({ items }) => {
  const parts = (items || []).filter(Boolean) as string[]
  if (parts.length === 0) return null

  return (
    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
      {parts.map((part, i) => (
        <li key={`${part}-${i}`} className="font-mono text-caption uppercase tracking-[0.14em] text-gold">
          {part}
        </li>
      ))}
    </ul>
  )
}

/**
 * Masthead for opportunity, post and case-study detail pages.
 *
 * When there is no featured image this renders as a plain dark band rather
 * than a 16:7 slab of flat colour with a gradient over nothing, which is what
 * the two hand-rolled versions of this did.
 */
export const ArticleHero: React.FC<Props> = ({
  title,
  image,
  imageAlt,
  meta,
  backHref,
  backLabel,
}) => {
  const hasImage = image && typeof image === 'object'

  const inner = (
    <>
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-2 text-body-s text-on-dark-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {backLabel}
      </Link>
      <h1 className="mt-2 max-w-4xl text-display-l tracking-display-tight text-white">{title}</h1>
      <MetaRow items={meta} />
    </>
  )

  if (!hasImage) {
    return (
      <Section as="header" tone="deep" rhythm="sm">
        {inner}
      </Section>
    )
  }

  return (
    <header className="relative isolate w-full bg-surface-deep">
      <div className="relative aspect-[16/9] w-full sm:aspect-[16/7]">
        <Media
          resource={image}
          alt={imageAlt}
          fill
          priority
          imgClassName="object-cover"
          size="100vw"
        />
        {/* Two stops rather than one: the lower half needs to be near-opaque
            for the title to clear WCAG AA over an arbitrary photograph. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/75 to-midnight/10"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <div className="container pb-8 sm:pb-10">{inner}</div>
      </div>
    </header>
  )
}

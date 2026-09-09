import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = {
  href: string
  title: React.ReactNode
  summary?: string | null
  image?: MediaType | string | number | null
  /** Alt text for the image. Falls back to the media record's own alt. */
  imageAlt?: string
  /** Sector, country, pillar. Rendered as columns, not dot-joined runs. */
  meta?: (string | null | undefined)[]
  /** A real, verifiable outcome number. Never a decorative fake-precise stat. */
  metric?: string | null
  /** Short state label overlaid on the image: "Closed", "Full". */
  status?: string | null
  /** Promotes the first item in a grid to a wide horizontal composition. */
  feature?: boolean
  /** Above-the-fold cards opt into eager loading for LCP. */
  priority?: boolean
  className?: string
}

const Meta: React.FC<{ items: Props['meta']; className?: string }> = ({ items, className }) => {
  const parts = (items || []).filter(Boolean) as string[]
  if (parts.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap items-baseline gap-x-5 gap-y-1', className)}>
      {parts.map((part, i) => (
        <li key={`${part}-${i}`} className="font-mono text-caption uppercase tracking-[0.14em] text-on-surface-accent">{part}</li>
      ))}
    </ul>
  )
}

/**
 * One card for every collection on the site: opportunities, magazine posts,
 * events and case studies. Previously each of the four index pages hand-rolled
 * its own near-identical `rounded-xl border bg-white` block, which is what made
 * the whole site read as one template repeated seven times.
 *
 * Hover treatment note: the old cards used `group-hover:text-gold`, putting
 * gold text on white. Brand DNA §5.2 forbids that outright — gold on light is
 * only ever a border or an underline, which is what this uses instead.
 */
export const EntityCard: React.FC<Props> = ({
  href,
  title,
  summary,
  image,
  imageAlt,
  meta,
  metric,
  status,
  feature = false,
  priority = false,
  className,
}) => {
  const hasImage = image && typeof image === 'object'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-hairline bg-surface-raised',
        'transition-[border-color,box-shadow,transform] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_12px_32px_-12px_rgb(10_29_55/0.28)]',
        feature && 'sm:col-span-2 lg:col-span-3 lg:flex-row',
        className,
      )}
    >
      <div
        className={cn(
          'relative w-full shrink-0 overflow-hidden bg-surface-sunken',
          feature ? 'aspect-[16/10] lg:aspect-auto lg:w-1/2' : 'aspect-[4/3]',
        )}
      >
        {hasImage && (
          <Media
            resource={image}
            alt={imageAlt}
            fill
            className="relative block size-full"
            priority={priority}
            imgClassName="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            size={
              feature
                ? '(min-width: 1024px) 50vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            }
          />
        )}
        {status && (
          <span className="absolute left-3 top-3 rounded bg-navy px-2.5 py-1 font-mono text-caption uppercase tracking-[0.1em] text-white">
            {status}
          </span>
        )}
      </div>

      <div
        className={cn(
          'flex flex-1 flex-col gap-3 p-5',
          feature && 'lg:justify-center lg:gap-4 lg:p-10',
        )}
      >
        <Meta items={meta} />
        <h3
          className={cn(
            'text-on-surface-heading underline decoration-transparent decoration-2 underline-offset-4',
            'transition-[text-decoration-color] duration-200 group-hover:decoration-gold',
            feature ? 'text-display-m' : 'text-display-s',
          )}
        >
          {title}
        </h3>
        {summary && (
          <p
            className={cn(
              'text-body-s text-on-surface-muted',
              feature ? 'measure line-clamp-4 text-body-m' : 'line-clamp-2',
            )}
          >
            {summary}
          </p>
        )}
        {metric && <p className="mt-auto pt-1 tabular text-body-s text-savanna">{metric}</p>}
      </div>
    </Link>
  )
}

type GridProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Three columns, but the `feature` card above spans all of them, so an index
 * page has a lead item instead of N identical tiles in a perfect rectangle.
 */
export const CardGrid: React.FC<GridProps> = ({ children, className }) => (
  <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
    {children}
  </div>
)

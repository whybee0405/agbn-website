import React from 'react'
import { cn } from '@/utilities/ui'

/**
 * Every band on the site declares its surface tone here rather than reaching
 * for `bg-navy` / `bg-white` inline. Two things fall out of that:
 *
 *  - the theme lock is enforceable — you can count the tone changes on a page
 *    instead of discovering them by scrolling,
 *  - text colour comes with the surface, so muted copy on a dark band can
 *    never silently inherit the light-surface muted token (Slate 500 on Navy
 *    is ~2.6:1 and was the site's most common contrast failure).
 */
export type SurfaceTone = 'page' | 'sunken' | 'brand' | 'deep'

const TONE: Record<SurfaceTone, string> = {
  page: 'bg-surface-page text-on-surface',
  sunken: 'bg-surface-sunken text-on-surface',
  brand: 'bg-surface-brand text-on-dark',
  deep: 'bg-surface-deep text-on-dark',
}

type Rhythm = 'sm' | 'md' | 'lg' | 'none'

const RHYTHM: Record<Rhythm, string> = {
  none: '',
  sm: 'section-y-sm',
  md: 'section-y',
  lg: 'section-y-lg',
}

const RHYTHM_TOP_VALUE: Record<Rhythm, string> = {
  none: '0px',
  sm: 'var(--space-section-sm)',
  md: 'var(--space-section)',
  lg: 'var(--space-section-lg)',
}

type SectionProps = {
  tone?: SurfaceTone
  rhythm?: Rhythm
  /**
   * Overrides the top padding only. A section that follows a PageHeader
   * otherwise stacks the header's bottom rhythm on top of its own, which reads
   * as a gap rather than as a section break.
   */
  rhythmTop?: Rhythm
  /** Renders the inner `.container` wrapper. Turn off for full-bleed content. */
  bleed?: boolean
  className?: string
  innerClassName?: string
  id?: string
  as?: 'section' | 'div' | 'header' | 'footer' | 'aside'
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({
  tone = 'page',
  rhythm = 'md',
  rhythmTop,
  bleed = false,
  className,
  innerClassName,
  id,
  as: Tag = 'section',
  children,
}) => (
  <Tag
    id={id}
    data-tone={tone}
    style={
      rhythmTop
        ? ({ '--section-pt': RHYTHM_TOP_VALUE[rhythmTop] } as React.CSSProperties)
        : undefined
    }
    className={cn(TONE[tone], RHYTHM[rhythm], className)}
  >
    {bleed ? children : <div className={cn('container', innerClassName)}>{children}</div>}
  </Tag>
)

type HeadingProps = {
  /** Optional kicker. Rationed deliberately: at most one per three sections. */
  kicker?: string
  title: React.ReactNode
  /** Stacked under the title, never floated into a right-hand column. */
  lede?: React.ReactNode
  level?: 1 | 2 | 3
  size?: 'xl' | 'l' | 'm' | 's'
  tone?: SurfaceTone
  align?: 'start' | 'center'
  className?: string
  /** Slot for a single trailing link or button, aligned to the baseline. */
  action?: React.ReactNode
}

const SIZE: Record<NonNullable<HeadingProps['size']>, string> = {
  xl: 'text-display-xl tracking-display-tight',
  l: 'text-display-l tracking-display-tight',
  m: 'text-display-m',
  s: 'text-display-s',
}

export const SectionHeading: React.FC<HeadingProps> = ({
  kicker,
  title,
  lede,
  level = 2,
  size = 'm',
  tone = 'page',
  align = 'start',
  className,
  action,
}) => {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const dark = tone === 'brand' || tone === 'deep'
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        centered && 'sm:flex-col sm:items-center',
        className,
      )}
    >
      <div className={cn('min-w-0', centered && 'text-center')}>
        {kicker && (
          <p
            className={cn(
              'mb-3 font-mono text-caption uppercase tracking-[0.18em]',
              dark ? 'text-gold' : 'text-on-surface-accent',
            )}
          >
            {kicker}
          </p>
        )}
        <Tag className={cn(SIZE[size], dark ? 'text-on-dark' : 'text-on-surface-heading')}>{title}</Tag>
        {lede && (
          <p
            className={cn(
              'mt-4 text-body-l measure',
              centered && 'mx-auto',
              dark ? 'text-on-dark-muted' : 'text-on-surface-muted',
            )}
          >
            {lede}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

type PageHeaderProps = {
  title: React.ReactNode
  lede?: React.ReactNode
  tone?: Extract<SurfaceTone, 'brand' | 'deep'>
  /** Small factual strip under the lede: result counts, dates, locations. */
  meta?: React.ReactNode
  children?: React.ReactNode
}

/**
 * The masthead for interior pages. Deliberately one shared component so the
 * seven index pages read as one system rather than seven near-copies of the
 * same hand-rolled band.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  lede,
  tone = 'brand',
  meta,
  children,
}) => (
  <Section as="header" tone={tone} rhythm="sm" className="relative overflow-hidden">
    <div className="relative max-w-3xl">
      <h1 className="text-display-l tracking-display-tight text-on-dark">{title}</h1>
      {lede && <p className="mt-4 text-lede text-on-dark-muted measure">{lede}</p>}
      {meta && <div className="mt-6 text-body-s text-on-dark-muted">{meta}</div>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  </Section>
)

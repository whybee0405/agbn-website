import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import { CalendarDays, MapPin } from 'lucide-react'

import { ArticleHero } from '@/components/ArticleHero'
import RichText from '@/components/RichText'
import { EventRsvpForm } from '@/components/Form/EventRsvpForm'
import { RelatedItems, type RelatedItem } from '@/components/RelatedItems'
import { generateMeta } from '@/utilities/generateMeta'
import { eventPresentation, eventDate } from '@/utilities/eventPresentation'
import { PUBLISHED_EVENTS_AVAILABLE } from '@/lib/content-policy'
import { DemoContentNotice } from '@/components/DemoContentNotice'

export const revalidate = 60
export const dynamic = 'force-dynamic'

const formatEventDate = (value?: string | null) =>
  value ? eventDate.format(new Date(value)) : ''

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

type Args = { params: Promise<{ slug: string }> }

const queryEventBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})

export default async function EventPage({ params: paramsPromise }: Args) {
  if (!PUBLISHED_EVENTS_AVAILABLE) return notFound()
  const { slug } = await paramsPromise
  const event = await queryEventBySlug(slug)
  if (!event) return notFound()
  const presentation = eventPresentation(event)

  const related = await (async () => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'events',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      where: {
        id: { not_equals: event.id },
        startDateTime: { greater_than_equal: new Date().toISOString() },
      },
      sort: 'startDateTime',
    })
    return result.docs
  })()

  const relatedItems: RelatedItem[] = related.map((doc) => ({
    id: doc.id,
    href: `/events/${doc.slug}`,
    title: doc.title,
    summary: doc.venue,
    image: doc.featuredImage,
    imageAlt: doc.title,
    meta: [doc.startDateTime ? shortDateFormatter.format(new Date(doc.startDateTime)) : null, doc.venue],
    status: eventPresentation(doc).label,
  }))

  return (
    <article className="pb-24">
      <ArticleHero
        title={event.title}
        image={event.featuredImage}
        imageAlt={event.title}
        backHref="/events"
        backLabel="All events"
      />

      <div className="container mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div>
          <DemoContentNotice className="mb-8" />
          <dl className="mb-10 grid gap-5 border-b border-hairline pb-8 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-accent">
                <CalendarDays size={14} aria-hidden="true" /> When
              </dt>
              <dd className="mt-2 text-body-m text-on-surface">
                {event.startDateTime ? (
                  <time dateTime={event.startDateTime}>{formatEventDate(event.startDateTime)}</time>
                ) : (
                  'To be announced'
                )}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-accent">
                <MapPin size={14} aria-hidden="true" /> Where
              </dt>
              <dd className="mt-2 text-body-m text-on-surface">{event.venue}</dd>
            </div>
          </dl>
          {event.description && <RichText data={event.description} enableGutter={false} />}
        </div>

        <aside className="h-fit rounded-lg border border-hairline bg-surface-raised p-6 lg:sticky lg:top-24">
          <h2 className="text-display-s text-on-surface-heading">
            {presentation.open ? 'RSVP for this event' : presentation.label}
          </h2>
          {!presentation.open && (
            <p className="mt-2 text-body-s text-on-surface-muted">
              {presentation.past ? 'This event has passed. Browse the events page for the next opportunity to meet the network.' : presentation.status === 'full' ? 'Leave your details to hear from the team if a place becomes available.' : 'Registration is currently closed. Leave your details if you would like the team to contact you about availability.'}
            </p>
          )}
          <div className="mt-5">
            {presentation.past ? <Link href="/events" className="inline-flex min-h-11 items-center underline underline-offset-4">Browse upcoming events</Link> : <EventRsvpForm eventId={String(event.id)} rsvpStatus={event.rsvpStatus} />}
          </div>
        </aside>
      </div>

      <RelatedItems title="Other upcoming events" items={relatedItems} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  if (!PUBLISHED_EVENTS_AVAILABLE) return { robots: { index: false, follow: false } }
  const { slug } = await paramsPromise
  const event = await queryEventBySlug(slug)
  return generateMeta({ doc: event })
}

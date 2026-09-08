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

export const revalidate = 60

const eventDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const formatEventDate = (value?: string | null) =>
  value ? eventDateFormatter.format(new Date(value)) : ''

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
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

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })
  return events.docs.map(({ slug }) => ({ slug }))
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const event = await queryEventBySlug(slug)
  if (!event) return notFound()

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
    status: doc.rsvpStatus !== 'open' ? 'Registration closed' : null,
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
            {event.rsvpStatus === 'open' ? 'RSVP for this event' : 'Registration not open yet'}
          </h2>
          {event.rsvpStatus !== 'open' && (
            <p className="mt-2 text-body-s text-on-surface-muted">
              {event.rsvpStatus === 'full'
                ? "This event is full. We'll email you if a spot opens up."
                : "Registration for this event isn't open yet. We'll email you the moment it is."}
            </p>
          )}
          <div className="mt-5">
            <EventRsvpForm eventId={String(event.id)} rsvpStatus={event.rsvpStatus} />
          </div>
        </aside>
      </div>

      <RelatedItems title="Other upcoming events" items={relatedItems} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const event = await queryEventBySlug(slug)
  return generateMeta({ doc: event })
}

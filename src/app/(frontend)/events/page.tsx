import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { MapPin } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { Media } from '@/components/Media'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { DemoContentNotice } from '@/components/DemoContentNotice'
import { eventPresentation } from '@/utilities/eventPresentation'
import { PUBLISHED_EVENTS_AVAILABLE } from '@/lib/content-policy'

export const revalidate = 60
export const dynamic = 'force-dynamic'

const dayFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' })
const yearFormatter = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone: 'UTC' })
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' })

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 50,
    sort: 'startDateTime',
    where: { startDateTime: { greater_than_equal: new Date().toISOString() } },
    overrideAccess: false,
  })

  return (
    <>
      <PageHeader
        backgroundImage="/home/subpages/events-network.webp"
        backgroundPosition="center 48%"
        title="Events"
        lede="Illustrative networking-event announcements from the AGBN community."
      />

      {/*
        Events are chronological, so they read as a dated agenda rather than a
        card grid. This is also what keeps the four index pages from all being
        the same three-column tile layout.
      */}
      <Section tone="page" rhythm="md" rhythmTop="sm">
        {!PUBLISHED_EVENTS_AVAILABLE || events.docs.length === 0 ? (
          <EmptyState
            title="The next networking event is being confirmed."
            body="AGBN’s monthly networking event is planned at Hard Rock Cafe. The date and time are still to be confirmed."
            action={
              <Button asChild variant="gold">
                <Link href="/join">Join AGBN</Link>
              </Button>
            }
          />
        ) : (
          <>
            <DemoContentNotice className="mb-7" />
            <ol className="border-t border-hairline">
            {events.docs.map((event) => {
              const start = event.startDateTime ? new Date(event.startDateTime) : null
              const { label: status, open: isOpen } = eventPresentation(event)

              return (
                <li key={event.id} className="border-b border-hairline">
                  <Link
                    href={`/events/${event.slug}`}
                    className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-5 gap-y-4 py-7 sm:grid-cols-[5rem_minmax(0,1fr)_9rem] sm:gap-x-8 lg:grid-cols-[5rem_minmax(0,1fr)_9rem_11rem]"
                  >
                    {start && (
                      <time
                        dateTime={event.startDateTime as string}
                        className="flex flex-col items-center rounded border border-hairline bg-surface-sunken py-3 transition-colors group-hover:border-gold"
                      >
                        <span className="tabular text-display-s leading-none text-on-surface-heading">
                          {dayFormatter.format(start)}
                        </span>
                        <span className="mt-1 font-mono text-caption uppercase tracking-[0.14em] text-on-surface-accent">
                          {monthFormatter.format(start)}
                        </span>
                        <span className="tabular text-caption text-on-surface-muted">
                          {yearFormatter.format(start)}
                        </span>
                      </time>
                    )}

                    <div className="min-w-0">
                      <h2 className="text-display-s text-on-surface-heading underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] group-hover:decoration-gold">
                        {event.title}
                      </h2>
                      <p className="mt-2 flex items-center gap-2 text-body-s text-on-surface-muted">
                        <MapPin size={14} aria-hidden="true" className="shrink-0" />
                        {event.venue}
                      </p>
                      {start && (
                        <p className="mt-1 tabular text-body-s text-on-surface-muted">
                          {timeFormatter.format(start)}
                        </p>
                      )}
                    </div>

                    <p
                      className={
                        isOpen
                          ? 'font-mono text-caption uppercase tracking-[0.14em] text-savanna'
                          : 'font-mono text-caption uppercase tracking-[0.14em] text-on-surface-muted'
                      }
                    >
                      {status}
                    </p>

                    {event.featuredImage && typeof event.featuredImage === 'object' && (
                      <div className="relative hidden aspect-[16/10] overflow-hidden rounded border border-hairline lg:block">
                        <Media
                          resource={event.featuredImage}
                          alt={event.title}
                          fill
                          imgClassName="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          size="11rem"
                        />
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
            </ol>
          </>
        )}
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Events',
    description: 'Upcoming AGBN webinars, roundtables, and networking events across Africa.',
  }
}

import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { EmptyState } from '@/components/EmptyState'
import { CardGrid, EntityCard } from '@/components/EntityCard'
import { OpportunitiesFilters } from '@/components/OpportunitiesFilters'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'

export const revalidate = 60

type Args = {
  searchParams: Promise<{ sector?: string; country?: string }>
}

export default async function OpportunitiesPage({ searchParams: searchParamsPromise }: Args) {
  const { sector, country } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const [sectors, allOpportunities] = await Promise.all([
    payload.find({ collection: 'sectors', limit: 100, overrideAccess: false }),
    payload.find({
      collection: 'opportunities',
      limit: 200,
      depth: 1,
      overrideAccess: false,
      select: { country: true },
    }),
  ])

  const countries = Array.from(
    new Set(allOpportunities.docs.map((o) => o.country).filter(Boolean)),
  ).sort()

  const where: Where = { and: [] }
  if (sector) {
    ;(where.and as Where[]).push({ 'sector.slug': { equals: sector } })
  }
  if (country) {
    ;(where.and as Where[]).push({ country: { equals: country } })
  }

  const opportunities = await payload.find({
    collection: 'opportunities',
    depth: 1,
    limit: 60,
    sort: '-datePosted',
    overrideAccess: false,
    where: (where.and as Where[]).length > 0 ? where : undefined,
  })

  const filtered = Boolean(sector || country)
  const count = opportunities.totalDocs

  return (
    <>
      <PageHeader
        title="Opportunities"
        lede="Real, vetted opportunities from AGBN members across every sector and country in our network."
        meta={
          allOpportunities.totalDocs > 0 ? (
            <p>
              <span className="tabular text-white">{allOpportunities.totalDocs}</span> listings from{' '}
              <span className="tabular text-white">{countries.length}</span>{' '}
              {countries.length === 1 ? 'country' : 'countries'}
            </p>
          ) : null
        }
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        <OpportunitiesFilters
          sectors={sectors.docs.map((s) => ({ label: s.name, value: s.slug || '' }))}
          countries={countries.map((c) => ({ label: c as string, value: c as string }))}
        />

        {opportunities.docs.length > 0 ? (
          <>
            <p aria-live="polite" className="mt-6 text-body-s text-on-surface-muted">
              Showing <span className="tabular text-on-surface">{count}</span>{' '}
              {count === 1 ? 'opportunity' : 'opportunities'}
              {filtered ? ' matching your filters' : ''}
            </p>
            <CardGrid className="mt-6">
              {opportunities.docs.map((opportunity, i) => {
                const sectorName =
                  typeof opportunity.sector === 'object' ? opportunity.sector?.name : undefined
                return (
                  <EntityCard
                    key={opportunity.id}
                    href={`/opportunities/${opportunity.slug}`}
                    title={opportunity.title}
                    summary={opportunity.summary}
                    image={opportunity.featuredImage}
                    imageAlt={`${opportunity.title}, ${opportunity.country}`}
                    meta={[sectorName, opportunity.country]}
                    /* The reason to click. Rendered in Savanna green as the
                       card's outcome figure rather than buried in the body. */
                    metric={
                      typeof opportunity.commissionRate === 'number'
                        ? `${opportunity.commissionRate}% referral commission`
                        : undefined
                    }
                    status={opportunity.listingStatus === 'closed' ? 'Closed' : undefined}
                    /* An unfiltered index leads with one wide item so the page
                       is not just N identical tiles in a rectangle. */
                    feature={i === 0 && !filtered && opportunities.docs.length > 3}
                    priority={i === 0}
                  />
                )
              })}
            </CardGrid>
          </>
        ) : (
          <EmptyState
            title="No opportunities match those filters yet."
            body="New opportunities are posted regularly. Try a different sector or country, or check back soon."
            action={
              <Button asChild variant="outline">
                <Link href="/opportunities">Clear filters</Link>
              </Button>
            }
          />
        )}
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Opportunities',
    description:
      'Browse real, vetted business opportunities from AGBN members across every sector and country in our network.',
  }
}

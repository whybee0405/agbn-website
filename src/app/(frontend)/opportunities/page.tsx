import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { EmptyState } from '@/components/EmptyState'
import { CardGrid, EntityCard } from '@/components/EntityCard'
import { OpportunitiesFilters } from '@/components/OpportunitiesFilters'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { PUBLISHED_OPPORTUNITIES_AVAILABLE } from '@/lib/content-policy'

export const revalidate = 60

type Args = {
  searchParams: Promise<{ sector?: string; country?: string; status?: string; page?: string }>
}

export default async function OpportunitiesPage({ searchParams: searchParamsPromise }: Args) {
  const { sector, country, status, page: pageParam } = await searchParamsPromise
  const page = Math.max(1, Math.floor(Number(pageParam) || 1))
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
  ;(where.and as Where[]).push({ listingStatus: status === 'closed' ? { equals: 'closed' } : { not_equals: 'closed' } })
  if (sector) {
    // Payload relationship fields are stored as IDs. Querying `sector.slug`
    // looks plausible but produces an empty result set in the local adapter.
    const selectedSector = sectors.docs.find((item) => item.slug === sector)
    ;(where.and as Where[]).push({ sector: { equals: selectedSector?.id ?? -1 } })
  }
  if (country) {
    ;(where.and as Where[]).push({ country: { equals: country } })
  }

  const opportunities = await payload.find({
    collection: 'opportunities',
    depth: 1,
    limit: 12,
    page,
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
        lede={
          PUBLISHED_OPPORTUNITIES_AVAILABLE
            ? 'Find a listing that fits your network. Confirm availability and referral terms with the team before making an introduction.'
            : 'AGBN is preparing its public opportunity-sharing platform.'
        }
        meta={
          PUBLISHED_OPPORTUNITIES_AVAILABLE && allOpportunities.totalDocs > 0 ? (
            <p>
              <span className="tabular text-white">{allOpportunities.totalDocs}</span> listings from{' '}
              <span className="tabular text-white">{countries.length}</span>{' '}
              {countries.length === 1 ? 'country' : 'countries'}
            </p>
          ) : null
        }
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        {!PUBLISHED_OPPORTUNITIES_AVAILABLE ? (
          <EmptyState
            title="The opportunity board is in development."
            body="AGBN is preparing the public board. Contact the team if you would like to discuss the type of opportunity you are looking for."
            action={
              <Button asChild variant="gold">
                <Link href="/contact">Talk to the AGBN team</Link>
              </Button>
            }
          />
        ) : (
          <>
            <OpportunitiesFilters
          sectors={sectors.docs.map((s) => ({ label: s.name, value: s.slug || '' }))}
          countries={countries.map((c) => ({ label: c as string, value: c as string }))}
        />
        <div className="mt-5 flex gap-5 border-b border-hairline text-body-s">
          {['open', 'closed'].map(value => { const params = new URLSearchParams(); if(sector)params.set('sector',sector);if(country)params.set('country',country);if(value === 'closed')params.set('status','closed');const selected = (status === 'closed' ? 'closed' : 'open') === value; return <Link key={value} href={`/opportunities?${params}`} aria-current={selected ? 'page' : undefined} className={`inline-flex min-h-11 items-center border-b-2 ${selected ? 'border-navy font-medium text-navy' : 'border-transparent text-on-surface-muted'}`}>{value === 'open' ? 'Open listings' : 'Closed listings'}</Link> })}
        </div>

        {opportunities.docs.length > 0 ? (
          <>
            <p aria-live="polite" className="mt-6 text-body-s text-on-surface-muted">
              Showing <span className="tabular text-on-surface">{opportunities.docs.length}</span> of <span className="tabular text-on-surface">{count}</span>{' '}
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
                    feature={i === 0 && !filtered && page === 1 && opportunities.docs.length > 3}
                    priority={i === 0}
                  />
                )
              })}
            </CardGrid>
            {opportunities.totalPages > 1 && <nav aria-label="Opportunity pages" className="mt-10 flex items-center justify-between gap-4">{[page-1,page+1].map((target,i)=>{const params=new URLSearchParams();if(sector)params.set('sector',sector);if(country)params.set('country',country);if(status==='closed')params.set('status','closed');params.set('page',String(target));return target > 0 && target <= opportunities.totalPages ? <Button key={i} asChild variant="outline"><Link href={`/opportunities?${params}`}>{i===0?'Previous page':'Next page'}</Link></Button>:<span key={i}/>})}<span className="text-body-s text-on-surface-muted">Page {page} of {opportunities.totalPages}</span></nav>}
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
          </>
        )}
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Opportunities',
    description:
      'Browse current business opportunities across sectors and countries in the AGBN network.',
  }
}

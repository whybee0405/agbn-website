import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { ArticleHero } from '@/components/ArticleHero'
import RichText from '@/components/RichText'
import { RelatedItems, type RelatedItem } from '@/components/RelatedItems'
import { Button } from '@/components/ui/button'
import { generateMeta } from '@/utilities/generateMeta'
import { PUBLISHED_OPPORTUNITIES_AVAILABLE } from '@/lib/content-policy'
import { DemoContentNotice } from '@/components/DemoContentNotice'

export const revalidate = 60
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string }>
}

const queryOpportunityBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'opportunities',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})

export default async function OpportunityPage({ params: paramsPromise }: Args) {
  if (!PUBLISHED_OPPORTUNITIES_AVAILABLE) return notFound()
  const { slug } = await paramsPromise
  const opportunity = await queryOpportunityBySlug(slug)

  if (!opportunity) return notFound()

  const sectorName =
    typeof opportunity.sector === 'object' ? opportunity.sector?.name : undefined
  const sectorId = typeof opportunity.sector === 'object' ? opportunity.sector?.id : opportunity.sector

  const { docs: related, allSameSector } = await (async () => {
    const payload = await getPayload({ config: configPromise })
    const sameSector = sectorId
      ? await payload.find({
          collection: 'opportunities',
          depth: 1,
          limit: 3,
          overrideAccess: false,
          where: { sector: { equals: sectorId }, id: { not_equals: opportunity.id }, listingStatus: { not_equals: 'closed' } },
          sort: '-datePosted',
        })
      : { docs: [] }

    // Every seeded opportunity currently sits in a different sector, so the
    // sector-matched query above is often empty. Rather than leave the page
    // with nothing to click into next, backfill with the most recent other
    // listings once real inventory makes sector matches common this backfill
    // will naturally stop firing.
    if (sameSector.docs.length >= 3) return { docs: sameSector.docs, allSameSector: true }
    const excludeIds = [opportunity.id, ...sameSector.docs.map((d) => d.id)]
    const backfill = await payload.find({
      collection: 'opportunities',
      depth: 1,
      limit: 3 - sameSector.docs.length,
      overrideAccess: false,
      where: { id: { not_in: excludeIds }, listingStatus: { not_equals: 'closed' } },
      sort: '-datePosted',
    })
    return { docs: [...sameSector.docs, ...backfill.docs], allSameSector: backfill.docs.length === 0 }
  })()

  const relatedItems: RelatedItem[] = related.map((doc) => {
    const docSectorName = typeof doc.sector === 'object' ? doc.sector?.name : undefined
    return {
      id: doc.id,
      href: `/opportunities/${doc.slug}`,
      title: doc.title,
      summary: doc.summary,
      image: doc.featuredImage,
      imageAlt: `${doc.title}, ${doc.country}`,
      meta: [docSectorName, doc.country],
      metric: doc.commissionRate ? `${doc.commissionRate}% referral commission` : null,
      status: doc.listingStatus === 'closed' ? 'Closed' : null,
    }
  })

  return (
    <article className="pb-24">
      <ArticleHero
        title={opportunity.title}
        image={opportunity.featuredImage}
        imageAlt={`${opportunity.title}, ${opportunity.country}`}
        meta={[sectorName, opportunity.country]}
        backHref="/opportunities"
        backLabel="All opportunities"
      />

      <div className="container mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div>
          <DemoContentNotice className="mb-8" />
          {opportunity.listingStatus === 'closed' && (
            <p
              role="status"
              className="mb-8 flex items-start gap-3 rounded-lg border border-hairline bg-surface-sunken p-4 text-body-s text-on-surface"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rounded-full bg-clay"
              />
              This opportunity is closed. Browse the feed for live listings in the same sector.
            </p>
          )}
          {opportunity.description && (
            <RichText data={opportunity.description} enableGutter={false} />
          )}
        </div>

        <aside className="h-fit rounded-lg border border-hairline bg-surface-raised p-6 lg:sticky lg:top-24">
          <p className="mb-3 text-caption font-medium uppercase tracking-[0.12em] text-on-surface-accent">{opportunity.listingStatus === 'closed' ? 'Listing closed' : 'Referral opportunity'}</p>
          {typeof opportunity.commissionRate === 'number' && <div className="mb-6 border-b border-hairline pb-6"><p className="font-display text-display-l font-medium text-on-surface-heading">{opportunity.commissionRate}%</p><p className="mt-1 text-body-s text-on-surface-muted">Listed referral commission</p></div>}
          <h2 className="text-display-s text-on-surface-heading">{opportunity.listingStatus === 'closed' ? 'Find your next connection.' : 'Know the right person?'}</h2>
          <p className="mt-2 text-body-s text-on-surface-muted">
            {opportunity.listingStatus === 'closed' ? 'This listing is no longer taking referrals. Explore other opportunities on the board.' : 'Confirm availability, eligibility and commission terms with the team before making an introduction.'}
          </p>
          <Button asChild variant="gold" className="mt-5 w-full">
            <Link href={opportunity.listingStatus === 'closed' ? '/opportunities' : `/join?opportunity=${encodeURIComponent(slug)}`}>{opportunity.listingStatus === 'closed' ? 'Browse open listings' : 'Apply to make a referral'}</Link>
          </Button>
          <Button asChild variant="outline" className="mt-2.5 w-full">
            <Link href={`/contact?opportunity=${encodeURIComponent(slug)}`}>Ask about this opportunity</Link>
          </Button>
          <p className="mt-5 text-caption text-on-surface-muted">Already a member? Use the enquiry link and the team can help you with the next step.</p>
        </aside>
      </div>

      <RelatedItems
        title={allSameSector && sectorName ? `More in ${sectorName}` : 'More opportunities'}
        items={relatedItems}
      />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  if (!PUBLISHED_OPPORTUNITIES_AVAILABLE) return { robots: { index: false, follow: false } }
  const { slug } = await paramsPromise
  const opportunity = await queryOpportunityBySlug(slug)
  return generateMeta({ doc: opportunity })
}

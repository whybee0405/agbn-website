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

export const revalidate = 300

type Args = { params: Promise<{ slug: string }> }

const queryCaseStudyBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'case-studies',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const docs = await payload.find({
    collection: 'case-studies',
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })
  return docs.docs.map(({ slug }) => ({ slug }))
}

export default async function CaseStudyPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const caseStudy = await queryCaseStudyBySlug(slug)
  if (!caseStudy) return notFound()

  const sectorName = typeof caseStudy.sector === 'object' ? caseStudy.sector?.name : undefined
  const sectorId = typeof caseStudy.sector === 'object' ? caseStudy.sector?.id : caseStudy.sector

  const { docs: related, allSameSector } = await (async () => {
    const payload = await getPayload({ config: configPromise })
    const sameSector = sectorId
      ? await payload.find({
          collection: 'case-studies',
          depth: 1,
          limit: 3,
          overrideAccess: false,
          where: { sector: { equals: sectorId }, id: { not_equals: caseStudy.id } },
        })
      : { docs: [] }

    // Every seeded case study currently sits in a different sector, so the
    // sector-matched query above is often empty. Backfill with other recent
    // stories rather than leave the page with nothing to click into next.
    if (sameSector.docs.length >= 3) return { docs: sameSector.docs, allSameSector: true }
    const excludeIds = [caseStudy.id, ...sameSector.docs.map((d) => d.id)]
    const backfill = await payload.find({
      collection: 'case-studies',
      depth: 1,
      limit: 3 - sameSector.docs.length,
      overrideAccess: false,
      where: { id: { not_in: excludeIds } },
    })
    return { docs: [...sameSector.docs, ...backfill.docs], allSameSector: backfill.docs.length === 0 }
  })()

  const relatedItems: RelatedItem[] = related.map((doc) => {
    const docSectorName = typeof doc.sector === 'object' ? doc.sector?.name : undefined
    return {
      id: doc.id,
      href: `/case-studies/${doc.slug}`,
      title: `${doc.memberName}, ${doc.memberBusiness}`,
      summary: doc.summary,
      image: doc.featuredImage,
      imageAlt: `${doc.memberName} of ${doc.memberBusiness}`,
      meta: [docSectorName, doc.country],
      metric: doc.outcomeMetric,
    }
  })

  return (
    <article className="pb-24">
      <ArticleHero
        title={`${caseStudy.memberName}, ${caseStudy.memberBusiness}`}
        image={caseStudy.featuredImage}
        imageAlt={`${caseStudy.memberName} of ${caseStudy.memberBusiness}`}
        meta={[sectorName, caseStudy.country]}
        backHref="/case-studies"
        backLabel="All case studies"
      />

      <div className="container mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div>
          {caseStudy.outcomeMetric && (
            /* The outcome is the whole point of a case study, so it leads at
               display scale instead of sitting in a small tinted pill. */
            <p className="mb-10 border-l-0 border-t border-savanna pt-5 tabular text-display-m text-savanna">
              {caseStudy.outcomeMetric}
            </p>
          )}
          {caseStudy.body && <RichText data={caseStudy.body} enableGutter={false} />}
        </div>
        <aside className="h-fit rounded-lg border border-hairline bg-surface-raised p-6 lg:sticky lg:top-24">
          <h2 className="text-display-s text-on-surface-heading">Want a story like this?</h2>
          <p className="mt-2 text-body-s text-on-surface-muted">
            Every AGBN member has access to the same opportunity feed.
          </p>
          <Button asChild variant="gold" className="mt-5 w-full">
            <Link href="/join">Join AGBN</Link>
          </Button>
        </aside>
      </div>

      <RelatedItems
        title={allSameSector && sectorName ? `More stories in ${sectorName}` : 'More stories'}
        items={relatedItems}
      />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const caseStudy = await queryCaseStudyBySlug(slug)
  return generateMeta({ doc: caseStudy })
}

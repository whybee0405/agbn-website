import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { EmptyState } from '@/components/EmptyState'
import { CardGrid, EntityCard } from '@/components/EntityCard'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { StoriesPending } from '@/components/StoriesPending'
import { VERIFIED_MEMBER_STORIES_AVAILABLE } from '@/lib/content-policy'

export const revalidate = 300

export default async function CaseStudiesPage() {
  if (!VERIFIED_MEMBER_STORIES_AVAILABLE) return <StoriesPending />
  const payload = await getPayload({ config: configPromise })
  const caseStudies = await payload.find({
    collection: 'case-studies',
    depth: 1,
    limit: 30,
    overrideAccess: false,
  })

  return (
    <>
      <PageHeader
        tone="deep"
        title="Case Studies"
        lede="Real AGBN members, real referrals, real outcomes from across the network."
      />

      <Section tone="page" rhythm="md" rhythmTop="sm">
        {caseStudies.docs.length > 0 ? (
          <CardGrid>
            {caseStudies.docs.map((cs, i) => {
              const sectorName = typeof cs.sector === 'object' ? cs.sector?.name : undefined
              return (
                <EntityCard
                  key={cs.id}
                  href={`/case-studies/${cs.slug}`}
                  title={`${cs.memberName}, ${cs.memberBusiness}`}
                  summary={cs.summary}
                  image={cs.featuredImage}
                  imageAlt={`${cs.memberName} of ${cs.memberBusiness}`}
                  meta={[sectorName, cs.country]}
                  metric={cs.outcomeMetric}
                  feature={i === 0 && caseStudies.docs.length > 3}
                  priority={i === 0}
                />
              )
            })}
          </CardGrid>
        ) : (
          <EmptyState
            title="Case studies are on the way."
            body="We publish deal stories with real numbers, with the member's permission. The first ones land soon."
            action={
              <Button asChild variant="outline">
                <Link href="/magazine">Read the magazine</Link>
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
    title: 'Case Studies',
    description: 'Member stories from the AGBN network. Verified outcomes will be shared here when available.',
  }
}

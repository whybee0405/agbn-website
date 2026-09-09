import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { EmptyState } from '@/components/EmptyState'
import { CardGrid, EntityCard } from '@/components/EntityCard'
import { MagazineFilters } from '@/components/MagazineFilters'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { VERIFIED_MEMBER_STORIES_AVAILABLE } from '@/lib/content-policy'
import { PUBLISHED_MAGAZINE_AVAILABLE } from '@/lib/content-policy'

export const revalidate = 300

const PILLAR_LABEL: Record<string, string> = {
  'deal-stories': 'Deal Stories',
  'sector-spotlights': 'Sector Spotlights',
  'country-spotlights': 'Country Spotlights',
  'network-notes': 'Network Notes',
}

type Args = {
  searchParams: Promise<{ pillar?: string; sector?: string }>
}

export default async function MagazinePage({ searchParams: searchParamsPromise }: Args) {
  const { pillar, sector } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const sectors = await payload.find({ collection: 'sectors', limit: 100, overrideAccess: false })

  const and: Where[] = []
  if (!VERIFIED_MEMBER_STORIES_AVAILABLE) and.push({ pillar: { not_equals: 'deal-stories' } })
  if (pillar) and.push({ pillar: { equals: pillar } })
  if (sector) and.push({ 'sector.slug': { equals: sector } })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 30,
    sort: '-publishedAt',
    overrideAccess: false,
    where: and.length > 0 ? { and } : undefined,
  })

  const filtered = Boolean(pillar || sector)

  return (
    <>
      <PageHeader
        title="Magazine"
        lede={
          PUBLISHED_MAGAZINE_AVAILABLE
            ? 'Perspectives on the sectors, markets and relationships shaping business across Africa.'
            : 'A forthcoming home for AGBN stories, market perspectives and network updates.'
        }
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        {PUBLISHED_MAGAZINE_AVAILABLE && (
          <MagazineFilters
            sectors={sectors.docs.map((s) => ({ label: s.name, value: s.slug || '' }))}
          />
        )}

        {PUBLISHED_MAGAZINE_AVAILABLE && posts.docs.length > 0 ? (
          <CardGrid className="mt-8">
            {posts.docs.map((post, i) => {
              const sectorName = typeof post.sector === 'object' ? post.sector?.name : undefined
              return (
                <EntityCard
                  key={post.id}
                  href={`/magazine/${post.slug}`}
                  title={post.title}
                  summary={post.excerpt}
                  image={post.heroImage}
                  imageAlt={post.title}
                  meta={[PILLAR_LABEL[post.pillar as string], sectorName]}
                  feature={i === 0 && !filtered && posts.docs.length > 1}
                  priority={i === 0}
                />
              )
            })}
          </CardGrid>
        ) : (
          <EmptyState
            title="The AGBN magazine is in development."
            body="Stories, markets, deals and success updates will be shared here when they are ready to publish."
            action={
              <Button asChild variant="outline">
                <Link href="/magazine">Clear filters</Link>
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
    title: 'Magazine',
    description:
      'Deal stories, sector spotlights, country spotlights, and network notes from the AGBN community.',
  }
}

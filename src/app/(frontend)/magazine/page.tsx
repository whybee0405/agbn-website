import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { EmptyState } from '@/components/EmptyState'
import { CardGrid, EntityCard } from '@/components/EntityCard'
import { MagazineFilters } from '@/components/MagazineFilters'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'

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
        lede="Deal stories, sector spotlights, country spotlights, and network notes from across the AGBN community."
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        <MagazineFilters
          sectors={sectors.docs.map((s) => ({ label: s.name, value: s.slug || '' }))}
        />

        {posts.docs.length > 0 ? (
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
                  feature={i === 0 && !filtered && posts.docs.length > 3}
                  priority={i === 0}
                />
              )
            })}
          </CardGrid>
        ) : (
          <EmptyState
            title="No articles match those filters."
            body="We publish deal stories and sector spotlights regularly. Try a broader filter."
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

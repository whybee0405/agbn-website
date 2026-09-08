import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { ArticleHero } from '@/components/ArticleHero'
import RichText from '@/components/RichText'
import { RelatedItems, type RelatedItem } from '@/components/RelatedItems'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 300

const publishedFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const PILLAR_LABEL: Record<string, string> = {
  'deal-stories': 'Deal Stories',
  'sector-spotlights': 'Sector Spotlights',
  'country-spotlights': 'Country Spotlights',
  'network-notes': 'Network Notes',
}

type Args = { params: Promise<{ slug: string }> }

const queryPostBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.map(({ slug }) => ({ slug }))
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const post = await queryPostBySlug(slug)
  if (!post) return notFound()

  const sectorName = typeof post.sector === 'object' ? post.sector?.name : undefined
  const authorNames = (post.populatedAuthors || [])
    .map((a) => a?.name)
    .filter(Boolean)
    .join(', ')

  const { docs: related, allSamePillar } = await (async () => {
    const payload = await getPayload({ config: configPromise })
    const samePillar = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      where: { pillar: { equals: post.pillar }, id: { not_equals: post.id } },
      sort: '-publishedAt',
    })

    // Every seeded post currently sits in a different pillar, so the
    // pillar-matched query above is often empty. Backfill with other recent
    // articles rather than leave the page with nothing to click into next.
    if (samePillar.docs.length >= 3) return { docs: samePillar.docs, allSamePillar: true }
    const excludeIds = [post.id, ...samePillar.docs.map((d) => d.id)]
    const backfill = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 3 - samePillar.docs.length,
      overrideAccess: false,
      where: { id: { not_in: excludeIds } },
      sort: '-publishedAt',
    })
    return { docs: [...samePillar.docs, ...backfill.docs], allSamePillar: backfill.docs.length === 0 }
  })()

  const relatedItems: RelatedItem[] = related.map((doc) => {
    const docSectorName = typeof doc.sector === 'object' ? doc.sector?.name : undefined
    return {
      id: doc.id,
      href: `/magazine/${doc.slug}`,
      title: doc.title,
      summary: doc.excerpt,
      image: doc.heroImage,
      imageAlt: doc.title,
      meta: [PILLAR_LABEL[doc.pillar as string], docSectorName, doc.country],
    }
  })

  return (
    <article className="pb-24">
      <ArticleHero
        title={post.title}
        image={post.heroImage}
        imageAlt={post.title}
        meta={[PILLAR_LABEL[post.pillar as string], sectorName, post.country]}
        backHref="/magazine"
        backLabel="All articles"
      />

      <div className="container mt-12 max-w-3xl">
        {(authorNames || post.publishedAt) && (
          <p className="mb-8 border-b border-hairline pb-6 text-body-s text-on-surface-muted">
            {authorNames && <span>By {authorNames}</span>}
            {authorNames && post.publishedAt && <span className="px-2">·</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {publishedFormatter.format(new Date(post.publishedAt))}
              </time>
            )}
          </p>
        )}
        <RichText data={post.content} enableGutter={false} />
      </div>

      <RelatedItems
        title={
          allSamePillar
            ? `More from ${PILLAR_LABEL[post.pillar as string] || 'the magazine'}`
            : 'More from the magazine'
        }
        items={relatedItems}
      />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const post = await queryPostBySlug(slug)
  return generateMeta({ doc: post })
}

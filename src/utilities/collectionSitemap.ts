import { getPayload } from 'payload'
import config from '@payload-config'
import type { CollectionSlug } from 'payload'
import {
  PUBLISHED_EVENTS_AVAILABLE,
  PUBLISHED_MAGAZINE_AVAILABLE,
  PUBLISHED_OPPORTUNITIES_AVAILABLE,
  VERIFIED_MEMBER_STORIES_AVAILABLE,
} from '@/lib/content-policy'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

export async function buildCollectionSitemap(collection: CollectionSlug, urlPrefix: string) {
  if (collection === 'case-studies' && !VERIFIED_MEMBER_STORIES_AVAILABLE) return []
  if (collection === 'opportunities' && !PUBLISHED_OPPORTUNITIES_AVAILABLE) return []
  if (collection === 'events' && !PUBLISHED_EVENTS_AVAILABLE) return []
  if (collection === 'posts' && !PUBLISHED_MAGAZINE_AVAILABLE) return []
  const payload = await getPayload({ config })

  const results = await payload.find({
    collection,
    overrideAccess: false,
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: { _status: { equals: 'published' }, ...(collection === 'posts' && !VERIFIED_MEMBER_STORIES_AVAILABLE ? { pillar: { not_equals: 'deal-stories' } } : {}) },
    select: { slug: true, updatedAt: true },
  })

  const dateFallback = new Date().toISOString()

  return results.docs
    .filter((doc) => Boolean((doc as { slug?: string }).slug))
    .map((doc) => ({
      loc: `${SITE_URL}/${urlPrefix}/${(doc as { slug?: string }).slug}`,
      lastmod: (doc as { updatedAt?: string }).updatedAt || dateFallback,
    }))
}

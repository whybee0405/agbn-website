import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const staticRoutes = [
      '',
      'opportunities',
      'about',
      'pricing',
      'events',
      'case-studies',
      'contact',
      'join',
      'download-app',
    ]

    const dateFallback = new Date().toISOString()

    const defaultSitemap = staticRoutes.map((route) => ({
      loc: `${SITE_URL}/${route}`,
      lastmod: dateFallback,
    }))

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    })

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => ({
            loc: `${SITE_URL}/${page?.slug}`,
            lastmod: page.updatedAt || dateFallback,
          }))
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  { tags: ['pages-sitemap'] },
)

export async function GET() {
  const sitemap = await getPagesSitemap()
  return getServerSideSitemap(sitemap)
}

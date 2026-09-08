import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { buildCollectionSitemap } from '@/utilities/collectionSitemap'

const getSitemap = unstable_cache(
  () => buildCollectionSitemap('opportunities', 'opportunities'),
  ['opportunities-sitemap'],
  { tags: ['opportunities-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getSitemap())
}

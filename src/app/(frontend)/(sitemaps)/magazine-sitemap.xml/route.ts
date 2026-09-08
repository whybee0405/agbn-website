import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { buildCollectionSitemap } from '@/utilities/collectionSitemap'

const getSitemap = unstable_cache(
  () => buildCollectionSitemap('posts', 'magazine'),
  ['magazine-sitemap'],
  { tags: ['magazine-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getSitemap())
}

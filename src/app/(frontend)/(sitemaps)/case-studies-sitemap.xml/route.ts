import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { buildCollectionSitemap } from '@/utilities/collectionSitemap'

const getSitemap = unstable_cache(
  () => buildCollectionSitemap('case-studies', 'case-studies'),
  ['case-studies-sitemap'],
  { tags: ['case-studies-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getSitemap())
}

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getOpportunityContext(slug?: string) {
  if (!slug || slug.length > 200) return undefined
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({ collection: 'opportunities', overrideAccess: false, limit: 1, where: { slug: { equals: slug } }, select: { slug: true, title: true } })
  const opportunity = result.docs[0]
  return opportunity?.slug ? { slug: opportunity.slug, title: opportunity.title } : undefined
}

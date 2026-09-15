import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug

  const page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageBySlug({
    slug: decodedSlug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  return (
    <article className="section-y">
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <div className="container max-w-3xl">
        <h1 className="mb-10 text-display-l tracking-display-tight text-on-surface-heading">{page.title}</h1>
        {page.body && <RichText data={page.body} enableGutter={false} />}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({ slug: decodedSlug })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] || null
})

import type { Metadata } from 'next'

import type { Media, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (
  image: Media | Config['db']['defaultIDType'] | null | undefined,
  fallbackTitle: string,
) => {
  const serverUrl = getServerSideURL()

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url
    return ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return `${serverUrl}/api/og?title=${encodeURIComponent(fallbackTitle)}`
}

type MetaDoc = {
  slug?: string | string[] | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: Media | Config['db']['defaultIDType'] | null
  } | null
}

export const generateMeta = async (args: { doc: MetaDoc | null }): Promise<Metadata> => {
  const { doc } = args

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | AGBN, Africa & Global Business Network'
    : 'AGBN, Africa & Global Business Network'

  const ogImage = getImageURL(doc?.meta?.image, doc?.meta?.title || title)

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: [{ url: ogImage }],
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}

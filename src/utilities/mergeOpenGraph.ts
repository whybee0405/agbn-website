import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Turn your network into income. AGBN connects business owners across Africa to vetted opportunities and pays commission when referrals become deals.',
  images: [
    {
      url: `${getServerSideURL()}/api/og`,
    },
  ],
  siteName: 'AGBN, Africa & Global Business Network',
  title: 'AGBN, turn your network into income.',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}

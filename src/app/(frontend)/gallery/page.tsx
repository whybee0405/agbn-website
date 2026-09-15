import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { EmptyState } from '@/components/EmptyState'
import { GalleryGallery } from '@/components/GalleryGallery'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const payload = await getPayload({ config: configPromise })
  const gallery = await payload.find({
    collection: 'gallery',
    depth: 1,
    limit: 100,
    sort: ['order', '-updatedAt'],
    overrideAccess: false,
  })

  return (
    <>
      <PageHeader
        backgroundImage="/home/subpages/gallery-network.webp"
        backgroundPosition="center 48%"
        title="Gallery"
        lede="A view into the people, places and conversations that move the AGBN network."
      />
      <Section tone="page" rhythm="lg" rhythmTop="sm">
        {gallery.docs.length ? (
          <GalleryGallery items={gallery.docs} />
        ) : (
          <EmptyState
            title="The gallery is being prepared."
            action={<Button asChild variant="gold"><Link href="/contact">Contact AGBN</Link></Button>}
          />
        )}
      </Section>
    </>
  )
}

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Images and video from the Africa & Global Business Network.',
}

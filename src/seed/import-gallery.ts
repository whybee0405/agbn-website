import configPromise from '@payload-config'
import { readdir, rename } from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'

const sourceDirectory = path.resolve(process.cwd(), 'src/seed/assets/gallery')
const supportedExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.mov', '.mp4', '.png', '.webm', '.webp'])
const videoExtensions = new Set(['.mov', '.mp4', '.webm'])

const toSlug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const toTitle = (slug: string) => slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
const galleryTitle = (slug: string) =>
  /^dsc\d+$/i.test(slug) ? `AGBN Gallery Frame ${slug.slice(3)}` : toTitle(slug)

async function importGallery() {
  const payload = await getPayload({ config: configPromise })
  const entries = (await readdir(sourceDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const [index, entry] of entries.entries()) {
    const extension = path.extname(entry.name).toLowerCase()
    const originalBase = path.basename(entry.name, path.extname(entry.name))
    const baseSlug = (toSlug(originalBase).replace(/^agbn-/, '') || `gallery-item-${index + 1}`)
    const normalizedName = `agbn-${baseSlug}${extension}`
    const currentPath = path.join(sourceDirectory, entry.name)
    const normalizedPath = path.join(sourceDirectory, normalizedName)

    if (entry.name !== normalizedName) await rename(currentPath, normalizedPath)

    const existingMedia = await payload.find({
      collection: 'media',
      limit: 1,
      where: { filename: { equals: normalizedName } },
    })
    const media = existingMedia.docs[0] || await payload.create({
      collection: 'media',
      data: { alt: galleryTitle(baseSlug) },
      filePath: normalizedPath,
    })

    const existingGalleryItem = await payload.find({
      collection: 'gallery',
      limit: 1,
      where: { media: { equals: media.id } },
    })
    if (existingGalleryItem.docs[0]) continue

    await payload.create({
      collection: 'gallery',
      data: {
        title: galleryTitle(baseSlug),
        group: 'AGBN Gallery',
        media: media.id,
        mediaType: videoExtensions.has(extension) ? 'video' : 'image',
        order: index + 1,
        _status: 'published',
      },
      context: { disableRevalidate: true },
    })
  }

  payload.logger.info(`Imported ${entries.length} gallery asset${entries.length === 1 ? '' : 's'}.`)
}

void importGallery()

import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: 'Gallery item',
    plural: 'Gallery',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['group', 'title', 'mediaType', 'order', 'updatedAt'],
  },
  fields: [
    {
      name: 'group',
      label: 'Gallery group',
      type: 'text',
      required: true,
      admin: {
        description: 'The shared label shown above a set of related gallery items, for example “AGBN Durban networking breakfast”.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'A private descriptive label for screen readers and the enlarged viewer. It is not displayed on gallery tiles.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mediaType',
          type: 'select',
          required: true,
          defaultValue: 'image',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          admin: {
            width: '50%',
            description: 'Lower numbers appear first. Items with the same number keep their most recently updated order.',
          },
        },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload the image or video file for this gallery item.',
      },
    },
    {
      name: 'poster',
      label: 'Video poster image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Recommended for video items. This still image appears in the gallery before the video is opened.',
        condition: (_, siblingData) => siblingData?.mediaType === 'video',
      },
    },
  ],
  versions: {
    drafts: true,
  },
}

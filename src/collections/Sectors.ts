import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '../fields/slug'

export const Sectors: CollectionConfig = {
  slug: 'sectors',
  labels: {
    singular: 'Sector',
    plural: 'Sectors',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField('name'),
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Lucide icon name (e.g. "pickaxe", "leaf", "cpu")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}

import type { GlobalConfig } from 'payload'

import { navLink } from '@/fields/navLink'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [navLink()],
      maxRows: 7,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Join AGBN',
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
  versions: false,
}

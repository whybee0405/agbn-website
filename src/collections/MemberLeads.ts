import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { SADC_COUNTRY_OPTIONS } from '../constants/countries'

export const MemberLeads: CollectionConfig = {
  slug: 'member-leads',
  labels: {
    singular: 'Member Lead',
    plural: 'Member Leads',
  },
  access: {
    create: anyone,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'selectedTier', 'status', 'submittedAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'country', type: 'select', options: SADC_COUNTRY_OPTIONS },
    {
      name: 'selectedTier',
      type: 'relationship',
      relationTo: 'pricing-plans',
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Converted', value: 'converted' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'submittedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar' },
    },
  ],
}

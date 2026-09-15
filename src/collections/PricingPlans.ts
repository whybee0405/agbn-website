import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const PricingPlans: CollectionConfig = {
  slug: 'pricing-plans',
  labels: {
    singular: 'Pricing Plan',
    plural: 'Pricing Plans',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'currency', 'highlighted', 'order'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          admin: { width: '33%' },
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
          defaultValue: 'ZAR',
          options: [{ label: 'ZAR — South African rand', value: 'ZAR' }],
          admin: { width: '33%' },
        },
        {
          name: 'billingPeriod',
          type: 'select',
          required: true,
          defaultValue: 'month',
          options: [
            { label: 'Per month', value: 'month' },
            { label: 'Per year', value: 'year' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'localPriceEstimate',
      type: 'text',
      admin: {
        description: 'Optional supporting note shown below the price. Leave blank when the price above is the final ZAR fee.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      required: true,
    },
    {
      name: 'ctaText',
      type: 'text',
      required: true,
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'highlighted',
      type: 'checkbox',
      defaultValue: false,
      label: 'Most popular',
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}

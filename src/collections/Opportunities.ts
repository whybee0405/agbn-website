import type { CollectionConfig } from 'payload'

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
} from '@payloadcms/plugin-seo/fields'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { slugField } from '../fields/slug'

export const Opportunities: CollectionConfig = {
  slug: 'opportunities',
  labels: {
    singular: 'Opportunity',
    plural: 'Opportunities',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sector', 'country', 'listingStatus', 'datePosted'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField('title'),
    {
      type: 'row',
      fields: [
        {
          name: 'sector',
          type: 'relationship',
          relationTo: 'sectors',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'listingStatus',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      /*
       * The referral commission, as a percentage.
       *
       * This is the single most persuasive number on a listing — "earn
       * commission when your referrals become deals" is the product (Brand DNA
       * §4) — and the AGBN app design surfaces it on every opportunity card.
       * The website was omitting it entirely.
       *
       * Optional: a listing with no agreed rate shows nothing rather than a
       * guess (Brand DNA §2, no stat without a number).
       */
      name: 'commissionRate',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        position: 'sidebar',
        description: 'Referral commission as a percentage, e.g. 5. Leave empty to hide.',
      },
    },
    {
      name: 'datePosted',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One or two sentences shown on the directory card.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        OverviewField({
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
          imagePath: 'meta.image',
        }),
        MetaTitleField({ hasGenerateFn: true }),
        MetaImageField({ relationTo: 'media' }),
        MetaDescriptionField({}),
      ],
    },
  ],
  versions: {
    drafts: true,
  },
}

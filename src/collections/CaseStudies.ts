import type { CollectionConfig } from 'payload'

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
} from '@payloadcms/plugin-seo/fields'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { slugField } from '../fields/slug'
import { SADC_COUNTRY_OPTIONS } from '../constants/countries'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: {
    singular: 'Case Study',
    plural: 'Case Studies',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'memberName',
    defaultColumns: ['memberName', 'memberBusiness', 'country', 'sector'],
  },
  fields: [
    {
      name: 'memberName',
      type: 'text',
      required: true,
    },
    slugField('memberName'),
    {
      type: 'row',
      fields: [
        {
          name: 'memberBusiness',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'country',
          type: 'select',
          required: true,
          options: SADC_COUNTRY_OPTIONS,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'sector',
      type: 'relationship',
      relationTo: 'sectors',
      required: true,
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
    },
    {
      name: 'youtubeUrl',
      label: 'YouTube video URL',
      type: 'text',
      admin: {
        description: 'Optional. Paste a YouTube or youtu.be link to embed the video on this case study.',
      },
      validate: (value: unknown) => {
        if (!value) return true
        if (typeof value !== 'string') return 'Use a valid YouTube or youtu.be URL.'
        try {
          const hostname = new URL(value).hostname.replace(/^www\./, '')
          return hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtu.be' || 'Use a valid YouTube or youtu.be URL.'
        } catch {
          return 'Use a valid YouTube or youtu.be URL.'
        }
      },
    },
    {
      name: 'body',
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
      name: 'outcomeMetric',
      type: 'text',
      admin: {
        description:
          'e.g. "Referral closed: $40,000 contract". Only fill in if the member consented to share a real figure.',
      },
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

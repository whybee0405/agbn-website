import type { GlobalConfig } from 'payload'

import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'Turn your network into income.',
    },
    {
      name: 'stats',
      type: 'group',
      admin: {
        description:
          'Every stat is optional. Leave a field empty to hide that stat on the homepage. Never ship a stat with no number behind it (Audit Issue #6).',
      },
      fields: [
        { name: 'members', type: 'number' },
        { name: 'countries', type: 'number' },
        { name: 'opportunitiesPosted', type: 'number' },
        { name: 'commissionEarned', type: 'text', admin: { description: 'e.g. "$128,000". Leave empty to hide.' } },
        {
          name: 'dealsClosed',
          type: 'number',
          admin: { description: 'Referrals that became closed deals. Leave empty to hide.' },
        },
        {
          name: 'businessesListed',
          type: 'number',
          admin: {
            description:
              'Member businesses in the directory, if you track it separately from total members. Leave empty to hide.',
          },
        },
        {
          name: 'averageResponseDays',
          type: 'number',
          admin: {
            description:
              'Typical days from referral to first introduction. A small, specific number is more persuasive than a big vague one. Leave empty to hide.',
          },
        },
        {
          name: 'asOf',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' },
            description:
              'The date these figures were last counted. Shown on the homepage as "Figures as of September 2026". This is what makes the numbers a checkable claim rather than a marketing line (Brand DNA §2) — set it whenever you update a figure above. Leave empty to hide the line.',
          },
        },
      ],
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'whatsappGroupUrl',
      type: 'text',
      defaultValue: 'https://chat.whatsapp.com/BRnfMQiLnuI04bsvTolanM?s=cl&p=i&mlu=4&ilr=4',
      admin: { description: 'Link to the existing WhatsApp community group.' },
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'X / Twitter', value: 'twitter' },
                { label: 'WhatsApp', value: 'whatsapp' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}

import type { Field } from 'payload'

// Fixed catalogue of real, existing routes. A nav item can only ever point at
// something in this list (or an explicit external URL), so a broken internal
// link can never ship — this is the structural fix for Audit Issue #7.
export const SITE_ROUTES: { label: string; value: string }[] = [
  { label: 'Home', value: '/' },
  { label: 'Opportunities', value: '/opportunities' },
  { label: 'About', value: '/about' },
  { label: 'Pricing', value: '/pricing' },
  { label: 'Events', value: '/events' },
  { label: 'Gallery', value: '/gallery' },
  { label: 'Case Studies', value: '/case-studies' },
  { label: 'Contact', value: '/contact' },
  { label: 'Join AGBN', value: '/join' },
  { label: 'AGBN App', value: '/download-app' },
  { label: 'Privacy Policy', value: '/privacy' },
  { label: 'Terms of Service', value: '/terms' },
]

export const navLink = (): Field => ({
  name: 'link',
  type: 'group',
  admin: {
    hideGutter: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          admin: { layout: 'horizontal', width: '50%' },
          defaultValue: 'internal',
          options: [
            { label: 'Site page', value: 'internal' },
            { label: 'External URL', value: 'external' },
          ],
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Open in new tab',
          admin: { style: { alignSelf: 'flex-end' }, width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'route',
          type: 'select',
          label: 'Page',
          options: SITE_ROUTES,
          required: true,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.type === 'internal',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'External URL',
          required: true,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.type === 'external',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
})

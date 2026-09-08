import type { Field } from 'payload'

// Exported so the seed script can look documents up by the value this hook will
// actually write. Deduping on the source field instead (title, name) breaks the
// moment a title is reworded without changing its slug: the lookup misses, the
// insert runs, and it collides with the existing row's unique slug.
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Payload 3.88 has no native `slug` field type — this is the standard
// text-field + beforeValidate-hook pattern used before/without that feature.
export const slugField = (fieldToUse = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (value && typeof value === 'string') return slugify(value)
        const source = data?.[fieldToUse]
        if (typeof source === 'string' && source.length > 0) return slugify(source)
        return value
      },
    ],
  },
})

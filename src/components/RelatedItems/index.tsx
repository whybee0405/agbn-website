import React from 'react'

import { CardGrid, EntityCard } from '@/components/EntityCard'
import type { Media as MediaType } from '@/payload-types'

export type RelatedItem = {
  id: string | number
  href: string
  title: string
  summary?: string | null
  image?: MediaType | string | number | null
  imageAlt?: string
  meta?: (string | null | undefined)[]
  metric?: string | null
  status?: string | null
}

type Props = {
  title: string
  items: RelatedItem[]
}

/**
 * Fills the space below a detail page's body with more of the same collection
 * rather than a void. Every article/opportunity/case-study/event page ends at
 * a single dek-length body field today; this gives a visitor somewhere to go
 * next instead of dead-ending at the footer.
 */
export const RelatedItems: React.FC<Props> = ({ title, items }) => {
  if (items.length === 0) return null

  return (
    <div className="container mt-16 border-t border-hairline pt-12">
      <h2 className="text-display-s text-on-surface-heading">{title}</h2>
      <CardGrid className="mt-6">
        {items.map((item) => (
          <EntityCard
            key={item.id}
            href={item.href}
            title={item.title}
            summary={item.summary}
            image={item.image}
            imageAlt={item.imageAlt}
            meta={item.meta}
            metric={item.metric}
            status={item.status}
          />
        ))}
      </CardGrid>
    </div>
  )
}

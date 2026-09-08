import React from 'react'

import { NetworkMap } from '@/components/NetworkMap'
import { cn } from '@/utilities/ui'

type Props = {
  title: string
  /** Say what happens next. Never apologise, never dead-end. */
  body?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Brand DNA §5.4: an empty state is an unconnected node plus copy that invites
 * action. Shared here because five pages were each hand-rolling their own
 * version, and two of them dead-ended with no way forward.
 */
export const EmptyState: React.FC<Props> = ({ title, body, action, className }) => (
  <div className={cn('flex flex-col items-center px-6 py-20 text-center', className)}>
    <NetworkMap variant="empty" className="scale-125" />
    <h2 className="mt-6 text-display-s text-on-surface-heading">{title}</h2>
    {body && <p className="mt-3 measure-tight text-body-s text-on-surface-muted">{body}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
)

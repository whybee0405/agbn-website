import Link from 'next/link'
import React from 'react'

type NavLinkData = {
  type?: 'internal' | 'external' | null
  route?: string | null
  url?: string | null
  label?: string | null
  newTab?: boolean | null
}

type Props = {
  link: NavLinkData
  className?: string
  children?: React.ReactNode
  /** Passed through so callers can mark the active route for screen readers. */
  'aria-current'?: React.AriaAttributes['aria-current']
}

export const NavLink: React.FC<Props> = ({ link, className, children, ...rest }) => {
  if (!link) return null
  const href = link.type === 'external' ? link.url : link.route
  if (!href) return null

  const newTabProps = link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  return (
    <Link href={href} className={className} {...newTabProps} {...rest}>
      {children ?? link.label}
    </Link>
  )
}

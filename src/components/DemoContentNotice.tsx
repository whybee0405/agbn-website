type DemoContentNoticeProps = {
  className?: string
}

export function DemoContentNotice({ className = '' }: DemoContentNoticeProps) {
  return (
    <p
      role="note"
      className={`rounded border border-hairline bg-surface-sunken px-3 py-2 font-mono text-caption leading-relaxed text-on-surface-muted ${className}`}
    >
      Demo content: these illustrative examples preview the AGBN experience; they are not live listings,
      confirmed events, or verified member outcomes.
    </p>
  )
}

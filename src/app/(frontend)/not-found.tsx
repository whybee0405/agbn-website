import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { NetworkMap } from '@/components/NetworkMap'

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface-deep py-24 text-on-dark">
      <div className="container max-w-xl text-center">
        <NetworkMap variant="empty" className="mx-auto mb-8 scale-150" />
        <h1 className="text-display-l tracking-display-tight text-on-dark">
          This node isn&rsquo;t connected.
        </h1>
        <p className="mx-auto mt-5 measure text-lede text-on-dark-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist, or has moved.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="gold" size="lg">
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="onDark" size="lg">
            <Link href="/opportunities">Explore Opportunities</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

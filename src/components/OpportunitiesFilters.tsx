'use client'

import React, { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { trackEvent } from '@/components/Analytics'
import { NetworkMap } from '@/components/NetworkMap'

type Option = { label: string; value: string }

type Props = {
  sectors: Option[]
  countries: Option[]
}

export const OpportunitiesFilters: React.FC<Props> = ({ sectors, countries }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    trackEvent('Opportunities Filter', { [key]: value || 'cleared' })
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3" role="search">
      <select
        aria-label="Filter by sector"
        className="select-field h-11 min-w-[10rem] rounded-md border border-input bg-surface-raised px-3.5 text-body-s text-on-surface transition-colors hover:border-on-surface-muted"
        value={searchParams.get('sector') || ''}
        onChange={(e) => updateParam('sector', e.target.value)}
      >
        <option value="">All sectors</option>
        {sectors.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by country"
        className="select-field h-11 min-w-[10rem] rounded-md border border-input bg-surface-raised px-3.5 text-body-s text-on-surface transition-colors hover:border-on-surface-muted"
        value={searchParams.get('country') || ''}
        onChange={(e) => updateParam('country', e.target.value)}
      >
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {isPending && <NetworkMap variant="loading" className="h-8 w-8" />}
    </div>
  )
}

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'

/** Outcomes stay unpublished until AGBN supplies verified, approved stories. */
export function StoriesPending() {
  return <><PageHeader title="Every connection has a story." lede="Member stories will have a home here when verified outcomes are available to share." tone="deep" /><Section tone="page" rhythm="lg"><div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><p className="text-caption font-medium uppercase tracking-[0.14em] text-on-surface-accent">A chapter still to come</p><div><h2 className="max-w-2xl text-display-l text-on-surface-heading">For now, start with<br />the possibilities.</h2><p className="mt-6 max-w-xl text-body-l text-on-surface-muted">Explore the opportunity board, get to know the membership options, or ask the team how a referral works. We aren’t publishing member results or earnings claims yet.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="gold"><Link href="/opportunities">Explore opportunities <ArrowRight /></Link></Button><Button asChild variant="outline"><Link href="/contact">Ask the team</Link></Button></div></div></div></Section></>
}

'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'

const STEPS = [
  { number: '01', title: 'Connect', label: 'Start with who you know.', body: 'Bring your sector knowledge and business relationships to the AGBN community.', href: '/join', action: 'Join the network', image: '/home/gallery-tunis.jpg' },
  { number: '02', title: 'Refer', label: 'See a fit. Make the introduction.', body: 'Find an opportunity that matches someone in your network, then confirm the referral terms with the team.', href: '/opportunities', action: 'Explore the opportunity board', image: '/home/gallery-luanda.jpg' },
  { number: '03', title: 'Earn', label: 'Commission follows the agreed terms.', body: 'When an eligible referral becomes a completed deal, commission follows the terms agreed for that opportunity.', href: '/pricing', action: 'Compare membership', image: '/home/gallery-bamako.jpg' },
  { number: '04', title: 'Grow', label: 'Build on every conversation.', body: 'Stay connected through the member community, sector opportunities and events.', href: '/events', action: 'See network events', image: '/home/gallery-cairo.jpg' },
]

export function ReferralJourney() {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(15rem,0.6fr)_minmax(0,1.4fr)] lg:gap-20">
      <div className="lg:pt-4">
        <p className="mb-4 text-caption font-medium uppercase tracking-[0.15em] text-on-surface-accent">How the network works</p>
        <h2 className="max-w-lg text-display-l text-on-surface-heading">Good business starts<br />with a connection.</h2>
        <p className="mt-5 max-w-sm text-body-m text-on-surface-muted">Follow the path from a conversation to a more valuable business relationship.</p>
      </div>
      <ol className="journey-links grid overflow-hidden rounded-lg border border-hairline">
        {STEPS.map((step) => (
          <li key={step.title} className="min-w-0 border-b border-hairline last:border-b-0">
            <Link href={step.href} className="journey-link group relative grid min-h-[10.5rem] overflow-hidden p-6 sm:p-8" style={{ '--journey-image': `url(${step.image})` } as CSSProperties}>
              <span className="journey-link-image" aria-hidden="true" />
              <span className="journey-link-shade" aria-hidden="true" />
              <span className="relative z-10 grid content-between gap-8 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start sm:gap-6">
                <span className="tabular text-caption text-on-surface-accent transition-colors duration-300 group-hover:text-gold group-focus-visible:text-gold">{step.number}</span>
                <span className="min-w-0">
                  <span className="block text-display-m text-on-surface-heading transition-colors duration-300 group-hover:text-white group-focus-visible:text-white">{step.title}</span>
                  <span className="mt-2 block text-body-s font-medium text-on-surface transition-colors duration-300 group-hover:text-white group-focus-visible:text-white">{step.label}</span>
                  <span className="mt-2 block max-w-xl text-body-s text-on-surface-muted transition-colors duration-300 group-hover:text-white/85 group-focus-visible:text-white/85">{step.body}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-body-s font-medium text-on-surface transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-white group-focus-visible:translate-x-1 group-focus-visible:text-white">{step.action} <ArrowUpRight size={17} aria-hidden="true" /></span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/components/Section'
import { Button } from '@/components/ui/button'

export const revalidate = 3600
export default function AboutPage() {
  return (
    <>
      <Section tone="deep" rhythm="lg">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-6 text-caption uppercase tracking-[0.15em] text-gold">About AGBN</p>
            <h1 className="text-display-xl text-white">
              Business travels
              <br />
              through people.
            </h1>
          </div>
          <p className="max-w-md text-lede text-on-dark-muted">
            A supplier you trust. A business that needs a partner. An introduction that opens a
            door. That is where our network begins.
          </p>
        </div>
      </Section>
      <Section tone="page" rhythm="lg">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image
              src="/home/gallery-cairo.jpg"
              alt="Illustrative scene of fabric being prepared in a textile workshop."
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-display-l text-on-surface-heading">
              Local knowledge.
              <br />
              Shared possibility.
            </h2>
            <p className="mt-6 text-body-l text-on-surface-muted">
              Africa &amp; Global Business Network brings business owners together around
              opportunities, introductions and referrals. Our ambition is to make business
              connections more accessible across Africa and beyond.
            </p>
            <p className="mt-4 text-body-m text-on-surface-muted">
              Membership gives you a place to explore opportunities, meet other businesses and make
              introductions. When an eligible referral becomes a deal, commission is governed by the
              terms agreed for that opportunity.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <Link href="/opportunities">
                Explore the opportunity board <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
      <Section tone="sunken" rhythm="lg">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <h2 className="text-display-l text-on-surface-heading">
            A network you
            <br />
            can take part in.
          </h2>
          <div className="divide-y divide-hairline border-t border-hairline">
            {[
              [
                'Bring what you know',
                'Your understanding of a sector, a market or a business can help you recognise an opportunity someone else might miss.',
              ],
              [
                'Ask the right questions',
                'Before making a referral, speak to the team about availability, eligibility, commission and how the introduction will be recorded.',
              ],
              [
                'Choose your next step',
                'Explore membership options or start with a conversation. You can ask about the network before you apply.',
              ],
            ].map(([title, body], i) => (
              <div key={title} className="grid grid-cols-[2rem_1fr] gap-4 py-7">
                <span
                  className="tabular pt-1 text-caption text-on-surface-accent"
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-display-s text-on-surface-heading">{title}</h3>
                  <p className="mt-3 text-body-m text-on-surface-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section tone="page" rhythm="lg">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-display-l text-on-surface-heading">
              Let’s talk about
              <br />
              your next connection.
            </h2>
            <p className="mt-5 max-w-xl text-body-l text-on-surface-muted">
              Tell us your sector, where you work and what you’re looking for. The team can help you
              understand where membership fits.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href="/contact">
                Talk to the team <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View membership</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
export const metadata: Metadata = {
  title: 'About AGBN',
  description:
    'Get to know Africa & Global Business Network: business opportunities, introductions and connections across Africa.',
}

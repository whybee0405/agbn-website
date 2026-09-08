import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { Reveal } from '@/components/Reveal'
import { PageHeader, Section, SectionHeading } from '@/components/Section'
import { Button } from '@/components/ui/button'

export const revalidate = 3600

const VALUES = [
  {
    title: 'Trust first',
    body: 'Every claim is backed by something visible. No stat without a number, no promise without a way to verify it.',
  },
  {
    title: 'Pan-African, not one-country',
    body: 'Our sectors, member stories, and case studies visibly span the continent, never just one market.',
  },
  {
    title: 'Opportunity is specific, not abstract',
    body: 'We name the sector, the number, the outcome, never vague "grow your business" language.',
  },
  {
    title: 'Access over exclusivity',
    body: 'Ambitious, not gatekeeping. Every tier is a door, not a velvet rope.',
  },
]

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise })
  const pricingPlans = await payload.find({
    collection: 'pricing-plans',
    limit: 3,
    sort: 'order',
    overrideAccess: false,
  })

  return (
    <>
      <PageHeader
        tone="deep"
        title="An economic engine, not a content platform."
        lede="AGBN turns a business owner's existing network into a source of income, by connecting people to vetted opportunities across sectors and paying commission when referrals become deals."
      />

      {/* Mission and vision as a two-up statement. Deliberately typographic:
          this is the page's argument, not a feature list. */}
      <Section tone="page" rhythm="lg" rhythmTop="sm">
        <div className="grid gap-12 border-t border-hairline pt-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-accent">
              Mission
            </h2>
            <p className="mt-5 measure text-display-s leading-snug text-on-surface-heading">
              To build Africa&rsquo;s largest opportunity-sharing ecosystem, where connections
              become partnerships and opportunities become income.
            </p>
          </div>
          <div>
            <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-accent">
              Vision
            </h2>
            <p className="mt-5 measure text-display-s leading-snug text-on-surface-heading">
              A continent where every entrepreneur has access to opportunities, markets, and
              meaningful business relationships, regardless of which of the 54 countries they start
              in.
            </p>
          </div>
        </div>
      </Section>

      {/* Values. Numbered rows on a dark band rather than four bordered boxes,
          which is the layout the old page shared with five other pages. */}
      {/*
        `sunken`, not `brand`. This band sat between two white sections, and it
        was the only dark band in the interior of any subpage — it pushed About
        to 66% dark by area, the heaviest page on the site. On Slate 50 the page
        now reads white → grey → white between its dark masthead and CTA, which
        keeps a tonal rhythm without a second slab of navy in the middle.

        Gold on Slate 50 is ~2.2:1, so the step numerals move to the deepened
        Clay accent token, which clears AA at this size (Brand DNA §5.2).
      */}
      <Section tone="sunken" rhythm="lg">
        <SectionHeading title="What we stand for" size="l" />
        <dl className="mt-12 grid gap-x-16 gap-y-10 sm:grid-cols-2">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 70}>
              <dt className="flex items-baseline gap-4 text-display-s text-on-surface-heading">
                <span className="tabular text-body-s text-on-surface-accent" aria-hidden="true">
                  0{i + 1}
                </span>
                {value.title}
              </dt>
              <dd className="mt-3 pl-9 measure text-body-m text-on-surface-muted">{value.body}</dd>
            </Reveal>
          ))}
        </dl>
      </Section>

      <Section tone="page" rhythm="lg">
        <SectionHeading
          title="How membership works"
          lede="Every tier connects you to the same network: directory listing, the opportunity feed, and the member community. Higher tiers add priority introductions and visibility."
          action={
            <Button asChild variant="outline">
              <Link href="/pricing">Compare all tiers</Link>
            </Button>
          }
        />

        {pricingPlans.docs.length > 0 && (
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline md:grid-cols-3">
            {pricingPlans.docs.map((plan) => (
              <li key={plan.id} className="bg-surface-raised p-7">
                <h3 className="text-display-s text-on-surface-heading">{plan.name}</h3>
                <p className="mt-1 text-body-s text-on-surface-muted">{plan.tagline}</p>
                <p className="mt-5 tabular text-display-m text-on-surface-heading">
                  ${plan.price}
                  <span className="text-body-m">/{plan.billingPeriod}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="deep" rhythm="lg">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-l tracking-display-tight text-on-dark">
            Ready to turn your network into income?
          </h2>
          <Button asChild variant="gold" size="lg" className="mt-8">
            <Link href="/join">Join AGBN</Link>
          </Button>
        </div>
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'About',
    description:
      'AGBN turns a business owner’s existing network into a source of income by connecting people to vetted opportunities across Africa.',
  }
}

import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ArrowRight, Check } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'

export const revalidate = 3600

export default async function PricingPage() {
  const payload = await getPayload({ config: configPromise })
  const pricingPlans = await payload.find({
    collection: 'pricing-plans',
    limit: 12,
    sort: 'order',
    overrideAccess: false,
  })

  return (
    <>
      <PageHeader
        tone="deep"
        title="Find your place in the network."
        lede="Start with connections. Add visibility as your business grows. Choose the membership that fits your next move."
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
          <p className="text-body-m font-medium text-on-surface-heading">Apply today. Confirm your membership with the team.</p>
          <p className="text-body-s text-on-surface-muted">Prices in USD. No payment taken on this site.</p>
        </div>
        {pricingPlans.docs.length === 0 ? (
          <EmptyState
            title="Pricing is being finalised."
            body="Tiers and figures are confirmed shortly. Tell us about your business and we will be in touch when they are live."
            action={
              <Button asChild variant="outline">
                <Link href="/contact">Contact us</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
            {pricingPlans.docs.map((plan) => {
              const highlighted = Boolean(plan.highlighted)
              return (
                <div
                  key={plan.id}
                  className={
                    highlighted
                      ? 'flex min-w-0 flex-col rounded-lg border border-gold bg-surface-brand p-5 text-on-dark sm:p-7'
                      : 'flex min-w-0 flex-col rounded-lg border border-hairline bg-surface-raised p-5 sm:p-7'
                  }
                >
                  {highlighted && (
                    <p className="mb-3 font-mono text-caption uppercase tracking-[0.14em] text-gold">
                      More visibility
                    </p>
                  )}
                  <h2 className={highlighted ? 'text-display-m text-on-dark' : 'text-display-m text-on-surface-heading'}>
                    {plan.name}
                  </h2>
                  <p
                    className={
                      highlighted
                        ? 'mt-2 text-body-s text-on-dark-muted'
                        : 'mt-2 text-body-s text-on-surface-muted'
                    }
                  >
                    {plan.tagline}
                  </p>

                  <p className="mt-7 tabular text-display-l">
                    ${plan.price}
                    <span className="text-body-l">/{plan.billingPeriod}</span>
                  </p>
                  {plan.localPriceEstimate && (
                    /* Muted price context has to follow the surface. On the
                       navy card the light-surface muted token measured ~2.6:1. */
                    <p
                      className={
                        highlighted
                          ? 'mt-1 text-caption text-on-dark-muted'
                          : 'mt-1 text-caption text-on-surface-muted'
                      }
                    >
                      {plan.localPriceEstimate}
                    </p>
                  )}

                  <ul className="mt-8 flex-1 space-y-3.5">
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-body-s">
                        <Check
                          size={16}
                          aria-hidden="true"
                          className={
                            highlighted ? 'mt-1 shrink-0 text-gold' : 'mt-1 shrink-0 text-savanna'
                          }
                        />
                        <span className={highlighted ? 'text-on-dark-muted' : 'text-on-surface'}>
                          {f.feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/*
                    `ctaText` holds the tier's promise line — "Be seen. Be
                    trusted. Be preferred." It is good brand copy (Brand DNA §2
                    quotes it directly) but it was being used as the button
                    label, which meant no button on this page said what it did.
                    A visitor comparing three tiers could not tell that any of
                    them started an application.

                    The promise now sits above the button as copy, and the
                    button states the action and names the tier — so it still
                    makes sense read on its own, which is how screen reader
                    users encounter it in a list of links.
                  */}
                  {plan.ctaText && (
                    <p
                      className={
                        highlighted
                          ? 'mt-9 text-body-s text-gold'
                          : 'mt-9 text-body-s text-on-surface-accent'
                      }
                    >
                      {plan.ctaText}
                    </p>
                  )}
                  <Button
                    asChild
                    variant={highlighted ? 'gold' : 'outline'}
                    size="lg"
                    className="mt-3 w-full text-body-s"
                  >
                    <Link href={`/join?tier=${plan.id}`}>
                      Apply for {plan.name}
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        )}

      </Section>

      {/*
        The page previously ended at the three cards, which left every practical
        question a visitor has at the point of deciding — what happens when I
        apply, am I about to be charged, does a cheaper tier cut me out of the
        network — unanswered on the page where they are deciding.

        Every answer here is drawn from something the site already states: the
        three steps on the Join page, the payment note that used to sit as a
        line of small print under these cards, and the lede at the top of this
        page. Nothing new is promised.
      */}
      <Section tone="page" rhythm="lg">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-display-l tracking-display-tight text-on-surface-heading">
              Before you apply.
            </h2>
            <p className="mt-5 measure text-body-l text-on-surface-muted">
              A few things worth knowing, so there are no surprises after you send the form.
            </p>
          </div>

          <dl className="divide-y divide-hairline border-t border-hairline">
            {[
              {
                q: 'Am I paying now?',
                a: 'No payment is taken with the application. A member of the AGBN team follows up to confirm your tier and discuss payment before you commit.',
              },
              {
                q: 'What happens after I apply?',
                a: 'We review your business and confirm which tier fits, a member of the team calls you within two business days, and once you are confirmed your directory listing and opportunity feed go live.',
              },
              {
                q: 'Does a lower tier get a smaller network?',
                a: 'No. Every tier connects you to the same network and the same opportunity feed. Higher tiers add priority introductions, visibility and access, not more members.',
              },
              {
                q: 'Which currency am I charged in?',
                a: 'Tiers are priced in US dollars. The figure under each price is an approximate local equivalent and will move with the exchange rate.',
              },
            ].map((item) => (
              <div key={item.q} className="py-6">
                <dt className="text-display-s text-on-surface-heading">{item.q}</dt>
                <dd className="mt-2.5 measure text-body-m text-on-surface-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Pricing',
    description:
      'Compare AGBN membership tiers, Africa Connect, Africa Grow, and Africa Elite, and find the right fit for your business.',
  }
}

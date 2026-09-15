import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ArrowRight, Check } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { PageHeader, Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { getPricingPlanTone } from '@/utilities/pricingPlans'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

const formatPlanPrice = (price: number) => `R${price}`

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
        backgroundImage="/home/gallery-tunis.jpg"
        backgroundPosition="center 48%"
        title="Find your place in the network."
        lede="Start with connections. Add visibility as your business grows. Choose the membership that fits your next move."
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
          <p className="text-body-m font-medium text-on-surface-heading">Apply today. Confirm your membership with the team.</p>
          <p className="text-body-s text-on-surface-muted">All fees are in South African rand (ZAR). No payment is taken on this site.</p>
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
          <div className="relative isolate grid grid-cols-1 items-stretch gap-5 overflow-hidden rounded-[2rem] border border-hairline bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.12),transparent_31%),radial-gradient(circle_at_84%_78%,rgba(139,92,246,0.12),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(226,232,240,0.72))] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:grid-cols-3 md:gap-6 md:p-5">
            {pricingPlans.docs.map((plan) => {
              const tone = getPricingPlanTone(plan.name)
              const isGold = tone === 'gold'
              const isDark = !isGold
              const palette = {
                blue: 'border-blue-300/30 bg-[linear-gradient(145deg,rgba(37,99,235,0.78),rgba(15,23,42,0.94)_72%)] text-white shadow-[0_24px_60px_rgba(30,64,175,0.24)]',
                gold: 'border-amber-100/45 bg-[linear-gradient(145deg,rgba(255,236,179,0.72),rgba(204,164,59,0.82)_55%,rgba(154,111,15,0.88))] text-navy shadow-[0_24px_60px_rgba(133,89,8,0.22)]',
                purple: 'border-violet-200/25 bg-[linear-gradient(145deg,rgba(139,92,246,0.72),rgba(67,35,128,0.9)_58%,rgba(29,20,58,0.96))] text-white shadow-[0_24px_60px_rgba(76,29,149,0.24)]',
              }[tone]
              return (
                <div
                  key={plan.id}
                  className={`relative isolate flex min-w-0 flex-col overflow-hidden rounded-[1.35rem] border p-5 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-px before:-z-10 before:rounded-[1.28rem] before:bg-white/[0.07] before:shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] sm:p-7 ${palette} ${isGold ? 'md:-translate-y-3 md:shadow-[0_32px_72px_rgba(133,89,8,0.3)]' : ''}`}
                >
                  <span aria-hidden="true" className={`absolute -right-14 -top-14 -z-10 size-44 rounded-full blur-3xl ${isGold ? 'bg-white/35' : 'bg-white/15'}`} />
                  <span aria-hidden="true" className={`absolute -bottom-20 -left-14 -z-10 size-40 rounded-full blur-3xl ${isGold ? 'bg-amber-950/25' : tone === 'blue' ? 'bg-cyan-300/20' : 'bg-fuchsia-400/15'}`} />
                  <h2 className="text-display-m">{plan.name}</h2>
                  <p className={`mt-2 text-body-s ${isGold ? 'text-navy/75' : 'text-white/75'}`}>{plan.tagline}</p>

                  <p className="mt-7 flex flex-wrap items-baseline gap-x-1 tabular text-display-l">
                    {formatPlanPrice(plan.price)}
                    <span className="whitespace-nowrap text-body-l">/month</span>
                  </p>
                  {plan.localPriceEstimate && (
                    /* Muted price context has to follow the surface. On the
                       navy card the light-surface muted token measured ~2.6:1. */
                    <p
                      className={
                        isDark ? 'mt-1 text-caption text-white/70' : 'mt-1 text-caption text-navy/70'
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
                            isGold ? 'mt-1 shrink-0 text-navy' : 'mt-1 shrink-0 text-white'
                          }
                        />
                        <span className={isGold ? 'text-navy' : 'text-white/85'}>
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
                        isGold ? 'mt-9 text-body-s italic text-navy/80' : 'mt-9 text-body-s italic text-white/80'
                      }
                    >
                      {plan.ctaText}
                    </p>
                  )}
                  <Button
                    asChild
                    variant={isGold ? 'outline' : 'onDark'}
                    size="lg"
                    className={isGold ? 'mt-3 w-full border-navy/60 bg-transparent text-body-s text-navy hover:border-navy hover:bg-navy hover:text-white' : 'mt-3 w-full text-body-s'}
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
                q: 'Which currency are membership fees quoted in?',
                a: 'All membership fees are quoted in and collected in South African rand (ZAR). The amount shown on each tier is the applicable monthly fee.',
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
      'Compare AGBN membership tiers, Connect, Grow, and Grow Pro Max, and find the right fit for your business.',
  }
}

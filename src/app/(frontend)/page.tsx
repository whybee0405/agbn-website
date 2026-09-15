import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ArrowDown, ArrowRight, MoveUpRight } from 'lucide-react'
import { HeroParallax } from '@/components/HeroParallax'
import { ReferralJourney } from '@/components/ReferralJourney'
import { Media } from '@/components/Media'
import { GalleryGallery } from '@/components/GalleryGallery'
import { Section, SectionHeading } from '@/components/Section'
import { SectorIcon } from '@/components/SectorIcon'
import { Button } from '@/components/ui/button'
import { PUBLISHED_OPPORTUNITIES_AVAILABLE } from '@/lib/content-policy'
import { getPricingPlanTone } from '@/utilities/pricingPlans'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const [sectors, plans, opportunities, gallery] = await Promise.all([
    payload.find({ collection: 'sectors', limit: 100, overrideAccess: false }),
    payload.find({ collection: 'pricing-plans', limit: 3, sort: 'order', overrideAccess: false }),
    payload.find({
      collection: 'opportunities',
      depth: 1,
      limit: 3,
      sort: '-datePosted',
      overrideAccess: false,
      where: { listingStatus: { not_equals: 'closed' } },
    }),
    payload.find({
      collection: 'gallery',
      depth: 1,
      limit: 12,
      sort: ['order', '-updatedAt'],
      overrideAccess: false,
    }),
  ])
  return (
    <>
      <Section
        id="home-hero"
        tone="deep"
        rhythm="none"
        bleed
        className="home-hero relative isolate overflow-hidden"
      >
        <HeroParallax />
        <Image
          src="/home/hero-sandton.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="agbn-hero-layer agbn-hero-back object-cover object-bottom opacity-30"
        />
        <div className="home-hero-art" aria-hidden="true">
          <Image
            src="/home/hero-network-africa.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="agbn-hero-layer agbn-hero-mid object-contain mix-blend-screen"
          />
        </div>
        <div className="home-hero-shade absolute inset-0" aria-hidden="true" />
        <div className="container relative z-10">
          <div className="agbn-hero-fore home-hero-copy">
            <p className="mb-7 flex items-center gap-3 text-caption font-medium uppercase tracking-[0.16em] text-on-dark-muted">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              Africa &amp; Global Business Network
            </p>
            <h1 className="home-hero-title">
              Turn your
              <br />
              network into
              <br />
              <span className="text-gold">income.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lede text-on-dark-muted">
              You know people. They need opportunities.
              <br className="hidden sm:block" /> AGBN connects the two, with commission when a
              referral becomes a deal.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/opportunities">
                  Explore opportunities <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link href="/join">Become a member</Link>
              </Button>
            </div>
          </div>
          <div className="home-hero-foot flex flex-wrap items-center justify-between gap-4 border-t border-white/15 py-5 text-body-s text-on-dark-muted">
            <p>Local knowledge. Connections beyond borders.</p>
            <a href="#how-it-works" className="inline-flex min-h-11 items-center gap-3 text-white">
              How it works <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </Section>

      <Section tone="page" rhythm="lg" id="opportunity-preview">
        <SectionHeading
          kicker="The opportunity board"
          title={
            <>
              A connection worth
              <br className="hidden sm:block" /> making.
            </>
          }
          size="l"
          lede="Start with a sector you know. Explore a listing, then speak to the team about availability and the referral terms."
          action={
            <Button asChild variant="link" size="clear">
              <Link href="/opportunities">
                View the opportunity board <ArrowRight />
              </Link>
            </Button>
          }
        />
        {PUBLISHED_OPPORTUNITIES_AVAILABLE && opportunities.docs.length > 0 ? (
          <div className="mt-10 grid gap-7 md:grid-cols-3">
            {opportunities.docs.map((opportunity, i) => {
              const sector =
                typeof opportunity.sector === 'object' ? opportunity.sector?.name : undefined
              return (
                <Link
                  key={opportunity.id}
                  href={`/opportunities/${opportunity.slug}`}
                  className="opportunity-preview group min-w-0"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-sunken">
                    {typeof opportunity.featuredImage === 'object' && (
                      <Media
                        resource={opportunity.featuredImage}
                        fill
                        className="relative block size-full"
                        size="(min-width: 768px) 33vw, 100vw"
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                    )}
                    <span className="absolute left-4 top-4 rounded bg-midnight px-3 py-1.5 text-caption text-white">
                      {opportunity.country}
                    </span>
                    <span
                      className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-white text-navy transition-transform group-hover:-rotate-45"
                      aria-hidden="true"
                    >
                      <ArrowRight size={18} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-hairline pb-3 pt-5 text-caption uppercase tracking-[0.12em] text-on-surface-muted">
                    <span>{sector}</span>
                    <span className="tabular" aria-hidden="true">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-display-s text-on-surface-heading">
                    {opportunity.title}
                  </h3>
                  <p className="opportunity-summary mt-3 text-body-s text-on-surface-muted">{opportunity.summary}</p>
                  {typeof opportunity.commissionRate === 'number' && (
                    <p className="mt-5 text-body-s font-medium text-savanna">
                      {opportunity.commissionRate}% listed referral commission
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="mt-10 border-y border-hairline py-8">
            <p className="text-body-l">The opportunity board is being prepared.</p>
            <Link
              href="/contact"
              className="mt-3 inline-flex min-h-11 items-center gap-2 underline underline-offset-4"
            >
              Tell us what you’re looking for <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </Section>

      <Section tone="sunken" rhythm="lg" id="how-it-works">
        <ReferralJourney />
      </Section>

      {gallery.docs.length > 0 && (
        <Section tone="page" rhythm="md" id="gallery" bleed>
          <div className="container mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-caption font-medium uppercase tracking-[0.16em] text-on-surface-accent">In the network</p>
              <h2 className="mt-3 text-display-l tracking-display-tight text-on-surface-heading">The connections behind the work.</h2>
            </div>
            <Link href="/gallery" className="inline-flex min-h-11 items-center gap-2 text-body-s font-medium text-on-surface underline decoration-gold underline-offset-4">
              View the full gallery <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <GalleryGallery items={gallery.docs} variant="ticker" />
        </Section>
      )}

      {sectors.docs.length > 0 && (
        <Section tone="page" rhythm="md">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <h2 className="text-display-l text-on-surface-heading">
                Your experience.
                <br />A wider horizon.
              </h2>
              <p className="mt-5 max-w-sm text-body-l text-on-surface-muted">
                From energy and agriculture to the services that keep businesses moving. Find the
                sector where your connections count.
              </p>
            </div>
            <ul className="grid content-start gap-x-8 sm:grid-cols-2">
              {sectors.docs.map((sector) => (
                <li key={sector.id} className="border-b border-hairline">
                  <Link
                    href={`/opportunities?sector=${sector.slug}`}
                    className="group flex min-h-16 items-center gap-3 py-4 text-body-m text-on-surface-heading transition-colors duration-300 hover:text-savanna motion-reduce:transition-none"
                  >
                    <SectorIcon
                      name={sector.icon}
                      size={19}
                      className="shrink-0 text-on-surface-muted transition-colors duration-300 group-hover:text-savanna motion-reduce:transition-none"
                    />
                    <span className="font-medium">{sector.name}</span>
                    <MoveUpRight
                      size={15}
                      aria-hidden="true"
                      className="ml-auto shrink-0 text-on-surface-muted transition-[color,transform] duration-300 group-hover:rotate-45 group-hover:text-savanna motion-reduce:transition-none"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {plans.docs.length > 0 && (
        <Section tone="deep" rhythm="lg">
          <SectionHeading
            tone="deep"
            kicker="Find your place"
            title="One network. Your next move."
            size="l"
            lede="Choose the membership that fits your business. Apply first; the team will confirm your tier and payment details with you."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/20 bg-white/20 md:grid-cols-3">
            {plans.docs.map((plan) => {
              const tone = getPricingPlanTone(plan.name)
              const isGold = tone === 'gold'
              return <div key={plan.id} className={`relative isolate flex min-w-0 flex-col overflow-hidden p-6 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-white/[0.05] before:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] sm:p-8 ${tone === 'blue' ? 'bg-[linear-gradient(145deg,rgba(37,99,235,0.78),rgba(15,23,42,0.94)_72%)] text-white' : tone === 'purple' ? 'bg-[linear-gradient(145deg,rgba(139,92,246,0.72),rgba(29,20,58,0.96))] text-white' : 'bg-[linear-gradient(145deg,rgba(255,236,179,0.72),rgba(204,164,59,0.88))] text-navy'}`}>
                <span aria-hidden="true" className={`absolute -right-12 -top-12 -z-10 size-36 rounded-full blur-3xl ${isGold ? 'bg-white/35' : 'bg-white/15'}`} />
                <h3 className="text-display-m">{plan.name}</h3>
                <p className={`mt-2 text-body-s ${isGold ? 'text-navy/75' : 'text-white/75'}`}>{plan.tagline}</p>
                <p className="mb-5 mt-4 font-display text-display-l font-medium md:mb-7 md:mt-7">
                  {`R${plan.price}`}
                  <span className={`ml-1 font-sans text-body-s font-normal ${isGold ? 'text-navy/75' : 'text-white/75'}`}>
                    /month
                  </span>
                </p>
                <ul className={`mb-8 hidden space-y-3 border-t pt-6 text-body-s md:block ${isGold ? 'border-navy/20 text-navy/85' : 'border-white/15 text-white/80'}`}>
                  {plan.features?.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex gap-3">
                      <span aria-hidden="true" className={isGold ? 'text-navy' : 'text-white'}>
                        ↗
                      </span>
                      {feature.feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={isGold ? 'outline' : 'onDark'}
                  className={isGold ? 'mt-auto w-full border-navy/60 bg-transparent text-navy hover:border-navy hover:bg-navy hover:text-white' : 'mt-auto w-full'}
                >
                  <Link href={`/join?tier=${plan.id}`}>
                    Choose {plan.name} <ArrowRight />
                  </Link>
                </Button>
              </div>
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-body-s">
            <p className="text-on-dark-muted">No payment is taken with your application.</p>
            <Link
              href="/pricing"
              className="inline-flex min-h-11 items-center gap-2 text-white underline decoration-gold underline-offset-4"
            >
              Compare membership benefits <ArrowRight size={16} />
            </Link>
          </div>
        </Section>
      )}

      <Section id="home-app-preview" tone="sunken" rhythm="lg" className="app-preview-section overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-20">
          <div className="relative z-10 max-w-xl">
            <p className="mb-5 text-caption font-medium uppercase tracking-[0.14em] text-on-surface-accent">
              The AGBN app, in development
            </p>
            <h2 className="text-display-l text-on-surface-heading">
              Keep the right
              <br />
              connection moving.
            </h2>
            <p className="mt-6 text-body-l text-on-surface-muted">
              A considered mobile home for the opportunities, introductions and referral progress
              that matter to your business.
            </p>
            <ul className="mt-8 grid gap-4 border-y border-hairline py-6 text-body-s text-on-surface">
              <li className="flex gap-4">
                <span className="tabular text-on-surface-accent" aria-hidden="true">01</span>
                Opportunities matched to your sector and location.
              </li>
              <li className="flex gap-4">
                <span className="tabular text-on-surface-accent" aria-hidden="true">02</span>
                A clearer view of referrals after you make an introduction.
              </li>
              <li className="flex gap-4">
                <span className="tabular text-on-surface-accent" aria-hidden="true">03</span>
                Your membership network, close at hand.
              </li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/download-app">
                  Explore the app preview <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/join">Become a member</Link>
              </Button>
            </div>
            <p className="mt-4 text-body-s text-on-surface-muted">
              Design preview only. Features and availability may change before launch.
            </p>
          </div>
          <figure className="app-preview-device relative">
            <Image
              src="/brand/agbn-app-screens.webp"
              alt="Two AGBN app design screens showing an opportunity board, a referral action and a wallet preview."
              width={1000}
              height={904}
              sizes="(min-width: 1024px) 58vw, 100vw"
              loading="eager"
              className="h-auto w-full mix-blend-multiply"
            />
            <figcaption className="sr-only">
              Design preview. Figures on screen are placeholders, not real balances or payouts.
            </figcaption>
          </figure>
        </div>
      </Section>
      <Section
        tone="deep"
        rhythm="none"
        bleed
        className="relative isolate overflow-hidden"
      >
        <Image
          src="/home/cta-network-night.webp"
          alt=""
          fill
          sizes="100vw"
          className="z-0 object-cover object-[center_68%]"
        />
        <div
          className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(4,24,45,0.96)_0%,rgba(4,24,45,0.82)_52%,rgba(4,24,45,0.56)_100%)]"
          aria-hidden="true"
        />
        <div className="container relative z-10 grid items-end gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_auto] lg:py-32">
          <div>
            <p className="mb-5 text-body-s text-gold">
              Your next introduction starts with a conversation.
            </p>
            <h2 className="max-w-3xl text-display-xl text-white">
              Who could you
              <br />
              connect next?
            </h2>
          </div>
          <div>
            <Button asChild variant="gold" size="lg">
              <Link href="/join">
                Let’s get you connected <ArrowRight />
              </Link>
            </Button>
            <p className="mt-4 text-body-s text-on-dark-muted">
              Not sure where to start?{' '}
              <Link href="/contact" className="text-white underline decoration-gold underline-offset-4">
                Talk to us.
              </Link>
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'AGBN, turn your network into income.',
    description:
      'Explore business opportunities across Africa and find your place in the AGBN network. Connect, refer, earn, grow.',
  }
}

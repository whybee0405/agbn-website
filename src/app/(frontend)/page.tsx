import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import {
  ArrowRight,
  Briefcase,
  Building2,
  CircleCheckBig,
  Clock,
  Coins,
  Globe2,
  Layers,
  ListChecks,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { HeroParallax } from '@/components/HeroParallax'
import { HomeGallery } from '@/components/HomeGallery'
import { NetworkMap } from '@/components/NetworkMap'
import { Reveal } from '@/components/Reveal'
import { Section, SectionHeading } from '@/components/Section'
import { SectorIcon } from '@/components/SectorIcon'
import { StatCounter } from '@/components/StatCounter'
import { Button } from '@/components/ui/button'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { SiteSetting } from '@/payload-types'

export const revalidate = 600

/**
 * Brand DNA §4: "Connect. Refer. Earn. Grow." is AGBN's value proposition and
 * the sequence is fixed. It carries this section outright rather than being
 * reduced to a mono kicker somewhere else on the page.
 */
const STEPS = [
  {
    title: 'Connect',
    body: 'Meet vetted business owners across 54 African countries and beyond.',
  },
  {
    title: 'Refer',
    body: 'Refer a member of your network to a real, sector-specific opportunity.',
  },
  {
    title: 'Earn',
    body: 'Earn commission when your referral becomes a closed deal.',
  },
  {
    title: 'Grow',
    body: 'Grow your business through introductions you would never have made alone.',
  },
]

/**
 * A trimmed pull from the five items on /download-app. The homepage gets a
 * teaser, not a duplicate of the dedicated page, so this keeps the three most
 * concrete, differentiated items and drops the two that read as more generic
 * once separated from the full list (Refer a lead, Your business profile).
 */
const APP_HIGHLIGHTS = [
  {
    icon: Briefcase,
    title: 'Opportunities near you',
    body: 'Vetted listings filtered by sector and location, each showing the commission rate before you open it.',
  },
  {
    icon: ListChecks,
    title: 'A deal tracker',
    body: 'Follow a referral from submitted through contacted, proposal, negotiation and won.',
  },
  {
    icon: Wallet,
    title: 'Wallet and payouts',
    body: 'Earnings split into pending, approved and paid, with payout requests and a transaction history.',
  },
]

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [sectors, pricingPlans, siteSettings] = await Promise.all([
    payload.find({ collection: 'sectors', limit: 10, overrideAccess: false }),
    payload.find({
      collection: 'pricing-plans',
      limit: 3,
      sort: 'order',
      overrideAccess: false,
    }),
    getCachedGlobal('site-settings', 0)() as Promise<SiteSetting>,
  ])

  // Brand DNA §2: no stat without a number. Anything the CMS hasn't been given
  // a real figure for does not render at all.
  // Annotated rather than inferred: the entries mix number and text figures, so
  // the inferred type is a union of two shapes and the predicate below cannot
  // be assignable to it.
  /*
   * `approx` appends a "+" to the figure.
   *
   * It is per-stat rather than global on purpose. A "+" says "at least this
   * many", which is fine for a figure that grows between updates, but it
   * weakens any number a visitor can verify — and Brand DNA §4 draws exactly
   * that line ("700 members across 7 countries", not "join thousands").
   *
   * Two here are worth revisiting: `Sectors` is counted live from published
   * sectors and the full list renders further down this same page, so "10+"
   * can be disproved by counting. `Days to first intro` is deliberately left
   * exact — "3+ days" reads as a floor on a wait, which is the opposite of
   * the reassurance that figure exists to give.
   */
  const rawStats: {
    label: string
    value: string | number | null | undefined
    icon: LucideIcon
    approx?: boolean
  }[] = [
    { label: 'Members', value: siteSettings?.stats?.members, icon: Users, approx: true },
    { label: 'Countries', value: siteSettings?.stats?.countries, icon: Globe2, approx: true },
    // Counted from the sectors actually published in the CMS rather than typed
    // in by hand, so it cannot drift away from the sector list further down
    // this same page.
    { label: 'Sectors', value: sectors.totalDocs || null, icon: Layers, approx: true },
    {
      label: 'Opportunities posted',
      value: siteSettings?.stats?.opportunitiesPosted,
      icon: Briefcase,
      approx: true,
    },
    {
      label: 'Deals closed',
      value: siteSettings?.stats?.dealsClosed,
      icon: CircleCheckBig,
      approx: true,
    },
    {
      label: 'Businesses listed',
      value: siteSettings?.stats?.businessesListed,
      icon: Building2,
      approx: true,
    },
    {
      label: 'Days to first intro',
      value: siteSettings?.stats?.averageResponseDays,
      icon: Clock,
    },
    {
      label: 'Commission earned',
      value: siteSettings?.stats?.commissionEarned,
      icon: Coins,
      approx: true,
    },
  ]

  // A type predicate, so the narrowing survives into the render rather than
  // leaving `value` possibly null at the call site.
  const stats = rawStats.filter(
    (s): s is { label: string; value: string | number; icon: LucideIcon; approx?: boolean } =>
      s.value !== undefined && s.value !== null && s.value !== '',
  )

  // Formatted on the server with an explicit locale, so the string is stable
  // rather than resolved against whatever locale the visitor's browser reports.
  const asOfRaw = siteSettings?.stats?.asOf
  const asOfDate = asOfRaw ? new Date(asOfRaw) : null
  const statsAsOf =
    asOfDate && !Number.isNaN(asOfDate.getTime())
      ? new Intl.DateTimeFormat('en-GB', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(asOfDate)
      : null

  return (
    <>
      {/*
        Hero. One full-bleed band: the network artwork spans the viewport and
        the copy sits over it, rather than the artwork being boxed into a
        right-hand column.

        The artwork is the Brand DNA §5.4 motif — the continent implied by
        node density and hairline connections, gold on Midnight. Its left two
        thirds are deliberately close to empty, which is what makes a single
        band work: the headline occupies real negative space in the image
        instead of being laid over detail and rescued by a heavy scrim.
      */}
      <Section
        tone="deep"
        rhythm="none"
        bleed
        className="relative isolate flex min-h-[36rem] items-center overflow-hidden lg:min-h-[42rem]"
      >
        {/* Renders nothing. Drives the parallax only where scroll-driven CSS
            animations are unavailable (currently Firefox). */}
        <HeroParallax />
        {/*
          Three stacked layers, painted in DOM order rather than with z-index:
          photograph, navy wash, then the network artwork blended over both.

          Both images are decorative — the headline states the proposition, and
          "Sandton skyline at dusk" / "map of Africa drawn in dots" add nothing
          for a screen reader — so both stay out of the accessibility tree.

          They carry different object-positions on purpose. The photograph is
          bottom-anchored so the skyline survives any crop, while the artwork is
          pushed right on small screens: a centred crop of a 16:9 frame on a
          phone lands on its empty left half and the network vanishes entirely.
          That difference is why these stay as separate layers instead of being
          flattened into one baked image.
        */}
        <Image
          src="/home/hero-sandton.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="agbn-hero-layer agbn-hero-back object-cover object-bottom"
        />

        {/* Pushes the photograph back so it reads as depth behind the artwork
            rather than as a competing subject. */}
        <div aria-hidden="true" className="absolute inset-0 bg-midnight/55" />

        {/*
          `contain`, not `cover`. Under `cover` the artwork was scaled to fill
          the band, so how much of the continent survived depended entirely on
          the window's aspect ratio — at 1920x711 the top of North Africa and
          the bottom of South Africa were both cropped away. `contain` fits the
          whole continent at every viewport instead.

          That only works because the asset's background is true black rather
          than Midnight: `screen` discards black outright, so the letterboxing
          `contain` introduces is invisible. Against the original Midnight
          background the letterbox would have screened as a visible lighter
          rectangle over the photograph.
        */}
        <Image
          src="/home/hero-network-africa.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="agbn-hero-layer agbn-hero-mid object-contain object-[50%_62%] mix-blend-screen lg:object-[92%_50%]"
        />

        {/*
          Two scrims, each shaped to the axis its breakpoint actually needs.

          Below `lg` the copy fills the band, so there is no empty region to
          hide behind and a horizontal scrim just flattened the whole frame to
          navy — the artwork disappeared entirely. A vertical one instead:
          heaviest behind the headline, releasing toward the bottom so the
          network still reads under and around the buttons.

          At `lg` the copy and the continent sit in opposite halves, so the
          scrim runs horizontally and is finished by 72% — left to run the full
          width it dimmed the continent it exists to protect.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-midnight/85 via-midnight/70 via-60% to-midnight/20 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-midnight via-midnight/85 via-45% to-transparent to-72% lg:block"
        />

        {/* z-10 because everything above is absolutely positioned, and a
            positioned sibling would otherwise paint over in-flow content. */}
        <div className="container relative z-10">
          <div className="agbn-hero-layer agbn-hero-fore max-w-2xl py-20 sm:py-24 lg:py-32">
            <h1 className="text-display-xl tracking-display-tight text-on-dark">
              Turn your network into income.
            </h1>
            <p className="mt-6 measure text-lede text-on-dark-muted">
              AGBN connects business owners across Africa to vetted opportunities, and pays
              commission when your referrals become deals.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/join">
                  Join AGBN
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link href="/opportunities">Explore Opportunities</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/*
        The trust band. Brand DNA §2 is the brief: "no stat without a number,
        no promise without a way to verify it."

        The verifiability is carried by the "figures as of" line, not by copy
        asserting that the numbers are honest — a site that tells you to trust
        it is doing the opposite of what §2 asks. A date turns "700 members"
        from an unfalsifiable marketing line into a claim someone could check.

        Built as a single wrapping row rather than a grid of tall cells, so the
        band stays a strip at any figure count. The figure, its icon and its
        label share one baseline instead of stacking, which is what keeps the
        height down as more stats are switched on in the CMS.
      */}
      {stats.length > 0 && (
        <Section tone="brand" rhythm="sm" className="border-y border-hairline-dark">
          <div className="flex flex-col gap-x-10 gap-y-4 lg:flex-row lg:items-center lg:justify-between">
            {/* `lg:flex-1` + `justify-between` spreads the figures across the
                full strip. Left to sit at their natural width they clustered
                against the left edge with the rest of the band empty. */}
            <dl className="flex flex-wrap items-center gap-x-9 gap-y-5 lg:flex-1 lg:justify-between lg:gap-x-6">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <Reveal
                    as="div"
                    key={stat.label}
                    delay={i * 70}
                    className="flex items-center gap-2.5"
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="shrink-0 text-gold/60"
                    />
                    {/*
                      `order` keeps the figure ahead of its label visually while
                      the DOM stays dt-then-dd, so the pairing still reads
                      correctly to a screen reader.
                    */}
                    <div className="flex items-baseline gap-2">
                      <dt className="order-2 text-body-s text-on-dark-muted">{stat.label}</dt>
                      <dd className="order-1 tabular text-display-s leading-none text-gold">
                        <StatCounter
                          value={stat.value}
                          delay={i * 110}
                          suffix={stat.approx ? '+' : ''}
                        />
                      </dd>
                    </div>
                  </Reveal>
                )
              })}
            </dl>

            {statsAsOf && (
              <p className="shrink-0 font-mono text-caption uppercase tracking-[0.14em] text-on-dark-muted">
                Figures as of {statsAsOf}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* How it works. Four numbered rows rather than four identical icon
          cards. The step number and the verb carry the hierarchy. */}
      <Section tone="page" rhythm="lg">
        <SectionHeading
          title="Four words, and they are the whole product."
          lede="No dashboards to learn, no pipeline to manage. You already have the network. AGBN pays you for using it."
          size="l"
        />

        <ol className="mt-14 border-t border-hairline">
          {STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 70}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 gap-y-2 border-b border-hairline py-7 sm:grid-cols-[4rem_minmax(0,14rem)_minmax(0,1fr)] sm:gap-x-10 sm:py-9"
            >
              <span className="tabular text-body-s text-gold sm:text-body-m" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="text-display-m text-on-surface-heading">{step.title}</h3>
              <p className="col-span-2 measure text-body-l text-on-surface-muted sm:col-span-1">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* Sectors as a typographic index. Ten identical bordered tiles with a
          centred icon was the most template-looking block on the page. */}
      {sectors.docs.length > 0 && (
        <Section tone="sunken" rhythm="md">
          <SectionHeading
            title="Opportunities across every sector"
            lede="Real sectors in real countries, not a generic promise to grow your business."
            action={
              <Button asChild variant="outline">
                <Link href="/opportunities">Browse all opportunities</Link>
              </Button>
            }
          />

          <ul className="mt-10 grid grid-cols-1 gap-x-10 border-t border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {sectors.docs.map((sector) => (
              <li key={sector.id} className="border-b border-hairline">
                <Link
                  href={`/opportunities?sector=${sector.slug}`}
                  className="group flex items-center gap-4 py-4 transition-colors hover:text-on-surface-heading"
                >
                  {/* Deliberately not gold on hover: #CCA43B on the light
                      surface is ~2.2:1, under the 3:1 an icon needs. Gold is
                      carried by the underline instead (Brand DNA §5.2). */}
                  <SectorIcon
                    name={sector.icon}
                    className="shrink-0 text-on-surface-muted transition-colors group-hover:text-on-surface-heading"
                    size={20}
                  />
                  <span className="text-body-l font-medium text-on-surface underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] group-hover:decoration-gold">
                    {sector.name}
                  </span>
                  <ArrowRight
                    size={16}
                    className="ml-auto shrink-0 text-hairline transition-[color,transform] group-hover:translate-x-1 group-hover:text-on-surface-heading"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/*
        Gallery. Sits after the sector index so the page reads what → where →
        what it costs, and on a dark surface because that is where photography
        and gold captions both hold up (Brand DNA §5.2).

        The copy describes the reach of the network, not the people in the
        frames. Captioning generated imagery as "our members" would be exactly
        the unbacked claim §2 exists to prevent.
      */}
      <Section tone="deep" rhythm="lg">
        <SectionHeading
          kicker="The network"
          title="Africa is bigger together."
          lede="From wholesale trade in Douala to fabrication in Bamako, AGBN reaches across sectors and borders that rarely connect on their own."
          size="l"
          tone="deep"
        />
        <div className="mt-12">
          <HomeGallery />
        </div>
      </Section>

      {/* Membership. Cards earn their place here: three plans being compared
          side by side is exactly what a card grid is for. */}
      {pricingPlans.docs.length > 0 && (
        <Section tone="page" rhythm="lg">
          <SectionHeading
            title="Membership tiers"
            lede="Every tier connects you to the same network. Higher tiers add priority introductions and visibility."
            action={
              <Button asChild variant="link" size="clear" className="hidden sm:inline-flex">
                <Link href="/pricing">Compare all tiers</Link>
              </Button>
            }
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pricingPlans.docs.map((plan) => {
              const highlighted = Boolean(plan.highlighted)
              return (
                <div
                  key={plan.id}
                  className={
                    highlighted
                      ? 'flex flex-col rounded-lg border border-gold bg-surface-brand p-7 text-on-dark'
                      : 'flex flex-col rounded-lg border border-hairline bg-surface-raised p-7'
                  }
                >
                  {highlighted && (
                    <p className="mb-3 font-mono text-caption uppercase tracking-[0.14em] text-gold">
                      Most popular
                    </p>
                  )}
                  <h3 className={highlighted ? 'text-display-s text-on-dark' : 'text-display-s text-on-surface-heading'}>
                    {plan.name}
                  </h3>
                  <p
                    className={
                      highlighted
                        ? 'mt-1 text-body-s text-on-dark-muted'
                        : 'mt-1 text-body-s text-on-surface-muted'
                    }
                  >
                    {plan.tagline}
                  </p>
                  <p className="mt-6 tabular text-display-m">
                    ${plan.price}
                    <span className="text-body-m">/{plan.billingPeriod}</span>
                  </p>
                  {plan.localPriceEstimate && (
                    /* This line previously read `highlighted ? 'text-slate-500'
                       : 'text-slate-500'`: the same muted token in both
                       branches, which rendered at ~2.6:1 on the navy card. */
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
                  {/* Same fix as the pricing page: the button states the
                      action, not the tier's tagline. */}
                  <Button
                    asChild
                    variant={highlighted ? 'gold' : 'outline'}
                    className="mt-7 w-full"
                  >
                    <Link href={`/join?tier=${plan.id}`}>Apply for {plan.name}</Link>
                  </Button>
                </div>
              )
            })}
          </div>

          <Button asChild variant="link" size="clear" className="mt-8 sm:hidden">
            <Link href="/pricing">Compare all tiers</Link>
          </Button>
        </Section>
      )}

      {/*
        The app. Previously a single understated line inside the closing CTA
        band ("the app does not exist yet, so it earns a line here rather than
        a section of its own"). It now gets a section, but the honesty budget
        that line was protecting stays intact: future tense throughout, no
        release date, a link that says what it does ("See what it will do")
        rather than a Download button for something with nothing to download.

        Sunken tone for the same reason /download-app uses it for this image:
        the screenshot's own baked-in background is Slate 50, and a white
        section would show it as a grey rectangle.
      */}
      <Section tone="sunken" rhythm="lg">
        <SectionHeading
          kicker="In development"
          title="Everything above, in your pocket."
          lede="A native app for members is in development: the opportunity feed, your referrals, and the member directory, on the device you carry. There's no release date yet, and nothing to wait for, everything above already works on the site today."
          size="l"
        />

        <div className="mt-12 grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <ul className="grid gap-y-8">
              {APP_HIGHLIGHTS.map((item, i) => {
                const Icon = item.icon
                return (
                  <Reveal as="li" key={item.title} delay={i * 70} className="flex gap-4">
                    <Icon
                      size={20}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-on-surface-accent"
                    />
                    <div className="min-w-0">
                      <h3 className="text-display-s text-on-surface-heading">{item.title}</h3>
                      <p className="mt-2 measure text-body-m text-on-surface-muted">{item.body}</p>
                    </div>
                  </Reveal>
                )
              })}
            </ul>

            <Link
              href="/download-app"
              className="mt-9 inline-flex items-center gap-2 text-body-m font-medium text-on-surface-heading underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-on-surface-accent"
            >
              See what it will do
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <figure>
            <Image
              src="/brand/agbn-app-screens.webp"
              alt="Two screens from the AGBN app design: a dashboard showing wallet earnings, opportunities near you and a deal tracker, and an opportunity detail screen with a commission rate and a refer-a-lead action."
              width={1070}
              height={967}
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-4 text-body-s text-on-surface-muted">
              Design preview. Figures shown are placeholder values, not real balances.
            </figcaption>
          </figure>
        </div>
      </Section>

      {/*
        The closing CTA and the footer were both `#061426` — the same value, so
        the page's final call to action dissolved straight into the footer and
        stopped reading as a section at all.

        A photograph fixes it without introducing a fifth surface tone. It is
        deliberately not another skyline: the hero already carries one. An
        aerial of lit settlements spread across distance echoes the network
        motif — points connected across a continent — rather than repeating the
        artwork, which §5.4 already spends twice on this page.

        The scrim stops short of full opacity on purpose. Fading the lower edge
        to solid Midnight would merge it back into the footer and undo the whole
        point; letting the lights run to the bottom edge is what creates the
        boundary.
      */}
      <Section tone="deep" rhythm="lg" bleed className="relative isolate overflow-hidden">
        <Image
          src="/home/cta-network-night.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
        {/*
          Graded, not flat. A uniform 72% scrim over an already-dark night plate
          left the photograph invisible — the band still read as flat navy and
          the change did nothing.

          Heaviest at the top where the heading sits, lightest at the bottom so
          the city lights survive right up to the footer edge. That lower band
          is what actually creates the boundary the section was missing.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-midnight/90 via-midnight/86 via-72% to-midnight/38"
        />

        {/* Not `.container`: that sets its own responsive max-width, which
            would fight the max-w-2xl measure this block wants. Padding only. */}
        <div className="relative z-10 mx-auto max-w-2xl px-5 text-center md:px-8">
          <NetworkMap variant="divider" className="mb-12 opacity-70" />
          <h2 className="text-display-l tracking-display-tight text-on-dark">
            One network. 54 countries. Endless opportunities.
          </h2>
          <p className="mx-auto mt-5 measure text-lede text-on-dark-muted">
            Membership takes a few minutes to apply for. A member of the AGBN team follows up to
            confirm your tier.
          </p>
          <Button asChild variant="gold" size="lg" className="mt-9">
            <Link href="/join">
              Join AGBN
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'AGBN, turn your network into income.',
    description:
      'AGBN connects business owners across Africa to vetted opportunities and pays commission when referrals become deals. Connect, refer, earn, grow.',
  }
}

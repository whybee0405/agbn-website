import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BellRing, Briefcase, ListChecks, UserPlus, Users, Wallet } from 'lucide-react'

import { NewsletterForm } from '@/components/Form/NewsletterForm'
import { Reveal } from '@/components/Reveal'
import { PageHeader, Section, SectionHeading } from '@/components/Section'
import { Button } from '@/components/ui/button'

/**
 * Every item here maps to something AGBN already does on the website — the
 * opportunity feed, referrals and commission, the member directory, events,
 * and the magazine. Nothing describes a capability the organisation does not
 * already have, because an unreleased product is the easiest place on a site
 * to accidentally promise something (Brand DNA §2).
 *
 * Copy is future tense throughout for the same reason: the app does not exist
 * yet, and the page should never read as though it does.
 */
const PLANNED = [
  {
    icon: Briefcase,
    title: 'Opportunities near you',
    body: 'Vetted listings filtered by sector and location, each showing the commission rate before you open it.',
  },
  {
    icon: UserPlus,
    title: 'Refer a lead',
    body: 'Make an introduction from the listing itself, or save it to come back to.',
  },
  {
    icon: ListChecks,
    title: 'A deal tracker',
    body: 'Follow a referral from submitted through contacted, proposal, negotiation and won, instead of waiting to be told what happened to it.',
  },
  {
    icon: Wallet,
    title: 'Wallet and payouts',
    body: 'Earnings split into pending, approved and paid, with payout requests and a transaction history.',
  },
  {
    icon: Users,
    title: 'Your business profile',
    body: 'Keep your directory listing current, and invite the people in your network to join.',
  },
]

export default function DownloadAppPage() {
  return (
    <>
      <PageHeader
        title="The AGBN app."
        lede="A preview of what’s being developed for AGBN members: opportunities, referrals and business connections in one place."
        meta={
          <span className="font-mono text-caption uppercase tracking-[0.14em] text-gold">
            In development
          </span>
        }
      />

      {/*
        The status sits immediately under the masthead rather than at the foot
        of the page. Someone arriving from a "Download App" link is asking one
        question, and the honest answer to it should not be below the fold.
      */}
      <Section tone="page" rhythm="md" rhythmTop="sm">
        <div className="measure">
          <h2 className="text-display-m text-on-surface-heading">
            It isn&rsquo;t available to download yet.
          </h2>
          <p className="mt-5 text-body-l text-on-surface-muted">
            The app is in development. A release date has not been announced, and the screens below are a design preview.
          </p>
          <p className="mt-4 text-body-l text-on-surface-muted">
            For now, use the website to explore opportunities, compare membership options and contact the team about a referral.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href="/opportunities">
                Browse opportunities
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/join">Become a member</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="sunken" rhythm="lg">
        <SectionHeading
          kicker="The concept"
          title="Your connections. Closer at hand."
          lede="These are the planned features. Availability and functionality may change as development progresses."
          size="l"
        />

        <div className="mt-12 grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <ul className="grid gap-y-9">
            {PLANNED.map((item, i) => {
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

          {/*
            AGBN's own design mockup, taken from their existing site. It sits on
            the `sunken` surface because its baked-in background is rgb(242,246,243),
            within a point or two of Slate 50 — on a white section it would show
            as a grey rectangle.

            Captioned as a design preview on purpose: the figures on screen are
            placeholder values from the mockup, and an uncaptioned screenshot of
            "R24,560.00 total earnings" reads as a claim about real payouts.
          */}
          <figure className="lg:sticky lg:top-28">
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
        Dark band: the newsletter field is styled for a dark surface, and this
        gives the page a tonal break before the footer.

        The copy is careful not to describe this as an app waiting list. It
        subscribes you to the AGBN mailing list, which is where a launch would
        be announced — saying anything more specific would be a promise the
        form does not keep.
      */}
      <Section tone="deep" rhythm="lg">
        <div className="mx-auto max-w-2xl text-center">
          <BellRing size={22} strokeWidth={1.75} aria-hidden="true" className="mx-auto text-gold" />
          <h2 className="mt-6 text-display-l tracking-display-tight text-on-dark">
            Hear about it when it ships.
          </h2>
          <p className="mx-auto mt-5 measure text-lede text-on-dark-muted">
            The AGBN mailing list carries deal stories and opportunities, and it is where the app
            launch will be announced. No separate sign-up.
          </p>
          <div className="mx-auto mt-9 max-w-md text-left">
            <NewsletterForm />
          </div>
        </div>
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'The AGBN App',
    description:
      'A native mobile app for AGBN members, currently in development. The opportunity feed, referrals and the member directory on your phone. Everything it will do, the website already does.',
  }
}

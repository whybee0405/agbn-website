import type { Metadata } from 'next'
import { Suspense } from 'react'
import { MessageCircleIcon } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { JoinForm } from '@/components/Form/JoinForm'
import { NetworkMap } from '@/components/NetworkMap'
import { PageHeader, Section } from '@/components/Section'
import { getOpportunityContext } from '@/utilities/getOpportunityContext'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

/** Sets expectations before the form, so nobody submits wondering what happens. */
const WHAT_HAPPENS_NEXT = [
  'We review your business and confirm which tier fits.',
  'A member of the AGBN team calls you within two business days.',
  'Once you are confirmed, your directory listing and opportunity feed go live.',
]

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/BRnfMQiLnuI04bsvTolanM?s=cl&p=i&mlu=4&ilr=4'

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ opportunity?: string }> }) {
  const opportunity = await getOpportunityContext((await searchParams).opportunity)
  const payload = await getPayload({ config: configPromise })
  const plans = await payload.find({
    collection: 'pricing-plans',
    limit: 12,
    sort: 'order',
    overrideAccess: false,
  })
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    overrideAccess: false,
  })
  const whatsappGroupUrl = siteSettings.whatsappGroupUrl || WHATSAPP_GROUP_URL

  return (
    <>
      <PageHeader
        tone="deep"
        title="Your next chapter starts here."
        lede="Turn your network into income. Tell us about your business and a member of the AGBN team will follow up to get you set up."
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div className="rounded-lg border border-hairline bg-surface-raised p-6 sm:p-9">
            <Suspense
              fallback={<NetworkMap variant="loading" className="py-16" />}
            >
              <JoinForm tiers={plans.docs.map((p) => ({ id: String(p.id), name: p.name }))} opportunity={opportunity} />
            </Suspense>
          </div>

          <aside className="lg:pt-2">
            <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-accent">
              What happens next
            </h2>
            <ol className="mt-5 space-y-5">
              {WHAT_HAPPENS_NEXT.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="tabular shrink-0 text-body-s text-on-surface-accent" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span className="text-body-s text-on-surface-muted">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 border-t border-hairline pt-6">
              <p className="text-body-s text-on-surface-muted">
                Already part of the conversation?
              </p>
              <a
                href={whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-body-s font-semibold text-on-surface-heading underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-on-surface-accent"
              >
                <MessageCircleIcon className="size-5" aria-hidden="true" />
                Join the WhatsApp group
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Join AGBN',
    description:
      'Apply to join AGBN, turn your network into income by connecting with vetted opportunities across Africa.',
  }
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { JoinForm } from '@/components/Form/JoinForm'
import { NetworkMap } from '@/components/NetworkMap'
import { PageHeader, Section } from '@/components/Section'

export const revalidate = 3600

/** Sets expectations before the form, so nobody submits wondering what happens. */
const WHAT_HAPPENS_NEXT = [
  'We review your business and confirm which tier fits.',
  'A member of the AGBN team calls you within two business days.',
  'Once you are confirmed, your directory listing and opportunity feed go live.',
]

export default async function JoinPage() {
  const payload = await getPayload({ config: configPromise })
  const plans = await payload.find({
    collection: 'pricing-plans',
    limit: 12,
    sort: 'order',
    overrideAccess: false,
  })

  return (
    <>
      <PageHeader
        tone="deep"
        title="Join AGBN"
        lede="Turn your network into income. Tell us about your business and a member of the AGBN team will follow up to get you set up."
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div className="rounded-lg border border-hairline bg-surface-raised p-6 sm:p-9">
            <Suspense
              fallback={<NetworkMap variant="loading" className="py-16" />}
            >
              <JoinForm tiers={plans.docs.map((p) => ({ id: String(p.id), name: p.name }))} />
            </Suspense>
          </div>

          <aside className="lg:pt-2">
            <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-accent">
              What happens next
            </h2>
            <ol className="mt-5 space-y-5">
              {WHAT_HAPPENS_NEXT.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="tabular shrink-0 text-body-s text-gold" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span className="text-body-s text-on-surface-muted">{step}</span>
                </li>
              ))}
            </ol>
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

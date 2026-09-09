import type { Metadata } from 'next'
import { Mail, Phone, MessageCircle } from 'lucide-react'

import { ContactForm } from '@/components/Form/ContactForm'
import { PageHeader, Section } from '@/components/Section'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { SiteSetting } from '@/payload-types'
import { getOpportunityContext } from '@/utilities/getOpportunityContext'

export const revalidate = 3600

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ opportunity?: string }> }) {
  const siteSettings = (await getCachedGlobal('site-settings', 0)()) as SiteSetting
  const opportunity = await getOpportunityContext((await searchParams).opportunity)
  const contactEmail = siteSettings?.contactEmail && !/\.(example|invalid|test)$/i.test(siteSettings.contactEmail) ? siteSettings.contactEmail : undefined

  return (
    <>
      <PageHeader
        title="Let’s make a connection."
        lede="Questions about membership, an opportunity, or the press? Send us a message."
      />

      <Section tone="sunken" rhythm="md" rhythmTop="sm">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="rounded-lg border border-hairline bg-surface-raised p-6 sm:p-9">
            <ContactForm opportunity={opportunity} />
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start lg:pt-2">
            <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-accent">
              Other ways to reach us
            </h2>

            {contactEmail || siteSettings?.contactPhone ? (
              <ul className="mt-5 space-y-1">
                {contactEmail && (
                  <li>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex min-h-11 items-center gap-3 text-body-s text-on-surface underline decoration-transparent underline-offset-4 transition-[text-decoration-color] hover:decoration-gold"
                    >
                      <Mail size={16} aria-hidden="true" className="shrink-0 text-on-surface-muted" />
                      {contactEmail}
                    </a>
                  </li>
                )}
                {siteSettings?.contactPhone && (
                  <li>
                    <a
                      href={`tel:${siteSettings.contactPhone}`}
                      className="flex min-h-11 items-center gap-3 text-body-s text-on-surface underline decoration-transparent underline-offset-4 transition-[text-decoration-color] hover:decoration-gold"
                    >
                      <Phone
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-on-surface-muted"
                      />
                      {siteSettings.contactPhone}
                    </a>
                    <a href={`https://wa.me/${siteSettings.contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex min-h-11 items-center gap-3 text-body-s font-medium text-on-surface underline underline-offset-4"><MessageCircle size={16} aria-hidden="true" />Start a WhatsApp conversation</a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-5 text-body-s text-on-surface-muted">
                Use the form and we&rsquo;ll get back to you within two business days.
              </p>
            )}
          </aside>
        </div>
      </Section>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Contact',
    description: 'Get in touch with the AGBN team about membership, opportunities, or the press.',
  }
}

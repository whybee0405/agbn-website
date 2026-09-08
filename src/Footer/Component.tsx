import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer as FooterType, SiteSetting } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { NavLink } from '@/components/NavLink'
import { NetworkMap } from '@/components/NetworkMap'
import { NewsletterForm } from '@/components/Form/NewsletterForm'

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  twitter: 'X / Twitter',
  whatsapp: 'WhatsApp',
}

export async function Footer() {
  const footerData = (await getCachedGlobal('footer', 1)()) as FooterType
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  const linkGroups = footerData?.linkGroups || []

  return (
    <footer className="mt-auto bg-surface-deep text-on-dark">
      <div className="container pt-10">
        <NetworkMap variant="divider" className="opacity-60" />
      </div>

      <div className="container grid gap-x-8 gap-y-12 pb-14 pt-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" aria-label="AGBN home" className="inline-block">
            <Logo variant="gold" className="h-8 w-auto" />
          </Link>
          {siteSettings?.tagline && (
            /* Was `text-slate-500` on midnight, roughly 2.4:1. */
            <p className="mt-5 max-w-xs text-body-s text-on-dark-muted">{siteSettings.tagline}</p>
          )}

          {siteSettings?.socialLinks && siteSettings.socialLinks.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {siteSettings.socialLinks.map((social, i) => (
                <li key={i}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-s text-on-dark-muted underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] hover:text-white hover:decoration-gold"
                  >
                    {SOCIAL_LABELS[social.platform] || social.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {linkGroups.map((group, i) => (
          <nav key={i} aria-label={group.groupTitle ?? undefined}>
            <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-gold">
              {group.groupTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {(group.links || []).map((item, j) => (
                <li key={j}>
                  <NavLink
                    link={item.link}
                    className="text-body-s text-on-dark-muted transition-colors hover:text-white"
                  />
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-gold">
            Stay in the loop
          </h2>
          <p className="mt-5 text-body-s text-on-dark-muted">
            Deal stories and opportunities, straight to your inbox.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-hairline-dark">
        <div className="container flex flex-col-reverse gap-3 py-6 text-caption text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Africa &amp; Global Business Network (AGBN). All rights
            reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

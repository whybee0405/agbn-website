import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import type { Footer as FooterType, SiteSetting } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { NavLink } from '@/components/NavLink'
import { NewsletterForm } from '@/components/Form/NewsletterForm'

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  twitter: 'X / Twitter',
  whatsapp: 'WhatsApp',
}

// A new or restored database should never leave visitors at a dead-end. These
// are public, owner-approved routes only. Legal links stay out until approved
// policy pages are published in the CMS.
const FALLBACK_LINK_GROUPS = [
  {
    groupTitle: 'Explore',
    links: [
      { link: { type: 'internal' as const, route: '/' as const, label: 'Home' } },
      { link: { type: 'internal' as const, route: '/opportunities' as const, label: 'Opportunities' } },
      { link: { type: 'internal' as const, route: '/about' as const, label: 'About AGBN' } },
      { link: { type: 'internal' as const, route: '/pricing' as const, label: 'Membership' } },
    ],
  },
  {
    groupTitle: 'Network',
    links: [
      { link: { type: 'internal' as const, route: '/events' as const, label: 'Events' } },
      { link: { type: 'internal' as const, route: '/case-studies' as const, label: 'Member stories' } },
      { link: { type: 'internal' as const, route: '/gallery' as const, label: 'Gallery' } },
      { link: { type: 'internal' as const, route: '/contact' as const, label: 'Contact' } },
    ],
  },
] satisfies NonNullable<FooterType['linkGroups']>

export async function Footer() {
  const [footer, settings] = await Promise.all([
    getCachedGlobal('footer', 1)() as Promise<FooterType>,
    getCachedGlobal('site-settings', 1)() as Promise<SiteSetting>,
  ])
  const configuredLinkGroups = footer.linkGroups?.map((group) => ({
    ...group,
    links: group.links?.filter((item) => (item.link?.route as string) !== '/magazine'),
  })).filter((group) => group.links?.length)
  const linkGroups = configuredLinkGroups?.length ? configuredLinkGroups : FALLBACK_LINK_GROUPS

  return (
    <footer className="mt-auto bg-surface-deep text-on-dark">
      <div className="container">
        <div className="grid items-center gap-7 border-b border-white/15 py-10 md:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <h2 className="text-display-s font-medium">Keep your next move in view.</h2>
            <p className="mt-2 text-body-s text-on-dark-muted">
              News, opportunities and updates from AGBN.
            </p>
          </div>
          <NewsletterForm />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 py-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="AGBN home"
              className="inline-flex min-h-11 items-center transition-transform duration-200 ease-out-expo hover:scale-[1.035]"
            >
              <Logo variant="gold" className="h-9 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-body-s text-on-dark-muted">
              Business starts with people.
              <br />
              Opportunity starts with a connection.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5">
              {settings.socialLinks?.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-body-s text-on-dark-muted underline underline-offset-4 transition-[color,transform,text-decoration-color] duration-200 ease-out-expo hover:translate-x-1 hover:text-white"
                >
                  {SOCIAL_LABELS[social.platform] || social.platform}
                </a>
              ))}
            </div>
          </div>
          {linkGroups.map((group, i) => (
            <nav key={i} aria-label={group.groupTitle || undefined}>
              <h2 className="mb-3 text-caption font-semibold uppercase tracking-[0.14em] text-gold">
                {group.groupTitle}
              </h2>
              <ul>
                {group.links?.map((item, j) => (
                  <li key={j}>
                    <NavLink
                      link={item.link}
                      className="inline-flex min-h-11 items-center text-body-s text-on-dark-muted transition-[color,transform] duration-200 ease-out-expo hover:translate-x-1 hover:text-white"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/15 py-6 pb-24 text-caption text-on-dark-muted lg:pb-6">
          <p>© {new Date().getFullYear()} Africa &amp; Global Business Network.</p>
          <p>Connect. Refer. Earn. Grow.</p>
        </div>
      </div>
    </footer>
  )
}

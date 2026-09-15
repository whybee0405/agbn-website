'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { MenuIcon, XIcon } from 'lucide-react'

import type { Header as HeaderType, SiteSetting } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { NavLink } from '@/components/NavLink'
import { cn } from '@/utilities/ui'

interface HeaderClientProps {
  data: HeaderType
  siteSettings?: SiteSetting
}

export const HeaderClient: React.FC<HeaderClientProps> = (props) => {
  const pathname = usePathname()
  return <HeaderNavigation key={pathname} {...props} />
}

const HeaderNavigation: React.FC<HeaderClientProps> = ({ data, siteSettings }) => {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  // A legacy CMS global may still contain this retired route. Hide it until the
  // next settings edit removes the stored row as well.
  const navItems = (data?.navItems || []).filter((item) => (item.link?.route as string) !== '/magazine')
  const ctaLabel = data?.ctaLabel || 'Join AGBN'

  // A nonmodal disclosure: focus can leave, which closes the panel. Route keys reset it.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const isCurrent = (route?: string | null) => {
    if (!route) return false
    return route === '/' ? pathname === '/' : pathname?.startsWith(route)
  }

  return (
    <header onBlur={(event) => {
      if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
    }} className="sticky top-0 z-30 border-b border-hairline-dark bg-surface-brand">
      {/* Keyboard users land here first and can jump straight past the nav. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-body-s focus:font-semibold focus:text-navy"
      >
        Skip to content
      </a>

      {/* Capped at 72px so the bar never eats the viewport. */}
      <div className="container flex h-[68px] items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="AGBN home"
          className="shrink-0 transition-transform duration-200 ease-out-expo hover:scale-[1.035]"
        >
          <Logo variant="gold" priority className="h-8 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-7">
          {navItems.map((item, i) => {
            const current = isCurrent(item.link?.route)
            return (
              <NavLink
                key={i}
                link={item.link}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'relative py-1 text-body-s font-medium transition-colors',
                  // Active state is a gold underline, not gold text: gold on
                  // navy is fine either way, but the underline keeps the label
                  // at full contrast (Brand DNA §5.2).
                  'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform hover:after:scale-x-100',
                  current ? 'text-white after:scale-x-100' : 'text-on-dark-muted hover:text-white',
                )}
              />
            )
          })}
        </nav>

        <Link
          href="/join"
          className="hidden shrink-0 items-center rounded-md bg-gold px-5 py-2.5 text-body-s font-semibold text-navy transition-[background-color,box-shadow,transform] duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-ember hover:shadow-lg active:translate-y-px lg:inline-flex"
        >
          {ctaLabel}
        </Link>

        <button
          ref={menuButton}
          type="button"
          className="-mr-2 flex size-11 items-center justify-center text-white lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-69px)] overflow-y-auto overscroll-contain border-t border-hairline-dark bg-surface-brand lg:hidden"
        >
          <nav aria-label="Main" className="container flex flex-col py-3">
            {navItems.map((item, i) => {
              const current = isCurrent(item.link?.route)
              return (
                <NavLink
                  key={i}
                  link={item.link}
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[48px] items-center border-b border-hairline-dark text-body-m transition-[color,transform] duration-200 ease-out-expo hover:translate-x-1',
                    current ? 'font-medium text-gold' : 'text-white',
                  )}
                />
              )
            })}
            <Link
              href="/join"
              className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-md bg-gold px-4 text-body-s font-semibold text-navy transition-[background-color,transform] duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-ember active:translate-y-px"
            >
              {ctaLabel}
            </Link>
            {siteSettings?.whatsappGroupUrl && (
              <a
                href={siteSettings.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 pb-2 text-center text-body-s text-on-dark-muted underline underline-offset-4"
              >
                Join our WhatsApp community
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

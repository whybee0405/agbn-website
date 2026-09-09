'use client'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { cn } from '@/utilities/ui'

/**
 * Floating WhatsApp contact button.
 *
 * WhatsApp already carries weight for this audience — AGBN runs a member
 * community on it (it is a listed benefit on every membership tier), so this
 * is the channel people expect, not a generic chat widget.
 *
 * Deliberately a plain anchor rather than an embedded widget: third-party chat
 * scripts are typically 100kB+ of JavaScript on every page for what is, in the
 * end, a link. This costs nothing and works with JS disabled.
 *
 * `wa.me` requires the number in international format with no `+`, spaces or
 * punctuation.
 */
const WHATSAPP_NUMBER = '27817075226'

const PREFILLED_MESSAGE = 'Hi AGBN, I found you through your website and I have a question.'

type Props = {
  className?: string
}

export const WhatsAppButton: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()
  const [homeActionState, setHomeActionState] = useState({ pathname: '', isVisible: false })
  const isOverHomeAction = homeActionState.pathname === pathname && homeActionState.isVisible

  useEffect(() => {
    if (pathname !== '/') return

    const protectedSections = ['how-it-works', 'home-app-preview']
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    if (!protectedSections.length) return

    const observer = new IntersectionObserver(
      (entries) => setHomeActionState({ pathname, isVisible: entries.some((entry) => entry.isIntersecting) }),
      { threshold: 0.12 },
    )

    protectedSections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname])

  if (pathname === '/join' || pathname === '/contact' || pathname.startsWith('/events/')) return null
  return (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`}
    target="_blank"
    rel="noopener noreferrer"
    /*
      The label names the destination and the action. "Chat on WhatsApp" reads
      correctly in a screen reader's link list, where an icon-only control would
      announce as nothing at all.
    */
    aria-label="Chat with AGBN on WhatsApp"
    className={cn(
      // Clears the sticky CTA bar, which is `lg:hidden` — so the button only
      // drops to the bottom of the viewport at `lg`, not at `sm`. Between those
      // two breakpoints the bar is still on screen and they would overlap.
      // The safe-area inset keeps it clear of the iOS home indicator.
      'group fixed right-4 z-40 flex items-center gap-2.5 rounded-full sm:right-6',
      'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
      // WhatsApp brand green. Deliberately not a palette colour: this is a
      // recognisable third-party mark, and recolouring it to Signal Gold would
      // make it read as a generic button and cost the instant recognition that
      // is the entire reason it works.
      'bg-[#25D366] py-3 pl-3 pr-3 text-[#053C24] shadow-[0_8px_24px_-6px_rgb(6_20_38/0.45)]',
      'transition-[transform,box-shadow,opacity] duration-200 ease-out',
      'hover:shadow-[0_12px_30px_-6px_rgb(6_20_38/0.55)] active:scale-[0.97]',
      // 48px minimum touch target on the icon alone, before the label.
      'min-h-12 min-w-12',
      isOverHomeAction && 'pointer-events-none scale-95 opacity-0',
      className,
    )}
  >
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.695.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.96 11.96 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.945a11.87 11.87 0 00-3.480-8.408" />
    </svg>

    {/*
      The label is revealed on hover at desktop and stays hidden on touch, where
      there is no hover and screen space is scarcer. The accessible name comes
      from aria-label either way, so nothing is lost when it is collapsed.
    */}
    <span
      className={cn(
        'hidden overflow-hidden whitespace-nowrap text-body-s font-medium',
        'lg:inline-block lg:max-w-0 lg:opacity-0',
        'lg:transition-[max-width,opacity,margin] lg:duration-300 lg:ease-out',
        'lg:group-hover:ml-0.5 lg:group-hover:max-w-[12rem] lg:group-hover:opacity-100',
        'lg:group-focus-visible:ml-0.5 lg:group-focus-visible:max-w-[12rem] lg:group-focus-visible:opacity-100',
      )}
    >
      Chat on WhatsApp
    </span>
  </a>
  )
}

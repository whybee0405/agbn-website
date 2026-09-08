import localFont from 'next/font/local'
import { Azeret_Mono } from 'next/font/google'

export const clashDisplay = localFont({
  src: [
    { path: '../../public/fonts/clash-display-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/clash-display-500.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/clash-display-600.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/clash-display-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
})

export const generalSans = localFont({
  src: [
    { path: '../../public/fonts/general-sans-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/general-sans-500.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/general-sans-600.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/general-sans-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
})

/**
 * Brand DNA §5.3 specifies a mono for stats, prices, dates and tags so numbers
 * read as precise rather than promotional. IBM Plex Mono did that job neutrally
 * but is now the default mono of developer tooling and AI-generated layouts —
 * it reads as absent rather than deliberate.
 *
 * Azeret Mono keeps the utility and adds character where it actually shows:
 * this site uses mono almost exclusively for uppercase kickers at 12px/0.14em
 * tracking and for figures at Display M/L. Its numerals are flat-sided and
 * engineered, and it stays narrow enough that tracked captions don't sprawl —
 * which rules out the wider alternatives (Martian Mono) and the single-weight
 * ones (Fragment Mono), since 400/500/600 are all in use.
 */
export const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-data',
  display: 'swap',
})

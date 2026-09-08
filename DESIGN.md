# AGBN Design System

The **[AGBN Brand DNA](./AGBN_Brand_DNA.md)** is the source of truth for what the brand
is. This file records how that brand is implemented in code, and the traps that
are easy to fall back into.

Everything here lives in `src/app/(frontend)/globals.css` unless stated otherwise.

---

## 1. Surfaces

Four tones. Every band on the site picks exactly one via `<Section tone="...">`
(`src/components/Section/index.tsx`) rather than reaching for `bg-navy` inline.

| Tone | Light mode | Dark mode | Used for |
|---|---|---|---|
| `page` | White | Midnight | Default content bands |
| `sunken` | Slate 50 | Near-black navy | Index pages, form pages |
| `brand` | Navy | Navy | Stats band, values, page headers |
| `deep` | Midnight | Midnight | Hero, closing CTA, article mastheads |

The tone carries its text colour with it. That is the whole point: muted copy on
a dark band can no longer silently inherit the light-surface muted token.

**Rule: a page changes tone deliberately, not incidentally.** The homepage runs
dark (hero, stats) then light (steps, sectors, membership) then dark (close).
Two switches, not six.

---

## 2. Colour tokens

Brand DNA §5.2 fixes the palette. These semantic tokens sit on top of it and
exist because the raw palette has gaps that caused real accessibility failures.

| Token | Why it exists |
|---|---|
| `--on-surface` / `text-on-surface` | Body copy on a light surface |
| `--on-surface-muted` | Secondary copy on a light surface (Slate 500) |
| `--on-surface-heading` / `text-on-surface-heading` | Headings. Navy in light mode, Slate 50 in dark. **Do not use `text-navy` for headings**: in dark mode the raised surface *is* Navy, so the heading disappears into its own card. |
| `--on-surface-accent` / `text-on-surface-accent` | Small Clay labels. Raw Clay (`#B85C2E`) is **4.28:1** on Slate 50, under AA. This deepens it toward Slate 900 for 5.3:1 and lightens it in dark mode. |
| `--on-dark` | Copy on Navy or Midnight |
| `--on-dark-muted` | Secondary copy on Navy or Midnight. **Slate 500 on Navy is ~2.6:1 and fails AA** — that was the single most common bug in the previous build. This is Slate 200 at 78%. |
| `--on-dark-error` | Error text on dark bands. `#B3261E` is ~2.3:1 on Midnight. |
| `--hairline` / `--hairline-dark` | Dividers, light and dark surfaces |

### Two rules that are easy to break

1. **Never put Slate 500 on Navy or Midnight.** Use `text-on-dark-muted`.
2. **Gold is never text on a light background** (Brand DNA §5.2). On light
   surfaces gold may only be a border or an underline. Card titles use
   `group-hover:decoration-gold`, not `group-hover:text-gold`. Gold icons on
   light also fail: `#CCA43B` on Slate 50 is ~2.2:1, under the 3:1 a meaningful
   icon needs.

---

## 3. Type scale

Fluid `clamp()` steps, each at least 1.25x the one below it at every viewport.

`text-caption` · `text-body-s` · `text-body-m` · `text-body-l` · `text-lede` ·
`text-display-s` · `text-display-m` · `text-display-l` · `text-display-xl`

Display sizes pair with `tracking-display` or `tracking-display-tight`. Clash
Display is geometric and wide; without negative tracking it reads like a default
UI sans.

Body copy is capped with `.measure` (65ch) or `.measure-tight` (48ch). Numbers,
prices, dates and stats use `.tabular`, which applies IBM Plex Mono with tabular
figures so columns of data stop changing width.

### ⚠️ tailwind-merge

`cn()` in `src/utilities/ui.ts` is `extendTailwindMerge`, **not** plain
`twMerge`. tailwind-merge only knows Tailwind's default scales, so out of the box
it reads `text-display-l` as a *colour* and silently drops it when combined with
`text-navy`. Every heading on the site rendered at body size because of this.

**If you add a new `--text-*`, `--color-*` or `--tracking-*` token, register it
in `src/utilities/ui.ts` as well.** Otherwise `cn()` will eat it, quietly, with
no build error.

---

## 4. Spacing

`--space-section-sm` / `--space-section` / `--space-section-lg`, applied through
`<Section rhythm="sm|md|lg">`.

A section directly under a `<PageHeader>` should pass `rhythmTop="sm"`, otherwise
the header's bottom rhythm stacks on the section's top rhythm and reads as a gap
rather than a section break.

The `.section-y*` utilities read from `--section-pt` / `--section-pb` so an
override is a custom-property change rather than a specificity fight.

---

## 5. Motion

Brand DNA §5.7: motion means something, and one orchestrated moment per page
beats five scattered ones.

- **The one moment** is the hero network map drawing itself. It resolves in
  ~1.7s and never loops.
- **`<Reveal>`** (`src/components/Reveal/index.tsx`) is the only scroll-entrance
  primitive. It uses IntersectionObserver, hides content only after hydrating,
  and has a 2.5s failsafe so entrance motion can never be the reason something
  is unreadable.
- **Never use `window.addEventListener('scroll')`.** It runs every frame and,
  driving React state, re-renders the tree throughout the scroll. Use
  IntersectionObserver (see `StickyMobileCTA` for the sentinel pattern).
- Animate `transform` and `opacity` only.
- Everything degrades under `prefers-reduced-motion: reduce`.

---

## 6. Components

| Component | Use for |
|---|---|
| `Section`, `SectionHeading`, `PageHeader` | Page structure, surface tone, rhythm |
| `EntityCard`, `CardGrid` | Every collection listing. Pass `feature` on the first item so an index has a lead item instead of N identical tiles. |
| `ArticleHero` | Detail-page mastheads. Collapses to a plain dark band when there is no image. |
| `EmptyState` | Any empty result. Always give it an `action`; never dead-end. |
| `Reveal` | Scroll entrance, used sparingly |
| `NetworkMap` | `hero` / `divider` / `loading` / `empty`. Brand DNA §5.4: at most once or twice per page, never as wallpaper. |

### Layout families

An index page should not look like every other index page. Current split:
opportunities, magazine and case studies use the card grid; **events uses a
dated agenda list**; the homepage uses numbered rows and a typographic sector
index. Keep at least four distinct layout families across the site.

### Kickers

The small uppercase mono label above a heading is rationed: **at most one per
three sections**. The four-word sequence "Connect. Refer. Earn. Grow." is a named
brand system (Brand DNA §4) and is exempt, but it carries a section outright
rather than appearing as a kicker.

---

## 7. Accessibility floor

Verified across 276 text nodes on 10 pages with zero failures. Keep it there.

- WCAG AA contrast: 4.5:1 body, 3:1 large text and meaningful icons.
- Interactive targets are at least 44px. Button `default` and `lg` sizes and all
  inputs are built to clear this.
- Focus is never removed. `:focus-visible` draws a gold ring site-wide.
- Form inputs use 16px text on mobile so iOS Safari does not zoom on focus.
- Labels are always visible; placeholders are never labels. Errors sit below the
  field with `role="alert"`.
- Every page has a skip link to `#main`.

---

## 8. Copy

- **No em dashes** (`—`) or en dashes (`–`) in anything a user or CMS editor
  reads. Use a comma, colon, period, or parentheses.
- No stat without a real number behind it (Brand DNA §2). The homepage stats
  band filters out any figure the CMS has not been given.
- Name the sector, country, or outcome rather than gesturing at "growth".

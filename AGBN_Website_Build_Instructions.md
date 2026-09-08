# AGBN Website Rebuild — Instructions for Claude Code
Prepared by CloudIA. This file is written to be read and executed by Claude Code with minimal further clarification needed. It assumes no prior context beyond this file and its companion, `AGBN_Brand_DNA.md`, which must be read first and treated as the source of truth for every visual and copy decision.

If anything in this file is ambiguous, prefer the choice that most directly fixes an issue listed in Section 2, and prefer the choice that keeps content editable by a non-technical AGBN team member through the CMS rather than hardcoded.

---

## 0. Read First

1. Read `AGBN_Brand_DNA.md` in full before writing any code. Every colour, font, and headline choice must trace back to that document.
2. This is a rebuild, not a redesign from a blank page. AGBN's existing structure (membership tiers, sector categories, mission/vision, "Connect, Refer, Earn, Grow" framing) is good and should be preserved, just fixed, made dynamic, and finished.
3. The current live site (for reference only, not to be copied as-is) is at `https://coderhashira.github.io/agbn/`. Its content, prices, and sector list are the real content to migrate into the CMS, not placeholder text to rewrite from scratch.

---

## 1. Project Goal

Build a production-ready marketing website for AGBN (Africa & Global Business Network) with a headless CMS backend, so that:
- Every issue found in the current site's audit is fixed (full list in Section 2).
- Non-technical AGBN staff can add and edit blog posts, case studies, pricing packages, events, sector categories, and opportunities without touching code.
- The site is fast, accessible, and trustworthy on a first mobile visit, which is the primary use case for this audience.

**Out of scope for this phase**: member login/authentication, a referral-tracking dashboard, in-app payments, and the mobile app itself. These are real, valuable Phase 2 features (see Section 10) but should not block shipping a finished, trustworthy marketing site first.

---

## 2. Issues This Build Must Fix

Every item below was confirmed in a live audit of the current site. Treat this as an acceptance checklist, not a suggestion list.

| # | Issue | Required fix |
|---|---|---|
| 1 | Homepage hero CTAs sit below the fold on mobile | Hero must fit its headline, one-line subhead, and primary CTA within a 375×812 viewport without scrolling |
| 2 | "Download App" button renders as white text on a light background, effectively invisible | Follow the Brand DNA colour rules exactly: gold/white text only ever sits on navy or midnight backgrounds |
| 3 | Opportunities, Download App, and Magazine pages are all placeholder "Coming Soon" screens | Opportunities becomes a real, CMS-driven directory (Section 6.3). Magazine becomes a real blog (Section 6.6). Download App can remain a simple, honest "in development" page but must not be a primary hero CTA until it is real |
| 4 | No privacy policy, no terms of service | Build both as CMS-editable pages (Section 6.8). Content must be drafted with/approved by AGBN, do not invent binding legal language, flag this clearly to the client as a content gap they or their lawyer must fill |
| 5 | No working contact page, only plain-text email | Build a real contact page with a working form (Section 7.4) and a `mailto:` fallback |
| 6 | Homepage stat "Commission Earned" ships with no number | Every stat must be a real, CMS-managed field with a value. If a number isn't available yet, don't display the stat |
| 7 | Broken footer links to non-existent Services and Contact pages | Every nav/footer link must resolve. No link is added to a template until its target page exists |
| 8 | About page has its own separate stylesheet, different colours and fonts from the rest of the site | One shared design system, one component library, no page-level style overrides, enforced structurally (Section 5) |
| 9 | RSVP modal promises "subscribe to our updates" with no subscribe mechanism | Either build a real newsletter signup (CMS-backed, connected to an email provider) or remove the promise from the copy |
| 10 | Homepage loads ~12.85MB of images | Enforce the performance budget in Section 8. No exceptions |
| 11 | No meta descriptions anywhere; 5 of 6 pages share one identical page title | Every page (static and CMS-generated) must have a unique title and description, enforced by the CMS field being required |
| 12 | No Open Graph or Twitter Card tags, link shares render blank | Implement dynamic OG image generation (Section 8.4) |
| 13 | No favicon set, only a single reused `.ico` | Full favicon/icon set plus a web app manifest (Section 8.5) |
| 14 | No `robots.txt`, no `sitemap.xml` | Both generated automatically and kept in sync with CMS content (Section 8.3) |
| 15 | No sticky mobile CTA | Persistent bottom action bar on mobile once the user scrolls past the hero (Section 6.1) |
| 16 | No loading states anywhere | Any CMS-fetched content (opportunities list, blog list, filtered views) needs a skeleton/loading state, styled per Brand DNA §5.4 |
| 17 | No form validation or error states | Every form needs inline validation, clear error messages in AGBN's voice (Brand DNA §4), and a loading state on submit |
| 18 | No thank-you/confirmation page or state | Every form submission (join, contact, RSVP, newsletter) ends in a clear confirmation, not a dead end |
| 19 | No cookie banner | Add one, scoped to what analytics/cookies are actually in use (Section 9) |
| 20 | No analytics | Implement analytics per Section 9 before launch, not after |
| 21 | No custom 404 page | Build one in-brand, with a way back to the homepage and to the opportunities directory |

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** | Server components, built-in image optimisation, native metadata API for SEO, industry standard for this kind of build |
| CMS | **Payload CMS 3.x**, installed in the same Next.js app (Payload's Next.js-native integration, not a separate service) | Single codebase and single deploy, full TypeScript type safety between the CMS schema and the frontend, self-hosted so AGBN owns their data outright |
| Database | **PostgreSQL** (Neon or Supabase for managed hosting) | Payload's recommended production database, supports the relational structure needed for tags, sectors, and filtering |
| Media storage | **Cloudflare R2** or **S3-compatible bucket**, via Payload's storage adapter | Keeps uploaded media out of the git repo and off the app server, required for the image pipeline in Section 8 |
| Styling | **Tailwind CSS** with a token config generated directly from Brand DNA §5.2 and §5.3 | Enforces the colour/type system at the config level, not by convention |
| Component layer | **shadcn/ui** as a base, restyled to the Brand DNA tokens | Accessible primitives (dialogs, forms, dropdowns) out of the box, avoids reinventing accessibility work |
| Hosting | **Vercel** (frontend + Payload admin together) | Native Next.js support, preview deployments per pull request |
| Transactional email | **Resend** | Powers contact form notifications, RSVP confirmations, newsletter confirmation emails |
| Analytics | **Plausible** (privacy-friendly, no cookie banner complexity for basic pageview tracking) plus optional GA4 if AGBN specifically needs it | See Section 9 |

Do not substitute a different CMS or framework without flagging the tradeoff. This stack was chosen specifically because Payload's schema, admin UI, and Next.js integration are what make "blogs, case studies, pricing packages, and anything else needing a database" editable by AGBN's own team without a developer.

---

## 4. Repository Structure

```
agbn/
├── src/
│   ├── app/
│   │   ├── (frontend)/          # public site routes
│   │   ├── (payload)/           # CMS admin, mounted at /admin
│   │   └── api/                 # form handlers, OG image route, etc.
│   ├── collections/             # Payload collection configs (Section 6)
│   ├── globals/                 # Payload global configs (nav, footer, site settings)
│   ├── components/              # shared React components, built to Brand DNA tokens
│   ├── lib/                     # utilities, email client, validation schemas
│   └── styles/                  # Tailwind config + design tokens from Brand DNA
├── public/                      # static assets: favicon set, fonts (self-hosted)
├── payload.config.ts
└── next.config.ts
```

---

## 5. Design System Implementation

1. Translate Brand DNA §5.2 (colour) and §5.3 (typography) directly into `tailwind.config.ts` as named tokens (`navy`, `midnight`, `gold`, `ember`, `savanna`, `clay`, `slate-900` etc). Components must reference these tokens, never raw hex values, so a future palette tweak happens in one file.
2. Self-host Clash Display, General Sans, and IBM Plex Mono (do not load from a third-party CDN at runtime, this hurts both performance and reliability). Use `next/font/local`.
3. Build the Network Map signature element (Brand DNA §5.4) as a reusable component with three variants: `hero` (animated), `divider` (static thin line), and `loading` (pulsing single node). Respect `prefers-reduced-motion` in the animated variant.
4. No component may define its own colours, fonts, or spacing outside the shared token system. This is the single structural fix for Audit Issue #8 (the About page problem), enforce it via a shared layout wrapper that every route uses, so a page cannot opt out.

---

## 6. Information Architecture and Payload Collections

### 6.1 Pages and Routes

| Route | Purpose | Data source |
|---|---|---|
| `/` | Homepage: hero, how it works, sector highlights, membership preview, CTA | Mostly CMS-driven via `SiteSettings` global + pulled highlights from other collections |
| `/opportunities` | Real, filterable opportunity directory | `Opportunities` collection |
| `/opportunities/[slug]` | Single opportunity detail | `Opportunities` collection |
| `/about` | Mission, vision, team, how membership works | `Pages` collection or static template pulling `PricingPlans` |
| `/pricing` | Full membership tier breakdown (currently folded into About, deserves its own page) | `PricingPlans` collection |
| `/events` | Events list | `Events` collection |
| `/events/[slug]` | Single event with real RSVP flow | `Events` collection |
| `/magazine` (or `/blog`, pick one and keep it consistent with existing brand naming) | Blog/magazine index, filterable by content pillar, sector, country | `Posts` collection |
| `/magazine/[slug]` | Single article | `Posts` collection |
| `/case-studies` | Case study index | `CaseStudies` collection |
| `/case-studies/[slug]` | Single case study | `CaseStudies` collection |
| `/contact` | Real contact form | Form handler + `Contact` submissions |
| `/privacy`, `/terms` | Legal pages | `Pages` collection, CMS-editable |
| `/join` | Membership sign-up, replaces the external Google Form | Form handler + `MemberLeads` collection |
| `*` (404) | Custom not-found page | Static, in-brand |

Every page below the top-level nav must also implement the **sticky mobile CTA**: a persistent bottom bar on mobile ("Join AGBN") that appears after the user scrolls past the hero, styled per Brand DNA, dismissable but reappearing on route change.

### 6.2 Collection: `PricingPlans`
Fields: `name`, `price` (number), `currency`, `localPriceEstimate` (for the R-equivalent shown alongside), `billingPeriod`, `tagline`, `features` (array of strings), `highlighted` (boolean, for the "most popular" tier), `order` (number). Powers both `/pricing` and the homepage preview.

### 6.3 Collection: `Opportunities`
Fields: `title`, `sector` (relationship to a `Sectors` collection), `country`, `summary`, `description` (rich text), `status` (open/closed), `datePosted`, `featuredImage`. This is the collection that replaces the static image carousel and the dead "Explore Opportunities" CTA, this is the single highest-priority piece of dynamic content in the whole rebuild (see Audit Issue #3).

### 6.4 Collection: `Sectors`
Fields: `name`, `slug`, `icon`, `description`. Seed with the ten existing categories (Mining, Healthcare, Construction, Technology, Agriculture, Green Energy, Logistics, Finance & Investment, Professional Services, Manufacturing). Used to tag both `Opportunities` and `Posts`.

### 6.5 Collection: `Events`
Fields: `title`, `venue`, `startDateTime`, `endDateTime`, `description`, `featuredImage`, `rsvpStatus` (open/closed/full), `capacity` (optional), relationship to `EventRSVPs` submissions. Fixes Audit Issue #9: if `rsvpStatus` is "closed," the RSVP button should offer a real "notify me" signup instead of a dead-end modal.

### 6.6 Collection: `Posts` (the Magazine/Blog)
Fields: `title`, `slug`, `pillar` (select: Deal Stories / Sector Spotlights / Country Spotlights / Network Notes, per Brand DNA §6), `sector` (relationship), `country`, `excerpt`, `body` (rich text), `featuredImage`, `author`, `publishedDate`, `seoTitle`, `seoDescription`.

### 6.7 Collection: `CaseStudies`
Fields: `memberName`, `memberBusiness`, `country`, `sector` (relationship), `summary`, `body` (rich text), `outcomeMetric` (e.g. "Referral closed: $40,000 contract", optional, only shown if the member has consented to share a real figure), `featuredImage`.

### 6.8 Collection: `Pages` (flexible/legal pages)
Fields: `title`, `slug`, `body` (rich text), `seoTitle`, `seoDescription`. Used for Privacy Policy and Terms of Service so they're editable without a deploy.

### 6.9 Collection: `MemberLeads` and `Contact` (form submissions)
Simple submission logs (`name`, `email`, `phone`, `message`/`selectedTier`, `submittedAt`, `status`). Every form in Section 7.4 writes here in addition to sending a notification email via Resend.

### 6.10 Globals
- `SiteSettings`: logo, tagline, homepage stats (members, countries, opportunities posted, and yes, a real commission-earned figure or the field is left empty and the stat is hidden, never shown blank), social links, contact email/phone.
- `Navigation`: primary nav items and footer link groups, so broken links (Audit Issue #7) become structurally impossible, a nav item can only be added by pointing it at a real page.
- `SEODefaults`: fallback site title template, fallback OG image, default description.

---

## 7. Functional Requirements

### 7.1 Homepage Hero
Headline, one-line subhead, and one primary CTA ("Join AGBN") must render inside a 375×812 viewport with zero scroll. Secondary CTAs ("Explore Opportunities") can sit just below. Replace the static phone mockup with the Network Map hero variant (Brand DNA §5.4), animated on load, respecting reduced-motion.

### 7.2 Opportunities Directory
Filterable by sector and country, card-based grid, each card links to a real detail page. Empty/loading states styled per Brand DNA §5.4. This single feature does more to fix the site's credibility than any other item on this list, prioritise it early in the build.

### 7.3 Sticky Mobile CTA
Implemented as a shared layout component, not per-page, so it can never be forgotten on a new page template.

### 7.4 Forms
Every form (`/join`, `/contact`, event RSVP, newsletter) needs:
- Inline validation with specific, in-voice error messages (Brand DNA §4: direct, no filler, no vague "an error occurred").
- A visible loading state on submit (button shows a spinner/disabled state, no double-submits).
- A real success/thank-you state, either an inline confirmation or a dedicated `/thank-you` route, never a silent redirect with no feedback.
- Server-side validation in addition to client-side, don't trust the client alone.

### 7.5 Custom 404
In-brand, uses the Network Map "loading" motif reimagined as a "disconnected node," with a clear path back to the homepage and to `/opportunities`.

---

## 8. Performance and Technical SEO

### 8.1 Image Pipeline
All images pass through Payload's media handling into the storage bucket, then are served through `next/image` with responsive `sizes`, modern formats (AVIF/WebP), and lazy loading by default (`loading="lazy"` except the LCP hero image, which should be `priority`). No image may be uploaded and served at its raw original size, this was the single biggest technical failure of the current site (12.85MB homepage).

### 8.2 Performance Budget
- Homepage total transferred weight: under 1.5MB on first load.
- Largest Contentful Paint: under 2.5s on a simulated Slow 4G connection.
- No single image over 300KB after optimisation.
- Every `<img>`/`Image` component must have explicit dimensions to prevent layout shift.

### 8.3 `robots.txt` and `sitemap.xml`
Both generated dynamically (Next.js route handlers or `next-sitemap`), sitemap must include CMS-generated routes (`/opportunities/[slug]`, `/magazine/[slug]`, `/case-studies/[slug]`) and regenerate as content is published, not just at build time for static pages.

### 8.4 Metadata and Open Graph
Use the Next.js Metadata API on every route, static and dynamic. Every CMS collection with a detail page (`Posts`, `CaseStudies`, `Opportunities`, `Events`) must have required `seoTitle`/`seoDescription` fields, enforced at the schema level so a page cannot be published without them. Generate OG images dynamically per page using `@vercel/og` (or equivalent), pulling the page title and AGBN's brand styling, so every shared link gets a real, on-brand preview card, not a blank one.

### 8.5 Favicon and Icons
Full set: `favicon.ico`, 16x16, 32x32, 180x180 (apple-touch-icon), 192x192 and 512x512 (for `site.webmanifest`), plus the manifest itself for installability.

---

## 9. Analytics and Consent

Implement Plausible (or GA4 if the client specifically requests it) before launch, not as a follow-up. Track, at minimum: pageviews, `/join` form starts and completions, `/opportunities` filter usage, and outbound clicks to WhatsApp. If any cookie-based tracking is used (GA4 does use cookies), implement a real cookie consent banner scoped to what's actually running, don't ship a banner that says more or less than what the site actually does.

---

## 10. Explicitly Out of Scope (Phase 2 Recommendations)

Flag these to the client as valuable next steps, but do not build them as part of this phase unless the client confirms scope:
- Authenticated member portal with login.
- Referral tracking dashboard ("earn commission" becoming something a member can watch happen, per the audit's original recommendation).
- In-app/on-site payment processing for membership tiers (currently and for this phase, membership sign-up is a qualified lead capture, not a checkout).
- Native mobile app (the "Download App" page should stay honest about this being in development, it should not fake a store listing).
- WhatsApp Business API integration for referral notifications (Phase 1 can keep a well-placed link to the existing WhatsApp group, done cleanly, rather than building the integration).

---

## 11. Definition of Done

Before this project is considered complete, every row in Section 2's table must be verifiably fixed, not just addressed in code but checked in a rendered browser at desktop, laptop, tablet, and mobile widths. Re-run the same kind of audit that produced this document (source inspection + rendered screenshots + a live network weight capture on the homepage) as a final QA pass, and confirm the homepage is under the 1.5MB budget in Section 8.2 before handoff.

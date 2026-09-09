# AGBN UI / UX audit

Date: 8 September 2026. Target: the local AGBN application at http://localhost:3030, baseline commit `42a437c`. Public website only; CMS administration is outside this review.

## Verdict

This is a coherent, promising website with a stronger visual foundation than a typical starter template. It is not yet an awards-ready experience. The largest gap is between what the site claims and what a visitor can verify or do. Visual refinement will help, but credible content and complete journeys must lead the work.

My qualitative assessment is **6.5/10 for visual craft and 5/10 for the end-to-end public experience**. These are editorial judgments, not user-study results, Lighthouse scores, or Awwwards jury predictions. A $5,000 project budget is a scope constraint, not a quality certification.

The visual anti-pattern verdict is mixed: the hero has identity, the palette is disciplined, and the page avoids excessive effects. However, internal strategy language appears in public copy, secondary pages repeat large mastheads and sparse content, and illustrative photography is doing work that should be done by evidence. Those are the strongest signs of an unfinished generated site.

## What was tested

- Captured and measured 12 routes at 1440 × 900 and 390 × 900: home, about, pricing, join, opportunities, events, magazine, case studies, contact, app preview, privacy, and terms. All returned HTTP 200 without uncaught page errors during the navigation sweep.
- Inspected eight detail pages: two each for opportunities, events, magazine, and case studies, using a 390px viewport.
- Checked home, pricing, join, and opportunities at 320, 768, 1024, and 1280px. Pricing overflowed at 320px; the other tested combinations did not.
- Tested membership tier preselection, empty-form validation and focus, menu keyboard navigation and Escape, sector/country filtering, an empty filter combination, and clearing filters.
- Ran axe-core 4.10.3 against main content on ten routes at two widths, plus one whole-document pass on Join. Automated checks are a subset of accessibility testing, not a conformance certificate.
- Simulated an aborted membership submission by intercepting its POST in the browser. The request never reached the server and created no lead or notification.
- Verified normal hero scroll motion and reduced-motion behavior in Chromium.
- Reviewed source for shared layout, typography, forms, listings, detail pages, media, motion, and seed content.

Evidence and repeatable diagnostic scripts are in `test-results/ui-audit/`, an existing Git-ignored output location. Key files: `pages.json`, `interactions.json`, `verify.json`, `final-checks.json`, screenshots, and the four `.mjs` scripts. The pre-existing Docker services were left running. No application or CMS content was changed.

Limitations: no production Core Web Vitals measurement, physical phone/soft-keyboard test, Safari/Firefox run, screen-reader session, user recruitment, successful email delivery test, or independent business-claim verification. Most screenshots use reduced motion to make layout comparison reliable. Full-page screenshots can place fixed UI partway down the stitched image; viewport screenshots and DOM measurements substantiate the overlap findings.

## Technical health

Scores use a 0–4 scale. Performance is provisional because this is a development server.

| Dimension | Score | Finding |
|---|---:|---|
| Accessibility | 2/4 | Mobile focus management and stats semantics need work; visible focus needs better contrast on light surfaces. |
| Performance | 3/4 provisional | Responsive images and small client components are good foundations; production speed is unmeasured. |
| Responsive design | 2/4 | Good at common widths; narrow pricing overflow and article hero collisions are confirmed. |
| Theming / tokens | 3/4 | Coherent intentional single theme; documentation and some gold-on-light usage have drifted. |
| Visual anti-patterns | 2/4 | Recognizable hero, but repetitive secondary composition and strategy-as-copy remain. |
| Total | **12/20** | Significant targeted work, not a wholesale rebuild. |

## Prioritized findings

P0 = task cannot be completed. P1 = major usability or launch-readiness issue. P2 = smaller issue or material design improvement. P3 = polish/documentation. There are **20 grouped findings: 0 P0, 10 P1, 9 P2, 1 P3**. Some P1 items require business content, not code. This is a product-readiness assessment, not legal advice.

### P1: fix before launch

**01. Public trust pages still disclose rebuild placeholders.**

Both `/privacy` and `/terms` explicitly say they are not real policies. Contact displays `hello@agbn.example`. These are visible failures at exactly the point someone checks whether to share personal details. Replace the email with a verified monitored destination and supply owner-approved policy content. Acceptance: all three routes contain approved real information; forms link to relevant privacy information nearby. Locations: `src/seed/index.ts:539`, `src/seed/index.ts:584`, CMS Pages and Site Settings. Workflow: harden / clarify.

**02. Proof is asserted without visible provenance.**

The homepage displays 700+ members, 7+ countries, 10+ sectors, and 10+ opportunities posted. Case studies introduce named people, attributed quotations, and contract values that are also present in the seed script. This does not establish that the claims are false; it establishes that this audit cannot substantiate them. The public copy also promises connections across 54 countries while the stats show 7+ countries. Distinguish current membership footprint from continental ambition. Verify each claim and obtain permission for stories/portraits; label illustrative examples where appropriate. Use exact live counts where available and dates/definitions for manually maintained metrics. Locations: `src/app/(frontend)/page.tsx:42`, `:121`, `:126`, `src/seed/index.ts:385`, `:577`. Workflow: clarify.

**03. The opportunity-to-application journey loses its context.**

The healthcare card advertises a 6% commission, but the selected opportunity's detail page never repeats that rate. It offers generic Join and Contact links with no opportunity reference. There is also no public path for an existing member to act on the listing. Keep commission, status, eligibility, referral process, and a stable opportunity reference together. Carry the opportunity into the enquiry/application and expose the real existing-member channel. Do not imply that a member dashboard exists unless it does. Acceptance: users can answer “what do I earn, what qualifies, and what happens next?” without leaving the detail page. Location: `src/app/(frontend)/opportunities/[slug]/page.tsx:130`. Workflow: shape / clarify.

**04. Article heroes cannot reliably contain long mobile titles.**

At 390px, the Ghana magazine article's back link occupies y=14.9–58.9 while the sticky header occupies y=0–69. Its heading begins at y=66.9. The back link is covered and the heading touches/overlaps the header, even at scrollY=0. The cause is absolute text over a fixed 16:9 mobile image box. Put the text in normal flow on narrow screens or give the hero a content-driven minimum height. Verify long titles and enlarged text. Location: `src/components/ArticleHero/index.tsx:76`. Evidence: `article-top-mobile.png`, `verify.json`. Workflow: adapt.

**05. Pricing overflows at 320px.**

The document becomes 343px wide. All three cards extend to x≈343 despite the 320px viewport. Constrain grid tracks and card min-width, reduce narrow-screen padding, and allow CTA labels to fit or wrap. Acceptance: no horizontal scrolling at 320px, including enlarged text. Location: `src/app/(frontend)/pricing/page.tsx`, pricing grid/cards/buttons. Evidence: `pricing-320.png`, `final-checks.json`. WCAG reference: Reflow, 1.4.10. Workflow: adapt.

**06. Mobile navigation locks scrolling but does not manage focus.**

After the eight menu links, Tab moves to `join-name`, `join-email`, and other background inputs while the menu stays open. Escape does close it, which is good. Choose a consistent model: either a modal navigation panel with contained focus, inert background, a scrollable panel and focus return, or a nonmodal disclosure that does not lock the page and conceal focused content. Do not add a focus trap without deciding that model. Location: `src/Header/Component.client.tsx:30`. Evidence: `menu-focus-mobile.png`, `interactions.json`. Workflow: harden.

**07. A failed submission produces no useful feedback.**

With the membership POST aborted locally, the browser reports “Failed to fetch”; the page shows no explanatory error or retry guidance. The button re-enables and values remain, but the visitor cannot tell whether the application arrived. Client handlers and server actions lack exception handling for this path. Catch failures, preserve values, announce a recovery message, and distinguish a failed save from a notification failure after a successful save. Acceptance: an interrupted request gives a clear actionable result without duplicate submissions. Locations: `src/components/Form/JoinForm.tsx`, `src/app/(frontend)/actions.ts`; related forms use the same pattern. Evidence: `join-network-failure.png`, `verify.json`. Workflow: harden.

**08. Event states and times are ambiguous or inconsistent.**

The index and detail pages mark the Nairobi roundtable open, while a related-events card observed on the webinar page labels it registration closed. The source also maps any non-open detail state to “Registration not open yet,” which cannot distinguish full, ended, and not-yet-open. Dates render without an explicit timezone or timezone label. Introduce a shared event-state model, inspect published/draft/cache differences behind the observed inconsistency, and display a named event timezone. Separate past events from upcoming ones. Locations: `src/app/(frontend)/events/page.tsx:20`, `src/app/(frontend)/events/[slug]/page.tsx:17`, `:129`. Evidence: `interactions.json`. The exact cause of the cross-page status mismatch is not established. Workflow: harden / clarify.

**09. The universal gold focus ring is weak on white.**

The custom focus color is #CCA43B, about 2.34:1 on white, below the 3:1 benchmark for meaningful non-text indicators. Give light surfaces a dark, high-contrast focus treatment and retain gold on dark surfaces. Verify actual focused controls and links rather than changing a token blindly. Location: `src/app/(frontend)/globals.css:295`. WCAG reference: Non-text Contrast, 1.4.11. Workflow: harden.

**10. Homepage statistics have invalid description-list nesting.**

Axe finds one malformed `dl` and eight affected `dt`/`dd` nodes. The Reveal wrapper contains another div around the term/value pair. Flatten the grouping so each direct group contains the paired term and description, with the icon inside that valid structure. Location: `src/app/(frontend)/page.tsx:320`. Evidence: `interactions.json`, rules `definition-list` and `dlitem`. WCAG reference: Info and Relationships, 1.3.1. Workflow: harden.

### P2: improve conversion and craft

**11. Homepage sequence buries the strongest sales material.**

The page is about 6,913px tall at desktop and 8,426px at 390px, including the footer. Length alone is not a defect; the issue is how that length is spent. There are no live opportunity cards or featured deal stories on the homepage, but a substantial gallery and a substantial unreleased-app section. Bring verified opportunities and one outcome near the top. Trim the future app to a small preview. Location: `src/app/(frontend)/page.tsx`. Workflow: shape / distill.

**12. Typography has size variation but little weight variation.**

The hero and sampled section headings all compute to Clash Display 400. The thin, tightly tracked style is distinctive, but using it everywhere softens authority and makes collection titles less scannable. Preserve the font family; assign deliberate weight and tracking roles to hero, section headings, card titles and body. Compare 500/600 selectively. Location: `src/app/(frontend)/globals.css:19`, shared heading components. Evidence: `hero-desktop.png`, `verify.json`. Workflow: typeset.

**13. Public copy contains internal design commentary.**

“Real sectors in real countries, not a generic promise to grow your business” and About values describing how copy should be written address the designer more than the member. The app teaser claims “everything above already works on the site today,” yet the public site has no referral tracker/wallet journey. Rewrite around actions visitors can actually take and the current service model. Location: `src/app/(frontend)/page.tsx:369`, `:400`, `:557`, `src/app/(frontend)/about/page.tsx`. Workflow: clarify.

**14. About does not establish who is accountable.**

The page repeats mission, vision, values, and pricing without leadership, operating history, verified locations, a vetting explanation, or a substantive member story. A strategic partner needs those facts more than another tier overview. Build the page around real people, how opportunities are checked, and evidence of activity. Requires supplied and approved business information. Location: `src/app/(frontend)/about/page.tsx`. Workflow: shape.

**15. Sticky conversion UI competes with the task already underway.**

At 650px scroll on Join, the fixed Join banner has `aria-hidden=false`. It advertises the page the visitor is already using. WhatsApp also floats alongside the form. Suppress the acquisition bar on Join and during form focus; coordinate all fixed elements and short-screen navigation. Use an actual hero sentinel rather than the global 480px guess. Location: `src/components/StickyMobileCTA/index.tsx:39`, `src/app/(frontend)/layout.tsx`. Evidence: `join-sticky-verified.png`. Workflow: adapt / distill.

**16. The footer grid creates a conspicuous empty second row.**

On desktop, the two-column brand block plus three navigation groups consume all five tracks. The newsletter then drops alone onto the next row, with a narrow email field and a large unused area. Give the newsletter an intentional full-width band or a grid area that can accommodate its controls. Mobile can group secondary navigation more compactly. Location: `src/Footer/Component.tsx:32`. Evidence: `-contact-1440.png`. Workflow: layout.

**17. Gold step numbers fade into light surfaces.**

Axe flags four homepage numerals at 2.34:1 and three Join numerals at 2.2:1, repeated at both tested widths. These numbers are marked decorative and their information is redundant, so this report does not automatically classify all seven as WCAG text violations. They still contradict the project's own palette rules and weaken hierarchy. Use the existing light-surface accent or muted token. Locations: homepage step rows and `src/app/(frontend)/join/page.tsx`. Workflow: colorize.

**18. Opportunity browsing needs clearer live inventory and recovery.**

Filtering, result counts and clearing an empty state work. But closed listings remain mixed into the live feed and related results; there is no status filter. With more content, the 60-item query can report totalDocs while rendering only 60 with no pagination. Default to live inventory, expose a deliberate closed/archive view, and make count/pagination truthful. Treat search as a later need tied to inventory growth, not a launch requirement for six records. Location: `src/app/(frontend)/opportunities/page.tsx:54`, related query in `[slug]/page.tsx`. Workflow: harden / clarify.

**19. Pricing supports reading, but not efficient comparison.**

The cards require reading multiple lists and remembering “Everything in Connect/Grow.” The no-payment-today explanation appears below the cards. Put that reassurance by the actions, give each tier one clear use case, and group shared versus added benefits in a compact comparison. Confirm billing/cancellation and currency information with the business. Showing only rand estimates on a pan-African site needs a clear audience rationale. Location: `src/app/(frontend)/pricing/page.tsx`. Workflow: clarify / layout.

### P3: maintainability and documentation

**20. Design documentation no longer reliably describes the implementation.**

DESIGN.md describes dark-mode behavior, IBM Plex Mono, a drawing hero map and zero contrast failures. The current code deliberately has one theme, Azeret Mono, a raster map with parallax, and the issues above. Update the document after fixes and record test scope/date. Themed light/dark bands are an intentional brand choice; adding an OS-driven dark mode is not required. Location: `DESIGN.md`. Workflow: document / polish.

## What should be preserved

- The headline communicates the business benefit quickly; the Africa artwork gives the hero a recognizable visual center.
- Navy, gold, and light surfaces provide a consistent identity. Keep these rather than restarting the palette.
- Self-hosted display/body fonts, fluid sizing, optimized image components and largely isolated client interactions are sound foundations.
- The event agenda is an appropriate alternative to another card grid.
- Form labels, inline validation, first-invalid-field focus and membership tier preselection already work.
- Filters use URL state, so results can be shared. Empty results provide a working way back.
- Reduced motion removes the tested hero transforms and preserves opacity/readability.
- No ordinary navigation-sweep page errors or visible broken images were confirmed. The initial mobile image detector flagged event thumbnails that are hidden at that breakpoint; those are not reported as broken visible assets.

## Creative direction: make one introduction tangible

Retain the network visual, but give it a job. A visitor should see a concrete opportunity, the connection it needs, and how a referral progresses. One selected, verified cross-border story can connect the hero to the next section. If the material is illustrative, label it explicitly. The experience must remain complete without animation.

Proposed homepage sequence:

1. Clear proposition and the network visual, with Browse opportunities as the discovery path and Apply for membership as the conversion path.
2. A compact verified proof strip with current definitions and dates.
3. Two or three live opportunities with country, sector, commission and status visible.
4. Connect → Refer → Earn → Grow illustrated through one understandable referral example.
5. One approved member outcome with a real portrait, attribution and the difference between contract value and actual commission earned.
6. Membership choices with the no-payment-today reassurance at the decision point.
7. A concise invitation and useful footer. Keep the app preview secondary until it is available.

Visual refinements: strengthen a few heading weights, use image scale more selectively, replace empty vertical padding with purposeful pacing, give mobile an intentional composition, and integrate controls with the content they affect. A network animation tied to a real story is a better use of effort than more generic hover effects. Do not add scroll hijacking or a page-load sequence that delays reading.

## Implementation sequence for a premium scope

| Pass | Share of effort | Deliverable |
|---|---:|---|
| Trust and journey repair | 30% | Approved contact/proof content, referral context, reliable forms, event state clarity. |
| Homepage art direction | 30% | Revised narrative, stronger hierarchy, one distinctive network/story moment. |
| Secondary pages | 25% | Content-driven detail heroes, stronger About, clearer pricing, compact footer. |
| Accessibility and release QA | 15% | Keyboard, 320px/reflow, contrast, real devices and production performance. |

These percentages are planning guidance, not a quote or an award guarantee. Content approval can proceed alongside code work. Within the Impeccable workflow, use harden/adapt first, then shape/clarify/layout/typeset, and finish with polish and a repeat audit.

Release acceptance: verified content instead of placeholders; no lost opportunity context; explicit submission recovery; no 320px overflow or covered article navigation; coherent keyboard behavior; consistent event states/timezones; and a production performance pass. Successful email/CRM delivery must be tested separately with an agreed test destination.

## Standards and interpretation

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) provides the relevant accessibility criteria; this review is not a declaration of conformance.
- [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) distinguishes the 24px AA minimum and its spacing exceptions from a 44px comfort target. Small inline footer links are not automatically failures.
- [Awwwards mobile excellence guidance](https://www.awwwards.com/mobile-excellence-guidelines.pdf) is a useful reminder that responsive usability and performance belong in a premium brief alongside art direction. The official evaluation webpage did not load during this review; no jury score or current awards eligibility is asserted.

import path from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'
import type { SadcCountry } from '@/constants/countries'

import { richTextFromParagraphs } from './richText'
import { slugify } from '../fields/slug'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, 'assets')

loadEnv({ path: path.resolve(__dirname, '../../.env') })

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  payload.logger.info('Seeding AGBN content...')

  // ---- Admin user -----------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@agbn.example'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'change-me-now-123'
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: adminEmail, password: adminPassword, name: 'AGBN Admin' },
    })
    payload.logger.info(`Created admin user ${adminEmail} / ${adminPassword}. Change this password immediately.`)
  }

  // ---- Media ----------------------------------------------------------
  // Alt text and provenance live in assets/manifest.json so the description of
  // an image sits next to the image itself. Every entry is real descriptive alt
  // text: the previous `AGBN placeholder image 3` told a screen reader nothing.
  //
  // Dedup is keyed on filename rather than alt. Alt is editorial copy and will
  // change as real photography replaces these; keying on it meant any reword
  // silently created a second media doc instead of finding the existing one.
  const manifest = JSON.parse(
    readFileSync(path.join(assetsDir, 'manifest.json'), 'utf8'),
  ) as { images: { file: string; alt: string }[] }

  const mediaByIndex: Record<number, number> = {}
  for (let i = 1; i <= manifest.images.length; i++) {
    const { file, alt } = manifest.images[i - 1]

    // The seed set used to ship as PNG placeholders. Match those too, so a
    // database seeded before the switch to real imagery is upgraded in place
    // rather than gaining a second, unreferenced copy of every image.
    const legacyFile = file.replace(/\.jpg$/, '.png')
    const existing = await payload.find({
      collection: 'media',
      where: {
        or: [{ filename: { equals: file } }, { filename: { equals: legacyFile } }],
      },
      limit: 1,
    })

    const doc = existing.docs[0]
    if (doc) {
      if (doc.filename === file && doc.alt === alt) {
        mediaByIndex[i] = doc.id
        continue
      }
      // Updating with a filePath swaps the underlying file and regenerates the
      // resized variants, while keeping the document id — so every opportunity,
      // event and article already pointing at this image keeps working.
      const updated = await payload.update({
        collection: 'media',
        id: doc.id,
        data: { alt },
        filePath: path.join(assetsDir, file),
      })
      mediaByIndex[i] = updated.id
      continue
    }

    const created = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: path.join(assetsDir, file),
    })
    mediaByIndex[i] = created.id
  }

  // ---- Sectors (real list from the live site audit) -------------------
  const SECTORS = [
    { name: 'Mining', icon: 'pickaxe' },
    { name: 'Healthcare', icon: 'heart-pulse' },
    { name: 'Construction', icon: 'hard-hat' },
    { name: 'Technology', icon: 'cpu' },
    { name: 'Agriculture', icon: 'leaf' },
    { name: 'Green Energy', icon: 'zap' },
    { name: 'Logistics', icon: 'truck' },
    { name: 'Finance & Investment', icon: 'landmark' },
    { name: 'Professional Services', icon: 'briefcase' },
    { name: 'Manufacturing', icon: 'factory' },
  ]
  const sectorIdByName: Record<string, number> = {}
  for (const sector of SECTORS) {
    const existing = await payload.find({
      collection: 'sectors',
      where: { slug: { equals: slugify(sector.name) } },
      limit: 1,
    })
    const doc =
      existing.docs[0] ||
      (await payload.create({
        collection: 'sectors',
        data: { name: sector.name, icon: sector.icon },
      }))
    sectorIdByName[sector.name] = doc.id
  }

  // ---- Pricing plans (all fees are quoted in South African rand) -------
  const PLANS = [
    {
      name: 'CONNECT',
      price: 350,
      currency: 'ZAR' as const,
      billingPeriod: 'month' as const,
      tagline: 'Build Your Network',
      ctaText: 'Perfect for starting out',
      order: 1,
      highlighted: false,
      features: [
        'Free entry to events',
        'Directory listing',
        'Event photos',
        'Promote your products & services',
        'Exhibition booth - R1000/event',
      ],
    },
    {
      name: 'GROW',
      price: 750,
      currency: 'ZAR' as const,
      billingPeriod: 'month' as const,
      tagline: 'Create Opportunities',
      ctaText: 'Ideal for growing businesses',
      order: 2,
      highlighted: true,
      features: [
        'All Connect benefits',
        '2 Guest passes monthly',
        'Priority visibility',
        '2 Member spotlight videos/year',
        'FREE exhibition booth - 1/quarter',
      ],
    },
    {
      name: 'GROW PRO MAX',
      price: 2000,
      currency: 'ZAR' as const,
      billingPeriod: 'month' as const,
      tagline: 'Scale Your Impact',
      ctaText: 'For business leaders & visionaries',
      order: 3,
      highlighted: false,
      features: [
        'All Grow benefits',
        'Priority event access',
        'Exclusive executive experiences',
        'Strategic partnership opportunities',
        'VIP member status',
      ],
    },
  ]
  for (const plan of PLANS) {
    const existing = await payload.find({
      collection: 'pricing-plans',
      where: { name: { equals: plan.name } },
      limit: 1,
    })
    if (existing.docs[0]) continue
    await payload.create({
      collection: 'pricing-plans',
      data: { ...plan, features: plan.features.map((feature) => ({ feature })) },
    })
  }

  // ---- Opportunities (EXAMPLE listings — replace with real ones) ------
  const OPPORTUNITIES = [
    {
      title: 'Manganese Export Distribution Partner',
      sector: 'Mining',
      country: 'South Africa',
      status: 'open' as const,
      summary: 'A mid-size manganese supplier is seeking distribution partners for export contracts.',
      image: 1,
      commissionRate: 3,
      body: [
        'A vetted South African manganese producer is looking to expand its export distribution network into new markets.',
        'The producer ships roughly 4,000 tonnes a month out of the Kalahari manganese field and wants distribution partners already trading into Asia or the Middle East, not new entrants to the sector.',
        'AGBN members with logistics or trading relationships in the mining sector are encouraged to make an introduction through the referral flow. The producer has committed to a first response within five business days of any introduction.',
      ],
    },
    {
      title: 'Solar Mini-Grid Rollout, Rural Electrification',
      sector: 'Green Energy',
      country: 'Zimbabwe',
      status: 'open' as const,
      summary: 'A green energy developer needs local installation and maintenance partners for a rural solar mini-grid rollout.',
      image: 6,
      commissionRate: 5,
      body: [
        'This opportunity covers installation, commissioning, and ongoing maintenance partnerships for a multi-site solar mini-grid project in Kenya.',
        'The developer is rolling out eleven mini-grid sites across Turkana and Marsabit counties over the next eighteen months, each sized between 40 and 80 kW.',
        'Referrals with renewable energy field experience are prioritised, particularly partners who can maintain equipment in low-connectivity rural sites without relying on the developer\'s own crew.',
      ],
    },
    {
      title: 'Cold-Chain Logistics Partner Needed',
      sector: 'Logistics',
      country: 'Mozambique',
      status: 'open' as const,
      summary: 'A perishable-goods exporter is looking for a reliable cold-chain logistics partner in Lagos.',
      image: 7,
      commissionRate: 4,
      body: [
        'The opportunity involves cold storage and last-mile delivery for a growing perishable-goods export business based in Lagos.',
        'Volumes currently sit around 30 tonnes a week of fresh produce and seafood moving through Murtala Muhammed Airport, with the exporter looking to double that over the next year.',
        'The ideal partner already runs temperature-controlled trucking (minus 2 to 8 degrees Celsius) between Lagos warehouses and the airport, and can commit to a twelve-month service agreement.',
      ],
    },
    {
      title: 'Agritech Distribution Across East Africa',
      sector: 'Agriculture',
      country: 'Lesotho',
      status: 'open' as const,
      summary: 'An agritech company is expanding distribution of soil-sensor hardware across East Africa.',
      image: 5,
      commissionRate: 7,
      body: [
        'Distribution partners with existing agricultural networks in East Africa are sought for a soil-sensor hardware rollout.',
        'The hardware measures moisture and nutrient levels for mid-size commercial farms and currently ships from a Lusaka warehouse, with a first-year target of 2,000 units across Zambia, Malawi and Mozambique.',
        'AGBN members with existing cooperative or agrodealer networks in any of those three countries are best placed to make this introduction.',
      ],
    },
    {
      title: 'Fintech Integration Partner, Mobile Payments',
      sector: 'Finance & Investment',
      country: 'Botswana',
      status: 'closed' as const,
      summary: 'A mobile payments fintech has closed its search for an integration partner in Ghana.',
      image: 8,
      commissionRate: 10,
      body: [
        'This opportunity has been filled. Check the directory regularly for new fintech listings.',
        'The integration partner was introduced through an AGBN referral and confirmed within three weeks of the listing going live, well inside the fintech\'s original six-week window.',
      ],
    },
    {
      title: 'Healthcare Equipment Supply Contract',
      sector: 'Healthcare',
      country: 'Namibia',
      status: 'open' as const,
      summary: 'A regional clinic network is sourcing a reliable supplier of diagnostic equipment.',
      image: 2,
      commissionRate: 6,
      body: [
        'A growing clinic network in Rwanda is looking for a long-term supplier relationship for diagnostic equipment.',
        'The network runs nine rural health centres across the Eastern Province and needs basic diagnostic equipment: blood pressure monitors, glucose testing kits, and portable ultrasound units, supplied and serviced on an ongoing basis rather than a one-time purchase.',
        'Suppliers who can offer local servicing and training for clinic staff, not just equipment shipment, are strongly preferred.',
      ],
    },
  ]
  for (const opp of OPPORTUNITIES) {
    const existing = await payload.find({
      collection: 'opportunities',
      where: { slug: { equals: slugify(opp.title) } },
      limit: 1,
    })
    if (existing.docs[0]) continue
    await payload.create({
      collection: 'opportunities',
      data: {
        title: opp.title,
        sector: sectorIdByName[opp.sector],
        country: opp.country as SadcCountry,
        listingStatus: opp.status,
        commissionRate: opp.commissionRate,
        datePosted: new Date().toISOString(),
        featuredImage: mediaByIndex[opp.image],
        summary: opp.summary,
        description: richTextFromParagraphs(opp.body),
        _status: 'published',
        meta: { title: opp.title, description: opp.summary },
      },
    })
  }

  // ---- Events (EXAMPLE listings — replace with real ones) -------------
  const now = Date.now()
  // Distinct explicit times per event. The previous version derived the time
  // from `Date.now()` at seed-run time, so every event silently inherited
  // whatever minute the script happened to run at — all three showed the
  // identical time on the live site, which is exactly the kind of unverifiable
  // "stat" Brand DNA §2 calls out as the site's biggest trust risk.
  const atTime = (daysFromNow: number, hourUTC: number, minuteUTC = 0) => {
    const d = new Date(now + daysFromNow * 24 * 60 * 60 * 1000)
    d.setUTCHours(hourUTC, minuteUTC, 0, 0)
    return d.toISOString()
  }
  const EVENTS = [
    {
      title: 'AGBN Monthly Networking Webinar',
      venue: 'Online, Zoom',
      start: atTime(14, 15, 0),
      end: atTime(14, 16, 0),
      rsvpStatus: 'open' as const,
      image: 11,
      body: [
        'Our monthly member webinar covering new opportunities, sector spotlights, and Q&A.',
        'Expect three new opportunity listings walked through live, a five-minute sector spotlight, and an open floor for questions in the last fifteen minutes.',
        'Recordings go out to registered members by email within two business days for anyone who cannot attend live.',
      ],
    },
    {
      title: 'Africa Elite Roundtable: Green Energy Investment',
      venue: 'Nairobi, Kenya',
      start: atTime(30, 8, 30),
      end: atTime(30, 11, 0),
      rsvpStatus: 'open' as const,
      capacity: 40,
      image: 12,
      body: [
        'An in-person roundtable for Africa Elite members on green energy investment opportunities across East Africa.',
        'Three operators active in solar mini-grid and off-grid rollout will present live deal pipelines, followed by a closed-door discussion on financing structures.',
        'Capacity is 40 seats. Africa Elite members get first access; remaining seats open to Africa Grow members two weeks out if space allows.',
      ],
    },
    {
      title: 'AGBN Country Spotlight: Ghana',
      venue: 'Online, Zoom',
      start: atTime(45, 13, 0),
      end: atTime(45, 14, 0),
      rsvpStatus: 'closed' as const,
      image: 5,
      body: [
        "Registration for this event isn't open yet. We'll email you the moment it is.",
        'When it opens, this session covers what AGBN members are seeing on the ground in Ghana right now: active sectors, common entry points for foreign referrals, and two members based in Accra sharing what worked and what did not.',
      ],
    },
  ]
  for (const event of EVENTS) {
    const existing = await payload.find({
      collection: 'events',
      where: { slug: { equals: slugify(event.title) } },
      limit: 1,
    })
    if (existing.docs[0]) continue
    await payload.create({
      collection: 'events',
      data: {
        title: event.title,
        venue: event.venue,
        startDateTime: event.start,
        endDateTime: event.end,
        rsvpStatus: event.rsvpStatus,
        capacity: event.capacity,
        featuredImage: mediaByIndex[event.image],
        description: richTextFromParagraphs(event.body),
        _status: 'published',
        meta: { title: event.title, description: event.body[0] },
      },
    })
  }

  // ---- Case studies (EXAMPLE — replace with real member stories) ------
  const CASE_STUDIES = [
    {
      memberName: 'Thabo Nkosi',
      memberBusiness: 'Nkosi Mining Supplies',
      country: 'South Africa',
      sector: 'Mining',
      outcomeMetric: 'Referral closed: $40,000 contract',
      image: 1,
      summary: 'A referral through the AGBN network turned into a $40,000 supply contract.',
      body: [
        'Thabo Nkosi referred a fellow AGBN member into a manganese supply opportunity, which closed as a $40,000 contract within two months.',
        'Nkosi Mining Supplies had worked with the buyer informally for years but had never been paid for the introductions. This was the first one made through AGBN\'s referral flow, and the first one that paid a commission.',
        '"I\'d been making this exact kind of introduction for free for fifteen years," Nkosi says. "The deal itself wasn\'t different. What was different is that this time, someone tracked it and I got paid for it."',
      ],
    },
    {
      memberName: 'Amara Okafor',
      memberBusiness: 'Okafor AgroExports',
      country: 'Mozambique',
      sector: 'Agriculture',
      outcomeMetric: 'Referral closed: $15,000 contract',
      image: 13,
      summary: 'An agribusiness referral through AGBN led to a new export contract.',
      body: [
        'Amara Okafor connected a member with an export buyer, resulting in a $15,000 agribusiness contract.',
        'Okafor AgroExports had the buyer relationship; the AGBN member had the cassava flour volume the buyer was looking for and no existing route to a European export contract.',
        'The introduction closed in five weeks, from first message in the AGBN member WhatsApp community to signed contract.',
      ],
    },
    {
      memberName: 'Grace Mwangi',
      memberBusiness: 'Mwangi Solar Solutions',
      country: 'Zimbabwe',
      sector: 'Green Energy',
      outcomeMetric: 'Referral closed: $22,000 contract',
      image: 6,
      summary: 'A solar installation referral became a $22,000 commercial contract.',
      body: [
        'Grace Mwangi\'s referral through AGBN\'s network led to a $22,000 commercial solar installation contract.',
        'Mwangi Solar Solutions had turned down the job itself, a warehouse rooftop system outside Nakuru too far from their usual service area, and referred it to another AGBN member who could take it on.',
        'The referral commission on a job Mwangi Solar Solutions would otherwise have simply declined and forgotten is, in her words, "money that didn\'t exist before AGBN."',
      ],
    },
  ]
  for (const cs of CASE_STUDIES) {
    const existing = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: slugify(cs.memberName) } },
      limit: 1,
    })
    if (existing.docs[0]) continue
    await payload.create({
      collection: 'case-studies',
      data: {
        memberName: cs.memberName,
        memberBusiness: cs.memberBusiness,
        country: cs.country as SadcCountry,
        sector: sectorIdByName[cs.sector],
        featuredImage: mediaByIndex[cs.image],
        summary: cs.summary,
        outcomeMetric: cs.outcomeMetric,
        body: richTextFromParagraphs(cs.body),
        _status: 'published',
        meta: { title: `${cs.memberName}, ${cs.memberBusiness}`, description: cs.summary },
      },
    })
  }

  // ---- Magazine posts (EXAMPLE — replace with real editorial) ---------
  const admin = await payload.find({ collection: 'users', limit: 1 })
  const authorId = admin.docs[0]?.id
  const POSTS = [
    {
      title: 'How a Referral Became a $40,000 Manganese Contract',
      pillar: 'deal-stories' as const,
      sector: 'Mining',
      country: 'South Africa',
      excerpt: 'A closer look at how one AGBN referral turned into a real six-figure-rand contract.',
      image: 14,
      body: [
        'Thabo Nkosi runs Nkosi Mining Supplies out of Johannesburg. He had been making introductions in the manganese trade informally for fifteen years, the kind of favour that keeps a network alive but never shows up on an invoice.',
        'The difference this time was AGBN\'s referral flow. Nkosi logged the introduction, the buyer and the South African producer went to contract within two months, and Nkosi was paid a 3% commission on a $40,000 supply agreement, roughly R730,000 at the time.',
        'Read the full case study on Thabo Nkosi, or browse the manganese export opportunity that started it.',
      ],
    },
    {
      title: "Why Green Energy Is Africa's Fastest-Growing Opportunity",
      pillar: 'sector-spotlights' as const,
      sector: 'Green Energy',
      country: undefined,
      excerpt: 'A sector spotlight on why green energy deals are moving fastest across the AGBN network right now.',
      image: 6,
      body: [
        'Green energy referrals have grown steadily across the network. Here is what members are seeing on the ground.',
        'Solar mini-grid rollouts in East Africa are the single largest source of green energy opportunities on the platform this quarter, driven by rural electrification programmes in Kenya, Tanzania and Uganda that need local installation and maintenance partners.',
        'Members with electrical, civil works or ongoing-maintenance capacity, not just solar-specific experience, are being referred into these opportunities. Developers consistently say the maintenance side is harder to source locally than the installation itself.',
        'AGBN currently lists one active solar mini-grid opportunity in Kenya. Sector-tagged listings in this category will grow as more developers list through the network.',
      ],
    },
    {
      title: 'Doing Business in Ghana: What AGBN Members Need to Know',
      pillar: 'country-spotlights' as const,
      sector: undefined,
        country: 'Botswana',
      excerpt: 'A country spotlight on doing business in Ghana, for members expanding beyond their home market.',
      image: 5,
      body: [
        'Ghana continues to be one of the most active markets in the AGBN network for cross-border referrals.',
        'Members most often ask about three things before referring into Ghana: company registration timelines (typically two to three weeks through the Registrar General\'s Department), the practical difference between operating in Accra versus Kumasi, and how import duties affect landed cost for physical goods.',
        'Agriculture and fintech account for most of the closed referrals into Ghana so far. A finance-sector opportunity based in Accra closed through the network earlier this year, and a Ghana-based agritech distribution listing is active now.',
        'Members considering a first introduction into Ghana are encouraged to post in the WhatsApp community before referring. Several members have already made the trip and will save you a wrong turn or two.',
      ],
    },
    {
      title: 'Five Ways to Refer Well (And Actually Get Paid)',
      pillar: 'network-notes' as const,
      sector: undefined,
      country: undefined,
      excerpt: 'Practical advice on referring well and getting the most from your AGBN membership.',
      image: 9,
      body: [
        'Referring well is a skill. Here are five practical habits that help AGBN members close more referrals.',
        '1. Name the specific opportunity. "You two should talk" gets ignored. "I have a cold-chain logistics contact who handles the exact route you need" gets a reply.',
        '2. Introduce both sides in one message. Members who name what each party needs from the other in a single introduction close referrals faster than members who introduce one side and hope the follow-up happens.',
        "3. Say why you're making the introduction now. A referral tied to a live opportunity or a specific deadline gets treated with more urgency than a general networking nudge.",
        '4. Log the referral in the AGBN opportunity feed, even for introductions that started outside the platform. Referrals that are logged are the ones that get tracked through to a paid commission. Referrals made in a WhatsApp chat and never logged are the single most common reason members report not getting paid for work they actually did.',
        '5. Follow up once, at the two-week mark, then let it go. A referral that has not moved in two weeks either needs one nudge or is not going to close. Chasing harder than that usually costs more goodwill than the deal is worth.',
      ],
    },
  ]
  for (const post of POSTS) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slugify(post.title) } },
      limit: 1,
    })
    if (existing.docs[0]) continue
    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        heroImage: mediaByIndex[post.image],
        excerpt: post.excerpt,
        pillar: post.pillar,
        sector: post.sector ? sectorIdByName[post.sector] : undefined,
        country: post.country as SadcCountry | undefined,
        content: richTextFromParagraphs(post.body),
        authors: authorId ? [authorId] : undefined,
        publishedAt: new Date().toISOString(),
        _status: 'published',
        meta: { title: post.title, description: post.excerpt },
      },
      context: { disableRevalidate: true },
    })
  }

  // ---- Legal pages (placeholder copy — flagged for AGBN/legal review) -
  const LEGAL_NOTICE = [
    'This page is a placeholder generated during the website rebuild. It is not binding legal language and must not be treated as a real policy.',
    'AGBN (or AGBN’s legal counsel) needs to draft and approve the real content for this page before launch. This structural page exists so that content can be added and edited here, in the CMS, without a developer or a deploy.',
  ]
  const LEGAL_PAGES = [
    { title: 'Privacy Policy', slug: 'privacy' },
    { title: 'Terms of Service', slug: 'terms' },
  ]
  for (const page of LEGAL_PAGES) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })
    if (existing.docs[0]) continue
    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        body: richTextFromParagraphs(LEGAL_NOTICE),
        publishedAt: new Date().toISOString(),
        _status: 'published',
        meta: {
          title: page.title,
          description: `AGBN ${page.title}, placeholder pending legal review.`,
        },
      },
      context: { disableRevalidate: true },
    })
  }

  // ---- Site settings, header, footer ------------------------------------
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      tagline: 'Turn your network into income.',
      stats: {
        members: 700,
        countries: 7,
        opportunitiesPosted: 10,
        // commissionEarned intentionally left empty — no real figure exists yet
        // (Audit Issue #6: never ship a stat without a number behind it).
      },
      contactEmail: 'hello@agbn.example',
      contactPhone: '+27 81 707 5226',
      whatsappGroupUrl: 'https://chat.whatsapp.com/BRnfMQiLnuI04bsvTolanM?s=cl&p=i&mlu=4&ilr=4',
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/africa_global_business_network' },
      ],
    },
    context: { disableRevalidate: true },
  })

  await payload.updateGlobal({
    slug: 'header',
    data: {
      ctaLabel: 'Join AGBN',
      navItems: [
        { link: { type: 'internal', route: '/', label: 'Home' } },
        { link: { type: 'internal', route: '/opportunities', label: 'Opportunities' } },
        { link: { type: 'internal', route: '/about', label: 'About' } },
        { link: { type: 'internal', route: '/pricing', label: 'Pricing' } },
        { link: { type: 'internal', route: '/events', label: 'Events' } },
        { link: { type: 'internal', route: '/download-app', label: 'App' } },
      ],
    },
    context: { disableRevalidate: true },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      linkGroups: [
        {
          groupTitle: 'Quick Links',
          links: [
            { link: { type: 'internal', route: '/', label: 'Home' } },
            { link: { type: 'internal', route: '/opportunities', label: 'Opportunities' } },
            { link: { type: 'internal', route: '/about', label: 'About' } },
            { link: { type: 'internal', route: '/events', label: 'Events' } },
            { link: { type: 'internal', route: '/download-app', label: 'AGBN App' } },
          ],
        },
        {
          groupTitle: 'Resources',
          links: [
            { link: { type: 'internal', route: '/case-studies', label: 'Case Studies' } },
            { link: { type: 'internal', route: '/pricing', label: 'Pricing' } },
            { link: { type: 'internal', route: '/contact', label: 'Contact' } },
          ],
        },
        {
          groupTitle: 'Legal',
          links: [
            { link: { type: 'internal', route: '/privacy', label: 'Privacy Policy' } },
            { link: { type: 'internal', route: '/terms', label: 'Terms of Service' } },
          ],
        },
      ],
    },
    context: { disableRevalidate: true },
  })

  payload.logger.info('AGBN seed complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

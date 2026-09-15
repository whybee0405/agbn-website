import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Sectors } from './collections/Sectors'
import { Opportunities } from './collections/Opportunities'
import { PricingPlans } from './collections/PricingPlans'
import { Events } from './collections/Events'
import { EventRSVPs } from './collections/EventRSVPs'
import { CaseStudies } from './collections/CaseStudies'
import { MemberLeads } from './collections/MemberLeads'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Gallery } from './collections/Gallery'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: '/components/AdminLogo/Icon',
        Logo: '/components/AdminLogo',
      },
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // This repository has no checked-in migrations. Opt in explicitly for a
    // fresh self-hosted database; established installations should use
    // migrations and leave this disabled.
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Sectors,
    Opportunities,
    PricingPlans,
    Events,
    EventRSVPs,
    CaseStudies,
    MemberLeads,
    ContactSubmissions,
    NewsletterSubscribers,
    Gallery,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [
    '/pages-sitemap.xml',
    '/opportunities-sitemap.xml',
    '/magazine-sitemap.xml',
    '/case-studies-sitemap.xml',
    '/events-sitemap.xml',
    '/opportunities/*',
    '/magazine/*',
    '/case-studies/*',
    '/events/*',
    '/privacy',
    '/terms',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`,
      `${SITE_URL}/opportunities-sitemap.xml`,
      `${SITE_URL}/magazine-sitemap.xml`,
      `${SITE_URL}/case-studies-sitemap.xml`,
      `${SITE_URL}/events-sitemap.xml`,
    ],
  },
}

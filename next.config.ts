import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig: NextConfig = {
  // The production container runs the standalone Next.js output generated at
  // build time. This keeps the runtime image small and self-contained.
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    // Defining localPatterns at all turns this into a strict allowlist: any
    // local path that does not match is rejected by the optimiser with a 400,
    // so a new directory of images has to be declared here or it silently
    // fails to render while the raw file still serves fine over HTTP.
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        // Curated homepage imagery (hero and gallery). Not CMS uploads, so it
        // does not come through the Payload media route above.
        pathname: '/home/**',
      },
      {
        // Brand assets (the AGBN emblem used in the header and footer).
        pathname: '/brand/**',
      },
    ],
    qualities: [60, 75, 90],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

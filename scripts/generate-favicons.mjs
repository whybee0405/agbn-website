import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')

// Square emblem version of the Logo mark (circle + node network), on a Deep Navy
// tile — used for favicons/app icons per Brand DNA §5.6.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#0A1D37" />
  <circle cx="50" cy="50" r="34" fill="none" stroke="#CCA43B" stroke-width="4" />
  <circle cx="36" cy="38" r="4.5" fill="#CCA43B" />
  <circle cx="64" cy="34" r="4.5" fill="#CCA43B" />
  <circle cx="30" cy="64" r="4.5" fill="#CCA43B" />
  <circle cx="62" cy="68" r="4.5" fill="#CCA43B" />
  <circle cx="50" cy="50" r="5" fill="#E5B945" />
  <line x1="36" y1="38" x2="50" y2="50" stroke="#CCA43B" stroke-width="2" />
  <line x1="64" y1="34" x2="50" y2="50" stroke="#CCA43B" stroke-width="2" />
  <line x1="30" y1="64" x2="50" y2="50" stroke="#CCA43B" stroke-width="2" />
  <line x1="62" y1="68" x2="50" y2="50" stroke="#CCA43B" stroke-width="2" />
</svg>
`

writeFileSync(path.join(publicDir, 'favicon.svg'), svg.trim())

const sizes = [16, 32, 180, 192, 512]

function buildIco(png32) {
  // Minimal single-image ICO container wrapping a PNG payload (supported by all
  // modern browsers) — avoids pulling in an extra dependency just for this.
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // 1 image

  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0) // width
  entry.writeUInt8(32, 1) // height
  entry.writeUInt8(0, 2) // palette
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // color planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(png32.length, 8) // image size
  entry.writeUInt32LE(header.length + entry.length, 12) // offset

  return Buffer.concat([header, entry, png32])
}

async function main() {
  for (const size of sizes) {
    const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()
    const name =
      size === 180 ? 'apple-touch-icon.png' : size === 16 || size === 32 ? `favicon-${size}x${size}.png` : `icon-${size}x${size}.png`
    writeFileSync(path.join(publicDir, name), buf)
  }

  const png32 = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer()
  writeFileSync(path.join(publicDir, 'favicon.ico'), buildIco(png32))

  const manifest = {
    name: 'AGBN — Africa & Global Business Network',
    short_name: 'AGBN',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#0A1D37',
    background_color: '#0A1D37',
    display: 'standalone',
    start_url: '/',
  }
  writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2))

  console.log('Favicons generated.')
}

main()

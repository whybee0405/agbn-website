import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { Readable } from 'stream'
import path from 'path'

export const runtime = 'nodejs'

const CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

type Context = { params: Promise<{ filename: string }> }

async function mediaResponse(request: Request, context: Context, headOnly = false) {
  const { filename } = await context.params
  if (filename !== path.basename(filename)) return new Response('Not found', { status: 404 })

  const extension = path.extname(filename).toLowerCase()
  const contentType = CONTENT_TYPES[extension]
  if (!contentType) return new Response('Not found', { status: 404 })

  try {
    const filePath = path.join(process.cwd(), 'public', 'media', filename)
    const file = await stat(filePath)
    const range = request.headers.get('range')
    const videoRequest = contentType.startsWith('video/')
    if (range && videoRequest) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range)
      const start = match?.[1] ? Number(match[1]) : 0
      const end = match?.[2] ? Math.min(Number(match[2]), file.size - 1) : file.size - 1
      if (!match || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= file.size) {
        return new Response('Range not satisfiable', { status: 416, headers: { 'Content-Range': `bytes */${file.size}` } })
      }
      return new Response(headOnly ? null : (Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream), {
        status: 206,
        headers: {
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${file.size}`,
          'Content-Type': contentType,
        },
      })
    }
    return new Response(headOnly ? null : (Readable.toWeb(createReadStream(filePath)) as ReadableStream), {
      headers: {
        'Accept-Ranges': videoRequest ? 'bytes' : 'none',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(file.size),
        'Content-Type': contentType,
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}

export async function GET(_request: Request, context: Context) {
  return mediaResponse(_request, context)
}

export async function HEAD(_request: Request, context: Context) {
  return mediaResponse(_request, context, true)
}

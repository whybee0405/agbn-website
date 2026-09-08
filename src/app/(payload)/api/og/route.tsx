import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') || 'AGBN, turn your network into income.').slice(
    0,
    120,
  )
  const eyebrow = (searchParams.get('eyebrow') || 'Africa & Global Business Network').slice(0, 80)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#061426',
          backgroundImage:
            'radial-gradient(circle at 85% 25%, rgba(204,164,59,0.25), transparent 45%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 28,
            color: '#CCA43B',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 32,
            fontSize: 64,
            lineHeight: 1.15,
            color: '#FFFFFF',
            fontWeight: 600,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 26,
            color: '#5B6B7A',
          }}
        >
          agbn.org
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}

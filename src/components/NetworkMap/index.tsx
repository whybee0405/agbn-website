import React from 'react'
import { cn } from '@/utilities/ui'

type Node = { x: number; y: number; label?: string }
type Edge = [number, number]

// A loose, roughly continent-shaped scatter of nodes. Not a literal map —
// per Brand DNA §5.4 the motif only needs to "occasionally trace the rough
// silhouette" of Africa, not render an accurate one.
const NODES: Node[] = [
  { x: 60, y: 40, label: 'Mining' },
  { x: 160, y: 25, label: 'Finance' },
  { x: 250, y: 55, label: 'Technology' },
  { x: 90, y: 110 },
  { x: 190, y: 100, label: 'Agriculture' },
  { x: 280, y: 130 },
  { x: 120, y: 175, label: 'Green Energy' },
  { x: 220, y: 190 },
  { x: 150, y: 240, label: 'Logistics' },
]

const EDGES: Edge[] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 4],
  [4, 5],
  [3, 6],
  [4, 7],
  [5, 7],
  [6, 7],
  [6, 8],
  [7, 8],
]

function edgeLength(a: Node, b: Node) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

type Props = {
  variant: 'hero' | 'divider' | 'loading' | 'empty'
  className?: string
  animated?: boolean
  /**
   * Drops the sector labels. The hero renders at roughly half size on a phone,
   * where 9px mono labels are unreadable clutter — the node-and-line figure
   * still reads perfectly without them.
   */
  compact?: boolean
}

export const NetworkMap: React.FC<Props> = ({
  variant,
  className,
  animated = true,
  compact = false,
}) => {
  if (variant === 'empty') {
    return (
      <svg
        className={cn('mx-auto', className)}
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="20" cy="44" r="3" fill="var(--color-slate-500)" />
        <circle cx="44" cy="20" r="3" fill="var(--color-slate-500)" />
        <line
          x1="23"
          y1="41"
          x2="34"
          y2="30"
          stroke="var(--color-slate-500)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>
    )
  }

  if (variant === 'loading') {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        role="status"
        aria-live="polite"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="6" fill="var(--color-gold)" className="agbn-node-pulse" />
        </svg>
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (variant === 'divider') {
    return (
      <svg
        className={cn('w-full h-6', className)}
        viewBox="0 0 400 24"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1="0" y1="12" x2="180" y2="12" stroke="var(--color-gold)" strokeWidth="1" />
        <circle cx="190" cy="12" r="3" fill="var(--color-gold)" />
        <line x1="200" y1="12" x2="400" y2="12" stroke="var(--color-gold)" strokeWidth="1" />
      </svg>
    )
  }

  // Hero. This is the page's single orchestrated moment (Brand DNA §5.7):
  // the lines draw themselves once, the nodes land behind them, and nothing
  // loops afterwards.
  return (
    <svg
      className={cn('w-full h-auto', className)}
      viewBox="0 0 320 280"
      fill="none"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => {
        const nodeA = NODES[a]
        const nodeB = NODES[b]
        const length = edgeLength(nodeA, nodeB)
        return (
          <line
            key={`edge-${i}`}
            x1={nodeA.x}
            y1={nodeA.y}
            x2={nodeB.x}
            y2={nodeB.y}
            stroke="var(--color-gold)"
            strokeWidth="1"
            strokeOpacity="0.7"
            className={animated ? 'agbn-line-draw' : undefined}
            style={
              animated
                ? ({
                    '--line-length': length,
                    // Nodes land first, then the connections draw between
                    // them. The whole sequence resolves inside ~1.7s: long
                    // enough to read as deliberate, short enough that a
                    // visitor is not watching the hero assemble itself.
                    '--line-delay': `${0.35 + 0.05 * i}s`,
                  } as React.CSSProperties)
                : undefined
            }
          />
        )
      })}
      {NODES.map((node, i) => {
        const showLabel = node.label && !compact
        return (
          <g key={`node-${i}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.label ? 4 : 2.5}
              fill={node.label ? 'var(--color-gold)' : 'var(--color-ember)'}
              className={animated ? 'agbn-node-in' : undefined}
              style={
                animated ? ({ '--node-delay': `${0.05 * i}s` } as React.CSSProperties) : undefined
              }
            />
            {showLabel && (
              <text
                x={node.x}
                y={node.y - 10}
                fill="var(--color-slate-200)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
                className={animated ? 'agbn-node-in' : undefined}
                style={
                  animated
                    ? ({ '--node-delay': `${0.05 * i + 0.5}s` } as React.CSSProperties)
                    : undefined
                }
              >
                {node.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

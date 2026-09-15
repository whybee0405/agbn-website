import React from 'react'

/**
 * A compact, self-contained Payload admin wordmark.
 *
 * This intentionally uses the public asset directly instead of importing the
 * frontend Logo component: Payload bundles admin components separately from
 * the Next.js application.
 */
const AdminLogo: React.FC = () => (
  <div
    aria-label="African Global Business Network"
    role="img"
    style={{
      alignItems: 'center',
      display: 'inline-flex',
      gap: '0.65rem',
      minHeight: '2.5rem',
    }}
  >
    <img
      alt=""
      aria-hidden="true"
      src="/brand/agbn-emblem.webp"
      style={{ display: 'block', height: '2.25rem', objectFit: 'contain', width: '2.25rem' }}
    />
    <span
      style={{
        color: 'var(--theme-text, #0a1d37)',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        fontSize: '1.05rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        lineHeight: 1,
      }}
    >
      AGBN
    </span>
  </div>
)

export default AdminLogo

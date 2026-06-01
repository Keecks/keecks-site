import type React from 'react'

/**
 * AnimatedBg — full-viewport looping video background.
 *
 * Sits at z-index:0 (position:fixed). All page content lives in a
 * z-index:1 wrapper in layout.tsx — no stacking-context issues.
 */
export default function AnimatedBg() {
  const fixed: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'block',
  }

  return (
    <>
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{ ...fixed, objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay — increase opacity to darken, decrease to brighten */}
      <div
        aria-hidden="true"
        style={{ ...fixed, zIndex: 0, background: 'rgba(0,0,0,0.45)' }}
      />
    </>
  )
}

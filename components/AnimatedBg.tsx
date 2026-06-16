'use client'

import React from 'react'

/**
 * AnimatedBg — full-viewport looping video background.
 *
 * Sits at z-index:0 (position:fixed). All page content lives in a
 * z-index:1 wrapper in layout.tsx — no stacking-context issues.
 */
export default function AnimatedBg() {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(true)

  React.useEffect(() => {
    if (videoRef.current) {
      // Forziamo il play via JS, se fallisce (es. Risparmio Energetico su iOS) nascondiamo il video
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false)
        })
      }
    }
  }, [])

  const fixed: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: isPlaying ? 'block' : 'none',
  }

  return (
    <>
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{ ...fixed, objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
    </>
  )
}

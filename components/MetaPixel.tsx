'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { usePathname } from 'next/navigation'

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

// Extend window object for fbq
declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

export const trackEvent = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options)
  }
}

export const trackCustomEvent = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', name, options)
  }
}

function PixelTracker() {
  const pathname = usePathname()
  const [loaded, setLoaded] = useState(false)
  const lastTracked = useRef<string | null>(null)

  // 1. Load Pixel logic
  useEffect(() => {
    if (!FB_PIXEL_ID) return

    const loadPixel = () => {
      if (loaded || window.fbq) return

      ;(function(f:any,b:any,e:any,v:any,n?:any,t?:any,s?:any){if(f.fbq)return;n=f.fbq=function(){
      n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      
      window.fbq('init', FB_PIXEL_ID)
      setLoaded(true)
    }

    if (localStorage.getItem('cookie-consent') === 'true') {
      loadPixel()
    } else {
      const listener = () => loadPixel()
      window.addEventListener('cookie-consent-granted', listener)
      return () => window.removeEventListener('cookie-consent-granted', listener)
    }
  }, [loaded])

  // 2. Track PageView once per real page (not on UTM/fbclid query changes,
  //    and guarded against StrictMode / loaded-toggle double-fires)
  useEffect(() => {
    if (!loaded || !window.fbq) return
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname
    window.fbq('track', 'PageView')
  }, [pathname, loaded])

  // 3. Track Scroll
  useEffect(() => {
    if (!loaded) return
    const tracked = new Set<number>()

    const handleScroll = () => {
      const scrollDepth = window.scrollY + window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const percent = Math.round((scrollDepth / docHeight) * 100)

      if (percent >= 50 && !tracked.has(50)) {
        tracked.add(50)
        trackCustomEvent('ScrollDepth', { percent: 50 })
      }
      if (percent >= 75 && !tracked.has(75)) {
        tracked.add(75)
        trackCustomEvent('ScrollDepth', { percent: 75 })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loaded])

  return null
}

export default function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <PixelTracker />
    </Suspense>
  )
}

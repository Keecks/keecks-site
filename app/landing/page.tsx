// English landing page (ads) — il contenuto sta in components/LandingPageEN
import type { Metadata } from 'next'
import LandingPageEN from '@/components/LandingPageEN'

export const metadata: Metadata = {
  title: 'AI Voice Assistant for Your Business',
  description:
    'Keecks answers every call and books every appointment 24/7 — even when you are busy or your business is closed. Hear it in action and book a demo.',
  alternates: { canonical: '/landing' },
  openGraph: {
    type: 'website',
    siteName: 'Keecks',
    title: 'AI Voice Assistant for Your Business — Keecks',
    description:
      'Keecks answers every call and books every appointment 24/7 — even when you are busy or your business is closed. Hear it in action and book a demo.',
    url: '/landing',
    locale: 'en_US',
    images: [{ url: '/images/Keecks_AI-Voice-Assistant.png', width: 1200, height: 630, alt: 'Keecks — AI Voice Assistant' }],
  },
}

export default function LandingPage() {
  return <LandingPageEN />
}

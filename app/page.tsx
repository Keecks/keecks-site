import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import VoiceDemo from '@/components/VoiceDemo'
import HowItWorks from '@/components/HowItWorks'
import FAQ from '@/components/FAQ'
import WhoWeAre from '@/components/WhoWeAre'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: { absolute: 'AI Voice Assistant that answers your calls 24/7 — Keecks' },
  description:
    'The AI voice assistant that answers calls, handles clients and books appointments 24/7. A smart virtual receptionist tailored to your business.',
  alternates: {
    canonical: '/',
    languages: { en: '/', 'it-IT': '/it', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Keecks',
    title: 'AI Voice Assistant that answers your calls 24/7 — Keecks',
    description:
      'The AI voice assistant that answers calls, handles clients and books appointments 24/7. A smart virtual receptionist tailored to your business.',
    url: '/',
    locale: 'en_US',
    images: [{ url: '/images/Keecks_AI-Voice-Assistant.png', width: 1200, height: 630, alt: 'Keecks — AI Voice Assistant' }],
  },
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <VoiceDemo />
        <HowItWorks />
        <WhoWeAre />
        <FAQ />
        <div className="cta-footer-wrap">
          <div className="cta__glow" aria-hidden />
          <CTA />
          <Footer />
        </div>
      </main>
    </>
  )
}

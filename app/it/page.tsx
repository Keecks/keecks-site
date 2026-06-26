// Italian homepage — language auto-detected from /it pathname by LanguageContext
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import VoiceDemo from '@/components/VoiceDemo'
import HowItWorks from '@/components/HowItWorks'
import WhoWeAre from '@/components/WhoWeAre'
import FAQ from '@/components/FAQ'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: { absolute: 'Assistente vocale AI che risponde alle chiamate — Keecks' },
  description:
    "L'assistente vocale con intelligenza artificiale che risponde alle chiamate e prenota appuntamenti 24/7. La segreteria intelligente su misura per la tua attività.",
  alternates: {
    canonical: '/it',
    languages: { en: '/', 'it-IT': '/it', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Keecks',
    title: 'Assistente vocale AI che risponde alle chiamate — Keecks',
    description:
      "L'assistente vocale con intelligenza artificiale che risponde alle chiamate e prenota appuntamenti 24/7. La segreteria intelligente su misura per la tua attività.",
    url: '/it',
    locale: 'it_IT',
    images: [{ url: '/images/Keecks_AI-Voice-Assistant.png', width: 1200, height: 630, alt: 'Keecks — Assistente vocale AI' }],
  },
}

export default function HomeIT() {
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

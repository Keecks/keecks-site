// Landing italiana generica (ads) — il contenuto sta in components/LandingPageIT
import type { Metadata } from 'next'
import LandingPageIT from '@/components/LandingPageIT'

export const metadata: Metadata = {
  title: 'Assistente vocale AI per la tua attività',
  description:
    'Keecks risponde a ogni chiamata e prende ogni appuntamento 24/7, anche quando sei occupato o la tua attività è chiusa. Ascoltalo in azione e prenota una demo.',
  alternates: { canonical: '/it/assistente-ai', languages: { en: '/landing', it: '/it/assistente-ai' } },
  openGraph: {
    type: 'website',
    siteName: 'Keecks',
    title: 'Assistente vocale AI per la tua attività — Keecks',
    description:
      'Keecks risponde a ogni chiamata e prende ogni appuntamento 24/7, anche quando sei occupato o la tua attività è chiusa. Ascoltalo in azione e prenota una demo.',
    url: '/it/assistente-ai',
    locale: 'it_IT',
    images: [{ url: '/images/Keecks_AI-Voice-Assistant.png', width: 1200, height: 630, alt: 'Keecks — Assistente vocale AI' }],
  },
}

export default function AssistenteAiPage() {
  return <LandingPageIT />
}

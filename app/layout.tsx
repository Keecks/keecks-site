import type { Metadata } from 'next'
import './globals.css'
import AnimatedBg from '@/components/AnimatedBg'
import CookieBanner from '@/components/CookieBanner'
import MetaPixel from '@/components/MetaPixel'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://keecks.ai'),
  title: {
    default: 'Keecks — AI Voice Assistant',
    template: '%s — Keecks',
  },
  description: 'Keecks is the AI voice assistant that answers your calls and books appointments 24/7.',
  openGraph: {
    type: 'website',
    siteName: 'Keecks',
    images: [{
      url: '/images/Keecks_AI-Voice-Assistant.png',
      width: 1200,
      height: 630,
      alt: 'Keecks — AI Voice Assistant',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/Keecks_AI-Voice-Assistant.png'],
  },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Keecks',
  url: 'https://keecks.ai',
  logo: 'https://keecks.ai/apple-icon.png',
  description: 'Keecks is the AI voice assistant that answers calls and books appointments 24/7.',
  sameAs: [
    'https://www.instagram.com/keecks.ai',
    'https://www.tiktok.com/@keecks.ai',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        AnimatedBg: <canvas> at z-index:0, position:fixed — always behind content.
        Content wrapper: position:relative, z-index:1 — always in front of canvas.
        This is the only stacking arrangement that is guaranteed to work in every
        browser without CSS @property / background-attachment tricks.
      */}
      <body>
        {/*
          Set scroll restoration to manual as early as possible (before paint),
          so a refresh always starts at the top instead of the browser jumping
          back to the previous scroll position (e.g. stuck at the bottom).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual';window.scrollTo(0,0);}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <AnimatedBg />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <LanguageProvider>
            {children}
            <CookieBanner />
            <MetaPixel />
          </LanguageProvider>
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import AnimatedBg from '@/components/AnimatedBg'
import CookieBanner from '@/components/CookieBanner'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: 'Keecks — More clients. Less thoughts.',
  description: 'The AI assistant that handles your calls, 24/7.',
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
        <AnimatedBg />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <LanguageProvider>
            {children}
            <CookieBanner />
          </LanguageProvider>
        </div>
      </body>
    </html>
  )
}

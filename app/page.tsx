import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import VoiceDemo from '@/components/VoiceDemo'
import HowItWorks from '@/components/HowItWorks'
import FAQ from '@/components/FAQ'
import WhoWeAre from '@/components/WhoWeAre'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

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

'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '@/contexts/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const PHASE1_END   = 3.0
const FRAME_COUNT  = 601   // 0000–0600 (both mobile & desktop share same count)
const FRAME_FPS    = 30
const PHASE1_FRAME = Math.round(PHASE1_END * FRAME_FPS)  // 90

// Total duration used to map phrase timestamps to scroll progress
const ANIM_DURATION = 20  // seconds

const PHRASES = {
  en: {
    p1: 'Your client is calling...',
    p2: 'Keecks replies',
    p3: 'Keecks speaks with your client',
    p4: 'Keecks gives recommendations',
    p5: <>Keecks sets the appointments<br />in your booking system</>,
    lower: 'Every call handled. Every appointment booked. Automatically.',
    alwaysLabel: 'AI Voice Assistants',
    alwaysHeading: <>The AI assistant that<br />handles your calls. 24/7.</>,
    alwaysSub: <>Even when your staff is busy.<br />Even when your business is closed.</>,
    heroTitle: <>More clients.<br />Less thoughts.</>,
  },
  it: {
    p1: 'Il tuo cliente sta chiamando...',
    p2: 'Keecks risponde',
    p3: 'Keecks parla con il tuo cliente',
    p4: 'Keecks consiglia',
    p5: <>Keecks fissa<br />gli appuntamenti<br />direttamente nel tuo gestionale</>,
    lower: 'Ogni chiamata gestita. Ogni appuntamento prenotato. Automaticamente.',
    alwaysLabel: 'Assistente vocale AI',
    alwaysHeading: <>L&apos;assistente AI che risponde al posto tuo. 24/7.</>,
    alwaysSub: <>Anche quando sei impegnato.<br />Anche quando la tua attività è chiusa.</>,
    heroTitle: <>Più clienti.<br />Meno pensieri.</>,
  },
}

export default function Hero() {
  const { lang } = useLanguage()
  const t = PHRASES[lang]

  const sectionRef  = useRef<HTMLElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const textRef     = useRef<HTMLDivElement>(null)
  const hintRef     = useRef<HTMLDivElement>(null)
  const phoneRef    = useRef<HTMLDivElement>(null)
  const upperRef    = useRef<HTMLDivElement>(null)
  const lowerRef    = useRef<HTMLDivElement>(null)
  const p1Ref       = useRef<HTMLSpanElement>(null)
  const p2Ref       = useRef<HTMLSpanElement>(null)
  const p3Ref       = useRef<HTMLSpanElement>(null)
  const p4Ref       = useRef<HTMLSpanElement>(null)
  const p5Ref       = useRef<HTMLSpanElement>(null)
  const alwaysOnRef = useRef<HTMLDivElement>(null)

  const p2StRef   = useRef<ScrollTrigger | null>(null)
  const p2TlRef   = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const isMobile  = window.matchMedia('(max-width: 767px)').matches
    const frameDir  = isMobile ? '/frames/vertical' : '/frames/horizontal'
    // Canvas intrinsic size: vertical=540×960, horizontal=960×540
    const cw = isMobile ? 540 : 960
    const ch = isMobile ? 960 : 540

    const canvas = canvasRef.current!
    canvas.width  = cw
    canvas.height = ch
    const gctx = canvas.getContext('2d')!

    // ── Preload all frames (in order → Phase 1 frames cached first) ──────────
    const frames: HTMLImageElement[] = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image()
      img.src = `${frameDir}/${String(i).padStart(4, '0')}.webp`
      return img
    })

    const drawFrame = (idx: number) => {
      const img = frames[Math.max(0, Math.min(FRAME_COUNT - 1, idx))]
      if (!img.complete || !img.naturalWidth) return
      gctx.clearRect(0, 0, cw, ch)
      gctx.drawImage(img, 0, 0, cw, ch)
    }

    if (frames[0].complete) drawFrame(0)
    else frames[0].onload = () => drawFrame(0)

    // ── Lock scroll during Phase 1 ────────────────────────────────────────────
    const lockWheel = (e: WheelEvent) => e.preventDefault()
    const lockTouch = (e: TouchEvent) => e.preventDefault()
    window.addEventListener('wheel',     lockWheel, { passive: false })
    window.addEventListener('touchmove', lockTouch, { passive: false })

    // ── Phrase timeline (shared: atS maps video seconds → scroll progress) ───
    const atS = (sec: number) =>
      Math.min(1, Math.max(0, (sec - PHASE1_END) / (ANIM_DURATION - PHASE1_END)))

    function buildPhraseTl() {
      const tl = gsap.timeline({ paused: true })
      tl
        .to(p1Ref.current, { opacity: 0, duration: 0.02 }, atS(3.0))
        .to(p2Ref.current, { opacity: 1, duration: 0.02 }, atS(3.0))
        .to(p2Ref.current, { opacity: 0, duration: 0.02 }, atS(6.8))
        .to(p3Ref.current, { opacity: 1, duration: 0.02 }, atS(7.0))
        .to(p3Ref.current, { opacity: 0, duration: 0.02 }, atS(10.8))
        .to(p4Ref.current, { opacity: 1, duration: 0.02 }, atS(11.0))
        .to(p4Ref.current, { opacity: 0, duration: 0.02 }, atS(14.8))
        .to(p5Ref.current, { opacity: 1, duration: 0.02 }, atS(15.0))
        .to({}, { duration: 1e-6 }, 1.0)
      return tl
    }

    const ctx = gsap.context(() => {
      const phrases = [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current, p5Ref.current]
      gsap.set(upperRef.current,    { opacity: 0 })
      gsap.set(lowerRef.current,    { opacity: 0 })
      gsap.set(phrases,             { opacity: 0 })
      gsap.set(phoneRef.current,    { y: '80vh' })
      gsap.set(alwaysOnRef.current, { y: 40, opacity: 0 })

      const proxy = { f: 0 }

      const autoTl = gsap.timeline({
        onComplete: () => {
          window.removeEventListener('wheel',     lockWheel)
          window.removeEventListener('touchmove', lockTouch)
          gsap.set(alwaysOnRef.current, { y: 0, opacity: 1 })
          gsap.set([upperRef.current, p1Ref.current], { opacity: 1 })

          p2TlRef.current = buildPhraseTl()

          p2StRef.current = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=300%',
            pin: true,
            scrub: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const frameIdx = Math.round(
                PHASE1_FRAME + (FRAME_COUNT - 1 - PHASE1_FRAME) * self.progress
              )
              drawFrame(frameIdx)
              p2TlRef.current?.progress(self.progress)
            },
          })
        },
      })

      autoTl
        .to(proxy, {
          f: PHASE1_FRAME,
          duration: 5,
          ease: 'power1.inOut',
          onUpdate() { drawFrame(Math.round(proxy.f)) },
        }, 0)
        .to(phoneRef.current,    { y: 0, ease: 'power3.out', duration: 5 }, 0)
        .to(hintRef.current,     { opacity: 0, duration: 0.6 }, 0.5)
        .to(textRef.current,     { opacity: 0, duration: 1.5, ease: 'power1.in' }, 1.5)
        .to(alwaysOnRef.current, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }, 3.5)
        .to(upperRef.current,    { opacity: 1, duration: 0.6, ease: 'power2.out' }, 4.2)
        .to(p1Ref.current,       { opacity: 1, duration: 0.6, ease: 'power2.out' }, 4.4)

    }, sectionRef)

    return () => {
      window.removeEventListener('wheel',     lockWheel)
      window.removeEventListener('touchmove', lockTouch)
      p2TlRef.current?.scrollTrigger?.kill()
      p2TlRef.current?.kill()
      p2StRef.current?.kill()
      ctx.revert()
    }
  }, [])

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero__glow" aria-hidden />

      <div className="hero__text" ref={textRef}>
        <h1 className="hero__title">{t.heroTitle}</h1>
      </div>

      <div className="hero__phone-wrap" aria-hidden>
        <div className="hero__phone" ref={phoneRef}>
          <canvas ref={canvasRef} className="hero__canvas" />
        </div>
      </div>

      <div className="hero__upper" ref={upperRef} aria-live="polite">
        <span ref={p1Ref} className="hero__phrase">{t.p1}</span>
        <span ref={p2Ref} className="hero__phrase">{t.p2}</span>
        <span ref={p3Ref} className="hero__phrase">{t.p3}</span>
        <span ref={p4Ref} className="hero__phrase">{t.p4}</span>
        <span ref={p5Ref} className="hero__phrase">{t.p5}</span>
      </div>

      <div className="hero__lower" ref={lowerRef}>
        <p className="hero__lower-text">{t.lower}</p>
      </div>

      <div className="hero__always" ref={alwaysOnRef}>
        <p className="hero__always-label tag">{t.alwaysLabel}</p>
        <h2 className="hero__always-heading">{t.alwaysHeading}</h2>
        <p className="hero__always-sub">{t.alwaysSub}</p>
      </div>

      <div className="hero__hint" ref={hintRef} aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  )
}

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

// Le frasi che cambiano per fotogramma ("Il tuo cliente sta chiamando…", ecc.)
// sono ora stampate dentro ai fotogrammi stessi, quindi non vengono più
// sovrapposte qui. Restano solo il titolo iniziale e l'heading "always on".
const PHRASES = {
  en: {
    lower: 'Every call handled. Every appointment booked. Automatically.',
    alwaysLabel: 'AI Voice Assistants',
    alwaysHeading: <>The AI assistant that<br />handles your calls. 24/7.</>,
    alwaysSub: <>Even when your staff is busy.<br />Even when your business is closed.</>,
    heroTitle: <>More clients.<br />Less thoughts.</>,
  },
  it: {
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
  const lowerRef    = useRef<HTMLDivElement>(null)
  const alwaysOnRef = useRef<HTMLDivElement>(null)

  const frameStRef  = useRef<ScrollTrigger | null>(null)

  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const isMobile  = window.matchMedia('(max-width: 767px)').matches
    // I fotogrammi hanno il testo già stampato e variano per lingua + orientamento.
    const frameDir  = `/frames/${lang}/${isMobile ? 'vertical' : 'horizontal'}`
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

    const ctx = gsap.context(() => {
      gsap.set(lowerRef.current,    { opacity: 0 })
      gsap.set(phoneRef.current,    { y: '80vh' })
      gsap.set(alwaysOnRef.current, { y: 40, opacity: 0 })

      const proxy = { f: 0 }

      const autoTl = gsap.timeline({
        onComplete: () => {
          window.removeEventListener('wheel',     lockWheel)
          window.removeEventListener('touchmove', lockTouch)
          gsap.set(alwaysOnRef.current, { y: 0, opacity: 1 })

          // Phase 2: scrub the remaining frames while the section is pinned.
          frameStRef.current = ScrollTrigger.create({
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

    }, sectionRef)

    return () => {
      window.removeEventListener('wheel',     lockWheel)
      window.removeEventListener('touchmove', lockTouch)
      frameStRef.current?.kill()
      ctx.revert()
    }
  }, [lang])

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

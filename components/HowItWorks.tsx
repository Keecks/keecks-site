'use client'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

/* Illustrazioni step — SVG vettoriali AUTENTICI esportati da Figma
   (Card1/2/3.svg → public/images/hiw-step-*.svg). Il testo è renderizzato
   qui sotto, così resta selezionabile, accessibile e bilingue. */
const STEPS = {
  en: [
    { num: '01', title: 'We set it up for you', desc: 'Our team connects everything behind the scenes.', illust: '/images/hiw-step-1.svg', kind: 'linear' },
    { num: '02', title: 'We build it around you', desc: 'We customize tone and services to match your business, integrating it in your booking system.', illust: '/images/hiw-step-2.svg', kind: 'hub' },
    { num: '03', title: 'Keecks takes care. You stay present.', desc: 'Calls and bookings run quietly in the background, so you can focus on what matters most.', illust: '/images/hiw-step-3.svg', kind: 'pulse' },
  ],
  it: [
    { num: '01', title: 'Pensiamo a tutto noi.', desc: 'Il nostro team connette tutto dietro le quinte.', illust: '/images/hiw-step-1.svg', kind: 'linear' },
    { num: '02', title: 'Disegnato su misura per te.', desc: 'Progettiamo tono e servizi in base alla tua attività, integrandolo nel tuo gestionale.', illust: '/images/hiw-step-2.svg', kind: 'hub' },
    { num: '03', title: 'Keecks gestisce. Tu rimani presente.', desc: 'Chiamate e prenotazioni girano in autonomia, così puoi concentrarti su ciò che conta davvero.', illust: '/images/hiw-step-3.svg', kind: 'pulse' },
  ],
}

const LABELS = {
  en: { tag: 'How It Works', title: 'Live in three steps' },
  it: { tag: 'Come funziona', title: 'Attivo in tre step.' },
}

export default function HowItWorks() {
  const { lang } = useLanguage()
  const steps = STEPS[lang]
  const labels = LABELS[lang]

  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Carosello premium su mobile: la card centrata è piena, le altre ridotte/attenuate.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const mq = window.matchMedia('(max-width: 699px)')
    let raf = 0

    const update = () => {
      const list = Array.from(track.querySelectorAll<HTMLElement>('.step'))
      if (!mq.matches) {
        list.forEach(c => { c.style.transform = ''; c.style.opacity = '' })
        return
      }
      const tr = track.getBoundingClientRect()
      const center = tr.left + tr.width / 2
      let best = 0, bestDist = Infinity
      list.forEach((c, i) => {
        const r = c.getBoundingClientRect()
        const dist = Math.abs(r.left + r.width / 2 - center)
        const t = Math.min(dist / r.width, 1)            // 0 al centro → 1 a una card di distanza
        c.style.transform = `scale(${(1 - t * 0.07).toFixed(3)})`
        c.style.opacity = (1 - t * 0.35).toFixed(3)
        if (dist < bestDist) { bestDist = dist; best = i }
      })
      setActive(best)
    }

    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [lang])

  const goTo = (i: number) => {
    const card = trackRef.current?.querySelectorAll<HTMLElement>('.step')[i]
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  return (
    <section className="section section--steps">
      <div className="container">
        <div className="section__header">
          <span className="tag section__tag">{labels.tag}</span>
          <h2 className="section__title" data-ghost={labels.title}>
            {labels.title}
          </h2>
        </div>

        <div className="steps" ref={trackRef}>
          {steps.map((step) => (
            <div key={step.num} className="step">
              <span className="step__num">{step.num}</span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__desc">{step.desc}</p>
              <div className="step__illust">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={step.illust} alt="" aria-hidden="true" className={`step__svg step__svg--${step.kind}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="steps-dots">
          {steps.map((s, i) => (
            <button
              key={s.num}
              type="button"
              className={`steps-dot${i === active ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

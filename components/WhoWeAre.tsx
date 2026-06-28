'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

const CONTENT = {
  en: {
    tag: 'Who We Are',
    title: <>Designed to<br />protect presence</>,
    cards: [
      {
        title: 'Designed to protect presence.',
        desc: "The real value of automation isn't speed. It's creating space for focus, attention, and human connection.",
        img: { src: '/images/Keecks_assistente-vocale-AI.png', alt: "Colleagues at work while Keecks' AI voice assistant handles calls" },
      },
      {
        title: 'Tailored, not templated.',
        desc: 'Tailored to your business — not built from a generic template. From tone to customer flow, every detail feels aligned with your brand.',
        img: { src: '/images/Keecks_segreteria-intelligente.png', alt: "Business owner at ease as Keecks' AI virtual receptionist manages bookings" },
      },
    ],
  },
  it: {
    tag: 'Chi siamo',
    title: <>Progettato per chi<br />vuole essere presente.</>,
    cards: [
      {
        title: <>Pensato per te,<br />che vuoi esserci davvero.</>,
        desc: "Il vero valore dell'automazione non è la velocità. È creare spazio per la concentrazione, per la presenza sul momento e per la connessione umana.",
        img: { src: '/images/Keecks_assistente-vocale-AI.png', alt: "Colleghi al lavoro mentre l'assistente vocale AI di Keecks gestisce le chiamate" },
      },
      {
        title: <>Progettato su misura.<br />Non preconfezionato.</>,
        desc: 'Progettato su misura per la tua attività, non costruito su un template generico. Dal tono alla gestione dei singoli clienti, ogni dettaglio rispecchia il tuo brand.',
        img: { src: '/images/Keecks_segreteria-intelligente.png', alt: "Titolare soddisfatto, con la segreteria intelligente AI di Keecks che gestisce gli appuntamenti" },
      },
    ],
  },
}

export default function WhoWeAre() {
  const { lang } = useLanguage()
  const c = CONTENT[lang]

  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Carosello premium su mobile: la card centrata è piena, le altre ridotte/attenuate.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const mq = window.matchMedia('(max-width: 699px)')
    let raf = 0

    const update = () => {
      const list = Array.from(track.querySelectorAll<HTMLElement>('.who__card'))
      if (!mq.matches) {
        list.forEach(el => { el.style.transform = ''; el.style.opacity = '' })
        return
      }
      const tr = track.getBoundingClientRect()
      const center = tr.left + tr.width / 2
      let best = 0, bestDist = Infinity
      list.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const dist = Math.abs(r.left + r.width / 2 - center)
        const t = Math.min(dist / r.width, 1)
        el.style.transform = `scale(${(1 - t * 0.07).toFixed(3)})`
        el.style.opacity = (1 - t * 0.35).toFixed(3)
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
    const card = trackRef.current?.querySelectorAll<HTMLElement>('.who__card')[i]
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  return (
    <section className="section section--steps">
      <div className="container">
        <div className="section__header">
          <span className="tag section__tag">{c.tag}</span>
          <h2 className="section__title">{c.title}</h2>
        </div>

        <div className="who__cards" ref={trackRef}>
          {c.cards.map((card, i) => (
            <div key={i} className="who__card">
              <div className="who__card-body">
                <h3 className="who__card-title">{card.title}</h3>
                <p className="who__card-desc">{card.desc}</p>
              </div>
              <div className="who__card-img">
                <Image
                  src={card.img.src}
                  alt={card.img.alt}
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="steps-dots">
          {c.cards.map((card, i) => (
            <button
              key={i}
              type="button"
              className={`steps-dot${i === active ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

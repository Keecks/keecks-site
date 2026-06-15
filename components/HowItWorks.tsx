'use client'
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

  return (
    <section className="section section--steps">
      <div className="container">
        <div className="section__header">
          <span className="tag section__tag">{labels.tag}</span>
          <h2 className="section__title" data-ghost={labels.title}>
            {labels.title}
          </h2>
        </div>

        <div className="steps">
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
      </div>
    </section>
  )
}

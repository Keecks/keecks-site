'use client'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

const STEPS = {
  en: [
    {
      num: '01',
      title: 'We set it up for you',
      desc: 'Our team connects everything behind the scenes.',
      illust: '/images/illust-1.png',
    },
    {
      num: '02',
      title: 'We build it around you',
      desc: 'We customize tone and services to match your business, integrating it in your booking system.',
      illust: '/images/illust-2.png',
    },
    {
      num: '03',
      title: 'Keecks takes care. You stay present.',
      desc: 'Calls and bookings run quietly in the background, so you can focus on what matters most.',
      illust: '/images/illust-3.png',
    },
  ],
  it: [
    {
      num: '01',
      title: 'Pensiamo a tutto noi.',
      desc: 'Il nostro team connette tutto dietro le quinte.',
      illust: '/images/illust-1.png',
    },
    {
      num: '02',
      title: 'Disegnato su misura per te.',
      desc: 'Progettiamo tono e servizi in base alla tua attività, integrandolo nel tuo gestionale.',
      illust: '/images/illust-2.png',
    },
    {
      num: '03',
      title: 'Keecks gestisce. Tu rimani presente.',
      desc: 'Chiamate e prenotazioni girano in autonomia, così puoi concentrarti su ciò che conta davvero.',
      illust: '/images/illust-3.png',
    },
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
    <section className="section">
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
                <Image
                  src={step.illust}
                  alt=""
                  width={280}
                  height={80}
                  style={{ width: 'auto', height: '80px', objectFit: 'contain' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

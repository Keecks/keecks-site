'use client'
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
        img: { src: '/images/keecks-img-1.png', alt: 'Two people focused on a laptop in a warm, dimly-lit office' },
      },
      {
        title: 'Tailored, not templated.',
        desc: 'Tailored to your business — not built from a generic template. From tone to customer flow, every detail feels aligned with your brand.',
        img: { src: '/images/keecks-img-2.png', alt: 'Person celebrating a win at their desk' },
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
        img: { src: '/images/keecks-img-1.png', alt: 'Due persone concentrate su un laptop in un ufficio caldo e soffuso' },
      },
      {
        title: <>Progettato su misura.<br />Non preconfezionato.</>,
        desc: 'Progettato su misura per la tua attività, non costruito su un template generico. Dal tono alla gestione dei singoli clienti, ogni dettaglio rispecchia il tuo brand.',
        img: { src: '/images/keecks-img-2.png', alt: 'Persona che celebra un risultato alla scrivania' },
      },
    ],
  },
}

export default function WhoWeAre() {
  const { lang } = useLanguage()
  const c = CONTENT[lang]

  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <span className="tag section__tag">{c.tag}</span>
          <h2 className="section__title">{c.title}</h2>
        </div>

        <div className="who__cards">
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
      </div>
    </section>
  )
}

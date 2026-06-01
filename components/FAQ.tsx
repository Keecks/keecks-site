'use client'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const FAQ_EN = [
  {
    q: 'What is Keecks?',
    a: 'Keecks is an AI voice assistant that answers your business calls, handles client enquiries, and books appointments directly in your system, even when you\'re busy or when your business is closed. It\'s built specifically around your business, so every conversation sounds like it comes from your team.',
  },
  {
    q: 'How is Keecks priced?',
    a: 'Keecks offers different plans depending on your needs and the volume of calls your business receives. Click on Get Started to get a free quote tailored to you.',
  },
  {
    q: 'Will the voice sound like a robot?',
    a: 'Only if you like robots. And we don\'t. Keecks has a tone of voice designed specifically around you, the way you speak, the words you choose, the warmth you bring. It converses like your best team member would: naturally, attentively, with the right level of care for every client. Forget the "press 1 to continue", with Keecks it\'s a real conversation. Click here to hear how it sounds.',
  },
  {
    q: 'Does Keecks work with my existing booking system?',
    a: 'Yes. Keecks connects directly to your booking system and confirms appointments in real time, no manual follow-up, no double entry.',
  },
  {
    q: 'What if I don\'t have a booking system and I use a paper diary?',
    a: 'No problem. We set up a simple booking system for you and your team, easy to use, intuitive, and included in the price.',
  },
  {
    q: 'What\'s the difference between Keecks and other AI tools?',
    a: 'Keecks integrates directly into your existing booking system, our competitors don\'t. And you don\'t need to configure anything, just talk to us, and we build it around you. We\'re not generalist. We\'re tailor-made for your business, and we take care of everything.',
  },
  {
    q: 'Does Keecks understand my clients and recommend correctly?',
    a: 'Yes. Keecks is trained on your services and knows how to guide clients toward the right options. It also upsells proactively, suggesting relevant services throughout the conversation so no opportunity is missed and your average booking value increases. Keecks is never tired, and never busy, it speaks as your best team member on their best day, every day, 24/7.',
  },
  {
    q: 'What happens if a client wants to speak with a real person?',
    a: 'Keecks transfers the call to a member of your team immediately. If no one is available, it can offer to schedule a callback at a convenient time. The client is never left without a next step.',
  },
  {
    q: 'Do I need to manage it after it\'s live?',
    a: 'No. Keecks runs in the background without requiring your attention. If anything changes in your business, we update the assistant for you at any time. More clients, less thoughts.',
  },
]

const FAQ_IT = [
  {
    q: 'Cos\'è Keecks?',
    a: 'Keecks è un assistente vocale, sviluppato su modelli di intelligenza artificiale, che risponde alle chiamate, gestisce le richieste dei tuoi clienti e prenota gli appuntamenti direttamente nel tuo gestionale. Anche quando sei occupato o quando la tua attività è chiusa. Keecks viene costruito su misura attorno alla tua realtà, dal tono di voce al modo di gestire ogni singolo cliente, come farebbe il tuo miglior collaboratore.',
  },
  {
    q: 'Quanto costa Keecks?',
    a: 'Keecks offre diversi piani in base alle tue esigenze e al volume di chiamate che la tua attività riceve. Clicca su Inizia ora per ricevere un preventivo gratuito su misura per te.',
  },
  {
    q: 'La voce sembrerà quella di un robot?',
    a: 'Solo se ti piacciono i robot. E a noi non piacciono. Keecks ha un tono di voce progettato su misura per te, il modo in cui parli, le parole che scegli, il calore che trasmetti. Conversa come farebbe il miglior membro del tuo staff: in modo naturale, attento, con il giusto livello di cura per ogni cliente. Dimentica il "per continuare premi 1", con Keecks è una conversazione vera. Clicca qui per sentire come suona.',
  },
  {
    q: 'Keecks funziona con il mio gestionale esistente?',
    a: 'Sì. Keecks si connette direttamente al tuo gestionale e si integra perfettamente con il tuo sistema di prenotazione. Conferma gli appuntamenti in tempo reale, nessun inserimento manuale, nessuna doppia registrazione di dati.',
  },
  {
    q: 'E se non ho un gestionale e segno gli appuntamenti sull\'agenda cartacea?',
    a: 'Nessun problema. Il nostro team configura un semplice gestionale di prenotazione per te e il tuo team, facile da usare, intuitivo, e incluso nel prezzo.',
  },
  {
    q: 'Qual è la differenza tra Keecks e gli altri strumenti AI?',
    a: 'Keecks si integra direttamente nel tuo gestionale esistente. E non hai bisogno di configurare nulla, parla con il nostro team, e progetteremo tutto attorno a te. Non siamo generalisti. Creiamo ad hoc, su misura per la tua attività, occupandoci di tutto. Così avrai più clienti, e meno pensieri.',
  },
  {
    q: 'Keecks capisce davvero i miei clienti e li indirizza correttamente?',
    a: 'Sì. Keecks è progettato su misura sui tuoi servizi e sa come guidare i tuoi clienti verso le scelte migliori. Suggerisce i giusti servizi aggiuntivi durante ogni conversazione, così ogni opportunità viene massimizzata e lo scontrino medio aumenta. Keecks non è mai stanco, e non è mai occupato, parla come il tuo miglior collaboratore nel suo giorno migliore, ogni giorno, 24/7.',
  },
  {
    q: 'Cosa succede se un cliente vuole parlare con una persona reale?',
    a: 'Keecks trasferisce la chiamata a un membro del tuo team. Se nessuno è disponibile, offre di programmare un richiamo in un momento conveniente. Il cliente trova sempre la risposta che cerca.',
  },
  {
    q: 'Dopo l\'attivazione, devo gestire qualcosa?',
    a: 'No. Keecks funziona in background senza richiedere la tua attenzione. Se qualcosa cambia nella tua attività, aggiorniamo l\'assistente per te in qualsiasi momento. Più clienti, meno pensieri.',
  },
]

const LABELS = {
  en: { tag: 'FAQ', title: 'Still have questions?' },
  it: { tag: 'FAQ', title: 'Curiosità ?' },
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const { lang } = useLanguage()

  const items = lang === 'it' ? FAQ_IT : FAQ_EN
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

        <div className="faq__list">
          {items.map((item, i) => (
            <div
              key={i}
              className={`faq__item${open === i ? ' faq__item--open' : ''}`}
            >
              <button
                className="faq__question"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {item.q}
                <span className="faq__chevron" aria-hidden>
                  <svg viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div className="faq__answer" aria-hidden={open !== i}>
                <div className="faq__answer-inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

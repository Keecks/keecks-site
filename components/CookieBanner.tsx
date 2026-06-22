'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { lp } from '@/lib/langPath'

const LABELS = {
  en: {
    title: 'Your privacy matters to us',
    body: 'We use cookies to make the site work and, with your consent, to measure performance and marketing. You can accept, reject, or choose which cookies to allow.',
    privacy: 'Privacy Policy',
    customize: 'Customize',
    accept: 'Accept',
    acceptAll: 'Accept all',
    save: 'Accept selected',
    reject: 'Reject',
    always: 'Always on',
    cats: {
      necessary: {
        name: 'Necessary',
        desc: 'Necessary cookies help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.',
      },
      preferences: {
        name: 'Preferences',
        desc: 'Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in.',
      },
      statistics: {
        name: 'Statistics',
        desc: 'Statistic cookies help website owners understand how visitors interact with websites by collecting and reporting information anonymously.',
      },
      marketing: {
        name: 'Marketing',
        desc: 'Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.',
      },
    },
  },
  it: {
    title: 'Abbiamo a cuore la tua privacy',
    body: 'Utilizziamo i cookie per far funzionare il sito e, con il tuo consenso, per misurare le prestazioni e il marketing. Puoi accettare, rifiutare o scegliere quali cookie consentire.',
    privacy: 'Informativa sulla Privacy',
    customize: 'Personalizza',
    accept: 'Accetta',
    acceptAll: 'Accetta tutti',
    save: 'Accetta selezionati',
    reject: 'Rifiuta',
    always: 'Sempre attivi',
    cats: {
      necessary: {
        name: 'Necessari',
        desc: 'I cookie necessari contribuiscono a rendere fruibile il sito web abilitandone funzionalità di base quali la navigazione sulle pagine e l’accesso alle aree protette del sito. Il sito web non è in grado di funzionare correttamente senza questi cookie.',
      },
      preferences: {
        name: 'Preferenze',
        desc: 'I cookie di preferenza consentono al sito web di memorizzare informazioni che ne influenzano il comportamento o l’aspetto, quali la lingua preferita o la località nella quale ti trovi.',
      },
      statistics: {
        name: 'Statistiche',
        desc: 'I cookie statistici aiutano i proprietari del sito web a capire come i visitatori interagiscono con i siti raccogliendo e trasmettendo informazioni in forma anonima.',
      },
      marketing: {
        name: 'Marketing',
        desc: 'I cookie di marketing vengono utilizzati per tracciare i visitatori sui siti web. La finalità è quella di presentare annunci pubblicitari che siano rilevanti e coinvolgenti per il singolo utente e quindi di maggior valore per editori e inserzionisti di terze parti.',
      },
    },
  },
}

export default function CookieBanner() {
  const { lang } = useLanguage()
  const t = LABELS[lang]
  const [visible, setVisible] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [prefs, setPrefs] = useState({ preferences: true, statistics: true, marketing: true })

  useEffect(() => {
    if (localStorage.getItem('cookie-consent')) return
    // Mostra il banner dopo 3 secondi dall'ingresso nel sito
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const persist = (p: { preferences: boolean; statistics: boolean; marketing: boolean }) => {
    // The Meta Pixel only loads with marketing consent
    localStorage.setItem('cookie-consent', p.marketing ? 'true' : 'false')
    localStorage.setItem('cookie-prefs', JSON.stringify({ necessary: true, ...p }))
    if (p.marketing) {
      window.dispatchEvent(new Event('cookie-consent-granted'))
    }
    // Ricarica così l'intro dell'hero ("More clients. Less thoughts.")
    // riparte da capo. La scelta è salvata, quindi il banner non riappare.
    window.scrollTo(0, 0)
    window.location.reload()
  }

  const acceptAll = () => persist({ preferences: true, statistics: true, marketing: true })
  const rejectAll = () => persist({ preferences: false, statistics: false, marketing: false })
  const saveSelected = () => persist(prefs)
  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  if (!visible) return null

  const cats = t.cats
  const allOff = !prefs.preferences && !prefs.statistics && !prefs.marketing

  return (
    <div className="cookie-modal" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="cookie-modal__overlay" />
      <div className="cookie-modal__card">
        <span className="cookie-modal__brand">Keecks</span>
        <h2 className="cookie-modal__title">{t.title}</h2>
        <p className="cookie-modal__body">{t.body}</p>
        <a href={lp(lang, '/cookies')} className="cookie-modal__link">{t.privacy}</a>

        {showCustom && (
          <div className="cookie-modal__prefs">
            <div className="cookie-pref">
              <div className="cookie-pref__head">
                <span className="cookie-pref__name">{cats.necessary.name}</span>
                <span className="cookie-pref__locked">{t.always}</span>
              </div>
              <p className="cookie-pref__desc">{cats.necessary.desc}</p>
            </div>

            {(['preferences', 'statistics', 'marketing'] as const).map((key) => (
              <div className="cookie-pref" key={key}>
                <div className="cookie-pref__head">
                  <span className="cookie-pref__name">{cats[key].name}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[key]}
                    aria-label={cats[key].name}
                    className={`cookie-switch ${prefs[key] ? 'is-on' : ''}`}
                    onClick={() => toggle(key)}
                  >
                    <span className="cookie-switch__knob" />
                  </button>
                </div>
                <p className="cookie-pref__desc">{cats[key].desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className={`cookie-modal__actions${showCustom ? ' cookie-modal__actions--stacked' : ''}`}>
          {showCustom ? (
            <>
              <button className="cookie-btn cookie-btn--primary cookie-btn--full" onClick={acceptAll}>{t.acceptAll}</button>
              <button className="cookie-btn cookie-btn--ghost cookie-btn--full" onClick={saveSelected}>
                {allOff ? t.reject : t.save}
              </button>
            </>
          ) : (
            <>
              <button className="cookie-btn cookie-btn--ghost" onClick={() => setShowCustom(true)}>{t.customize}</button>
              <button className="cookie-btn cookie-btn--primary" onClick={acceptAll}>{t.accept}</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

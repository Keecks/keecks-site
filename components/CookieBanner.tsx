'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { lp } from '@/lib/langPath'

const LABELS = {
  en: {
    text: 'We use cookies to give you the best experience on our site.',
    accept: 'Accept',
    more: 'Learn more',
  },
  it: {
    text: 'Utilizziamo i cookie per offrirti la migliore esperienza sul sito.',
    accept: 'Accetta',
    more: 'Scopri di più',
  },
}

export default function CookieBanner() {
  const { lang } = useLanguage()
  const t = LABELS[lang]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie notice">
      <p className="cookie-banner__text">{t.text}</p>
      <div className="cookie-banner__actions">
        <a href={lp(lang, '/cookies')} className="cookie-banner__link">{t.more}</a>
        <button className="cookie-banner__ok" onClick={accept}>{t.accept}</button>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { lp } from '@/lib/langPath'

const LABELS = {
  en: { text: 'Cookies are used to improve your experience.', more: 'Learn more', ok: 'Ok' },
  it: { text: 'Si utilizzano i cookie per migliorare la tua esperienza.', more: 'Scopri di più', ok: 'Ok' },
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

  const dismiss = useCallback(() => {
    localStorage.setItem('cookie-consent', 'true')
    window.dispatchEvent(new Event('cookie-consent-granted'))
    setVisible(false)
  }, [])

  // As soon as the user scrolls, the banner disappears (and consent is stored).
  useEffect(() => {
    if (!visible) return
    const onScroll = () => dismiss()
    window.addEventListener('scroll', onScroll, { passive: true, once: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [visible, dismiss])

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie notice">
      <span className="cookie-banner__text">{t.text}</span>
      <a href={lp(lang, '/cookies')} className="cookie-banner__link">{t.more}</a>
      <button className="cookie-banner__ok" onClick={dismiss}>{t.ok}</button>
    </div>
  )
}

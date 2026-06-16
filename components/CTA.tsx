'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { lp } from '@/lib/langPath'

const LABELS = {
  en: {
    title: <>Less calls to manage.<br />More room to breathe.</>,
    placeholder: 'Your email address',
    btn: 'Get Started',
  },
  it: {
    title: <>Meno chiamate da gestire.<br />Più spazio per respirare.</>,
    placeholder: 'Il tuo indirizzo email',
    btn: 'Inizia ora',
  },
}

export default function CTA() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { lang } = useLanguage()
  const t = LABELS[lang]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    router.push(`${lp(lang, '/book')}?email=${encodeURIComponent(email)}`)
  }

  return (
    <section className="section cta" id="waitlist">
      <div className="cta__glow" aria-hidden />
      <div className="container">
        <h2 className="cta__title">{t.title}</h2>
        <form className="cta__form" onSubmit={handleSubmit}>
          <input
            className="cta__input"
            type="email"
            placeholder={t.placeholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="cta__btn">
            {t.btn}
          </button>
        </form>
      </div>
    </section>
  )
}

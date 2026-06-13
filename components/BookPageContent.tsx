'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { lp } from '@/lib/langPath'
import { getTimeSlots, getTomorrowISO } from '@/lib/slots'

// ── i18n ──────────────────────────────────────────────────────────────────────
const LABELS = {
  en: {
    navLink: 'See how it works',
    title: 'See Keecks in action.',
    subtitle: 'Book a personalized demo with our team.',
    dateLabel: 'Consultation Date',
    timeLabel: 'Consultation Time',
    nameLabel: 'Name',
    companyLabel: 'Company',
    companyOpt: '(optional)',
    namePlaceholder: 'Enter your name',
    companyPlaceholder: 'Enter your company',
    emailLabel: 'E-mail',
    emailPlaceholder: 'Enter your email',
    submit: 'Book a Demo',
    selectDateFirst: 'Select a date to see available slots.',
  },
  it: {
    navLink: 'Come funziona',
    title: 'Scopri Keecks dal vivo.',
    subtitle: 'Prenota una demo personalizzata con il nostro team.',
    dateLabel: 'Data della consulenza',
    timeLabel: 'Orario della consulenza',
    nameLabel: 'Nome',
    companyLabel: 'Azienda',
    companyOpt: '(opzionale)',
    namePlaceholder: 'Inserisci il tuo nome',
    companyPlaceholder: "Inserisci l'azienda",
    emailLabel: 'E-mail',
    emailPlaceholder: 'Inserisci la tua mail',
    submit: 'Prenota una Demo',
    selectDateFirst: 'Seleziona una data per vedere gli orari disponibili.',
  },
}

// ── Logo ──────────────────────────────────────────────────────────────────────
const LOGO_SVG = (
  <svg width="84" height="19" viewBox="0 0 153 35" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28.7061 34.4385L12.9092 22.7256H20.292L28.7061 34.4385ZM74.8096 12.7715C79.5678 12.7715 82.5316 16.7106 82.1416 20.8838H68.8037C68.7648 21.2737 68.7646 21.6638 68.7646 22.0537C68.7648 27.2795 71.3384 30.5164 75.8232 30.5166C78.2023 30.5166 80.426 29.6199 81.8301 27.6309L82.2588 27.9424C81.0888 30.9064 78.359 33.1297 74.498 33.1299C69.1939 33.1299 65.6446 29.1128 65.6445 23.2627C65.6445 16.8275 70.0124 12.7715 74.8096 12.7715ZM93.4922 12.7715C98.2504 12.7715 101.214 16.7106 100.824 20.8838H87.4863C87.4474 21.2737 87.4473 21.6638 87.4473 22.0537C87.4474 27.2797 90.0218 30.5166 94.5068 30.5166C96.8857 30.5165 99.1087 29.6197 100.513 27.6309L100.941 27.9424C99.7714 30.9064 97.0416 33.1298 93.1807 33.1299C87.8765 33.1299 84.3273 29.1128 84.3271 23.2627C84.3271 16.8275 88.6951 12.7716 93.4922 12.7715ZM113.229 12.7715C115.88 12.7716 117.635 13.5125 118.61 13.9805L119.078 18.3486L118.688 18.4648C117.206 15.9689 115.217 13.8635 112.526 13.8633C108.704 13.8633 106.091 16.9836 106.091 22.1318C106.091 27.2408 108.743 30.5557 113.229 30.5557C115.49 30.5555 117.791 29.6971 119.195 27.7861L119.624 28.0596C118.493 30.8676 115.763 33.1298 111.785 33.1299C106.559 33.1299 103.01 29.3072 103.01 23.418C103.01 16.944 107.846 12.7715 113.229 12.7715ZM146.563 12.7715C148.358 12.7715 150.113 13.1217 151.205 13.5117L151.673 17.7637L151.283 17.8799C149.606 14.76 147.617 13.8633 145.628 13.8633C143.366 13.8633 141.884 15.0722 141.884 16.9053C141.884 19.2843 144.341 20.0642 147.032 21.1562C149.879 22.2873 152.765 23.6526 152.765 27.4355C152.765 31.1407 149.879 33.1299 145.394 33.1299C143.054 33.1299 141.142 32.584 139.777 31.999L139.31 27.124L139.738 27.0068C141.376 30.5168 143.288 31.999 146.018 31.999C148.904 31.999 150.229 30.3994 150.229 28.4883C150.229 26.0705 148.163 25.1341 145.667 24.1201C142.937 23.0281 139.699 21.7802 139.699 17.9971C139.699 14.0971 143.131 12.7716 146.563 12.7715ZM49.875 4.07422C48.5101 6.14118 48.2363 7.27206 48.2363 10.0801V26.4609C48.2363 29.2689 48.549 30.3998 49.875 32.4668V32.5449H43.4004V32.4668C44.7264 30.3998 45 29.2299 45 26.4609V10.0801C45 7.31106 44.7263 6.14119 43.4004 4.07422V3.99609H49.875V4.07422ZM64.7734 4.07422C61.7704 5.59525 60.5615 6.88235 58.6895 9.06641L52.1758 16.4766L61.1074 27.8262C63.0183 30.205 64.0715 31.3748 65.9434 32.4668L65.9824 32.5449H60.7168L49.251 18.0361L57.0117 9.14453C59.1568 6.60943 59.3128 5.20526 58.2598 4.07422V3.99609H64.7734V4.07422ZM125.992 27.0459C125.992 29.6979 126.188 31.1408 126.968 32.4668V32.5449H122.054V32.4668C122.756 31.1019 123.028 29.7367 123.028 27.085V7.31055C123.028 5.39967 122.131 4.30739 121.195 3.56641V3.48828L125.992 1.57812V27.0459ZM137.225 13.4346C135.314 14.3705 134.183 15.4233 132.467 17.4121L129.229 21.1562L134.807 28.8398C136.172 30.7118 137.069 31.6868 138.473 32.4668V32.5449H133.949L126.655 22.5215L131.453 17.0225C132.584 15.7356 132.935 14.3316 132.038 13.4346V13.3564H137.225V13.4346ZM12.9092 22.7256H0L33.8613 0L12.9092 22.7256ZM74.6924 13.8633C71.5724 13.8634 69.5059 16.2033 68.9209 19.9082L78.8662 19.7129V19.3623C78.8662 15.6182 77.3835 13.8633 74.6924 13.8633ZM93.375 13.8633C90.2551 13.8634 88.1886 16.2033 87.6035 19.9082L97.5488 19.7129V19.3623C97.5488 15.6182 96.0661 13.8633 93.375 13.8633Z" fill="#E7E7E7"/>
  </svg>
)

// ── BookForm ──────────────────────────────────────────────────────────────────
function BookForm() {
  const searchParams   = useSearchParams()
  const emailFromCta   = searchParams.get('email') ?? ''
  const { lang }       = useLanguage()
  const t              = LABELS[lang]
  const router         = useRouter()

  const [scrolled,     setScrolled]     = useState(false)
  const [date,         setDate]         = useState('')
  const [time,         setTime]         = useState('')
  const [name,         setName]         = useState('')
  const [company,      setCompany]      = useState('')
  const [email,        setEmail]        = useState(emailFromCta)
  const [privacy,      setPrivacy]      = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [bookedSlots,  setBookedSlots]  = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Scroll listener for book-nav background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const slotGroups = getTimeSlots(date)

  useEffect(() => {
    if (!date) { setBookedSlots([]); return }
    setLoadingSlots(true)
    fetch(`/api/availability?date=${date}`)
      .then(r => r.json())
      .then(d => setBookedSlots(d.booked ?? []))
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [date])

  const handleDateChange = (val: string) => {
    setDate(val)
    setTime('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!time) return
    setLoading(true)
    let success = false
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name, company, email, date, time, lang }),
      })
      if (res.ok) success = true
    } catch (err) {
      console.error('Submit error:', err)
    }
    if (success) {
      router.push(lp(lang, '/book/confirmed'))
    } else {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Navbar */}
      <nav className={`book-nav${scrolled ? ' scrolled' : ''}`}>
        <a href={lp(lang, '/')} className="book-nav__logo" aria-label="Back to Keecks">
          {LOGO_SVG}
        </a>
        <div className="book-nav__actions">
          <a href={`${lp(lang, '/')}#how-it-works`} className="book-nav__link">{t.navLink}</a>
        </div>
      </nav>

      <div className="book__glow" aria-hidden />
      <div className="book__inner">
        <h1 className="book__title">{t.title}</h1>
        <p className="book__subtitle">{t.subtitle}</p>

        <form className="book__card" onSubmit={handleSubmit}>

          {/* Date */}
          <div className="book__field">
            <label className="book__label" htmlFor="book-date">
              {t.dateLabel} <span>*</span>
            </label>
            <div className="book__date-wrap">
              <input
                id="book-date"
                type="date"
                className="book__input"
                value={date}
                min={getTomorrowISO()}
                onChange={e => handleDateChange(e.target.value)}
                required
              />
              <span className="book__date-icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="book__field">
            <label className="book__label">
              {t.timeLabel} <span>*</span>
            </label>
            {!date ? (
              <p style={{ fontSize: 13, color: 'rgba(231,231,231,0.35)', margin: '8px 0 0' }}>
                {t.selectDateFirst}
              </p>
            ) : loadingSlots ? (
              <p style={{ fontSize: 13, color: 'rgba(231,231,231,0.35)', margin: '8px 0 0' }}>…</p>
            ) : (
              <div className="book__times">
                {slotGroups.flatMap(group => group.slots).map(slot => {
                  const booked = bookedSlots.includes(slot)
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`book__time-btn${time === slot ? ' active' : ''}${booked ? ' booked' : ''}`}
                      onClick={() => !booked && setTime(slot)}
                      disabled={booked}
                      title={booked ? (lang === 'it' ? 'Non disponibile' : 'Not available') : undefined}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Name + Company */}
          <div className="book__row">
            <div className="book__field">
              <label className="book__label" htmlFor="book-name">
                {t.nameLabel} <span>*</span>
              </label>
              <input
                id="book-name"
                type="text"
                className="book__input"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="book__field">
              <label className="book__label" htmlFor="book-company">
                {t.companyLabel} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>{t.companyOpt}</span>
              </label>
              <input
                id="book-company"
                type="text"
                className="book__input"
                placeholder={t.companyPlaceholder}
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="book__field">
            <label className="book__label" htmlFor="book-email">
              {t.emailLabel} <span>*</span>
            </label>
            <input
              id="book-email"
              type="email"
              className="book__input"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Privacy */}
          <label className="book__check-wrap">
            <input
              type="checkbox"
              className="book__check"
              checked={privacy}
              onChange={e => setPrivacy(e.target.checked)}
              required
            />
            <span className="book__check-label">
              {lang === 'it'
                ? <>Accetto la <a href={lp(lang, '/privacy')}>Privacy policy</a></>
                : <>I agree to the <a href={lp(lang, '/privacy')}>Privacy policy</a>.</>
              }
            </span>
          </label>

          {/* Submit */}
          <button type="submit" className="book__submit" disabled={loading || !time}>
            {loading ? '...' : t.submit}
          </button>

        </form>
      </div>
    </>
  )
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function BookPage() {
  return (
    <main className="book">
      <Suspense fallback={null}>
        <BookForm />
      </Suspense>
    </main>
  )
}

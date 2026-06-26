'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { trackEvent, trackCustomEvent } from '@/components/MetaPixel'
import { getTimeSlots, getTomorrowISO } from '@/lib/slots'
import { useHideOnScroll } from '@/lib/useHideOnScroll'

// ── Waveform decorative bars ──────────────────────────────────────────────────
const BARS = [3,5,8,4,7,6,9,5,3,8,7,4,9,6,5,8,4,7,3,9,6,5,8,4,7,9,5,3,6,8,
              4,7,5,9,3,6,8,5,4,7,6,3,9,5,8,4,7,6,3,9]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const AUDIO_SRC = '/audio/Keecks_Assistente-Vocale-AI_Salone-di-Parrucchieri-Parrucchiere-Hairdresser_Italiano.mp3'
const AUDIO_DURATION = 116

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function LogoSvg({ fill = '#E7E7E7' }: { fill?: string }) {
  return (
    <svg width="84" height="19" viewBox="0 0 153 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.7061 34.4385L12.9092 22.7256H20.292L28.7061 34.4385ZM74.8096 12.7715C79.5678 12.7715 82.5316 16.7106 82.1416 20.8838H68.8037C68.7648 21.2737 68.7646 21.6638 68.7646 22.0537C68.7648 27.2795 71.3384 30.5164 75.8232 30.5166C78.2023 30.5166 80.426 29.6199 81.8301 27.6309L82.2588 27.9424C81.0888 30.9064 78.359 33.1297 74.498 33.1299C69.1939 33.1299 65.6446 29.1128 65.6445 23.2627C65.6445 16.8275 70.0124 12.7715 74.8096 12.7715ZM93.4922 12.7715C98.2504 12.7715 101.214 16.7106 100.824 20.8838H87.4863C87.4474 21.2737 87.4473 21.6638 87.4473 22.0537C87.4474 27.2797 90.0218 30.5166 94.5068 30.5166C96.8857 30.5165 99.1087 29.6197 100.513 27.6309L100.941 27.9424C99.7714 30.9064 97.0416 33.1298 93.1807 33.1299C87.8765 33.1299 84.3273 29.1128 84.3271 23.2627C84.3271 16.8275 88.6951 12.7716 93.4922 12.7715ZM113.229 12.7715C115.88 12.7716 117.635 13.5125 118.61 13.9805L119.078 18.3486L118.688 18.4648C117.206 15.9689 115.217 13.8635 112.526 13.8633C108.704 13.8633 106.091 16.9836 106.091 22.1318C106.091 27.2408 108.743 30.5557 113.229 30.5557C115.49 30.5555 117.791 29.6971 119.195 27.7861L119.624 28.0596C118.493 30.8676 115.763 33.1298 111.785 33.1299C106.559 33.1299 103.01 29.3072 103.01 23.418C103.01 16.944 107.846 12.7715 113.229 12.7715ZM146.563 12.7715C148.358 12.7715 150.113 13.1217 151.205 13.5117L151.673 17.7637L151.283 17.8799C149.606 14.76 147.617 13.8633 145.628 13.8633C143.366 13.8633 141.884 15.0722 141.884 16.9053C141.884 19.2843 144.341 20.0642 147.032 21.1562C149.879 22.2873 152.765 23.6526 152.765 27.4355C152.765 31.1407 149.879 33.1299 145.394 33.1299C143.054 33.1299 141.142 32.584 139.777 31.999L139.31 27.124L139.738 27.0068C141.376 30.5168 143.288 31.999 146.018 31.999C148.904 31.999 150.229 30.3994 150.229 28.4883C150.229 26.0705 148.163 25.1341 145.667 24.1201C142.937 23.0281 139.699 21.7802 139.699 17.9971C139.699 14.0971 143.131 12.7716 146.563 12.7715ZM49.875 4.07422C48.5101 6.14118 48.2363 7.27206 48.2363 10.0801V26.4609C48.2363 29.2689 48.549 30.3998 49.875 32.4668V32.5449H43.4004V32.4668C44.7264 30.3998 45 29.2299 45 26.4609V10.0801C45 7.31106 44.7263 6.14119 43.4004 4.07422V3.99609H49.875V4.07422ZM64.7734 4.07422C61.7704 5.59525 60.5615 6.88235 58.6895 9.06641L52.1758 16.4766L61.1074 27.8262C63.0183 30.205 64.0715 31.3748 65.9434 32.4668L65.9824 32.5449H60.7168L49.251 18.0361L57.0117 9.14453C59.1568 6.60943 59.3128 5.20526 58.2598 4.07422V3.99609H64.7734V4.07422ZM125.992 27.0459C125.992 29.6979 126.188 31.1408 126.968 32.4668V32.5449H122.054V32.4668C122.756 31.1019 123.028 29.7367 123.028 27.085V7.31055C123.028 5.39967 122.131 4.30739 121.195 3.56641V3.48828L125.992 1.57812V27.0459ZM137.225 13.4346C135.314 14.3705 134.183 15.4233 132.467 17.4121L129.229 21.1562L134.807 28.8398C136.172 30.7118 137.069 31.6868 138.473 32.4668V32.5449H133.949L126.655 22.5215L131.453 17.0225C132.584 15.7356 132.935 14.3316 132.038 13.4346V13.3564H137.225V13.4346ZM12.9092 22.7256H0L33.8613 0L12.9092 22.7256ZM74.6924 13.8633C71.5724 13.8634 69.5059 16.2033 68.9209 19.9082L78.8662 19.7129V19.3623C78.8662 15.6182 77.3835 13.8633 74.6924 13.8633ZM93.375 13.8633C90.2551 13.8634 88.1886 16.2033 87.6035 19.9082L97.5488 19.7129V19.3623C97.5488 15.6182 96.0661 13.8633 93.375 13.8633Z" fill={fill}/>
    </svg>
  )
}

// ── Audio Player ──────────────────────────────────────────────────────────────
function AudioPlayer() {
  const [playing,     setPlaying]     = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const audioRef      = useRef<HTMLAudioElement | null>(null)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const wallStartRef  = useRef(0)
  const audioStartRef = useRef(0)

  const clearTicker = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(AUDIO_SRC)
      a.addEventListener('ended', () => {
        clearTicker(); setPlaying(false); setProgress(0); setCurrentTime(0); a.currentTime = 0
      })
      audioRef.current = a
    }
    return audioRef.current
  }, [])

  const togglePlay = () => {
    const audio = getAudio()
    if (playing) {
      audio.pause(); clearTicker(); setPlaying(false)
    } else {
      wallStartRef.current  = Date.now()
      audioStartRef.current = audio.currentTime
      audio.play()
      setPlaying(true)
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - wallStartRef.current) / 1000
        const t = Math.min(audioStartRef.current + elapsed, AUDIO_DURATION)
        setCurrentTime(t); setProgress(t / AUDIO_DURATION)
      }, 100)
    }
  }

  const handleWaveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = getAudio()
    const rect  = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const seekTo = ratio * AUDIO_DURATION
    audio.currentTime = seekTo
    wallStartRef.current  = Date.now()
    audioStartRef.current = seekTo
    setCurrentTime(seekTo); setProgress(ratio)
  }

  const playedCount = Math.round(progress * BARS.length)

  return (
    <div className="lp-player">
      <button className="lp-player__play" onClick={togglePlay} aria-label={playing ? 'Pausa' : 'Riproduci'}>
        {playing ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF7005">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF7005" style={{ marginLeft: 2 }}>
            <path d="M5 3l14 9-14 9V3z"/>
          </svg>
        )}
      </button>
      <div className="lp-player__wave" onClick={handleWaveClick} style={{ cursor: 'pointer' }} aria-hidden>
        {BARS.map((h, i) => {
          let cls = 'lp-player__bar'
          if (i < playedCount) cls += ' played'
          else if (playing && i === playedCount) cls += ' playing'
          return <div key={i} className={cls} style={{ height: Math.round(4 + h * 1.8) + 'px' }} />
        })}
      </div>
      <span className="lp-player__time">
        {formatTime(currentTime)} / {formatTime(AUDIO_DURATION)}
      </span>
    </div>
  )
}

// ── Book Form ─────────────────────────────────────────────────────────────────
function BookForm() {
  const [date,         setDate]         = useState('')
  const [time,         setTime]         = useState('')
  const [name,         setName]         = useState('')
  const [company,      setCompany]      = useState('')
  const [email,        setEmail]        = useState('')
  const [phone,        setPhone]        = useState('')
  const [privacy,      setPrivacy]      = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [bookedSlots,  setBookedSlots]  = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [hasTrackedStart, setHasTrackedStart] = useState(false)
  const [hasTrackedComplete, setHasTrackedComplete] = useState(false)

  useEffect(() => {
    if (name && email && phone && date && time && privacy && !hasTrackedComplete) {
      setHasTrackedComplete(true)
      trackCustomEvent('FormComplete')
    }
  }, [name, email, phone, date, time, privacy, hasTrackedComplete])

  const handleFormInteraction = () => {
    if (!hasTrackedStart) {
      setHasTrackedStart(true)
      trackCustomEvent('FormStart')
      trackCustomEvent('FormClick')
    }
  }

  // Slot già prenotati per la data scelta (stessa API del book page)
  useEffect(() => {
    if (!date) { setBookedSlots([]); return }
    setLoadingSlots(true)
    fetch(`/api/availability?date=${date}`)
      .then(r => r.json())
      .then(d => setBookedSlots(d.booked ?? []))
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!time) return
    trackEvent('SubmitApplication')
    setLoading(true)
    try {
      await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name, company, phone, email, date, time, lang: 'it' }),
      })
      window.location.href = '/it/book/confirmed'
    } catch {
      setLoading(false)
    }
  }

  return (
    <form className="lp-form__card" onSubmit={handleSubmit} onClick={handleFormInteraction} onFocus={handleFormInteraction}>
      {/* Date */}
      <div className="lp-form__field">
        <label className="lp-form__label">Data della consulenza</label>
        <div className="lp-form__date-wrap">
          <input
            type="date"
            className="lp-form__input"
            value={date}
            min={getTomorrowISO()}
            onChange={e => { setDate(e.target.value); setTime('') }}
            required
          />
          <span className="lp-form__date-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Time slots — appaiono in base al giorno scelto (come il book page) */}
      <div className="lp-form__field">
        <label className="lp-form__label">Orario della consulenza</label>
        {!date ? (
          <p className="lp-form__hint">Seleziona una data per vedere gli orari disponibili.</p>
        ) : loadingSlots ? (
          <p className="lp-form__hint">…</p>
        ) : (
          <div className="lp-form__times">
            {getTimeSlots(date).flatMap(g => g.slots).map(slot => {
              const booked = bookedSlots.includes(slot)
              return (
                <button
                  key={slot}
                  type="button"
                  className={`lp-form__time-btn${time === slot ? ' active' : ''}${booked ? ' booked' : ''}`}
                  onClick={() => !booked && setTime(slot)}
                  disabled={booked}
                  title={booked ? 'Non disponibile' : undefined}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Name + Company */}
      <div className="lp-form__row">
        <div className="lp-form__field">
          <label className="lp-form__label">Nome</label>
          <input type="text" className="lp-form__input" placeholder="Inserisci il tuo nome"
            value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="lp-form__field">
          <label className="lp-form__label">Azienda</label>
          <input type="text" className="lp-form__input" placeholder="Inserisci l'azienda"
            value={company} onChange={e => setCompany(e.target.value)} />
        </div>
      </div>

      {/* Email */}
      <div className="lp-form__field">
        <label className="lp-form__label">E-mail</label>
        <input type="email" className="lp-form__input" placeholder="Inserisci la tua mail"
          value={email} onChange={e => setEmail(e.target.value)} required />
      </div>

      {/* Telefono */}
      <div className="lp-form__field">
        <label className="lp-form__label">Telefono</label>
        <input type="tel" className="lp-form__input" placeholder="Inserisci il tuo numero"
          value={phone} onChange={e => setPhone(e.target.value)} required />
      </div>

      {/* Privacy */}
      <label className="lp-form__check-wrap">
        <input type="checkbox" className="lp-form__check" checked={privacy}
          onChange={e => setPrivacy(e.target.checked)} required />
        <span className="lp-form__check-label">
          Accetto la <Link href="/it/privacy">Privacy policy</Link>
        </span>
      </label>

      <button type="submit" className="lp-form__submit" disabled={loading || !time}>
        {loading ? '...' : 'Prenota una Demo'}
      </button>
    </form>
  )
}


// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingIT() {
  const { hidden } = useHideOnScroll()
  return (
    <>
      {/* ── Navbar ── */}
      <nav className={`lp-nav${hidden ? ' gone' : ''}`}>
        <Link href="/it" className="lp-nav__logo" aria-label="Keecks">
          <LogoSvg />
        </Link>
        <Link href="/it#how-it-works" className="lp-nav__btn">Come funziona</Link>
      </nav>

      {/* ── Section 1 — Hero (usa section trasparente del sito: video mostra sotto) ── */}
      <section className="section" style={{ paddingTop: 74, paddingBottom: 56, paddingInline: 0, position: 'relative' }}>
        <div className="hero__glow" aria-hidden />
        <div className="lp-container">
          <span className="tag" style={{ marginBottom: 18 }}>Assistente vocale AI</span>
          <h1 className="lp-hero__title">Quanti clienti chiamano quando non puoi rispondere?</h1>
          <p className="lp-hero__body">
            Keecks risponde a ogni chiamata, prende ogni appuntamento direttamente nel gestionale
            e aumenta lo scontrino medio. Anche quando sei occupato o il tuo salone è chiuso.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link href="#prenota" className="lp-btn lp-btn--light">Prenota una Demo</Link>
          </div>
        </div>
      </section>

      {/* ── Sezioni 2+3 su fascia calda arancione (come da design) ── */}
      <div className="lp-warm">
        <div className="lp-warm__glow" aria-hidden />

      {/* ── Section 2 — Demo AI ── */}
      <section className="section" style={{ paddingTop: 52, paddingBottom: 48, paddingInline: 0 }}>
        <div className="lp-container">
          <h2 className="lp-demo__title">
            L&apos;assistente AI per il tuo salone di parrucchieri.{' '}
            Risponde e prenota. 24/7.
          </h2>
          <p className="lp-demo__body">
            Senti come Keecks gestisce una chiamata per taglio, piega e colore.
          </p>
          <AudioPlayer />
        </div>
      </section>

      {/* ── Section 3 — Form ── */}
      <section className="lp-book" id="prenota">
        <div className="lp-container">
          <span className="lp-book__label">Prenota una Demo</span>
          <BookForm />
        </div>
      </section>
      </div>

      {/* ── Section 4 + Footer — usa cta-footer-wrap identico al sito principale ── */}
      <div className="cta-footer-wrap">
        <div className="cta__glow" aria-hidden />

        <section className="section cta" style={{ paddingTop: 70, paddingBottom: 80, paddingInline: 0 }}>
          <div className="lp-container" style={{ textAlign: 'center' }}>
            <h2 className="lp-cta__title">
              Meno chiamate da gestire.<br />
              Più spazio per respirare.
            </h2>
            <Link href="#prenota" className="lp-btn lp-btn--light">Prenota una Demo</Link>
          </div>
        </section>

        <footer className="lp-footer">
          <Link href="/it" className="lp-footer__logo" aria-label="Keecks">
            <LogoSvg />
          </Link>
          <p className="lp-footer__tagline">More clients. Less thoughts.</p>
          <nav className="lp-footer__social" aria-label="Social media">
            <a href="https://www.instagram.com/keecks.ai" aria-label="Instagram" className="lp-footer__social-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="rgba(231,231,231,0.70)">
                <path d="M16 2H8a6 6 0 00-6 6v8a6 6 0 006 6h8a6 6 0 006-6V8a6 6 0 00-6-6zm4 14a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v8zm-8-9a5 5 0 100 10A5 5 0 0012 7zm0 8a3 3 0 110-6 3 3 0 010 6zm5.5-9a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@keecks.ai" aria-label="TikTok" className="lp-footer__social-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="rgba(231,231,231,0.70)">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.74a4.85 4.85 0 01-1-.05z"/>
              </svg>
            </a>
          </nav>
          <p className="lp-footer__copy">© {new Date().getFullYear()} Keecks. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}

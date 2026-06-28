'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { trackCustomEvent } from '@/components/MetaPixel'

// Audio per lingua — stesso ordine dei TABS: [Salone, Clinica Medica, Ristorante]
const AUDIO_FILES = {
  en: [
    '/audio/Keecks_AI-Voice-Assistant_Hair-Beauty-Salon-Hairdresser_English.mp3',
    '/audio/Keecks_AI-Voice-Assistant_Medical-Center_Dental-Clinic_Botox-Filler_Healthcare_English.mp3',
    '/audio/Keecks_AI-Voice-Assistant_Restaurant_English.mp3',
  ],
  it: [
    '/audio/Keecks_Assistente-Vocale-AI_Salone-di-Parrucchieri-Parrucchiere-Hairdresser_Italiano.mp3',
    '/audio/Keecks_Assistente-Vocale-AI_Clinica-Medica-Centro-Medico-Dottore-Studio-Dentistico-Dentista-Igiene_Italiano.mp3',
    '/audio/Keecks_Assistente-Vocale-AI_Ristorante-Pizzeria-Ristoranti-Trattoria-Ristorazione_Italiano.mp3',
  ],
}

// Durate REALI degli MP3 in secondi — i browser riportano durate sbagliate
// (più corte) per gli MP3 VBR, quindi usiamo i valori reali.
// Ordine come AUDIO_FILES/TABS: [Salone/Hair, Clinica/Medical, Ristorante/Restaurant].
const DURATIONS: Record<'en' | 'it', number[]> = {
  en: [118, 96, 122],   // Hair 1:58 · Medical 1:36 · Restaurant 2:02
  it: [115, 132, 122],  // Parrucchieri 1:55 · Clinica 2:12 · Ristorante 2:02
}

const TABS = {
  en: ['Hair Salon', 'Medical Clinic', 'Restaurant'],
  it: ['Parrucchieri', 'Clinica Medica', 'Ristorante'],
}

const SECTION_LABELS = {
  en: { tag: 'Voice Demo', title: 'Hear Keecks in action.' },
  it: { tag: 'Demo vocale', title: 'Senti Keecks in azione.' },
}

// Waveform heights — fixed decorative pattern
const BARS = [3,5,8,4,7,6,9,5,3,8,7,4,9,6,5,8,4,7,3,9,6,5,8,4,7,9,5,3,6,8,
              4,7,5,9,3,6,8,5,4,7,6,3,9,5,8,4,7,6,3,9]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VoiceDemo() {
  const { lang } = useLanguage()
  const tabs = TABS[lang]
  const labels = SECTION_LABELS[lang]

  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)   // 0–1
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Durata reale del clip attivo (audio.duration è inaffidabile sui VBR — vedi DURATIONS)
  const realDuration = DURATIONS[lang][active]

  // Build / swap audio element when tab changes
  useEffect(() => {
    const prev = audioRef.current
    if (prev) {
      prev.pause()
      prev.src = ''
    }

    const audio = new Audio(AUDIO_FILES[lang][active])
    audioRef.current = audio

    const onTimeUpdate = () => {
      const t = Math.min(audio.currentTime, realDuration)
      setCurrentTime(t)
      setProgress(realDuration ? t / realDuration : 0)
    }
    const onEnded = () => {
      // La waveform si completa al 100% esattamente quando finisce l'audio
      // (il reset a 0 avviene solo quando si ripreme play)
      setPlaying(false)
      setProgress(1)
      setCurrentTime(realDuration)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    setPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(realDuration)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [active, lang])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      // Se è arrivato in fondo, riparti da capo
      if (audio.ended) {
        audio.currentTime = 0
        setProgress(0)
        setCurrentTime(0)
      }
      audio.play()
      setPlaying(true)
      trackCustomEvent('DemoAudioPlay', { demo: tabs[active], lang })
    }
  }, [playing, tabs, active, lang])

  // Click on waveform — seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * realDuration
  }

  // floor (non round): la barra si riempie in sincrono col playhead e arriva
  // in fondo esattamente alla fine dell'audio (con round finiva ~1 bar prima).
  const playedCount = Math.floor(progress * BARS.length)

  return (
    <section className="section" id="voice-demo">
      <div className="container">
        <div className="section__header">
          <span className="tag section__tag">{labels.tag}</span>
          <h2 className="demo__title">
            {labels.title.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
        </div>

        <div className="demo__tabs" role="tablist">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              role="tab"
              aria-selected={active === i}
              className={`demo__tab${active === i ? ' active' : ''}`}
              onClick={() => setActive(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="demo__player">
          <button
            className="demo__play"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={togglePlay}
          >
            {playing ? (
              /* Pause icon */
              <svg viewBox="0 0 24 24" style={{ fill: 'var(--orange)', marginLeft: 0 }}>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              /* Play icon */
              <svg viewBox="0 0 24 24">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            )}
          </button>

          <div
            className="waveform"
            aria-hidden
            role="presentation"
            onClick={handleWaveformClick}
            style={{ cursor: 'pointer' }}
          >
            {BARS.map((h, i) => {
              let cls = 'waveform__bar'
              if (i < playedCount) cls += ' played'
              else if (playing && i === playedCount) cls += ' playing'
              return (
                <div
                  key={i}
                  className={cls}
                  style={{ height: `${Math.round(8 + h * 3.2)}px` }}
                />
              )
            })}
          </div>

          <span className="demo__time">
            {duration > 0
              ? `${formatTime(currentTime)} / ${formatTime(duration)}`
              : '0:00'}
          </span>
        </div>
      </div>
    </section>
  )
}

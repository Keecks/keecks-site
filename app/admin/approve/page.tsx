'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const messages: Record<string, { icon: string; title: string; desc: string }> = {
  confirmed: {
    icon: '✅',
    title: 'Appuntamento confermato',
    desc: 'L\'evento Google Calendar è stato creato e il cliente ha ricevuto l\'email di conferma con il link Meet.',
  },
  rejected: {
    icon: '❌',
    title: 'Richiesta rifiutata',
    desc: 'La prenotazione è stata segnata come rifiutata. Nessuna email è stata inviata al cliente.',
  },
  already: {
    icon: 'ℹ️',
    title: 'Già confermato',
    desc: 'Questa prenotazione era già stata confermata in precedenza.',
  },
  invalid: {
    icon: '⚠️',
    title: 'Link non valido',
    desc: 'Il link è scaduto o non è valido. Usa il pannello admin per gestire le prenotazioni.',
  },
  not_found: {
    icon: '🔍',
    title: 'Prenotazione non trovata',
    desc: 'La prenotazione richiesta non esiste nel sistema.',
  },
  error: {
    icon: '💥',
    title: 'Errore',
    desc: 'Si è verificato un errore. Riprova o usa il pannello admin.',
  },
}

function ApproveContent() {
  const searchParams = useSearchParams()
  const result = searchParams.get('result') || 'invalid'
  const msg = messages[result] || messages.invalid

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0806',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      padding: 24,
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '48px 36px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>{msg.icon}</div>
        <h1 style={{
          margin: '0 0 12px',
          fontSize: 22,
          fontWeight: 600,
          color: '#e7e7e7',
          letterSpacing: '-0.02em',
        }}>{msg.title}</h1>
        <p style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.7,
          color: 'rgba(231,231,231,0.55)',
        }}>{msg.desc}</p>
      </div>
    </main>
  )
}

export default function ApprovePage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0806',
      }}>
        <p style={{ color: 'rgba(231,231,231,0.5)' }}>Caricamento…</p>
      </main>
    }>
      <ApproveContent />
    </Suspense>
  )
}

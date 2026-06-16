'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// ── Slot logic (same as booking form / admin) ────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0') }

function getTimeSlots(dateStr: string): string[] {
  if (!dateStr) return []
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  const isWeekend = dow === 0 || dow === 6
  const slots: string[] = []
  if (isWeekend) {
    for (let h = 13; h <= 18; h++) { slots.push(`${pad(h)}:00`); slots.push(`${pad(h)}:30`) }
  } else {
    slots.push('12:00', '12:30')
    for (let h = 18; h <= 21; h++) { slots.push(`${h}:00`); if (h < 21) slots.push(`${h}:30`) }
  }
  return slots
}

function getTodayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function RescheduleInner() {
  const params = useSearchParams()
  const id     = params.get('id') ?? ''
  const token  = params.get('token') ?? ''

  const [date, setDate]       = useState('')
  const [time, setTime]       = useState('')
  const [booked, setBooked]   = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const slots = getTimeSlots(date)

  useEffect(() => {
    if (!date) { setBooked([]); return }
    let cancelled = false
    fetch(`/api/availability?date=${date}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setBooked(d.booked ?? []) })
      .catch(() => { if (!cancelled) setBooked([]) })
    return () => { cancelled = true }
  }, [date])

  const send = async () => {
    if (!date || !time) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/admin/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token, new_date: date, new_time: time }),
      })
      if (res.ok) setDone(true)
      else if (res.status === 401) setError('Link non valido o scaduto.')
      else setError('Errore durante l’invio. Riprova.')
    } catch {
      setError('Errore di rete. Riprova.')
    }
    setSending(false)
  }

  if (!id || !token) {
    return <p style={{ color: '#ff7005' }}>Link non valido.</p>
  }

  if (done) {
    return (
      <div className="admin-gate__box" style={{ textAlign: 'center' }}>
        <span style={{ color: '#e7e7e7', fontSize: 20, fontWeight: 600 }}>Proposta inviata ✓</span>
        <p style={{ marginTop: 16, fontSize: 14, color: 'rgba(231,231,231,0.6)', lineHeight: 1.7 }}>
          Abbiamo proposto la nuova data al cliente.<br/>
          Quando il cliente confermerà, potrai accettare l’appuntamento dal pulsante
          <strong style={{ color: '#e7e7e7' }}> “Accetta” </strong> nell’email originale.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-gate__box" style={{ maxWidth: 520 }}>
      <span style={{ color: '#e7e7e7', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Proponi una nuova data
      </span>
      <p style={{ margin: '12px 0 20px', fontSize: 13, color: 'rgba(231,231,231,0.55)' }}>
        Scegli data e orario: il cliente riceverà la proposta via email.
      </p>

      <label style={{ display: 'block', fontSize: 13, color: 'rgba(231,231,231,0.6)', marginBottom: 8 }}>Data</label>
      <input
        type="date"
        min={getTodayISO()}
        value={date}
        onChange={e => { setDate(e.target.value); setTime('') }}
        className="admin-input"
        style={{ width: 200 }}
      />

      {date && (
        <>
          <label style={{ display: 'block', fontSize: 13, color: 'rgba(231,231,231,0.6)', margin: '20px 0 8px' }}>Orario</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {slots.map(slot => {
              const isBooked = booked.includes(slot)
              const isActive = time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => !isBooked && setTime(slot)}
                  disabled={isBooked}
                  title={isBooked ? 'Già occupato' : undefined}
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: `1px solid ${isActive ? 'var(--orange)' : 'rgba(231,231,231,0.15)'}`,
                    background: isActive ? 'var(--orange)' : 'rgba(255,255,255,0.04)',
                    color: isBooked ? 'rgba(231,231,231,0.28)' : isActive ? '#fff' : 'rgba(231,231,231,0.7)',
                    cursor: isBooked ? 'not-allowed' : 'pointer',
                    textDecoration: isBooked ? 'line-through' : 'none',
                  }}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </>
      )}

      {error && <p style={{ color: '#ff7005', fontSize: 13, margin: '16px 0 0' }}>{error}</p>}

      <button
        className="admin-confirm-btn"
        onClick={send}
        disabled={!date || !time || sending}
        style={{ marginTop: 24 }}
      >
        {sending ? '...' : '📨 Invia proposta al cliente'}
      </button>
    </div>
  )
}

export default function ReschedulePage() {
  return (
    <main className="admin-gate">
      <Suspense fallback={null}>
        <RescheduleInner />
      </Suspense>
    </main>
  )
}

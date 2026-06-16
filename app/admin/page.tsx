'use client'
import { useState } from 'react'

type Booking = {
  id: number
  created_at: string
  nome: string
  company_name: string | null
  email: string
  consultation_date: string
  consultation_time: string
  confirmed: boolean
}

// ── Slot logic (same as booking form) ────────────────────────────────────────
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

function formatDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatTime(t: string) {
  return t?.slice(0, 5) ?? '—'
}

// ── Reschedule inline form ────────────────────────────────────────────────────
function RescheduleForm({
  booking,
  pwd,
  onDone,
  onCancel,
}: {
  booking: Booking
  pwd: string
  onDone: (newDate: string, newTime: string) => void
  onCancel: () => void
}) {
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [sending, setSending] = useState(false)

  const slots = getTimeSlots(newDate)

  const handleSend = async () => {
    if (!newDate || !newTime) return
    setSending(true)
    const res = await fetch('/api/admin/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: booking.id,
        pwd,
        nome: booking.nome,
        email: booking.email,
        new_date: newDate,
        new_time: newTime,
      }),
    })
    setSending(false)
    if (res.ok) onDone(newDate, newTime)
  }

  return (
    <div className="admin-reschedule">
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(231,231,231,0.6)' }}>
        Proponi nuova data a <strong style={{ color: '#e7e7e7' }}>{booking.nome}</strong>
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Date picker */}
        <input
          type="date"
          min={getTodayISO()}
          value={newDate}
          onChange={e => { setNewDate(e.target.value); setNewTime('') }}
          className="admin-input"
          style={{ width: 160 }}
        />
        {/* Time slots */}
        {newDate && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {slots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => setNewTime(slot)}
                style={{
                  padding: '6px 10px',
                  fontSize: 12,
                  borderRadius: 8,
                  border: `1px solid ${newTime === slot ? 'var(--orange)' : 'rgba(231,231,231,0.15)'}`,
                  background: newTime === slot ? 'var(--orange)' : 'rgba(255,255,255,0.04)',
                  color: newTime === slot ? '#fff' : 'rgba(231,231,231,0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          className="admin-confirm-btn"
          onClick={handleSend}
          disabled={!newDate || !newTime || sending}
        >
          {sending ? '...' : '📨 Invia proposta'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '7px 14px',
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid rgba(231,231,231,0.12)',
            background: 'transparent',
            color: 'rgba(231,231,231,0.4)',
            cursor: 'pointer',
          }}
        >
          Annulla
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [pwd, setPwd]           = useState('')
  const [authed, setAuthed]     = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [confirming, setConfirming]   = useState<number | null>(null)
  const [connecting, setConnecting]   = useState(false)
  const [rescheduling, setRescheduling] = useState<number | null>(null) // booking id being rescheduled

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/bookings?pwd=${encodeURIComponent(pwd)}`)
    if (!res.ok) {
      setError('Password errata.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setBookings(data)
    setAuthed(true)
    setLoading(false)
  }

  const confirm = async (b: Booking) => {
    setConfirming(b.id)
    const res = await fetch('/api/admin/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: b.id, pwd,
        nome: b.nome, email: b.email,
        company_name: b.company_name,
        consultation_date: b.consultation_date,
        consultation_time: b.consultation_time,
      }),
    })
    if (res.ok) {
      setBookings(prev => prev.map(x => x.id === b.id ? { ...x, confirmed: true } : x))
    }
    setConfirming(null)
  }

  const connectGoogle = async () => {
    setConnecting(true)
    const res = await fetch(`/api/auth/url?pwd=${encodeURIComponent(pwd)}`)
    const { url } = await res.json()
    window.open(url, '_blank')
    setConnecting(false)
  }

  if (!authed) {
    return (
      <main className="admin-gate">
        <div className="admin-gate__box">
          <span style={{ color: '#e7e7e7', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Keecks Admin</span>
          <form onSubmit={login} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="password"
              placeholder="Password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              className="admin-input"
              required
            />
            {error && <p style={{ color: '#ff7005', fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? '...' : 'Accedi'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  const pending   = bookings.filter(b => !b.confirmed)
  const confirmed = bookings.filter(b => b.confirmed)

  return (
    <main className="admin-page">
      <div className="admin-header">
        <span style={{ color: '#e7e7e7', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Keecks Admin</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="admin-connect-btn" onClick={connectGoogle} disabled={connecting}>
            {connecting ? '...' : '🔗 Connetti Google Calendar'}
          </button>
          <span style={{ color: 'rgba(231,231,231,0.4)', fontSize: 13 }}>
            {pending.length} da confermare · {confirmed.length} confermati
          </span>
        </div>
      </div>

      {pending.length === 0 && (
        <p className="admin-empty">Nessuna prenotazione da confermare.</p>
      )}

      {pending.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-section-title">Da confermare</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Azienda</th>
                  <th>Email</th>
                  <th>Data</th>
                  <th>Ora</th>
                  <th>Ricevuto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map(b => (
                  <>
                    <tr key={b.id}>
                      <td>{b.nome}</td>
                      <td>{b.company_name ?? '—'}</td>
                      <td>{b.email}</td>
                      <td>{formatDate(b.consultation_date)}</td>
                      <td>{formatTime(b.consultation_time)}</td>
                      <td>{new Date(b.created_at).toLocaleDateString('it-IT')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            className="admin-confirm-btn"
                            onClick={() => confirm(b)}
                            disabled={confirming === b.id}
                          >
                            {confirming === b.id ? '...' : 'Invia conferma'}
                          </button>
                          <button
                            className="admin-reschedule-btn"
                            onClick={() => setRescheduling(rescheduling === b.id ? null : b.id)}
                          >
                            📅 Altra data
                          </button>
                        </div>
                      </td>
                    </tr>
                    {rescheduling === b.id && (
                      <tr key={`${b.id}-reschedule`}>
                        <td colSpan={7} style={{ padding: '0 12px 16px' }}>
                          <RescheduleForm
                            booking={b}
                            pwd={pwd}
                            onDone={(newDate, newTime) => {
                              setBookings(prev => prev.map(x =>
                                x.id === b.id
                                  ? { ...x, consultation_date: newDate, consultation_time: newTime, confirmed: false }
                                  : x
                              ))
                              setRescheduling(null)
                            }}
                            onCancel={() => setRescheduling(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {confirmed.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-section-title" style={{ color: 'rgba(231,231,231,0.35)' }}>Confermati</h2>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--dim">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Azienda</th>
                  <th>Email</th>
                  <th>Data</th>
                  <th>Ora</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map(b => (
                  <tr key={b.id}>
                    <td>{b.nome}</td>
                    <td>{b.company_name ?? '—'}</td>
                    <td>{b.email}</td>
                    <td>{formatDate(b.consultation_date)}</td>
                    <td>{formatTime(b.consultation_time)}</td>
                    <td style={{ color: '#4ade80', fontSize: 13 }}>✓ Confermato</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}

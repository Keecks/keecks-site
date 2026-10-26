// Orari per i clienti USA (landing inglese).
// Gli slot sono definiti in Eastern Time; il backend continua a salvare tutto
// in ora di Roma, quindi qui ci sono le conversioni nei due sensi.
// Lun-ven 12pm-7pm ET, sab-dom 7am-8pm ET (ultimo slot mezz'ora prima).

export const US_TZ = 'America/New_York'
export const ROME_TZ = 'Europe/Rome'

function pad(n: number) { return String(n).padStart(2, '0') }

export function getUsSlots(dateStr: string): string[] {
  if (!dateStr) return []
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  const isWeekend = dow === 0 || dow === 6
  const [from, to] = isWeekend ? [7, 20] : [12, 19]
  const slots: string[] = []
  for (let h = from; h < to; h++) slots.push(`${pad(h)}:00`, `${pad(h)}:30`)
  return slots
}

function parts(at: Date, tz: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(at).map(x => [x.type, x.value])
  )
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute }
}

function offsetMinutes(at: Date, tz: string): number {
  const p = parts(at, tz)
  const asUtc = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi)
  return (asUtc - Math.floor(at.getTime() / 60_000) * 60_000) / 60_000
}

// "2026-10-28" + "14:00" in un fuso → istante
export function zonedToDate(date: string, time: string, tz: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, h, mi)
  let t = guess - offsetMinutes(new Date(guess), tz) * 60_000
  t = guess - offsetMinutes(new Date(t), tz) * 60_000
  return new Date(t)
}

// istante → { date: "YYYY-MM-DD", time: "HH:MM" } in un fuso
export function dateToZoned(at: Date, tz: string): { date: string; time: string } {
  const p = parts(at, tz)
  return { date: `${p.y}-${pad(p.mo)}-${pad(p.d)}`, time: `${pad(p.h)}:${pad(p.mi)}` }
}

export function usToRome(date: string, time: string) {
  return dateToZoned(zonedToDate(date, time, US_TZ), ROME_TZ)
}

// "2:00 PM"
export function formatTime12(at: Date, tz: string): string {
  return at.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })
}

// Per le email in inglese: "Wednesday, October 28, 2026 at 2:00 PM ET (7:00 PM in Italy)"
export function formatUsDateTime(romeDate: string, romeTime: string): string {
  const at = zonedToDate(romeDate, romeTime.slice(0, 5), ROME_TZ)
  const day = at.toLocaleDateString('en-US', {
    timeZone: US_TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  return `${day} at ${formatTime12(at, US_TZ)} ET (${formatTime12(at, ROME_TZ)} in Italy)`
}

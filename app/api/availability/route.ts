import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient } from '@/lib/google-calendar'
import { getUsSlots, zonedToDate, dateToZoned, US_TZ, ROME_TZ } from '@/lib/usTime'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()
const SUPABASE_URL         = clean(process.env.SUPABASE_URL)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY)

function pad(n: number) { return String(n).padStart(2, '0') }

// Slots taken by bookings in Supabase (pending + confirmed). Rejected bookings
// are deleted, so every remaining row is an active reservation.
// A booking lasts 30 min → it blocks exactly its own slot.
async function getSupabaseBookedSlots(date: string): Promise<string[]> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return []
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/FormSito?consultation_date=eq.${date}&select=consultation_time`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
    )
    if (!res.ok) return []
    const rows: { consultation_time: string | null }[] = await res.json()
    return rows
      .map(r => r.consultation_time?.slice(0, 5))
      .filter((t): t is string => !!t)
  } catch (err) {
    console.error('Supabase availability error:', err)
    return []
  }
}

// Same slot logic as the booking form
function getAvailableSlots(dateStr: string): string[] {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  const isWeekend = dow === 0 || dow === 6
  const slots: string[] = []
  if (isWeekend) {
    for (let h = 13; h <= 18; h++) {
      slots.push(`${pad(h)}:00`)
      slots.push(`${pad(h)}:30`)
    }
  } else {
    slots.push('12:00', '12:30')
    for (let h = 18; h <= 21; h++) {
      slots.push(`${h}:00`)
      if (h < 21) slots.push(`${h}:30`)
    }
  }
  return slots
}

// Returns UTC offset in minutes for Europe/Rome on a given date (handles DST)
function getRomeOffsetMinutes(date: Date): number {
  const rome = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
  const utc  = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  return (rome.getTime() - utc.getTime()) / 60_000
}

function toOffsetStr(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs  = Math.abs(offsetMinutes)
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

// Landing inglese: slot in Eastern Time. Una giornata ET a Roma copre due date
// (es. 12pm-7pm ET = 18:00-01:00), quindi si controllano entrambe.
async function getUsBooked(date: string): Promise<string[]> {
  const slots = getUsSlots(date).map(slot => {
    const start = zonedToDate(date, slot, US_TZ)
    return { slot, start, rome: dateToZoned(start, ROME_TZ) }
  })
  if (!slots.length) return []

  const romeDates = Array.from(new Set(slots.map(s => s.rome.date)))
  const taken = new Set<string>()
  for (const d of romeDates) {
    for (const t of await getSupabaseBookedSlots(d)) taken.add(`${d} ${t}`)
  }

  let busy: { start: Date; end: Date }[] = []
  try {
    const calendar = await getCalendarClient()
    const fbRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: slots[0].start.toISOString(),
        timeMax: new Date(slots[slots.length - 1].start.getTime() + 30 * 60_000).toISOString(),
        items: [{ id: 'primary' }],
      },
    })
    busy = (fbRes.data.calendars?.primary?.busy ?? []).map(b => ({ start: new Date(b.start!), end: new Date(b.end!) }))
  } catch (err) {
    console.error('Calendar freebusy error:', err)
  }

  return slots
    .filter(({ start, rome }) => {
      const end = new Date(start.getTime() + 30 * 60_000)
      return taken.has(`${rome.date} ${rome.time}`) || busy.some(b => start < b.end && end > b.start)
    })
    .map(s => s.slot)
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ booked: [] })
  if (req.nextUrl.searchParams.get('tz') === US_TZ) {
    return NextResponse.json({ booked: await getUsBooked(date) })
  }

  const slots = getAvailableSlots(date)

  // Source 1 — Supabase bookings (pending + confirmed). Always blocks the slot,
  // even before the appointment is confirmed, to avoid double-booking.
  const supabaseBooked = await getSupabaseBookedSlots(date)

  // Source 2 — Google Calendar freebusy (confirmed events + any other busy time).
  let calendarBooked: string[] = []
  try {
    const calendar = await getCalendarClient()

    // Compute Rome UTC offset for this date (CET = +1, CEST = +2)
    const offsetMin = getRomeOffsetMinutes(new Date(`${date}T12:00:00Z`))
    const offsetStr = toOffsetStr(offsetMin)

    // Query Google Calendar freebusy for the full day
    const fbRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: `${date}T00:00:00${offsetStr}`,
        timeMax: `${date}T23:59:59${offsetStr}`,
        items: [{ id: 'primary' }],
      },
    })

    const busyIntervals = fbRes.data.calendars?.primary?.busy ?? []

    // Check each available slot against the busy intervals
    calendarBooked = slots.filter(slot => {
      const [h, m] = slot.split(':').map(Number)
      const slotStart = new Date(`${date}T${pad(h)}:${pad(m)}:00${offsetStr}`)
      const slotEnd   = new Date(slotStart.getTime() + 30 * 60_000)

      return busyIntervals.some(busy => {
        const busyStart = new Date(busy.start!)
        const busyEnd   = new Date(busy.end!)
        // Overlap: slot starts before busy ends AND slot ends after busy starts
        return slotStart < busyEnd && slotEnd > busyStart
      })
    })
  } catch (err) {
    console.error('Calendar freebusy error:', err)
    // If Calendar is unreachable we still fall back to the Supabase result
  }

  // Union of both sources, restricted to real bookable slots
  const booked = slots.filter(s => supabaseBooked.includes(s) || calendarBooked.includes(s))
  return NextResponse.json({ booked })
}

import { NextRequest, NextResponse } from 'next/server'
import { createHoldEvent, deleteBookingEvents } from '@/lib/google-calendar'
import { verifyToken } from '@/lib/adminToken'
import { rescheduleEmailHtml, rescheduleSubject, type Lang } from '@/lib/emails'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

const SUPABASE_URL         = clean(process.env.SUPABASE_URL!)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY!)
const RESEND_API_KEY       = clean(process.env.RESEND_API_KEY!)
const ADMIN_PASSWORD       = clean(process.env.ADMIN_PASSWORD!)

export async function POST(req: NextRequest) {
  const { id, pwd, token, new_date, new_time } = await req.json()

  // Authorize via admin password (admin page) OR signed token (email link)
  const authorized = pwd === ADMIN_PASSWORD || (token && verifyToken(id, token))
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id || !new_date || !new_time) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Fetch booking details from the DB (don't trust the client for these)
  const bookingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/FormSito?id=eq.${id}&select=nome,email,company_name,lang`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  )
  const booking = bookingRes.ok ? (await bookingRes.json())[0] : null
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  const nome     = booking.nome as string
  const email    = booking.email as string
  const company  = booking.company_name?.trim() || undefined
  const language: Lang = booking.lang === 'en' ? 'en' : 'it'

  // 1. Send reschedule email
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Gianmarco — Keecks <info@keecks.ai>',
      to: [email],
      subject: rescheduleSubject(language),
      html: rescheduleEmailHtml(language, nome, new_date, new_time),
    }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.text()
    console.error('Resend reschedule error:', err)
    return NextResponse.json({ error: 'Email error' }, { status: 500 })
  }

  // 2. Update date/time in Supabase (reset confirmed to false)
  await fetch(`${SUPABASE_URL}/rest/v1/FormSito?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      consultation_date: new_date,
      consultation_time: new_time,
      confirmed: false,
    }),
  })

  // 3. Move the hold on the calendar: drop old event(s), create a new
  //    tentative hold at the proposed date/time so the new slot is blocked.
  await deleteBookingEvents(id)
  await createHoldEvent({ bookingId: id, nome, company, email, date: new_date, time: new_time })

  return NextResponse.json({ ok: true })
}

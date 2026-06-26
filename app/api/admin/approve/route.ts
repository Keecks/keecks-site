import { NextRequest, NextResponse } from 'next/server'
import { createConfirmedEvent, deleteBookingEvents, addToCalendarLink } from '@/lib/google-calendar'
import { verifyToken } from '@/lib/adminToken'
import { confirmEmailHtml, confirmSubject, type Lang } from '@/lib/emails'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

const SUPABASE_URL         = clean(process.env.SUPABASE_URL!)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY!)
const RESEND_API_KEY       = clean(process.env.RESEND_API_KEY!)

// ── GET handler ────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id     = searchParams.get('id')
  const token  = searchParams.get('token')
  const action = searchParams.get('action') // 'accept' or 'reject'

  if (!id || !token || !action) {
    return NextResponse.redirect(new URL('/admin/approve?result=invalid', req.url))
  }

  // Verify HMAC
  try {
    if (!verifyToken(id, token)) {
      return NextResponse.redirect(new URL('/admin/approve?result=invalid', req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/admin/approve?result=invalid', req.url))
  }

  // ── REJECT ───────────────────────────────────────────────────────
  if (action === 'reject') {
    // Remove the booking so its slot frees up again on the site…
    await fetch(`${SUPABASE_URL}/rest/v1/FormSito?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })
    // …and drop the tentative hold event from the calendar
    await deleteBookingEvents(id)
    return NextResponse.redirect(new URL('/admin/approve?result=rejected', req.url))
  }

  // ── ACCEPT ──────────────────────────────────────────────────────
  // 1. Fetch booking data from Supabase
  const bookingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/FormSito?id=eq.${id}&select=*`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  )

  if (!bookingRes.ok) {
    return NextResponse.redirect(new URL('/admin/approve?result=error', req.url))
  }

  const bookings = await bookingRes.json()
  if (!bookings.length) {
    return NextResponse.redirect(new URL('/admin/approve?result=not_found', req.url))
  }

  const booking = bookings[0]

  // Already confirmed?
  if (booking.confirmed) {
    return NextResponse.redirect(new URL('/admin/approve?result=already', req.url))
  }

  const company = booking.company_name?.trim() || undefined
  const language: Lang = booking.lang === 'en' ? 'en' : 'it'

  // 2. Upgrade the tentative hold to a confirmed event with Meet link.
  //    Remove the hold first so we don't end up with two events.
  let meetLink: string | undefined
  try {
    await deleteBookingEvents(id)
    const created = await createConfirmedEvent({
      bookingId: id,
      nome: booking.nome,
      company,
      email: booking.email,
      date: booking.consultation_date,
      time: booking.consultation_time,
    })
    meetLink = created.meetLink
    console.log('Calendar event confirmed via email approve, meet:', meetLink)
  } catch (err) {
    console.error('Google Calendar error (email approve):', err)
  }

  // Add-to-calendar link is built from booking data, so it's always present
  // even if the Google Calendar call above failed (Meet link may be missing).
  const eventLink = addToCalendarLink({
    company,
    date: booking.consultation_date,
    time: booking.consultation_time,
    meetLink,
  })

  // 3. Send Email 2 to client
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Gianmarco — Keecks <info@keecks.ai>',
      to: [booking.email],
      subject: confirmSubject(language),
      html: confirmEmailHtml(language, booking.nome, booking.consultation_date, booking.consultation_time, meetLink, eventLink),
    }),
  })

  if (!emailRes.ok) {
    console.error('Resend confirm error (email approve):', await emailRes.text())
  }

  // 4. Mark confirmed in Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/FormSito?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ confirmed: true }),
  })

  return NextResponse.redirect(new URL('/admin/approve?result=confirmed', req.url))
}

import { NextRequest, NextResponse } from 'next/server'
import { createConfirmedEvent, deleteBookingEvents, addToCalendarLink } from '@/lib/google-calendar'
import { confirmEmailHtml, confirmSubject, type Lang } from '@/lib/emails'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

const SUPABASE_URL         = clean(process.env.SUPABASE_URL!)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY!)
const RESEND_API_KEY       = clean(process.env.RESEND_API_KEY!)
const ADMIN_PASSWORD       = clean(process.env.ADMIN_PASSWORD!)

export async function POST(req: NextRequest) {
  const { id, pwd, nome, email, company_name, consultation_date, consultation_time, lang } = await req.json()

  if (pwd !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const company = company_name?.trim() || undefined
  const language: Lang = lang === 'en' ? 'en' : 'it'

  // ── 1. Upgrade the tentative hold to a confirmed event with Meet link ──
  let meetLink: string | undefined
  try {
    await deleteBookingEvents(id)
    const created = await createConfirmedEvent({
      bookingId: id, nome, company, email,
      date: consultation_date, time: consultation_time,
    })
    meetLink = created.meetLink
  } catch (err) {
    // Don't block confirmation if Calendar fails — log and continue
    console.error('Google Calendar error:', err)
  }

  // Add-to-calendar link is built from booking data, so it's always present
  // even if the Google Calendar call above failed (Meet link may be missing).
  const eventLink = addToCalendarLink({
    company, date: consultation_date, time: consultation_time, meetLink,
  })

  // ── 2. Send Email 2 to user (with Meet + calendar links if available) ──
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Gianmarco — Keecks <noreply@keecks.ai>',
      to: [email],
      subject: confirmSubject(language),
      html: confirmEmailHtml(language, nome, consultation_date, consultation_time, meetLink, eventLink),
    }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.text()
    console.error('Resend confirm error:', err)
    return NextResponse.json({ error: 'Email error' }, { status: 500 })
  }

  // ── 3. Mark confirmed in Supabase ────────────────────────────
  await fetch(`${SUPABASE_URL}/rest/v1/FormSito?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ confirmed: true }),
  })

  return NextResponse.json({ ok: true, meetLink, eventLink })
}

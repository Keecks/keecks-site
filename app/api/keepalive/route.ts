import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()
const SUPABASE_URL         = clean(process.env.SUPABASE_URL)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY)

// Chiamata ogni giorno dal cron di Vercel: Supabase free mette in pausa il
// progetto dopo 7 giorni senza richieste, e allora le prenotazioni falliscono.
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ ok: false, stage: 'config' }, { status: 500 })
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/FormSito?select=id&limit=1`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) console.error('Keepalive Supabase:', res.status, await res.text())
    return NextResponse.json({ ok: res.ok, status: res.status }, { status: res.ok ? 200 : 502 })
  } catch (e) {
    console.error('Keepalive Supabase error:', e)
    return NextResponse.json({ ok: false, stage: 'db' }, { status: 502 })
  }
}

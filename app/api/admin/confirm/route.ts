import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient } from '@/lib/google-calendar'

const clean = (s: string) => s.replace(/^\uFEFF/, '').trim()

const SUPABASE_URL         = clean(process.env.SUPABASE_URL!)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY!)
const RESEND_API_KEY       = clean(process.env.RESEND_API_KEY!)
const ADMIN_PASSWORD       = clean(process.env.ADMIN_PASSWORD!)
const GIANMARCO_EMAIL      = clean(process.env.GIANMARCO_EMAIL!)

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

// Build ISO datetime strings for the event (1-hour slot)
function buildEventTimes(date: string, time: string) {
  const timeShort = time.slice(0, 5)            // "HH:MM"
  const start = `${date}T${timeShort}:00`       // "YYYY-MM-DDTHH:MM:00"
  const [h, m] = timeShort.split(':').map(Number)
  const endH   = String(h + 1).padStart(2, '0')
  const end    = `${date}T${endH}:${String(m).padStart(2, '0')}:00`
  return { start, end }
}

function confirmEmailHtml(nome: string, date: string, time: string, meetLink?: string): string {
  const dateIt = formatDate(date)
  const timeIt = formatTime(time)

  const meetSection = meetLink ? `
          <div style="margin:0 0 32px;padding:20px 24px;background:rgba(255,112,5,0.08);border:1px solid rgba(255,112,5,0.25);border-radius:12px;">
            <p style="margin:0 0 12px;font-size:13px;color:rgba(231,231,231,0.5);text-transform:uppercase;letter-spacing:0.06em;">Link Google Meet</p>
            <a href="${meetLink}" style="color:#ff7005;font-size:15px;font-weight:600;text-decoration:none;word-break:break-all;">${meetLink}</a>
          </div>` : ''

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0806;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0806;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:40px;">
          <span style="color:#e7e7e7;font-size:22px;font-weight:600;letter-spacing:-0.02em;">Keecks</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px 32px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#e7e7e7;">Gentile ${nome},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">
            il nostro appuntamento è confermato per il giorno <strong style="color:#e7e7e7;">${dateIt}</strong> alle <strong style="color:#e7e7e7;">${timeIt}</strong>.
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">
            Durante la chiamata, ci prenderemo il tempo per comprendere la tua realtà e capire assieme come Keecks può supportare la tua attività. Avremo l'occasione di provare dal vivo il nostro assistente vocale e affrontare qualsiasi domanda o curiosità.
          </p>
          ${meetSection}
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(231,231,231,0.6);">A presto,<br/>Gianmarco</p>
        </td></tr>

        <!-- Tagline -->
        <tr><td style="padding-top:28px;text-align:center;">
          <span style="font-size:12px;color:rgba(231,231,231,0.35);letter-spacing:0.04em;">More clients. Less thoughts.</span>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const { id, pwd, nome, email, consultation_date, consultation_time } = await req.json()

  if (pwd !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 1. Create Google Calendar event with Meet link ────────────
  let meetLink: string | undefined
  try {
    const calendar = await getCalendarClient()
    const { start, end } = buildEventTimes(consultation_date, consultation_time)

    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Consulenza Keecks — ${nome}`,
        description: `Consulenza commerciale con ${nome} (${email})`,
        start: { dateTime: start, timeZone: 'Europe/Rome' },
        end:   { dateTime: end,   timeZone: 'Europe/Rome' },
        attendees: [
          { email: GIANMARCO_EMAIL },
          { email },
        ],
        conferenceData: {
          createRequest: {
            requestId: `keecks-${id}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email',  minutes: 60 },
            { method: 'popup',  minutes: 15 },
          ],
        },
      },
    })

    meetLink = event.data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    )?.uri ?? undefined

    console.log('Calendar event created:', event.data.htmlLink)
  } catch (err) {
    // Don't block confirmation if Calendar fails — log and continue
    console.error('Google Calendar error:', err)
  }

  // ── 2. Send Email 2 to user (with Meet link if available) ─────
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Gianmarco — Keecks <info@keecks.ai>',
      to: [email],
      subject: 'Appuntamento confermato',
      html: confirmEmailHtml(nome, consultation_date, consultation_time, meetLink),
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

  return NextResponse.json({ ok: true, meetLink })
}

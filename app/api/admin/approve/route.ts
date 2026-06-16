import { NextRequest, NextResponse } from 'next/server'
import { createConfirmedEvent, deleteBookingEvents, addToCalendarLink } from '@/lib/google-calendar'
import { verifyToken } from '@/lib/adminToken'

const clean = (s: string) => s.replace(/^\uFEFF/, '').trim()

const SUPABASE_URL         = clean(process.env.SUPABASE_URL!)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY!)
const RESEND_API_KEY       = clean(process.env.RESEND_API_KEY!)

// ── Helpers ────────────────────────────────────────────────────────
function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function confirmEmailHtml(nome: string, date: string, time: string, meetLink?: string, eventLink?: string): string {
  const dateIt = formatDate(date)
  const timeIt = formatTime(time)

  const meetSection = meetLink ? `
          <div style="margin:0 0 16px;padding:20px 24px;background:rgba(255,112,5,0.08);border:1px solid rgba(255,112,5,0.25);border-radius:12px;">
            <p style="margin:0 0 12px;font-size:13px;color:rgba(231,231,231,0.5);text-transform:uppercase;letter-spacing:0.06em;">Link della call (Google Meet)</p>
            <a href="${meetLink}" style="color:#ff7005;font-size:15px;font-weight:600;text-decoration:none;word-break:break-all;">${meetLink}</a>
          </div>` : ''

  const eventSection = eventLink ? `
          <div style="margin:0 0 32px;padding:20px 24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
            <p style="margin:0 0 12px;font-size:13px;color:rgba(231,231,231,0.5);text-transform:uppercase;letter-spacing:0.06em;">Evento sul calendario</p>
            <a href="${eventLink}" style="color:#e7e7e7;font-size:15px;font-weight:600;text-decoration:none;word-break:break-all;">Aggiungi al tuo calendario</a>
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
          ${eventSection}
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
      subject: 'Appuntamento confermato',
      html: confirmEmailHtml(booking.nome, booking.consultation_date, booking.consultation_time, meetLink, eventLink),
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

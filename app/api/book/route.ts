import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL      = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const RESEND_API_KEY    = process.env.RESEND_API_KEY!

// Convert "9:00 am" → "09:00:00" for Supabase time column
function toTime24(t: string): string {
  const [time, period] = t.toLowerCase().split(' ')
  const [h, m] = time.split(':')
  let hours = parseInt(h)
  if (period === 'pm' && hours !== 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0
  return `${hours.toString().padStart(2, '0')}:${m}:00`
}

function emailHtml(nome: string, lang: string): string {
  const isIt = lang === 'it'
  const greeting   = isIt ? `Gentile ${nome},` : `Dear ${nome},`
  const body1      = isIt
    ? 'grazie per aver contattato Keecks.'
    : 'thank you for contacting Keecks.'
  const body2      = isIt
    ? 'Abbiamo ricevuto la tua richiesta e il nostro team la sta prendendo in carico. Ti ricontatteremo a breve per confermare il nostro meeting e vedere insieme come Keecks può supportare la tua attività.'
    : 'We have received your request and our team is taking care of it. We will contact you promptly to confirm our meeting and see together how Keecks can support your business.'
  const sign       = isIt ? 'A presto,<br/>Il team Keecks' : 'All the best,<br/>The Keecks Team'
  const tagline    = 'More clients. Less thoughts.'

  return `<!DOCTYPE html>
<html lang="${lang}">
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
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#e7e7e7;">${greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">${body1}</p>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">${body2}</p>
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(231,231,231,0.6);">${sign}</p>
        </td></tr>

        <!-- Tagline -->
        <tr><td style="padding-top:28px;text-align:center;">
          <span style="font-size:12px;color:rgba(231,231,231,0.35);letter-spacing:0.04em;">${tagline}</span>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { nome, company, email, date, time, lang } = await req.json()

    // ── 0. Reject same-day and past dates ──────────────────────────
    // Le date sono ISO "YYYY-MM-DD" → confronto lessicografico valido.
    const pad = (n: number) => String(n).padStart(2, '0')
    const now = new Date()
    const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    if (!date || date <= todayISO) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    // ── 1. Save to Supabase ────────────────────────────────────────
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/FormSito`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        nome,
        company_name: company || null,
        email,
        consultation_date: date,
        consultation_time: toTime24(time),
      }),
    })

    if (!insertRes.ok) {
      const err = await insertRes.text()
      console.error('Supabase insert error:', err)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // ── 2. Send confirmation email to user (Resend) ───────────────
    const isIt = lang === 'it'
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Keecks <noreply@keecks.ai>',
        to: [email],
        subject: isIt ? 'La tua richiesta è stata ricevuta' : 'Your request has been received',
        html: emailHtml(nome, lang),
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('Resend error:', err)
      // Non blocchiamo il flusso: la prenotazione è salvata, solo l'email è fallita
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('API /book error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

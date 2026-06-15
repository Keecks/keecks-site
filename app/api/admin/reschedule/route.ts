import { NextRequest, NextResponse } from 'next/server'

const clean = (s: string) => s.replace(/^\uFEFF/, '').trim()

const SUPABASE_URL         = clean(process.env.SUPABASE_URL!)
const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_KEY!)
const RESEND_API_KEY       = clean(process.env.RESEND_API_KEY!)
const ADMIN_PASSWORD       = clean(process.env.ADMIN_PASSWORD!)

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function rescheduleEmailHtml(nome: string, newDate: string, newTime: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0806;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0806;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="padding-bottom:40px;">
          <span style="color:#e7e7e7;font-size:22px;font-weight:600;letter-spacing:-0.02em;">Keecks</span>
        </td></tr>

        <tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px 32px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#e7e7e7;">Gentile ${nome},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">
            Ti scrivo per proporti una nuova data per la nostra consulenza.
          </p>

          <div style="margin:0 0 28px;padding:20px 24px;background:rgba(255,112,5,0.08);border:1px solid rgba(255,112,5,0.25);border-radius:12px;">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(231,231,231,0.5);text-transform:uppercase;letter-spacing:0.06em;">Nuova data proposta</p>
            <p style="margin:0;font-size:22px;font-weight:600;color:#e7e7e7;letter-spacing:-0.02em;">
              ${formatDate(newDate)} — ${newTime.slice(0, 5)}
            </p>
          </div>

          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">
            Se ti va bene, non devi fare nulla — ti contatterò con il link per la chiamata. Se invece questa data non è comoda, rispondimi pure a questa email.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(231,231,231,0.6);">A presto,<br/>Gianmarco</p>
        </td></tr>

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
  const { id, pwd, nome, email, new_date, new_time } = await req.json()

  if (pwd !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
      subject: 'Proposta nuova data per la nostra consulenza',
      html: rescheduleEmailHtml(nome, new_date, new_time),
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

  return NextResponse.json({ ok: true })
}

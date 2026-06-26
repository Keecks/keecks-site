// Template email condivisi (conferma + riprogrammazione), bilingue IT/EN.
// Usati da app/api/admin/confirm, app/api/admin/approve e app/api/admin/reschedule.

export type Lang = 'it' | 'en'

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

// Wrapper esterno comune (logo + card + tagline)
function shell(bodyInner: string, lang: Lang): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0806;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0806;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="padding-bottom:40px;">
          <span style="color:#e7e7e7;font-size:22px;font-weight:600;letter-spacing:-0.02em;">Keecks</span>
        </td></tr>
        <tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px 32px;">
${bodyInner}
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

// ── Email di conferma appuntamento (con link Meet + aggiungi al calendario) ──
export function confirmEmailHtml(
  lang: Lang, nome: string, date: string, time: string, meetLink?: string, eventLink?: string,
): string {
  const isIt = lang === 'it'
  const dateStr = formatDate(date)
  const timeStr = formatTime(time)

  const t = isIt ? {
    greeting: `Gentile ${nome},`,
    p1: `il nostro appuntamento è confermato per il giorno <strong style="color:#e7e7e7;">${dateStr}</strong> alle <strong style="color:#e7e7e7;">${timeStr}</strong>.`,
    p2: `Durante la chiamata, ci prenderemo il tempo per comprendere la tua realtà e capire assieme come Keecks può supportare la tua attività. Avremo l'occasione di provare dal vivo il nostro assistente vocale e affrontare qualsiasi domanda o curiosità.`,
    meetLabel: 'Link della call (Google Meet)',
    eventLabel: 'Evento sul calendario',
    eventCta: 'Aggiungi al tuo calendario',
    sign: 'A presto,<br/>Gianmarco',
  } : {
    greeting: `Dear ${nome},`,
    p1: `our appointment is confirmed for <strong style="color:#e7e7e7;">${dateStr}</strong> at <strong style="color:#e7e7e7;">${timeStr}</strong>.`,
    p2: `During the call, we'll take the time to understand your business and explore together how Keecks can support it. You'll also get to try our voice assistant live and ask any questions you may have.`,
    meetLabel: 'Call link (Google Meet)',
    eventLabel: 'Calendar event',
    eventCta: 'Add to your calendar',
    sign: 'Talk soon,<br/>Gianmarco',
  }

  const meetSection = meetLink ? `
          <div style="margin:0 0 16px;padding:20px 24px;background:rgba(255,112,5,0.08);border:1px solid rgba(255,112,5,0.25);border-radius:12px;">
            <p style="margin:0 0 12px;font-size:13px;color:rgba(231,231,231,0.5);text-transform:uppercase;letter-spacing:0.06em;">${t.meetLabel}</p>
            <a href="${meetLink}" style="color:#ff7005;font-size:15px;font-weight:600;text-decoration:none;word-break:break-all;">${meetLink}</a>
          </div>` : ''

  const eventSection = eventLink ? `
          <div style="margin:0 0 32px;padding:20px 24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
            <p style="margin:0 0 12px;font-size:13px;color:rgba(231,231,231,0.5);text-transform:uppercase;letter-spacing:0.06em;">${t.eventLabel}</p>
            <a href="${eventLink}" style="color:#e7e7e7;font-size:15px;font-weight:600;text-decoration:none;word-break:break-all;">${t.eventCta}</a>
          </div>` : ''

  const inner = `          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#e7e7e7;">${t.greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">${t.p1}</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">${t.p2}</p>
          ${meetSection}
          ${eventSection}
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(231,231,231,0.6);">${t.sign}</p>`

  return shell(inner, lang)
}

export function confirmSubject(lang: Lang): string {
  return lang === 'it' ? 'Appuntamento confermato' : 'Appointment confirmed'
}

// ── Email di proposta nuova data ──────────────────────────────────────────
export function rescheduleEmailHtml(
  lang: Lang, nome: string, newDate: string, newTime: string,
): string {
  const isIt = lang === 'it'

  const t = isIt ? {
    greeting: `Gentile ${nome},`,
    p1: 'ti scrivo per proporti una nuova data per la nostra consulenza.',
    boxLabel: 'Nuova data proposta',
    p2: 'Se ti va bene, non devi fare nulla — ti contatterò con il link per la chiamata. Se invece questa data non è comoda, rispondimi pure a questa email.',
    sign: 'A presto,<br/>Gianmarco',
  } : {
    greeting: `Dear ${nome},`,
    p1: "I'm writing to propose a new date for our meeting.",
    boxLabel: 'Proposed new date',
    p2: "If it works for you, there's nothing you need to do — I'll send you the call link. If this date isn't convenient, just reply to this email.",
    sign: 'Talk soon,<br/>Gianmarco',
  }

  const inner = `          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#e7e7e7;">${t.greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">${t.p1}</p>
          <div style="margin:0 0 28px;padding:20px 24px;background:rgba(255,112,5,0.08);border:1px solid rgba(255,112,5,0.25);border-radius:12px;">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(231,231,231,0.5);text-transform:uppercase;letter-spacing:0.06em;">${t.boxLabel}</p>
            <p style="margin:0;font-size:22px;font-weight:600;color:#e7e7e7;letter-spacing:-0.02em;">${formatDate(newDate)} — ${formatTime(newTime)}</p>
          </div>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:rgba(231,231,231,0.75);">${t.p2}</p>
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(231,231,231,0.6);">${t.sign}</p>`

  return shell(inner, lang)
}

export function rescheduleSubject(lang: Lang): string {
  return lang === 'it'
    ? 'Proposta nuova data per la nostra consulenza'
    : 'A new date for our meeting'
}

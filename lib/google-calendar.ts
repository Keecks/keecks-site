import { google } from 'googleapis'

const TZ = 'Europe/Rome'

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/callback'
  )
}

export function getAuthUrl() {
  const client = getOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  })
}

export async function getCalendarClient() {
  const client = getOAuthClient()
  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })
  return google.calendar({ version: 'v3', auth: client })
}

// ── Helpers ────────────────────────────────────────────────────────
// Build ISO datetime strings for a 30-minute slot
export function buildEventTimes(date: string, time: string) {
  const timeShort = time.slice(0, 5)              // "HH:MM"
  const start = `${date}T${timeShort}:00`         // "YYYY-MM-DDTHH:MM:00"
  const [h, m] = timeShort.split(':').map(Number)
  const endTotal = h * 60 + m + 30                // +30 min
  const endH = String(Math.floor(endTotal / 60)).padStart(2, '0')
  const endM = String(endTotal % 60).padStart(2, '0')
  const end  = `${date}T${endH}:${endM}:00`
  return { start, end }
}

// Build a "add to your own calendar" Google Calendar link (TEMPLATE action).
// Works for any Google user: opens a pre-filled event they can save.
function buildAddToCalendarLink(opts: {
  summary: string; start: string; end: string; meetLink?: string
}): string {
  const compact = (local: string) => local.replace(/[-:]/g, '') // YYYYMMDDTHHMMSS
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text:   opts.summary,
    dates:  `${compact(opts.start)}/${compact(opts.end)}`,
    ctz:    TZ,
    details: opts.meetLink ? `Link della call: ${opts.meetLink}` : 'Consulenza Keecks',
  })
  if (opts.meetLink) params.set('location', opts.meetLink)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

type BookingInfo = {
  bookingId: string | number
  nome: string
  company?: string
  email?: string
  date: string
  time: string
}

// Create a TENTATIVE "hold" event at booking time so the slot is immediately
// blocked on the site (freebusy) and visible on Keecks' calendar.
// No client invite and no Meet link until the appointment is confirmed.
export async function createHoldEvent(b: BookingInfo): Promise<void> {
  try {
    const calendar = await getCalendarClient()
    const { start, end } = buildEventTimes(b.date, b.time)

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `🟡 Da confermare — ${b.nome}${b.company ? ` (${b.company})` : ''}`,
        description: `Richiesta di consulenza in attesa di conferma.\n${b.nome}${b.company ? `\nAzienda: ${b.company}` : ''}${b.email ? `\nEmail: ${b.email}` : ''}`,
        start: { dateTime: start, timeZone: TZ },
        end:   { dateTime: end,   timeZone: TZ },
        status: 'tentative',
        transparency: 'opaque', // counts as busy in freebusy → blocks the slot
        extendedProperties: {
          private: { keecksBookingId: String(b.bookingId), keecksStatus: 'pending' },
        },
      },
    })
  } catch (err) {
    // Don't block the booking flow if Calendar fails
    console.error('createHoldEvent error:', err)
  }
}

// Delete every calendar event linked to a booking (hold or confirmed).
// Used on confirm (before recreating), reject and reschedule.
export async function deleteBookingEvents(bookingId: string | number): Promise<void> {
  try {
    const calendar = await getCalendarClient()
    const res = await calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: [`keecksBookingId=${bookingId}`],
      showDeleted: false,
      maxResults: 10,
      singleEvents: true,
    })
    for (const ev of res.data.items ?? []) {
      if (ev.id) {
        await calendar.events.delete({ calendarId: 'primary', eventId: ev.id })
      }
    }
  } catch (err) {
    console.error('deleteBookingEvents error:', err)
  }
}

// Create the CONFIRMED event with Google Meet + client as attendee.
// Returns the Meet link and the calendar event link for the confirmation email.
export async function createConfirmedEvent(
  b: BookingInfo
): Promise<{ meetLink?: string; eventLink?: string }> {
  const calendar = await getCalendarClient()
  const { start, end } = buildEventTimes(b.date, b.time)

  // No attendees on purpose: we don't want Google to send the client a separate
  // (spam-looking) invite email. The client adds it via the link in our own
  // confirmation email instead. Client details still live in the description.
  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    sendUpdates: 'none',
    requestBody: {
      summary: `Consulenza Keecks — ${b.nome}${b.company ? ` (${b.company})` : ''}`,
      description: `Consulenza commerciale con ${b.nome}${b.company ? `\nAzienda: ${b.company}` : ''}${b.email ? `\nEmail: ${b.email}` : ''}`,
      start: { dateTime: start, timeZone: TZ },
      end:   { dateTime: end,   timeZone: TZ },
      status: 'confirmed',
      conferenceData: {
        createRequest: {
          requestId: `keecks-${b.bookingId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      extendedProperties: {
        private: { keecksBookingId: String(b.bookingId), keecksStatus: 'confirmed' },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    },
  })

  const meetLink = event.data.conferenceData?.entryPoints?.find(
    ep => ep.entryPointType === 'video'
  )?.uri ?? undefined

  // Link the client can use to add the appointment to their OWN calendar
  const eventLink = buildAddToCalendarLink({
    summary: `Consulenza Keecks${b.company ? ` — ${b.company}` : ''}`,
    start, end, meetLink,
  })

  return { meetLink, eventLink }
}

type EventDetails = { startDateTime?: string | null; endDateTime?: string | null; rsvpStatus?: string | null }
export function eventPresentation(event: EventDetails) {
  const end = Date.parse(event.endDateTime || event.startDateTime || '')
  const past = Number.isFinite(end) && end < Date.now()
  const status = past ? 'past' : event.rsvpStatus || 'closed'
  const label = status === 'past' ? 'Past event' : status === 'open' ? 'Registration open' : status === 'full' ? 'Fully booked' : 'Registration closed'
  return { status, label, open: status === 'open', past }
}

// Explicit UTC prevents the server's timezone from silently changing event times.
export const eventDate = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' })

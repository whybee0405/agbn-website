import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

export async function sendNotificationEmail(subject: string, html: string) {
  const to = process.env.NOTIFICATION_EMAIL
  const from = process.env.RESEND_FROM_EMAIL

  if (!resend || !to || !from) {
    // eslint-disable-next-line no-console
    console.log(`[email:skipped] ${subject}: RESEND_API_KEY/NOTIFICATION_EMAIL not configured`)
    return
  }

  try {
    await resend.emails.send({ from, to, subject, html })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send notification email', error)
  }
}

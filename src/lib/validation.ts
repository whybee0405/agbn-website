import { z } from 'zod'

const requiredString = (label: string) =>
  z.string().trim().min(1, { message: `${label} is required.` })

export const contactSchema = z.object({
  name: requiredString('Your name'),
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
  phone: z.string().trim().optional(),
  message: requiredString('Message').min(10, {
    message: 'Tell us a bit more, at least 10 characters.',
  }),
})
export type ContactInput = z.infer<typeof contactSchema>

export const joinSchema = z.object({
  name: requiredString('Your name'),
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
  phone: requiredString('Phone number'),
  country: z.string().trim().optional(),
  selectedTier: z.string().trim().optional(),
  message: z.string().trim().optional(),
})
export type JoinInput = z.infer<typeof joinSchema>

export const eventRsvpSchema = z.object({
  eventId: requiredString('Event'),
  kind: z.enum(['rsvp', 'notify']),
  name: requiredString('Your name'),
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
  phone: z.string().trim().optional(),
})
export type EventRsvpInput = z.infer<typeof eventRsvpSchema>

export const newsletterSchema = z.object({
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
})
export type NewsletterInput = z.infer<typeof newsletterSchema>

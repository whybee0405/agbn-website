'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { sendNotificationEmail } from '@/lib/email'
import {
  contactSchema,
  eventRsvpSchema,
  joinSchema,
  newsletterSchema,
} from '@/lib/validation'

export type ActionResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string> }

function fieldErrorsFrom(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten().fieldErrors
  const out: Record<string, string> = {}
  for (const key in flat) {
    const messages = flat[key]
    if (messages && messages[0]) out[key] = messages[0]
  }
  return out
}

export async function submitContact(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    }
  }

  const payload = await getPayload({ config: configPromise })
  await payload.create({ collection: 'contact-submissions', data: parsed.data })

  await sendNotificationEmail(
    `New contact form submission from ${parsed.data.name}`,
    `<p><strong>Name:</strong> ${parsed.data.name}</p>
     <p><strong>Email:</strong> ${parsed.data.email}</p>
     <p><strong>Phone:</strong> ${parsed.data.phone || 'Not provided'}</p>
     <p><strong>Message:</strong><br/>${parsed.data.message}</p>`,
  )

  return { success: true }
}

export async function submitJoin(input: unknown): Promise<ActionResult> {
  const parsed = joinSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    }
  }

  const payload = await getPayload({ config: configPromise })
  await payload.create({
    collection: 'member-leads',
    data: {
      ...parsed.data,
      selectedTier: parsed.data.selectedTier ? Number(parsed.data.selectedTier) : undefined,
    },
  })

  await sendNotificationEmail(
    `New membership lead: ${parsed.data.name}`,
    `<p><strong>Name:</strong> ${parsed.data.name}</p>
     <p><strong>Email:</strong> ${parsed.data.email}</p>
     <p><strong>Phone:</strong> ${parsed.data.phone}</p>
     <p><strong>Country:</strong> ${parsed.data.country || 'Not provided'}</p>
     <p><strong>Message:</strong><br/>${parsed.data.message || 'Not provided'}</p>`,
  )

  return { success: true }
}

export async function submitEventRsvp(input: unknown): Promise<ActionResult> {
  const parsed = eventRsvpSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    }
  }

  const payload = await getPayload({ config: configPromise })
  await payload.create({
    collection: 'event-rsvps',
    data: {
      event: Number(parsed.data.eventId),
      kind: parsed.data.kind,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    },
  })

  await sendNotificationEmail(
    parsed.data.kind === 'rsvp'
      ? `New event RSVP from ${parsed.data.name}`
      : `New "notify me" signup from ${parsed.data.name}`,
    `<p><strong>Name:</strong> ${parsed.data.name}</p>
     <p><strong>Email:</strong> ${parsed.data.email}</p>
     <p><strong>Phone:</strong> ${parsed.data.phone || 'Not provided'}</p>`,
  )

  return { success: true }
}

export async function subscribeNewsletter(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    }
  }

  const payload = await getPayload({ config: configPromise })

  const existing = await payload.find({
    collection: 'newsletter-subscribers',
    where: { email: { equals: parsed.data.email } },
    limit: 1,
  })

  if (existing.docs.length === 0) {
    await payload.create({ collection: 'newsletter-subscribers', data: parsed.data })
  }

  return { success: true }
}

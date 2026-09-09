'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { submitEventRsvp } from '@/app/(frontend)/actions'
import { eventRsvpSchema, type EventRsvpInput } from '@/lib/validation'
import { FormField } from './FormField'
import { FormSuccess } from './FormSuccess'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { runFormAction } from '@/lib/form-action'

type Props = {
  eventId: string
  rsvpStatus: 'open' | 'closed' | 'full'
}

export const EventRsvpForm: React.FC<Props> = ({ eventId, rsvpStatus }) => {
  const kind = rsvpStatus === 'open' ? 'rsvp' : 'notify'
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EventRsvpInput>({
    resolver: zodResolver(eventRsvpSchema),
    defaultValues: { eventId, kind },
  })

  if (done) {
    return (
      <FormSuccess
        title={kind === 'rsvp' ? "You're on the list." : "We'll let you know."}
        message={
          kind === 'rsvp'
            ? 'A confirmation has been logged for this event. See you there.'
            : 'Your interest has been recorded. The team can contact you if registration becomes available.'
        }
      />
    )
  }

  const onSubmit = async (data: EventRsvpInput) => {
    setFormError(null)
    const result = await runFormAction(() => submitEventRsvp({ ...data, eventId, kind }))
    if (!result.success) {
      setFormError(result.message)
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof EventRsvpInput, { message })
        }
      }
      return
    }
    setDone(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register('eventId')} value={eventId} />
      <input type="hidden" {...register('kind')} value={kind} />
      <FormField label="Full name" htmlFor="rsvp-name" required error={errors.name?.message}>
        <Input
          id="rsvp-name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'rsvp-name-error' : undefined}
          {...register('name')}
        />
      </FormField>
      <FormField label="Email address" htmlFor="rsvp-email" required error={errors.email?.message}>
        <Input
          id="rsvp-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'rsvp-email-error' : undefined}
          {...register('email')}
        />
      </FormField>
      <FormField label="Phone (optional)" htmlFor="rsvp-phone" error={errors.phone?.message}>
        <Input id="rsvp-phone" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
      </FormField>
      {formError && (
        <p role="alert" className="text-body-s text-error">
          {formError}
        </p>
      )}
      <Button type="submit" variant="gold" loading={isSubmitting} className="w-full">
        {kind === 'rsvp' ? 'RSVP' : 'Notify me'}
      </Button>
    </form>
  )
}

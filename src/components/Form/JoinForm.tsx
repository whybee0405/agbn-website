'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'

import { submitJoin } from '@/app/(frontend)/actions'
import { joinSchema, type JoinInput } from '@/lib/validation'
import { FormField } from './FormField'
import { FormSuccess } from './FormSuccess'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/components/Analytics'
import { runFormAction } from '@/lib/form-action'
import { SADC_COUNTRIES } from '@/constants/countries'

type Tier = { id: string; name: string }

export const JoinForm: React.FC<{ tiers: Tier[]; opportunity?: { title: string; slug: string } }> = ({ tiers, opportunity }) => {
  const searchParams = useSearchParams()
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JoinInput>({
    resolver: zodResolver(joinSchema),
    defaultValues: { selectedTier: tiers.some(t => t.id === searchParams.get('tier')) ? searchParams.get('tier') || '' : '', opportunity: opportunity?.slug || '' },
  })

  if (done) {
    return (
      <FormSuccess
        title="Application received."
        message="Thanks for applying. The AGBN team will reach out within two business days to confirm your tier and get you set up."
      />
    )
  }

  const onSubmit = async (data: JoinInput) => {
    setFormError(null)
    const result = await runFormAction(() => submitJoin(data))
    if (!result.success) {
      setFormError(result.message)
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof JoinInput, { message })
        }
      }
      return
    }
    trackEvent('Join Completed')
    setDone(true)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocus={() => {
        if (!started) {
          trackEvent('Join Started')
          setStarted(true)
        }
      }}
      className="space-y-5"
      noValidate
    >
      {opportunity && <div className="border-b border-hairline pb-5"><p className="text-caption font-medium uppercase tracking-[0.1em] text-on-surface-accent">Your opportunity</p><p className="mt-2 text-body-l font-medium">{opportunity.title}</p><p className="mt-2 text-body-s text-on-surface-muted">We’ll include this listing with your application.</p></div>}
      <input type="hidden" {...register('opportunity')} />
      <FormField label="Full name" htmlFor="join-name" required error={errors.name?.message}>
        <Input
          id="join-name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'join-name-error' : undefined}
          {...register('name')}
        />
      </FormField>
      <FormField label="Email address" htmlFor="join-email" required error={errors.email?.message}>
        <Input
          id="join-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'join-email-error' : undefined}
          {...register('email')}
        />
      </FormField>
      <FormField label="Phone number" htmlFor="join-phone" required error={errors.phone?.message}>
        <Input
          id="join-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Include your country code"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? 'join-phone-error' : undefined}
          {...register('phone')}
        />
      </FormField>
      <FormField label="Country (optional)" htmlFor="join-country" error={errors.country?.message}>
        <select id="join-country" autoComplete="country-name" {...register('country')} className="h-11 w-full rounded-md border border-input bg-surface-raised px-3.5 text-base text-on-surface transition-colors hover:border-on-surface-muted md:text-body-s">
          <option value="">Select a country</option>
          {SADC_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
        </select>
      </FormField>
      {tiers.length > 0 && (
        <FormField label="Which tier interests you?" htmlFor="join-tier">
          <select
            id="join-tier"
            {...register('selectedTier')}
            className="h-11 w-full rounded-md border border-input bg-surface-raised px-3.5 text-base text-on-surface transition-colors hover:border-on-surface-muted md:text-body-s"
          >
            <option value="">Not sure yet</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FormField>
      )}
      <FormField label="Anything else? (optional)" htmlFor="join-message" error={errors.message?.message}>
        <Textarea id="join-message" rows={4} {...register('message')} />
      </FormField>
      {formError && (
        <p role="alert" className="text-body-s text-error">
          {formError}
        </p>
      )}
      <Button type="submit" variant="gold" size="lg" loading={isSubmitting} className="w-full">
        Apply to join
      </Button>
      <p className="text-caption text-on-surface-muted">
        This is a membership application, not a checkout. Our team follows up to confirm your
        tier and payment.
      </p>
    </form>
  )
}

'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { submitContact } from '@/app/(frontend)/actions'
import { contactSchema, type ContactInput } from '@/lib/validation'
import { FormField } from './FormField'
import { FormSuccess } from './FormSuccess'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export const ContactForm: React.FC = () => {
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) })

  if (done) {
    return (
      <FormSuccess
        title="Message sent."
        message="Thanks for reaching out. A member of the AGBN team will reply within two business days."
      />
    )
  }

  const onSubmit = async (data: ContactInput) => {
    setFormError(null)
    const result = await submitContact(data)
    if (!result.success) {
      setFormError(result.message)
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof ContactInput, { message })
        }
      }
      return
    }
    setDone(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
      </FormField>
      <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
      </FormField>
      <FormField label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
      </FormField>
      <FormField label="Message" htmlFor="message" required error={errors.message?.message}>
        <Textarea
          id="message"
          rows={5}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
          {...register('message')}
        />
      </FormField>
      {formError && (
        <p role="alert" className="text-body-s text-error">
          {formError}
        </p>
      )}
      <Button type="submit" variant="gold" size="lg" loading={isSubmitting} className="w-full">
        Send message
      </Button>
    </form>
  )
}

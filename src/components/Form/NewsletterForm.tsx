'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'

import { subscribeNewsletter } from '@/app/(frontend)/actions'
import { newsletterSchema, type NewsletterInput } from '@/lib/validation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const NewsletterForm: React.FC = () => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) })

  if (done) {
    return (
      <p role="status" className="flex items-center gap-2 text-body-s text-on-dark">
        <CheckCircle2 size={16} className="shrink-0 text-gold" aria-hidden="true" />
        You&rsquo;re subscribed.
      </p>
    )
  }

  const onSubmit = async (data: NewsletterInput) => {
    setError(null)
    const result = await subscribeNewsletter(data)
    if (!result.success) {
      setError(result.message)
      return
    }
    setDone(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@business.com"
          aria-label="Email address"
          aria-invalid={errors.email ? true : undefined}
          /* This input sits on the midnight footer, so it opts out of the
             light-surface field styling rather than inheriting it. */
          className="border-white/25 bg-white/5 text-white placeholder:text-on-dark-muted hover:border-white/45"
          {...register('email')}
        />
        <Button type="submit" variant="gold" loading={isSubmitting} className="shrink-0">
          Subscribe
        </Button>
      </div>
      {(errors.email?.message || error) && (
        <p role="alert" className="text-body-s text-on-dark-error">
          {errors.email?.message || error}
        </p>
      )}
    </form>
  )
}

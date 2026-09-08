import React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'

type Props = {
  label: string
  htmlFor: string
  error?: string
  /** Persistent guidance. Rendered above the control so it is read before entry. */
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<Props> = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <Label htmlFor={htmlFor}>
      {label}
      {required && (
        <>
          <span aria-hidden="true" className="text-on-surface-accent">
            {' '}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </Label>
    {hint && (
      <p id={`${htmlFor}-hint`} className="text-caption text-on-surface-muted">
        {hint}
      </p>
    )}
    {children}
    {error && (
      /* aria-live so the message is announced when it appears, not only when
         focus happens to land back on the field. */
      <p id={`${htmlFor}-error`} role="alert" aria-live="polite" className="text-body-s text-error">
        {error}
      </p>
    )}
  </div>
)

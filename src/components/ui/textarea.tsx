import { cn } from '@/utilities/ui'
import * as React from 'react'

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...props
}) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-28 w-full rounded-md border border-input bg-surface-raised px-3.5 py-2.5 text-base text-on-surface shadow-xs',
        'transition-[border-color,box-shadow] duration-150',
        'placeholder:text-on-surface-muted',
        'selection:bg-gold selection:text-navy',
        'hover:border-on-surface-muted',
        'aria-invalid:border-destructive aria-invalid:hover:border-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'md:text-body-s',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

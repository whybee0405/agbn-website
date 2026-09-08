import { cn } from '@/utilities/ui'
import * as React from 'react'

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  type,
  ...props
}) => {
  return (
    <input
      data-slot="input"
      className={cn(
        // 44px tall so it clears the minimum touch target, and 16px text so
        // iOS Safari does not zoom the viewport on focus.
        'flex h-11 w-full min-w-0 rounded-md border border-input bg-surface-raised px-3.5 text-base text-on-surface shadow-xs',
        'transition-[border-color,box-shadow] duration-150',
        // Placeholder is a hint, never the label, and still has to clear AA.
        'placeholder:text-on-surface-muted',
        'selection:bg-gold selection:text-navy',
        'hover:border-on-surface-muted',
        'aria-invalid:border-destructive aria-invalid:hover:border-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-body-s file:font-medium file:text-foreground',
        'md:text-body-s',
        className,
      )}
      type={type}
      {...props}
    />
  )
}

export { Input }

'use client'

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

const buttonVariants = cva(
  [
    "inline-flex min-w-0 items-center justify-center gap-2 whitespace-normal rounded-md text-center text-body-s font-medium",
    // Transform is in the transition list so the press state can push the
    // button down a pixel. Colour and shadow only — never layout properties.
    'transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out-expo',
    'hover:-translate-y-0.5 active:translate-y-px',
    'hover:[&>svg]:translate-x-0.5 [&>svg]:transition-transform [&>svg]:duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    'aria-invalid:focus-visible:ring-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        // The single gold action. Brand DNA §5.2: one primary per screen, and
        // Ember is a hover state only, never a resting colour.
        gold: 'bg-gold text-navy font-semibold shadow-sm hover:bg-ember',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-input bg-background text-on-surface shadow-xs hover:border-navy hover:bg-secondary',
        /**
         * Secondary action on a navy or midnight band. Previously this was
         * patched in at every call site with `border-white/30 bg-transparent
         * text-white`, which drifted between pages. White at 32% on Navy gives
         * a visible edge and the label itself stays at full white for contrast.
         */
        onDark:
          'border border-white/32 bg-transparent text-white hover:border-gold hover:bg-white/10',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'text-on-surface hover:bg-secondary',
        link: 'text-primary underline underline-offset-4 decoration-1 hover:decoration-2',
      },
      size: {
        clear: '',
        // 44px minimum on the two sizes used for real touch targets.
        default: 'min-h-11 px-5 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 rounded-md px-3.5 has-[>svg]:px-3',
        lg: 'min-h-12 rounded-md px-6 py-3 text-body-m has-[>svg]:px-5',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  className,
  size,
  variant,
  loading = false,
  disabled,
  children,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }

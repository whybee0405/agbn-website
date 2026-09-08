/**
 * Utility functions for UI components automatically added by ShadCN and used in a few of our frontend components and blocks.
 *
 * Other functions may be exported from here in the future or by installing other shadcn components.
 */

import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge resolves conflicts using a built-in map of Tailwind's default
 * scales. It has no way to know about the custom scales declared in
 * `globals.css`, so out of the box it reads `text-display-l` as a *colour*
 * (the same group as `text-navy`) and silently drops one of them. That made
 * every `cn('text-display-l', 'text-navy')` render at body size.
 *
 * Registering the custom scales here fixes it for every call site, including
 * ones written later.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Font sizes declared as `--text-*` in the @theme block.
      'font-size': [
        {
          text: [
            'caption',
            'body-s',
            'body-m',
            'body-l',
            'lede',
            'display-s',
            'display-m',
            'display-l',
            'display-xl',
          ],
        },
      ],
      // Semantic colours declared as `--color-*` in the @theme inline block.
      'text-color': [
        {
          text: [
            'on-surface',
            'on-surface-muted',
            'on-surface-accent',
            'on-surface-heading',
            'on-dark',
            'on-dark-muted',
            'on-dark-error',
            'navy',
            'midnight',
            'gold',
            'ember',
            'savanna',
            'clay',
          ],
        },
      ],
      'bg-color': [
        {
          bg: [
            'surface-page',
            'surface-sunken',
            'surface-raised',
            'surface-brand',
            'surface-deep',
            'navy',
            'midnight',
            'gold',
            'ember',
            'savanna',
            'clay',
          ],
        },
      ],
      'border-color': [{ border: ['hairline', 'hairline-dark', 'navy', 'gold', 'savanna', 'clay'] }],
      tracking: [{ tracking: ['display', 'display-tight'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Minimal native <select> wrapper. Native gives us platform-correct keyboard
 * behavior and an OS-native dropdown menu — better UX than a custom popover
 * for what is essentially a dropdown of preset values.
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full appearance-none rounded-md border bg-[var(--color-elevated)]',
      'pl-3 pr-8 py-1 text-sm text-[var(--color-fg)]',
      'transition-colors duration-150',
      'hover:border-[var(--color-muted-fg)]/40',
      'focus-visible:outline-none focus-visible:border-[var(--color-accent)]',
      'focus-visible:[box-shadow:var(--shadow-ring)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'bg-[image:linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)]',
      'bg-[size:5px_5px,5px_5px]',
      'bg-[position:calc(100%-14px)_calc(50%-2px),calc(100%-9px)_calc(50%-2px)]',
      'bg-no-repeat',
      className,
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export { Select }

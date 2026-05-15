import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group relative isolate overflow-hidden rounded-lg border',
        'bg-[var(--color-card)] text-[var(--color-card-fg)]',
        '[box-shadow:var(--shadow-soft)] transition-shadow duration-300',
        'hover:[box-shadow:var(--shadow-lifted)]',
        // Hairline oxblood top border, animated in on hover —
        // an editorial "marker ribbon" effect.
        'before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-0',
        'before:h-px before:bg-[var(--color-accent-line)]',
        'before:scale-x-0 before:origin-left',
        'before:transition-transform before:duration-500',
        'hover:before:scale-x-100',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4', className)}
      {...props}
    />
  ),
)
CardHeader.displayName = 'CardHeader'

/** Small-caps editorial label above a CardTitle (e.g. "§ 02 · Matrices"). */
const CardKicker = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('kicker', className)} {...props} />
))
CardKicker.displayName = 'CardKicker'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-serif text-[1.45rem] leading-[1.1] tracking-tight text-[var(--color-fg)]',
      '[font-variation-settings:"opsz"_36,"SOFT"_30,"WONK"_0]',
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[0.8125rem] leading-[1.55] text-[var(--color-muted-fg)]',
      className,
    )}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 pb-6 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardKicker, CardTitle, CardDescription, CardContent }

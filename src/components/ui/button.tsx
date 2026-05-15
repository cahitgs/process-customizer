import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
    'rounded-md text-sm font-medium',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none ring-accent-soft',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-[var(--color-accent)] text-[var(--color-accent-fg)]',
          'hover:brightness-110',
          '[box-shadow:0_1px_2px_oklch(0%_0_0/0.08)]',
        ),
        outline: cn(
          'border bg-[var(--color-card)] text-[var(--color-fg)]',
          'hover:bg-[var(--color-muted)] hover:border-[var(--color-muted-fg)]/40',
          '[box-shadow:var(--shadow-soft)]',
        ),
        ghost: 'bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-muted)]',
        destructive: cn(
          'bg-[var(--color-danger)] text-white',
          'hover:brightness-110',
        ),
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

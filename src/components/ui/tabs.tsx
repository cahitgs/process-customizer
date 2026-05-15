import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center gap-0.5 rounded-lg',
      'border bg-[var(--color-muted)]/60 p-1 text-[var(--color-muted-fg)]',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap',
      'rounded-md px-3 py-1 text-sm font-medium transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
      'disabled:pointer-events-none disabled:opacity-50',
      'hover:text-[var(--color-fg)]',
      'data-[state=active]:bg-[var(--color-card)] data-[state=active]:text-[var(--color-fg)]',
      'data-[state=active]:[box-shadow:0_1px_2px_oklch(0%_0_0/0.08)]',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none',
      'data-[state=inactive]:hidden',
      'data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:duration-200',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

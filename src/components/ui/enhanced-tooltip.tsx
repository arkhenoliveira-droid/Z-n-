'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Enhanced tooltip with additional features
interface EnhancedTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  delay?: number
  disabled?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
  contentClassName?: string
  showArrow?: boolean
}

export function EnhancedTooltip({
  content,
  children,
  delay = 300,
  disabled = false,
  side = 'top',
  align = 'center',
  className,
  contentClassName,
  showArrow = true
}: EnhancedTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delay} disableHoverableContent={disabled}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            'max-w-xs',
            showArrow && 'relative',
            contentClassName
          )}
        >
          {content}
          {showArrow && (
            <TooltipPrimitive.Arrow className="fill-current text-popover" />
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Tooltip with rich content support
interface RichTooltipProps {
  title?: string
  content: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  icon?: React.ReactNode
  delay?: number
  disabled?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  width?: string
}

export function RichTooltip({
  title,
  content,
  children,
  footer,
  icon,
  delay = 300,
  disabled = false,
  side = 'top',
  width = '300px'
}: RichTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delay} disableHoverableContent={disabled}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="p-0"
          style={{ width }}
        >
          <div className="p-4 space-y-2">
            {(title || icon) && (
              <div className="flex items-center gap-2 border-b pb-2">
                {icon && (
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                )}
                {title && (
                  <h4 className="font-medium text-sm leading-none">
                    {title}
                  </h4>
                )}
              </div>
            )}

            <div className="text-sm">
              {content}
            </div>

            {footer && (
              <div className="pt-2 border-t">
                {footer}
              </div>
            )}
          </div>
          <TooltipPrimitive.Arrow className="fill-current text-popover" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Interactive tooltip that stays open on hover
interface InteractiveTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  trigger?: 'hover' | 'click'
  delay?: number
  disabled?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  width?: string
}

export function InteractiveTooltip({
  content,
  children,
  trigger = 'hover',
  delay = 300,
  disabled = false,
  side = 'top',
  width = '300px'
}: InteractiveTooltipProps) {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!disabled) {
      setOpen(newOpen)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip
        open={open}
        onOpenChange={handleOpenChange}
        delayDuration={delay}
        disableHoverableContent={disabled}
      >
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="p-0"
          style={{ width }}
          onMouseEnter={() => trigger === 'hover' && setOpen(true)}
          onMouseLeave={() => trigger === 'hover' && setOpen(false)}
        >
          <div className="p-4">
            {content}
          </div>
          <TooltipPrimitive.Arrow className="fill-current text-popover" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
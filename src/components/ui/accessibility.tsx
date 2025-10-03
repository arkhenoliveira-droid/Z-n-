'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Skip to main content link for keyboard navigation
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium z-50"
    >
      Skip to main content
    </a>
  )
}

// Visually hidden text for screen readers
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Announcer for live region updates
interface AnnouncerProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
}

export function Announcer({ message, politeness = 'polite' }: AnnouncerProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Focus trap for modals and dialogs
interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
}

export function FocusTrap({ children, active }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first element when trap is activated
    firstElement.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// Keyboard navigation helper
interface UseKeyboardNavigationProps {
  onEnter?: () => void
  onSpace?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onHome?: () => void
  onEnd?: () => void
}

export function useKeyboardNavigation({
  onEnter,
  onSpace,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onHome,
  onEnd
}: UseKeyboardNavigationProps) {
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        onEnter?.()
        break
      case ' ':
        e.preventDefault()
        onSpace?.()
        break
      case 'Escape':
        e.preventDefault()
        onEscape?.()
        break
      case 'ArrowUp':
        e.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        e.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowLeft':
        e.preventDefault()
        onArrowLeft?.()
        break
      case 'ArrowRight':
        e.preventDefault()
        onArrowRight?.()
        break
      case 'Home':
        e.preventDefault()
        onHome?.()
        break
      case 'End':
        e.preventDefault()
        onEnd?.()
        break
    }
  }, [onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onHome, onEnd])

  return { handleKeyDown }
}

// Accessible button that handles keyboard events
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function AccessibleButton({
  children,
  disabled,
  loading,
  icon,
  iconPosition = 'left',
  variant = 'default',
  size = 'md',
  className,
  ...props
}: AccessibleButtonProps) {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: props.onClick as (() => void) || undefined,
    onSpace: props.onClick as (() => void) || undefined
  })

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    {
      'h-9 px-4 py-2': size === 'md',
      'h-8 px-3 py-1 text-xs': size === 'sm',
      'h-10 px-6 py-2 text-base': size === 'lg',
    },
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
      'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
    },
    className
  )

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      onKeyDown={handleKeyDown}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}

      {children}

      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

// Accessible card with proper heading structure
interface AccessibleCardProps {
  title: string
  titleLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function AccessibleCard({
  title,
  titleLevel = 'h3',
  description,
  children,
  actions,
  className
}: AccessibleCardProps) {
  const TitleTag = titleLevel

  return (
    <article className={cn('border rounded-lg bg-card text-card-foreground shadow-sm', className)}>
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <TitleTag className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </TitleTag>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
        {children}
      </div>
    </article>
  )
}

// Color contrast checker utility
export function checkColorContrast(
  textColor: string,
  backgroundColor: string,
  minimumRatio: number = 4.5
): { passes: boolean; ratio: number } {
  // This is a simplified version - in production, you'd want a more robust implementation
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const sRGB = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }

  const luminance1 = getLuminance(textColor)
  const luminance2 = getLuminance(backgroundColor)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  const ratio = (lighter + 0.05) / (darker + 0.05)

  return {
    passes: ratio >= minimumRatio,
    ratio
  }
}

// Screen reader only utilities
export const srOnly = {
  className: 'sr-only'
}

export const focusVisible = {
  className: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
}

export const focusRing = {
  className: 'ring-2 ring-ring ring-offset-2'
}
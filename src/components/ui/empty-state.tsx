'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
  variant?: 'default' | 'card' | 'minimal'
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const baseClasses = cn(
    'flex flex-col items-center justify-center text-center p-8',
    variant === 'card' && 'rounded-lg border bg-card',
    variant === 'minimal' && 'py-12',
    className
  )

  const iconClasses = cn(
    'mb-4',
    variant === 'minimal' ? 'h-8 w-8' : 'h-12 w-12'
  )

  const titleClasses = cn(
    'font-semibold',
    variant === 'minimal' ? 'text-base' : 'text-lg'
  )

  const descriptionClasses = cn(
    'text-muted-foreground mt-2 max-w-md',
    variant === 'minimal' ? 'text-sm' : 'text-sm'
  )

  return (
    <div className={baseClasses}>
      <div className={cn(
        'text-muted-foreground',
        variant === 'minimal' ? 'opacity-60' : 'opacity-80'
      )}>
        {icon}
      </div>

      <h3 className={titleClasses}>{title}</h3>

      {description && (
        <p className={descriptionClasses}>{description}</p>
      )}

      {actions && (
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
interface EmptyStateConfig {
  title: string
  description: string
  icon: React.ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'outline' | 'ghost'
  }
}

export const emptyStates = {
  noData: {
    title: 'No Data Available',
    description: 'There is no data to display at this time.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    )
  },

  noResults: {
    title: 'No Results Found',
    description: 'We couldn\'t find any results matching your search criteria.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },

  noWebhooks: {
    title: 'No Webhooks Created',
    description: 'Get started by creating your first webhook endpoint.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    primaryAction: {
      label: 'Create Webhook',
      onClick: () => {},
      variant: 'default' as const
    }
  },

  noChannels: {
    title: 'No Channels Configured',
    description: 'Set up your first notification channel to start receiving alerts.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    primaryAction: {
      label: 'Add Channel',
      onClick: () => {},
      variant: 'default' as const
    }
  },

  noAlerts: {
    title: 'No Alerts Yet',
    description: 'Alerts will appear here when your webhooks receive data.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
      </svg>
    )
  },

  error: {
    title: 'Something Went Wrong',
    description: 'An error occurred while loading the data. Please try again.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    primaryAction: {
      label: 'Try Again',
      onClick: () => {},
      variant: 'default' as const
    }
  },

  offline: {
    title: 'You\'re Offline',
    description: 'Check your internet connection and try again.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    primaryAction: {
      label: 'Retry',
      onClick: () => {},
      variant: 'default' as const
    }
  }
}

// Helper component for pre-configured empty states
interface ConfiguredEmptyStateProps {
  type: keyof typeof emptyStates
  className?: string
  variant?: 'default' | 'card' | 'minimal'
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

export function ConfiguredEmptyState({
  type,
  className,
  variant = 'default',
  onPrimaryAction,
  onSecondaryAction
}: ConfiguredEmptyStateProps) {
  const config = emptyStates[type]

  const actions = (
    <>
      {config.primaryAction && (
        <Button
          variant={config.primaryAction.variant || 'default'}
          onClick={onPrimaryAction || config.primaryAction.onClick}
        >
          {config.primaryAction.label}
        </Button>
      )}
      {config.secondaryAction && (
        <Button
          variant={config.secondaryAction.variant || 'outline'}
          onClick={onSecondaryAction || config.secondaryAction.onClick}
        >
          {config.secondaryAction.label}
        </Button>
      )}
    </>
  )

  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      actions={actions}
      className={className}
      variant={variant}
    />
  )
}
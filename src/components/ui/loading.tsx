'use client'

import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse'
  className?: string
  text?: string
}

export function Loading({
  size = 'md',
  variant = 'spinner',
  className,
  text
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const containerClasses = cn(
    'flex items-center justify-center',
    className
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'bg-current rounded-full animate-bounce',
                  sizeClasses[size],
                  i === 1 ? 'animation-delay-100' : 'animation-delay-200'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'bg-current animate-pulse',
                  size === 'sm' ? 'h-2 w-1' :
                  size === 'md' ? 'h-4 w-2' :
                  size === 'lg' ? 'h-6 w-3' : 'h-8 w-4'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <div className={cn(
            'bg-current rounded-full animate-pulse',
            sizeClasses[size]
          )} />
        )

      default:
        return (
          <div className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size]
          )} />
        )
    }
  }

  return (
    <div className={containerClasses}>
      {renderLoader()}
      {text && (
        <span className="ml-2 text-sm text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  )
}

// Skeleton loading component
interface SkeletonProps {
  className?: string
  lines?: number
  animate?: boolean
}

export function Skeleton({
  className,
  lines = 1,
  animate = true
}: SkeletonProps) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-muted rounded',
            animate && 'animate-pulse',
            lines === 1 ? 'h-4' : `h-${4 + i * 2}`,
            className
          )}
        />
      ))}
    </div>
  )
}

// Card skeleton component
interface CardSkeletonProps {
  className?: string
  showHeader?: boolean
  showContent?: boolean
  lines?: number
}

export function CardSkeleton({
  className,
  showHeader = true,
  showContent = true,
  lines = 3
}: CardSkeletonProps) {
  return (
    <div className={cn('border rounded-lg p-6 space-y-4', className)}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      {showContent && (
        <div className="space-y-2">
          {[...Array(lines)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      )}
    </div>
  )
}

// Page loading component
interface PageLoadingProps {
  message?: string
  className?: string
}

export function PageLoading({
  message = 'Loading...',
  className
}: PageLoadingProps) {
  return (
    <div className={cn(
      'min-h-[400px] flex items-center justify-center',
      className
    )}>
      <div className="text-center space-y-4">
        <Loading size="xl" variant="spinner" />
        <p className="text-lg font-medium text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  )
}
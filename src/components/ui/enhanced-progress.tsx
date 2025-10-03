'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Enhanced progress with label and percentage
interface EnhancedProgressProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  animated?: boolean
  className?: string
}

export function EnhancedProgress({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  variant = 'default',
  animated = true,
  className
}: EnhancedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }

  const variantColors = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500'
  }

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
          )}
          {showValue && (
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <ProgressPrimitive.Root
          className={cn(
            'relative overflow-hidden rounded-full bg-secondary',
            sizeClasses[size]
          )}
          value={percentage}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full w-full flex-1 transition-all duration-300 ease-in-out',
              variantColors[variant],
              animated && 'animate-pulse'
            )}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </ProgressPrimitive.Root>

        {/* Progress markers */}
        {max === 100 && (
          <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
            {[25, 50, 75].map((marker) => (
              <div
                key={marker}
                className="w-px h-3 bg-background/30"
                style={{ left: `${marker}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Circular progress component
interface CircularProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  strokeWidth?: number
  showValue?: boolean
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  strokeWidth = 8,
  showValue = true,
  label,
  variant = 'default',
  className
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = 50 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const variantColors = {
    default: 'text-primary',
    success: 'text-green-500',
    warning: 'text-orange-500',
    error: 'text-red-500'
  }

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          className="transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-secondary opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300 ease-in-out',
              variantColors[variant]
            )}
          />
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>

      {label && (
        <span className="text-sm text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  )
}

// Progress with steps
interface StepProgressProps {
  steps: Array<{
    id: string
    label: string
    completed?: boolean
    current?: boolean
  }>
  className?: string
}

export function StepProgress({ steps, className }: StepProgressProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.completed
          const isCurrent = step.current
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors duration-200',
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'border-blue-500 text-blue-500 bg-blue-50'
                      : 'border-gray-300 text-gray-400 bg-white'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs text-center max-w-[80px]',
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-[-16px] relative z-[-1]">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// Progress bar with segments
interface SegmentedProgressProps {
  segments: Array<{
    value: number
    color: string
    label?: string
  }>
  total?: number
  showLabels?: boolean
  className?: string
}

export function SegmentedProgress({
  segments,
  total = 100,
  showLabels = false,
  className
}: SegmentedProgressProps) {
  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0)
  const normalizedTotal = totalValue > 0 ? totalValue : total

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary flex">
        {segments.map((segment, index) => {
          const percentage = (segment.value / normalizedTotal) * 100
          return (
            <div
              key={index}
              className="h-full transition-all duration-300 ease-in-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: segment.color
              }}
            />
          )
        })}
      </div>

      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span>{segment.label || `Segment ${index + 1}`}</span>
              <span className="font-medium">({segment.value})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { Progress }
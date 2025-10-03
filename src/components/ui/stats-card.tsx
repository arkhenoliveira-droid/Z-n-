'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  progress?: {
    value: number
    label?: string
    color?: string
  }
  variant?: 'default' | 'gradient' | 'minimal'
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  progress,
  variant = 'default',
  className
}: StatsCardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
      case 'minimal':
        return 'border-0 shadow-none bg-transparent'
      default:
        return 'shadow-md hover:shadow-lg transition-shadow duration-300'
    }
  }

  const getTitleClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'text-sm font-medium text-blue-100'
      case 'minimal':
        return 'text-xs font-medium text-muted-foreground'
      default:
        return 'text-sm font-medium text-muted-foreground'
    }
  }

  const getValueClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'text-3xl font-bold text-white'
      case 'minimal':
        return 'text-2xl font-bold'
      default:
        return 'text-3xl font-bold'
    }
  }

  const getDescriptionClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'text-xs text-blue-100'
      case 'minimal':
        return 'text-xs text-muted-foreground'
      default:
        return 'text-xs text-muted-foreground'
    }
  }

  const renderTrend = () => {
    if (!trend) return null

    const TrendIcon = trend.isPositive ? TrendingUp : trend.value === 0 ? Minus : TrendingDown
    const trendColor = trend.isPositive ? 'text-green-500' : trend.value === 0 ? 'text-gray-500' : 'text-red-500'

    return (
      <div className={cn('flex items-center gap-1', variant === 'gradient' ? 'text-blue-100' : trendColor)}>
        <TrendIcon className="h-3 w-3" />
        <span className="text-xs font-medium">
          {trend.isPositive ? '+' : ''}{trend.value}%
        </span>
        {trend.label && (
          <span className="text-xs opacity-80">{trend.label}</span>
        )}
      </div>
    )
  }

  const renderProgress = () => {
    if (!progress) return null

    const progressColor = progress.color || (variant === 'gradient' ? 'bg-blue-400' : 'bg-blue-600')

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className={variant === 'gradient' ? 'text-blue-100' : 'text-muted-foreground'}>
            {progress.label || 'Progress'}
          </span>
          <span className={variant === 'gradient' ? 'text-blue-100' : 'text-muted-foreground'}>
            {progress.value}%
          </span>
        </div>
        <Progress
          value={progress.value}
          className={cn('h-2', variant === 'gradient' ? 'bg-blue-400' : '')}
        />
      </div>
    )
  }

  return (
    <Card className={cn(getCardClasses(), className)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn('flex items-center gap-2', getTitleClasses())}>
          {icon && (
            <div className={variant === 'gradient' ? 'bg-blue-400/20 p-2 rounded-lg' : ''}>
              {icon}
            </div>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={getValueClasses()}>{value}</div>
          {icon && variant === 'default' && (
            <div className="bg-muted/50 p-2 rounded-lg">
              {icon}
            </div>
          )}
        </div>

        {(description || trend) && (
          <div className="mt-2 flex items-center justify-between">
            {description && (
              <p className={getDescriptionClasses()}>{description}</p>
            )}
            {trend && renderTrend()}
          </div>
        )}

        {progress && renderProgress()}
      </CardContent>
    </Card>
  )
}

// Stats grid component for displaying multiple stats cards
export interface StatsGridProps {
  stats: StatsCardProps[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-4 md:gap-6', gridClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}
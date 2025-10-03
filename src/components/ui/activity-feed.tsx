'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Zap,
  Bell,
  Activity,
  TrendingUp,
  Users,
  Clock,
  MoreVertical,
  Filter,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActivityItem {
  id: string
  type: 'webhook' | 'channel' | 'alert' | 'user' | 'system'
  action: 'created' | 'updated' | 'deleted' | 'received' | 'delivered' | 'failed' | 'processed'
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, any>
  severity?: 'low' | 'medium' | 'high'
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  className?: string
  maxHeight?: string
  showHeader?: boolean
  searchable?: boolean
  filterable?: boolean
  realtime?: boolean
}

export function ActivityFeed({
  activities,
  className,
  maxHeight = '400px',
  showHeader = true,
  searchable = true,
  filterable = true,
  realtime = false
}: ActivityFeedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedAction, setSelectedAction] = useState<string>('all')

  const getActivityIcon = (type: string) => {
    const iconClasses = "h-4 w-4"
    switch (type) {
      case 'webhook': return <Zap className={iconClasses} />
      case 'channel': return <Bell className={iconClasses} />
      case 'alert': return <Activity className={iconClasses} />
      case 'user': return <Users className={iconClasses} />
      case 'system': return <TrendingUp className={iconClasses} />
      default: return <Activity className={iconClasses} />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'webhook': return 'text-blue-600 dark:text-blue-400'
      case 'channel': return 'text-green-600 dark:text-green-400'
      case 'alert': return 'text-orange-600 dark:text-orange-400'
      case 'user': return 'text-purple-600 dark:text-purple-400'
      case 'system': return 'text-gray-600 dark:text-gray-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800 border-green-200'
      case 'updated': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deleted': return 'bg-red-100 text-red-800 border-red-200'
      case 'received': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'processed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-orange-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-transparent'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === 'all' || activity.type === selectedType
    const matchesAction = selectedAction === 'all' || activity.action === selectedAction

    return matchesSearch && matchesType && matchesAction
  })

  const uniqueTypes = [...new Set(activities.map(a => a.type))]
  const uniqueActions = [...new Set(activities.map(a => a.action))]

  return (
    <Card className={cn('shadow-md', className)}>
      {showHeader && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>Activity Feed</span>
              {realtime && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardTitle>

          {(searchable || filterable) && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {searchable && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {filterable && (
                <div className="flex gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Actions</option>
                    {uniqueActions.map(action => (
                      <option key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent>
        <ScrollArea className={cn('pr-4', maxHeight)} style={{ maxHeight }}>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                {searchTerm || selectedType !== 'all' || selectedAction !== 'all'
                  ? 'No activities match your filters'
                  : 'No activities yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border-l-4 bg-muted/30 hover:bg-muted/50 transition-colors duration-200',
                    getSeverityColor(activity.severity)
                  )}
                >
                  <div className={cn('mt-0.5', getActivityColor(activity.type))}>
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {activity.title}
                      </p>
                      <Badge variant="outline" className={cn('text-xs', getActionColor(activity.action))}>
                        {activity.action}
                      </Badge>
                    </div>

                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>

                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            +{Object.keys(activity.metadata).length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
import { ActivityFeed } from '@/components/ui/activity-feed'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Bell, Activity, TrendingUp, Clock, Users } from 'lucide-react'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

interface DashboardStats {
  totalWebhooks: number
  activeWebhooks: number
  totalChannels: number
  activeChannels: number
  totalAlerts: number
  recentAlerts: number
  successRate: number
}

interface RealTimeStatsProps {
  initialStats: DashboardStats
}

export default function RealTimeStats({ initialStats }: RealTimeStatsProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    type: string
    action: string
    title: string
    description?: string
    timestamp: string
    severity?: string
  }>>([])
  const { isConnected, lastEvent } = useRealTimeUpdates()

  useEffect(() => {
    if (lastEvent) {
      // Update stats based on the event
      setStats(prevStats => {
        const newStats = { ...prevStats }

        switch (lastEvent.type) {
          case 'webhook':
            if (lastEvent.action === 'created') {
              newStats.totalWebhooks++
              newStats.activeWebhooks++
            } else if (lastEvent.action === 'deleted') {
              newStats.totalWebhooks--
              if (lastEvent.data.isActive) {
                newStats.activeWebhooks--
              }
            } else if (lastEvent.action === 'updated') {
              if (lastEvent.data.isActive !== undefined) {
                if (lastEvent.data.isActive) {
                  newStats.activeWebhooks++
                } else {
                  newStats.activeWebhooks--
                }
              }
            }
            break

          case 'channel':
            if (lastEvent.action === 'created') {
              newStats.totalChannels++
              newStats.activeChannels++
            } else if (lastEvent.action === 'deleted') {
              newStats.totalChannels--
              if (lastEvent.data.isActive) {
                newStats.activeChannels--
              }
            } else if (lastEvent.action === 'updated') {
              if (lastEvent.data.isActive !== undefined) {
                if (lastEvent.data.isActive) {
                  newStats.activeChannels++
                } else {
                  newStats.activeChannels--
                }
              }
            }
            break

          case 'alert':
            if (lastEvent.action === 'received') {
              newStats.totalAlerts++
              newStats.recentAlerts++
            } else if (lastEvent.action === 'delivered') {
              // Update success rate
              const successRate = Math.min(100, newStats.successRate + 1)
              newStats.successRate = successRate
            } else if (lastEvent.action === 'failed') {
              // Update success rate
              const successRate = Math.max(0, newStats.successRate - 2)
              newStats.successRate = successRate
            }
            break

          case 'stats':
            if (lastEvent.data) {
              Object.assign(newStats, lastEvent.data)
            }
            break
        }

        return newStats
      })

      // Add to recent activity
      setRecentActivity(prev => {
        const activity = {
          id: `${Date.now()}-${Math.random()}`,
          type: lastEvent.type,
          action: lastEvent.action,
          title: getActivityTitle(lastEvent),
          description: getActivityDescription(lastEvent),
          timestamp: lastEvent.timestamp,
          severity: getActivitySeverity(lastEvent)
        }

        // Keep only last 20 activities
        return [activity, ...prev].slice(0, 20)
      })
    }
  }, [lastEvent])

  const getActivityTitle = (event: any) => {
    switch (event.type) {
      case 'webhook':
        return `Webhook "${event.data.name}"`
      case 'channel':
        return `Channel "${event.data.name}"`
      case 'alert':
        return `Alert for webhook "${event.data.webhookName || 'Unknown'}"`
      default:
        return `${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`
    }
  }

  const getActivityDescription = (event: any) => {
    switch (event.action) {
      case 'created': return 'was created'
      case 'updated': return 'was updated'
      case 'deleted': return 'was deleted'
      case 'received': return 'was received'
      case 'delivered': return 'was delivered successfully'
      case 'failed': return 'failed to deliver'
      case 'processed': return 'was processed'
      default: return event.action
    }
  }

  const getActivitySeverity = (event: any) => {
    switch (event.action) {
      case 'failed': return 'high'
      case 'created': return 'low'
      case 'deleted': return 'medium'
      default: return undefined
    }
  }

  // Calculate trends (mock data for demonstration)
  const webhookTrend = {
    value: 12,
    isPositive: true,
    label: 'vs last week'
  }

  const channelTrend = {
    value: 8,
    isPositive: true,
    label: 'vs last week'
  }

  const alertTrend = {
    value: 5,
    isPositive: true,
    label: 'vs last hour'
  }

  const successRateTrend = {
    value: 2,
    isPositive: true,
    label: 'improvement'
  }

  const statsData = [
    {
      title: 'Total Webhooks',
      value: stats.totalWebhooks,
      description: `${stats.activeWebhooks} active`,
      icon: <Zap className="h-5 w-5" />,
      trend: webhookTrend,
      progress: {
        value: stats.totalWebhooks > 0 ? (stats.activeWebhooks / stats.totalWebhooks) * 100 : 0,
        label: 'Active Rate'
      },
      variant: 'gradient' as const
    },
    {
      title: 'Notification Channels',
      value: stats.activeChannels,
      description: `${stats.totalChannels} total`,
      icon: <Bell className="h-5 w-5" />,
      trend: channelTrend,
      progress: {
        value: stats.totalChannels > 0 ? (stats.activeChannels / stats.totalChannels) * 100 : 0,
        label: 'Active Rate'
      },
      variant: 'gradient' as const
    },
    {
      title: 'Total Alerts',
      value: stats.totalAlerts,
      description: `${stats.recentAlerts} recent`,
      icon: <Activity className="h-5 w-5" />,
      trend: alertTrend,
      variant: 'gradient' as const
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      trend: successRateTrend,
      progress: {
        value: stats.successRate,
        label: 'Delivery Rate'
      },
      variant: 'gradient' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                Real-time Updates {isConnected ? 'Active' : 'Disconnected'}
              </span>
            </div>
            {recentActivity.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {recentActivity.length} recent activities
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Cards */}
      <StatsGrid stats={statsData} columns={4} />

      {/* Enhanced Activity Feed */}
      <ActivityFeed
        activities={recentActivity}
        maxHeight="400px"
        searchable={true}
        filterable={true}
        realtime={isConnected}
      />
    </div>
  )
}
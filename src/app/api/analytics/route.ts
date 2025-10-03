import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get alert trends over time
    const alertTrends = await db.alert.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        status: 'asc'
      }
    })

    // Get daily alert counts for the last 30 days
    const dailyAlerts = await db.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
      FROM Alert
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    ` as Array<{ date: string; count: number; delivered: number; failed: number }>

    // Get webhook performance metrics
    const webhookPerformance = await db.webhook.findMany({
      select: {
        id: true,
        name: true,
        endpoint: true,
        isActive: true,
        _count: {
          select: {
            alerts: true
          }
        },
        alerts: {
          where: {
            createdAt: {
              gte: startDate
            }
          },
          select: {
            status: true,
            deliveries: {
              select: {
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    })

    // Process webhook performance data
    const processedWebhookPerformance = webhookPerformance.map(webhook => {
      const recentAlerts = webhook.alerts
      const totalRecentAlerts = recentAlerts.length
      const deliveredAlerts = recentAlerts.filter(alert =>
        alert.deliveries.some(delivery => delivery.status === 'SENT')
      ).length
      const failedAlerts = recentAlerts.filter(alert =>
        alert.deliveries.some(delivery => delivery.status === 'FAILED')
      ).length

      return {
        id: webhook.id,
        name: webhook.name,
        endpoint: webhook.endpoint,
        isActive: webhook.isActive,
        totalAlerts: webhook._count.alerts,
        recentAlerts: totalRecentAlerts,
        successRate: totalRecentAlerts > 0 ? Math.round((deliveredAlerts / totalRecentAlerts) * 100) : 0
      }
    })

    // Get channel performance metrics
    const channelPerformance = await db.alertChannel.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        _count: {
          select: {
            deliveries: true
          }
        },
        deliveries: {
          where: {
            createdAt: {
              gte: startDate
            }
          },
          select: {
            status: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Process channel performance data
    const processedChannelPerformance = channelPerformance.map(channel => {
      const recentDeliveries = channel.deliveries
      const totalRecentDeliveries = recentDeliveries.length
      const successfulDeliveries = recentDeliveries.filter(delivery => delivery.status === 'SENT').length
      const failedDeliveries = recentDeliveries.filter(delivery => delivery.status === 'FAILED').length

      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        isActive: channel.isActive,
        totalDeliveries: channel._count.deliveries,
        recentDeliveries: totalRecentDeliveries,
        successRate: totalRecentDeliveries > 0 ? Math.round((successfulDeliveries / totalRecentDeliveries) * 100) : 0
      }
    })

    // Get top performing webhooks by alert volume
    const topWebhooks = await db.webhook.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            alerts: true
          }
        }
      },
      orderBy: {
        alerts: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Get response time metrics (average time from alert creation to delivery)
    const responseTimeStats = await db.$queryRaw`
      SELECT
        AVG(julianday(sentAt) - julianday(createdAt)) * 24 * 60 * 60 as avgResponseTimeSeconds,
        MIN(julianday(sentAt) - julianday(createdAt)) * 24 * 60 * 60 as minResponseTimeSeconds,
        MAX(julianday(sentAt) - julianday(createdAt)) * 24 * 60 * 60 as maxResponseTimeSeconds
      FROM AlertDelivery
      WHERE sentAt IS NOT NULL
        AND createdAt >= ${startDate}
    ` as Array<{
      avgResponseTimeSeconds: number | null
      minResponseTimeSeconds: number | null
      maxResponseTimeSeconds: number | null
    }>

    const analytics = {
      alertTrends,
      dailyAlerts: dailyAlerts.map(day => ({
        date: day.date,
        total: day.count,
        delivered: day.delivered,
        failed: day.failed,
        successRate: day.count > 0 ? Math.round((day.delivered / day.count) * 100) : 0
      })),
      webhookPerformance: processedWebhookPerformance,
      channelPerformance: processedChannelPerformance,
      topWebhooks,
      responseTime: {
        average: responseTimeStats[0]?.avgResponseTimeSeconds || 0,
        minimum: responseTimeStats[0]?.minResponseTimeSeconds || 0,
        maximum: responseTimeStats[0]?.maxResponseTimeSeconds || 0
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
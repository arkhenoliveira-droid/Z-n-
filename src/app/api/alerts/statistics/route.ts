import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total webhooks and active webhooks
    const [totalWebhooks, activeWebhooks] = await Promise.all([
      db.webhook.count(),
      db.webhook.count({
        where: {
          isActive: true
        }
      })
    ])

    // Get total channels and active channels
    const [totalChannels, activeChannels] = await Promise.all([
      db.alertChannel.count(),
      db.alertChannel.count({
        where: {
          isActive: true
        }
      })
    ])

    // Get total alerts
    const totalAlerts = await db.alert.count()

    // Get recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentAlerts = await db.alert.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    })

    // Calculate success rate (delivered vs failed alerts)
    const deliveredAlerts = await db.alertDelivery.count({
      where: {
        status: 'SENT'
      }
    })

    const failedAlerts = await db.alertDelivery.count({
      where: {
        status: 'FAILED'
      }
    })

    const totalDeliveries = deliveredAlerts + failedAlerts
    const successRate = totalDeliveries > 0 ? Math.round((deliveredAlerts / totalDeliveries) * 100) : 100

    const stats = {
      totalWebhooks,
      activeWebhooks,
      totalChannels,
      activeChannels,
      totalAlerts,
      recentAlerts,
      successRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
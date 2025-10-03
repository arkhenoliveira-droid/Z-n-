import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get alerts from the last 24 hours
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const alerts = await db.alert.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 most recent alerts
      include: {
        webhook: {
          select: {
            id: true,
            name: true,
            endpoint: true
          }
        }
      }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching recent alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent alerts' },
      { status: 500 }
    )
  }
}
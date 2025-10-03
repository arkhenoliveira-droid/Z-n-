import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const webhookId = searchParams.get('webhookId')
    const channelId = searchParams.get('channelId')

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (webhookId) {
      where.webhookId = webhookId
    }

    if (channelId) {
      where.deliveries = {
        some: {
          channelId: channelId
        }
      }
    }

    const [alerts, totalCount] = await Promise.all([
      db.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          webhook: {
            select: { id: true, name: true, endpoint: true }
          },
          author: {
            select: { id: true, name: true, email: true }
          },
          deliveries: {
            include: {
              channel: {
                select: { id: true, name: true, type: true }
              }
            }
          }
        }
      }),
      db.alert.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      alerts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhookId, message, rawData, authorId } = body

    if (!webhookId || !message || !authorId) {
      return NextResponse.json(
        { error: 'WebhookId, message, and authorId are required' },
        { status: 400 }
      )
    }

    // Verify webhook exists
    const webhook = await db.webhook.findUnique({
      where: { id: webhookId },
      include: {
        channels: {
          include: {
            channel: true
          }
        }
      }
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Create the alert
    const alert = await db.alert.create({
      data: {
        webhookId,
        message,
        rawData: rawData || JSON.stringify({}),
        authorId
      },
      include: {
        webhook: {
          select: { id: true, name: true, endpoint: true }
        },
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Create delivery records for each active channel
    const deliveries = await Promise.all(
      webhook.channels
        .filter(wc => wc.isActive)
        .map(wc =>
          db.alertDelivery.create({
            data: {
              alertId: alert.id,
              channelId: wc.channelId
            },
            include: {
              channel: {
                select: { id: true, name: true, type: true }
              }
            }
          })
        )
    )

    return NextResponse.json({
      alert,
      deliveries
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
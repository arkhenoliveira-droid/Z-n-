import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  try {
    const webhook = await db.webhook.findUnique({
      where: { id: params.webhookId },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        channels: {
          include: {
            channel: {
              select: { id: true, name: true, type: true, config: true }
            }
          }
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            deliveries: {
              include: {
                channel: {
                  select: { id: true, name: true, type: true }
                }
              }
            }
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

    return NextResponse.json(webhook)
  } catch (error) {
    console.error('Error fetching webhook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  try {
    const body = await request.json()
    const { name, description, isActive, regenerateSecret } = body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    if (regenerateSecret) {
      updateData.secretKey = Math.random().toString(36).substr(2, 16)
    }

    const webhook = await db.webhook.update({
      where: { id: params.webhookId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        channels: {
          include: {
            channel: {
              select: { id: true, name: true, type: true }
            }
          }
        },
        _count: {
          select: { alerts: true }
        }
      }
    })

    return NextResponse.json(webhook)
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  try {
    // First, delete all related alerts and deliveries
    await db.alertDelivery.deleteMany({
      where: {
        alert: {
          webhookId: params.webhookId
        }
      }
    })

    await db.alert.deleteMany({
      where: {
        webhookId: params.webhookId
      }
    })

    // Delete webhook-channel relationships
    await db.webhookAlertChannel.deleteMany({
      where: {
        webhookId: params.webhookId
      }
    })

    // Finally, delete the webhook
    await db.webhook.delete({
      where: { id: params.webhookId }
    })

    return NextResponse.json({ message: 'Webhook deleted successfully' })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}
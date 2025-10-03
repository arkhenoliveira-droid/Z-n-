import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhook = await db.webhook.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, isActive } = body

    const webhook = await db.webhook.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
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
  { params }: { params: { id: string } }
) {
  try {
    await db.webhook.delete({
      where: { id: params.id }
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
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  try {
    const webhookChannels = await db.webhookAlertChannel.findMany({
      where: { webhookId: params.webhookId },
      include: {
        channel: {
          select: { id: true, name: true, type: true, isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(webhookChannels)
  } catch (error) {
    console.error('Error fetching webhook channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook channels' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  try {
    const body = await request.json()
    const { channelId, isActive } = body

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    // Check if the relationship already exists
    const existing = await db.webhookAlertChannel.findUnique({
      where: {
        webhookId_channelId: {
          webhookId: params.webhookId,
          channelId: channelId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Channel is already connected to this webhook' },
        { status: 400 }
      )
    }

    const webhookChannel = await db.webhookAlertChannel.create({
      data: {
        webhookId: params.webhookId,
        channelId,
        isActive: isActive ?? true
      },
      include: {
        channel: {
          select: { id: true, name: true, type: true, isActive: true }
        }
      }
    })

    return NextResponse.json(webhookChannel, { status: 201 })
  } catch (error) {
    console.error('Error creating webhook channel:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook channel' },
      { status: 500 }
    )
  }
}
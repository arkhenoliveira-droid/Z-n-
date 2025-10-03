import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { webhookId: string; channelId: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    const webhookChannel = await db.webhookAlertChannel.update({
      where: {
        webhookId_channelId: {
          webhookId: params.webhookId,
          channelId: params.channelId
        }
      },
      data: {
        ...(isActive !== undefined && { isActive })
      },
      include: {
        channel: {
          select: { id: true, name: true, type: true, isActive: true }
        }
      }
    })

    return NextResponse.json(webhookChannel)
  } catch (error) {
    console.error('Error updating webhook channel:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook channel' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { webhookId: string; channelId: string } }
) {
  try {
    await db.webhookAlertChannel.delete({
      where: {
        webhookId_channelId: {
          webhookId: params.webhookId,
          channelId: params.channelId
        }
      }
    })

    return NextResponse.json({ message: 'Channel disconnected from webhook successfully' })
  } catch (error) {
    console.error('Error deleting webhook channel:', error)
    return NextResponse.json(
      { error: 'Failed to delete webhook channel' },
      { status: 500 }
    )
  }
}
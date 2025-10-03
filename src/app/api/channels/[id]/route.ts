import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const channel = await db.alertChannel.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { deliveries: true }
        }
      }
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error fetching channel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
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
    const { name, config, isActive } = body

    // Validate config if provided
    let parsedConfig
    if (config) {
      try {
        parsedConfig = typeof config === 'string' ? JSON.parse(config) : config
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON configuration' },
          { status: 400 }
        )
      }
    }

    const channel = await db.alertChannel.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(config && { config: JSON.stringify(parsedConfig) }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { deliveries: true }
        }
      }
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error updating channel:', error)
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.alertChannel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Channel deleted successfully' })
  } catch (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// import { emitToConstantsRoom } from '@/lib/socket-global'
import { withSecurity } from '@/lib/securityMiddleware'

async function getWebhooksHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    // Get total count for pagination
    const total = await db.webhook.count({ where })

    // Get paginated data
    const webhooks = await db.webhook.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { updatedAt: 'desc' },
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

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: webhooks,
      total,
      page,
      totalPages,
      limit
    })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    )
  }
}

async function createWebhookHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, authorId } = body

    if (!name || !authorId) {
      return NextResponse.json(
        { error: 'Name and authorId are required' },
        { status: 400 }
      )
    }

    // Generate unique endpoint and secret key
    const endpoint = `/webhook/${Math.random().toString(36).substr(2, 9)}`
    const secretKey = Math.random().toString(36).substr(2, 16)

    const webhook = await db.webhook.create({
      data: {
        name,
        description,
        endpoint,
        secretKey,
        authorId
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

    return NextResponse.json(webhook, { status: 201 })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}

export const GET = getWebhooksHandler

export const POST = createWebhookHandler
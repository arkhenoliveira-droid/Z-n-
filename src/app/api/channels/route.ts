import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const channels = await db.alertChannel.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { deliveries: true }
        }
      }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, config, authorId } = body

    if (!name || !type || !config || !authorId) {
      return NextResponse.json(
        { error: 'Name, type, config, and authorId are required' },
        { status: 400 }
      )
    }

    // Validate config based on channel type
    let parsedConfig
    try {
      parsedConfig = typeof config === 'string' ? JSON.parse(config) : config
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON configuration' },
        { status: 400 }
      )
    }

    // Validate required fields based on channel type
    switch (type) {
      case 'TELEGRAM':
        if (!parsedConfig.botToken || !parsedConfig.chatId) {
          return NextResponse.json(
            { error: 'Telegram channels require botToken and chatId' },
            { status: 400 }
          )
        }
        break
      case 'DISCORD':
        if (!parsedConfig.webhookUrl) {
          return NextResponse.json(
            { error: 'Discord channels require webhookUrl' },
            { status: 400 }
          )
        }
        break
      case 'SLACK':
        if (!parsedConfig.webhookUrl) {
          return NextResponse.json(
            { error: 'Slack channels require webhookUrl' },
            { status: 400 }
          )
        }
        break
      case 'EMAIL':
        if (!parsedConfig.smtp || !parsedConfig.to) {
          return NextResponse.json(
            { error: 'Email channels require smtp configuration and to address' },
            { status: 400 }
          )
        }
        break
      case 'TWITTER':
        if (!parsedConfig.apiKey || !parsedConfig.apiSecret || !parsedConfig.accessToken || !parsedConfig.accessTokenSecret) {
          return NextResponse.json(
            { error: 'Twitter channels require API keys and access tokens' },
            { status: 400 }
          )
        }
        break
    }

    const channel = await db.alertChannel.create({
      data: {
        name,
        type,
        config: JSON.stringify(parsedConfig),
        authorId
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

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
}
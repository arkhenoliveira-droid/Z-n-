import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitToConstantsRoom } from '@/lib/socket-global'

export async function GET() {
  try {
    const constants = await db.globalConstant.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(constants)
  } catch (error) {
    console.error('Error fetching constants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch constants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, format, content, category, environment, isPublic, authorId } = body

    if (!name || !content || !authorId) {
      return NextResponse.json(
        { error: 'Name, content, and authorId are required' },
        { status: 400 }
      )
    }

    // Validate content based on format
    if (format === 'JSON') {
      try {
        JSON.parse(content)
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      }
    }

    const constant = await db.globalConstant.create({
      data: {
        name,
        description,
        format: format || 'KEY_VALUE',
        content,
        category,
        environment: environment || 'default',
        isPublic: isPublic || false,
        authorId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Emit WebSocket event
    emitToConstantsRoom('constant:created', constant)

    return NextResponse.json(constant, { status: 201 })
  } catch (error) {
    console.error('Error creating constant:', error)
    return NextResponse.json(
      { error: 'Failed to create constant' },
      { status: 500 }
    )
  }
}
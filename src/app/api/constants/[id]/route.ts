import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitToConstantsRoom } from '@/lib/socket-global'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const constant = await db.globalConstant.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!constant) {
      return NextResponse.json(
        { error: 'Constant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(constant)
  } catch (error) {
    console.error('Error fetching constant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch constant' },
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
    const { name, description, format, content, category, environment, isPublic } = body

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

    const constant = await db.globalConstant.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(format && { format }),
        ...(content && { content }),
        ...(category !== undefined && { category }),
        ...(environment && { environment }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Emit WebSocket event
    emitToConstantsRoom('constant:updated', constant)

    return NextResponse.json(constant)
  } catch (error) {
    console.error('Error updating constant:', error)
    return NextResponse.json(
      { error: 'Failed to update constant' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.globalConstant.delete({
      where: { id: params.id }
    })

    // Emit WebSocket event
    emitToConstantsRoom('constant:deleted', { id: params.id })

    return NextResponse.json({ message: 'Constant deleted successfully' })
  } catch (error) {
    console.error('Error deleting constant:', error)
    return NextResponse.json(
      { error: 'Failed to delete constant' },
      { status: 500 }
    )
  }
}
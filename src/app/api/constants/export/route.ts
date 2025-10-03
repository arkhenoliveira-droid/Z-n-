import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // Format for export
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      constants: constants.map(constant => ({
        name: constant.name,
        description: constant.description,
        format: constant.format,
        content: constant.content,
        category: constant.category,
        environment: constant.environment,
        isPublic: constant.isPublic,
        createdAt: constant.createdAt,
        updatedAt: constant.updatedAt
      }))
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error exporting constants:', error)
    return NextResponse.json(
      { error: 'Failed to export constants' },
      { status: 500 }
    )
  }
}
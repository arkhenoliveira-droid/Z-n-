import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface ImportConstant {
  name: string
  description?: string
  format: 'KEY_VALUE' | 'JSON'
  content: string
  category?: string
  environment: string
  isPublic: boolean
}

interface ImportData {
  version?: string
  constants: ImportConstant[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { constants: importConstants, version }: ImportData = body

    if (!importConstants || !Array.isArray(importConstants)) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      errors: 0,
      errorMessages: [] as string[]
    }

    for (let i = 0; i < importConstants.length; i++) {
      const constant = importConstants[i]

      try {
        // Validate required fields
        if (!constant.name || !constant.content) {
          results.errors++
          results.errorMessages.push(`Constant ${i + 1}: Missing required fields (name or content)`)
          continue
        }

        // Validate content based on format
        if (constant.format === 'JSON') {
          try {
            JSON.parse(constant.content)
          } catch {
            results.errors++
            results.errorMessages.push(`Constant ${i + 1} (${constant.name}): Invalid JSON format`)
            continue
          }
        }

        // Check if constant with same name and environment already exists
        const existingConstant = await db.globalConstant.findFirst({
          where: {
            name: constant.name,
            environment: constant.environment || 'default'
          }
        })

        if (existingConstant) {
          // Skip or update existing constant (for now, we'll skip)
          results.errors++
          results.errorMessages.push(`Constant ${i + 1} (${constant.name}): Already exists in environment '${constant.environment}'`)
          continue
        }

        // Create new constant
        await db.globalConstant.create({
          data: {
            name: constant.name,
            description: constant.description,
            format: constant.format || 'KEY_VALUE',
            content: constant.content,
            category: constant.category,
            environment: constant.environment || 'default',
            isPublic: constant.isPublic || false,
            authorId: 'imported-user' // In a real app, this would come from auth
          }
        })

        results.success++
      } catch (error) {
        results.errors++
        results.errorMessages.push(`Constant ${i + 1} (${constant.name}): ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: `Import completed. ${results.success} constants imported successfully, ${results.errors} errors.`,
      results
    })

  } catch (error) {
    console.error('Error importing constants:', error)
    return NextResponse.json(
      { error: 'Failed to import constants' },
      { status: 500 }
    )
  }
}
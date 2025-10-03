import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, webhookIds } = body

    if (!action || !webhookIds || !Array.isArray(webhookIds)) {
      return NextResponse.json(
        { error: 'Action and webhookIds array are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'activate':
        result = await db.webhook.updateMany({
          where: { id: { in: webhookIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await db.webhook.updateMany({
          where: { id: { in: webhookIds } },
          data: { isActive: false }
        })
        break

      case 'delete':
        // Delete related data first
        await db.alertDelivery.deleteMany({
          where: {
            alert: {
              webhookId: { in: webhookIds }
            }
          }
        })

        await db.alert.deleteMany({
          where: {
            webhookId: { in: webhookIds }
          }
        })

        await db.webhookAlertChannel.deleteMany({
          where: {
            webhookId: { in: webhookIds }
          }
        })

        result = await db.webhook.deleteMany({
          where: { id: { in: webhookIds } }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: activate, deactivate, delete' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      affectedCount: result.count
    })
  } catch (error) {
    console.error('Error performing bulk webhook operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
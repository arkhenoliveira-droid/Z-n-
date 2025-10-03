import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processTemplate, getDefaultTemplate } from '@/lib/template-processor'

interface WebhookAlert {
  key?: string
  telegram?: string
  discord?: string
  slack?: string
  msg?: string
  [key: string]: any
}

export async function POST(
  request: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  try {
    // Find the webhook by endpoint
    const webhook = await db.webhook.findFirst({
      where: {
        endpoint: `/webhook/${params.endpoint}`,
        isActive: true
      },
      include: {
        channels: {
          include: {
            channel: true
          }
        }
      }
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found or inactive' },
        { status: 404 }
      )
    }

    // Parse the incoming alert data
    const alertData: WebhookAlert = await request.json()

    // Verify secret key if provided
    if (alertData.key && alertData.key !== webhook.secretKey) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 401 }
      )
    }

    // Create the alert record
    const alert = await db.alert.create({
      data: {
        webhookId: webhook.id,
        message: alertData.msg || 'Webhook Alert',
        rawData: JSON.stringify(alertData),
        authorId: webhook.authorId,
        status: 'RECEIVED'
      }
    })

    // Process the alert and send to configured channels
    await processAlert(alert, alertData, webhook.channels)

    return NextResponse.json({
      message: 'Alert received and processed',
      alertId: alert.id
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function processAlert(alert: any, alertData: WebhookAlert, webhookChannels: any[]) {
  try {
    // Update alert status to processing
    await db.alert.update({
      where: { id: alert.id },
      data: { status: 'PROCESSING' }
    })

    // Process each configured channel
    for (const webhookChannel of webhookChannels) {
      if (!webhookChannel.isActive) continue

      const channel = webhookChannel.channel
      let deliveryStatus: 'SENT' | 'FAILED' = 'FAILED'
      let response: string | null = null

      try {
        // Send alert based on channel type
        switch (channel.type) {
          case 'TELEGRAM':
            response = await sendToTelegram(channel, alertData, webhook)
            deliveryStatus = 'SENT'
            break
          case 'DISCORD':
            response = await sendToDiscord(channel, alertData, webhook)
            deliveryStatus = 'SENT'
            break
          case 'SLACK':
            response = await sendToSlack(channel, alertData, webhook)
            deliveryStatus = 'SENT'
            break
          case 'EMAIL':
            response = await sendToEmail(channel, alertData, webhook)
            deliveryStatus = 'SENT'
            break
          case 'TWITTER':
            response = await sendToTwitter(channel, alertData, webhook)
            deliveryStatus = 'SENT'
            break
        }
      } catch (error) {
        console.error(`Failed to send alert to ${channel.type}:`, error)
        response = error instanceof Error ? error.message : 'Unknown error'
        deliveryStatus = 'FAILED'
      }

      // Record the delivery attempt
      await db.alertDelivery.create({
        data: {
          alertId: alert.id,
          channelId: channel.id,
          status: deliveryStatus,
          response: response,
          sentAt: deliveryStatus === 'SENT' ? new Date() : null
        }
      })
    }

    // Update overall alert status
    const allDeliveries = await db.alertDelivery.findMany({
      where: { alertId: alert.id }
    })

    const allSent = allDeliveries.every(d => d.status === 'SENT')
    const anySent = allDeliveries.some(d => d.status === 'SENT')

    await db.alert.update({
      where: { id: alert.id },
      data: {
        status: allSent ? 'DELIVERED' : anySent ? 'PROCESSING' : 'FAILED',
        sentAt: allSent ? new Date() : null
      }
    })

  } catch (error) {
    console.error('Error processing alert:', error)
    await db.alert.update({
      where: { id: alert.id },
      data: { status: 'FAILED' }
    })
  }
}

// Channel-specific sending functions
async function sendToTelegram(channel: any, alertData: WebhookAlert, webhook: any): Promise<string> {
  const config = JSON.parse(channel.config)

  // Get or create template for this webhook-channel combination
  const template = getDefaultTemplate('TELEGRAM')
  const processedMessage = processTemplate(template, alertData)

  // In a real implementation, you would use the Telegram Bot API
  console.log(`Sending to Telegram: ${processedMessage}`)
  console.log(`Bot Token: ${config.botToken}`)
  console.log(`Chat ID: ${config.chatId}`)

  return `Message sent to Telegram chat ${config.chatId}`
}

async function sendToDiscord(channel: any, alertData: WebhookAlert, webhook: any): Promise<string> {
  const config = JSON.parse(channel.config)

  // Get or create template for this webhook-channel combination
  const template = getDefaultTemplate('DISCORD')
  const processedMessage = processTemplate(template, alertData)

  // In a real implementation, you would send to Discord webhook
  console.log(`Sending to Discord: ${processedMessage}`)
  console.log(`Webhook URL: ${config.webhookUrl}`)

  return `Message sent to Discord webhook`
}

async function sendToSlack(channel: any, alertData: WebhookAlert, webhook: any): Promise<string> {
  const config = JSON.parse(channel.config)

  // Get or create template for this webhook-channel combination
  const template = getDefaultTemplate('SLACK')
  const processedMessage = processTemplate(template, alertData)

  // In a real implementation, you would send to Slack webhook
  console.log(`Sending to Slack: ${processedMessage}`)
  console.log(`Webhook URL: ${config.webhookUrl}`)

  return `Message sent to Slack webhook`
}

async function sendToEmail(channel: any, alertData: WebhookAlert, webhook: any): Promise<string> {
  const config = JSON.parse(channel.config)

  // Get or create template for this webhook-channel combination
  const template = getDefaultTemplate('EMAIL')
  const processedMessage = processTemplate(template, alertData)

  // In a real implementation, you would send email using nodemailer
  console.log(`Sending Email: ${processedMessage}`)
  console.log(`To: ${config.to}`)
  console.log(`From: ${config.from}`)
  console.log(`SMTP: ${config.smtp.host}:${config.smtp.port}`)

  return `Email sent to ${config.to}`
}

async function sendToTwitter(channel: any, alertData: WebhookAlert, webhook: any): Promise<string> {
  const config = JSON.parse(channel.config)

  // Get or create template for this webhook-channel combination
  const template = getDefaultTemplate('TWITTER')
  const processedMessage = processTemplate(template, alertData)

  // In a real implementation, you would post to Twitter using twitter-api-v2
  console.log(`Posting to Twitter: ${processedMessage}`)
  console.log(`Using API key: ${config.apiKey}`)

  return `Tweet posted successfully`
}
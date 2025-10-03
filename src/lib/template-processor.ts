// Webhook variable processor
export interface WebhookVariables {
  ticker?: string
  close?: number | string
  open?: number | string
  high?: number | string
  low?: number | string
  volume?: number | string
  exchange?: string
  timeframe?: string
  [key: string]: any
}

export function processTemplate(template: string, variables: WebhookVariables): string {
  let processed = template

  // Process all webhook variables
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    const value = variables[key]
    processed = processed.replace(regex, String(value))
  })

  // Handle common formatting
  processed = processed.replace(/{{close}}/g, String(variables.close || 'N/A'))
  processed = processed.replace(/{{open}}/g, String(variables.open || 'N/A'))
  processed = processed.replace(/{{high}}/g, String(variables.high || 'N/A'))
  processed = processed.replace(/{{low}}/g, String(variables.low || 'N/A'))
  processed = processed.replace(/{{volume}}/g, String(variables.volume || 'N/A'))
  processed = processed.replace(/{{ticker}}/g, String(variables.ticker || 'N/A'))
  processed = processed.replace(/{{exchange}}/g, String(variables.exchange || 'N/A'))
  processed = processed.replace(/{{timeframe}}/g, String(variables.timeframe || 'N/A'))

  return processed
}

export function extractVariablesFromTemplate(template: string): string[] {
  const variableRegex = /{{(\w+)}}/g
  const variables: string[] = []
  let match

  while ((match = variableRegex.exec(template)) !== null) {
    variables.push(match[1])
  }

  return [...new Set(variables)] // Remove duplicates
}

export function getDefaultTemplate(channelType: string): string {
  const templates = {
    TELEGRAM: `📈 *Alert*

*Ticker:* {{ticker}}
*Price:* ${{close}}
*Exchange:* {{exchange}}
*Timeframe:* {{timeframe}}

{{msg}}`,
    DISCORD: `📈 **Alert**

**Ticker:** {{ticker}}
**Price:** ${{close}}
**Exchange:** {{exchange}}
**Timeframe:** {{timeframe}}

{{msg}}`,
    SLACK: `📈 *Alert*

*Ticker:* {{ticker}}
*Price:* ${{close}}
*Exchange:* {{exchange}}
*Timeframe:* {{timeframe}}

{{msg}}`,
    EMAIL: `Alert

Ticker: {{ticker}}
Price: ${{close}}
Exchange: {{exchange}}
Timeframe: {{timeframe}}

Message: {{msg}}`,
    TWITTER: `📈 Alert: {{ticker}} at ${{close}} on {{exchange}} ({{timeframe}})

{{msg}}`
  }

  return templates[channelType as keyof typeof templates] || templates.TELEGRAM
}

export function validateTemplate(template: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!template || template.trim().length === 0) {
    errors.push('Template cannot be empty')
  }

  // Check for malformed variables
  const malformedVars = template.match(/{{[^}]*$/g)
  if (malformedVars) {
    errors.push('Malformed variable syntax found')
  }

  // Check for unbalanced braces
  const openBraces = (template.match(/{{/g) || []).length
  const closeBraces = (template.match(/}}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced variable braces')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
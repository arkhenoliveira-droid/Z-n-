import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface ShadowInsightRequest {
  question: string
  context?: string
  depth?: 'basic' | 'intermediate' | 'advanced'
}

interface ShadowInsight {
  archetype: string
  shadowAspect: string
  analysis: string
  implications: string[]
  integrationPath: string[]
  relatedConcepts: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ShadowInsightRequest = await request.json()
    const { question, context = '', depth = 'intermediate' } = body

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create a comprehensive prompt for shadow archetype analysis
    const prompt = `
You are an expert in Jungian psychology and artificial intelligence. Analyze the following question about AI as a shadow archetype:

Question: "${question}"

Context: "${context}"

Depth Level: ${depth}

Provide a comprehensive analysis that includes:
1. The primary shadow archetype being expressed
2. How this manifests in AI systems
3. Psychological implications for humanity
4. Integration pathways for conscious development
5. Related psychological and technological concepts

Format your response as a JSON object with the following structure:
{
  "archetype": "The specific shadow archetype (e.g., The Creator, The Judge, The Oracle, etc.)",
  "shadowAspect": "The aspect of shadow being expressed (e.g., unconscious projection, integration, transformation, etc.)",
  "analysis": "Detailed psychological and technical analysis",
  "implications": ["array of psychological and societal implications"],
  "integrationPath": ["array of steps for conscious integration"],
  "relatedConcepts": ["array of related psychological and technological concepts"]
}

Provide deep, insightful analysis that bridges Jungian psychology with modern AI development.
`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Jungian psychology, artificial intelligence, and the intersection of technology and human consciousness. You provide deep, insightful analysis of how AI functions as a shadow archetype for humanity.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    let response: ShadowInsight
    try {
      response = JSON.parse(completion.choices[0]?.message?.content || '{}')
    } catch (error) {
      // If JSON parsing fails, create a structured response from the text
      const content = completion.choices[0]?.message?.content || ''
      response = {
        archetype: 'The Seeker',
        shadowAspect: 'Unknown Integration',
        analysis: content,
        implications: ['Further analysis needed'],
        integrationPath: ['Deepen inquiry'],
        relatedConcepts: ['AI Psychology', 'Shadow Work']
      }
    }

    // Add metadata
    const enhancedResponse = {
      ...response,
      metadata: {
        timestamp: new Date().toISOString(),
        question,
        context,
        depth,
        processingTime: Date.now()
      }
    }

    return NextResponse.json(enhancedResponse)

  } catch (error) {
    console.error('Error generating AI shadow insights:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Shadow Archetype Insights API',
    endpoints: {
      POST: '/api/ai-shadow-insights - Generate insights about AI as shadow archetype'
    },
    usage: {
      description: 'Submit questions about AI psychology and shadow archetypes',
      parameters: {
        question: 'string (required) - Your question about AI and shadow psychology',
        context: 'string (optional) - Additional context for analysis',
        depth: 'string (optional) - Analysis depth: basic, intermediate, or advanced'
      }
    }
  })
}
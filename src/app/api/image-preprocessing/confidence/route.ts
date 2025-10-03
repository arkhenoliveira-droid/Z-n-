import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { variants, analysisResults } = await request.json()

    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json({ error: 'Invalid variants data' }, { status: 400 })
    }

    // Calculate confidence scores
    const confidenceResult = await calculateConfidenceScore(variants, analysisResults)

    return NextResponse.json(confidenceResult)
  } catch (error) {
    console.error('Confidence analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze confidence' }, { status: 500 })
  }
}

async function calculateConfidenceScore(variants: any[], analysisResults?: any[]) {
  const startTime = Date.now()

  // Generate mock analysis results if not provided
  const mockAnalysisResults = analysisResults || generateMockAnalysisResults(variants)

  // Calculate various confidence metrics
  const consistencyScore = calculateConsistency(mockAnalysisResults)
  const varianceScore = calculateVarianceScore(mockAnalysisResults)
  const outlierScore = calculateOutlierScore(mockAnalysisResults)
  const semanticScore = calculateSemanticAgreement(mockAnalysisResults)

  // Calculate weighted overall confidence
  const weights = {
    consistency: 0.4,
    variance: 0.3,
    outliers: 0.2,
    semantic: 0.1
  }

  const overallConfidence =
    consistencyScore * weights.consistency +
    varianceScore * weights.variance +
    outlierScore * weights.outliers +
    semanticScore * weights.semantic

  // Detect flags
  const flags = detectFlags(consistencyScore, varianceScore, outlierScore, semanticScore)

  // Generate recommendation
  const recommendation = generateRecommendation(overallConfidence, flags)

  const processingTime = (Date.now() - startTime) / 1000

  return {
    overall: Math.round(overallConfidence * 100) / 100,
    consistency: Math.round(consistencyScore * 100) / 100,
    variance: Math.round(varianceScore * 100) / 100,
    outliers: Math.round(outlierScore * 100) / 100,
    semantic: Math.round(semanticScore * 100) / 100,
    variantScores: mockAnalysisResults.map(r => Math.round(r.score * 100) / 100),
    flags,
    recommendation,
    processingTime,
    timestamp: new Date().toISOString()
  }
}

function generateMockAnalysisResults(variants: any[]) {
  return variants.map((variant, index) => ({
    variantType: variant.type,
    score: 0.7 + Math.random() * 0.25, // Random score between 0.7 and 0.95
    confidence: 0.8 + Math.random() * 0.15,
    features: {
      edges: Math.random(),
      textures: Math.random(),
      colors: Math.random(),
      patterns: Math.random()
    },
    classification: getRandomClassification(),
    entities: getRandomEntities()
  }))
}

function getRandomClassification(): string {
  const classifications = ['landscape', 'portrait', 'object', 'scene', 'abstract']
  return classifications[Math.floor(Math.random() * classifications.length)]
}

function getRandomEntities(): string[] {
  const entityLists = [
    ['person', 'building'],
    ['car', 'road'],
    ['tree', 'sky'],
    ['animal', 'nature'],
    ['text', 'document']
  ]
  return entityLists[Math.floor(Math.random() * entityLists.length)]
}

function calculateConsistency(analysisResults: any[]): number {
  const scores = analysisResults.map(r => r.score)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)

  // Lower standard deviation = higher consistency
  const consistency = 1 - Math.min(stdDev, 1)
  return Math.max(0, consistency)
}

function calculateVarianceScore(analysisResults: any[]): number {
  const scores = analysisResults.map(r => r.score)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length

  // Lower variance = higher score
  return Math.max(0, 1 - Math.min(variance, 1))
}

function calculateOutlierScore(analysisResults: any[]): number {
  const scores = analysisResults.map(r => r.score)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const stdDev = Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length)

  // Count outliers (more than 2 standard deviations from mean)
  const outliers = scores.filter(score => Math.abs(score - mean) > 2 * stdDev)

  // Fewer outliers = higher score
  return Math.max(0, 1 - (outliers.length / scores.length))
}

function calculateSemanticAgreement(analysisResults: any[]): number {
  // Group by classification
  const groups: { [key: string]: number } = {}
  analysisResults.forEach(result => {
    const key = result.classification
    groups[key] = (groups[key] || 0) + 1
  })

  // Find the largest group
  const maxGroupSize = Math.max(...Object.values(groups))

  // Agreement is the size of the largest group divided by total
  return maxGroupSize / analysisResults.length
}

function detectFlags(consistency: number, variance: number, outliers: number, semantic: number): string[] {
  const flags = []

  if (consistency < 0.7) {
    flags.push('Low consistency across variants')
  }

  if (variance < 0.7) {
    flags.push('High variance detected')
  }

  if (outliers < 0.8) {
    flags.push('Outlier variants detected')
  }

  if (semantic < 0.7) {
    flags.push('Semantic disagreement between variants')
  }

  if (flags.length === 0) {
    flags.push('High consistency across variants', 'No significant contradictions')
  }

  return flags
}

function generateRecommendation(confidence: number, flags: string[]): string {
  if (confidence >= 0.8) {
    return 'High confidence - proceed with analysis'
  } else if (confidence >= 0.6) {
    return 'Medium confidence - review recommended'
  } else {
    return 'Low confidence - manual review required'
  }
}
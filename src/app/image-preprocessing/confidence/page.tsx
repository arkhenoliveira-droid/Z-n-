'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConfidenceResult {
  overall: number;
  consistency: number;
  variantScores: number[];
  flags: string[];
  recommendation: string;
}

const ConfidenceScoringSystem = () => {
  const [results, setResults] = useState<ConfidenceResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeConfidence = async () => {
    setAnalyzing(true);

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResult: ConfidenceResult = {
      overall: 0.87,
      consistency: 0.92,
      variantScores: [0.85, 0.89, 0.91, 0.83, 0.88, 0.86, 0.90],
      flags: ['High consistency across variants', 'No significant contradictions'],
      recommendation: 'High confidence - proceed with analysis'
    };

    setResults(mockResult);
    setAnalyzing(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (score >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Confidence Scoring System</CardTitle>
          <CardDescription className="text-lg">
            Quantify reliability and detect hallucinations through cross-variant analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Engine</CardTitle>
            <CardDescription>
              Run confidence analysis on image variants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={analyzeConfidence}
              disabled={analyzing}
              className="w-full"
            >
              {analyzing ? 'Analyzing...' : 'Run Confidence Analysis'}
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Overall Confidence</p>
                  <p className={`text-4xl font-bold ${getConfidenceColor(results.overall)}`}>
                    {(results.overall * 100).toFixed(0)}%
                  </p>
                  {getConfidenceBadge(results.overall)}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Consistency Score</p>
                  <p className={`text-2xl font-bold ${getConfidenceColor(results.consistency)}`}>
                    {(results.consistency * 100).toFixed(0)}%
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Recommendation</p>
                  <p className="text-sm p-3 bg-blue-50 rounded">
                    {results.recommendation}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Monitoring</CardTitle>
            <CardDescription>
              Live confidence metrics and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Variance</p>
                  <p className="text-xl font-bold">0.03</p>
                  <p className="text-xs text-green-600">Low</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Outliers</p>
                  <p className="text-xl font-bold">0</p>
                  <p className="text-xs text-green-600">None</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">System Status</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Analysis Engine</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Variant Generator</span>
                    <Badge className="bg-green-100 text-green-800">Ready</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence Scorer</span>
                    <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scoring" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scoring">Scoring Algorithm</TabsTrigger>
              <TabsTrigger value="consistency">Consistency Check</TabsTrigger>
              <TabsTrigger value="flags">Flagging System</TabsTrigger>
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            </TabsList>

            <TabsContent value="scoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Variant Confidence Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm">
{`class ConfidenceScorer {
  constructor() {
    this.weights = {
      consistency: 0.4,
      variance: 0.3,
      outlierCount: 0.2,
      semanticAgreement: 0.1
    };
    this.thresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  calculateConfidence(analysisResults) {
    const scores = analysisResults.map(r => r.score);
    const variance = this.calculateVariance(scores);
    const consistency = 1 - Math.min(variance, 1);
    const outliers = this.detectOutliers(scores);
    const semanticAgreement = this.checkSemanticAgreement(analysisResults);

    const weightedScore =
      consistency * this.weights.consistency +
      (1 - variance) * this.weights.variance +
      (1 - outliers.length / scores.length) * this.weights.outlierCount +
      semanticAgreement * this.weights.semanticAgreement;

    return {
      overall: Math.max(0, Math.min(1, weightedScore)),
      consistency,
      variance,
      outliers,
      semanticAgreement,
      variantScores: scores
    };
  }

  calculateVariance(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) =>
      sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  }

  detectOutliers(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(this.calculateVariance(scores));
    const threshold = 2 * stdDev; // 2-sigma rule

    return scores
      .map((score, index) => ({ score, index }))
      .filter(item => Math.abs(item.score - mean) > threshold)
      .map(item => item.index);
  }

  checkSemanticAgreement(analysisResults) {
    // Check if different variants produce semantically consistent results
    const semanticGroups = this.groupBySemantics(analysisResults);
    const dominantGroup = semanticGroups.reduce((max, group) =>
      group.length > max.length ? group : max, []);

    return dominantGroup.length / analysisResults.length;
  }

  groupBySemantics(analysisResults) {
    // Group results by semantic meaning
    const groups = {};

    analysisResults.forEach((result, index) => {
      const semanticKey = this.getSemanticKey(result);
      if (!groups[semanticKey]) {
        groups[semanticKey] = [];
      }
      groups[semanticKey].push(index);
    });

    return Object.values(groups);
  }

  getSemanticKey(result) {
    // Extract semantic key from analysis result
    // This depends on the specific analysis type
    if (result.classification) {
      return result.classification;
    }
    if (result.entities) {
      return result.entities.sort().join(',');
    }
    return 'default';
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consistency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consistency Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Statistical Consistency</h4>
                      <p className="text-sm text-gray-600">
                        Measures how consistent the scores are across different image variants
                      </p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
{`class ConsistencyAnalyzer {
  analyzeConsistency(scores) {
    return {
      statistical: this.statisticalConsistency(scores),
      trend: this.trendConsistency(scores),
      distribution: this.distributionConsistency(scores)
    };
  }

  statisticalConsistency(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) =>
      sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation
    const cv = stdDev / mean;

    return {
      coefficient: cv,
      consistency: 1 - Math.min(cv, 1),
      mean,
      stdDev
    };
  }

  trendConsistency(scores) {
    // Check if scores follow a consistent pattern
    const trends = [];
    for (let i = 1; i < scores.length; i++) {
      trends.push(scores[i] - scores[i - 1]);
    }

    const trendVariance = this.calculateVariance(trends);
    return {
      trendVariance,
      consistency: 1 - Math.min(trendVariance, 1),
      trends
    };
  }

  distributionConsistency(scores) {
    // Check if scores follow expected distribution
    const sorted = [...scores].sort((a, b) => a - b);
    const q1 = this.percentile(sorted, 25);
    const q3 = this.percentile(sorted, 75);
    const iqr = q3 - q1;

    // Check for normal distribution characteristics
    const skewness = this.calculateSkewness(scores);
    const kurtosis = this.calculateKurtosis(scores);

    return {
      iqr,
      skewness,
      kurtosis,
      consistency: 1 - Math.abs(skewness) * 0.5
    };
  }

  percentile(sortedArray, p) {
    const index = Math.ceil((p / 100) * sortedArray.length) - 1;
    return sortedArray[index];
  }

  calculateSkewness(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) =>
      sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    const skewness = scores.reduce((sum, score) =>
      sum + Math.pow((score - mean) / stdDev, 3), 0) / scores.length;

    return skewness;
  }

  calculateKurtosis(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) =>
      sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    const kurtosis = scores.reduce((sum, score) =>
      sum + Math.pow((score - mean) / stdDev, 4), 0) / scores.length - 3;

    return kurtosis;
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flags" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Intelligent Flagging System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Automatic Flag Detection</h4>
                      <p className="text-sm text-gray-600">
                        Identifies potential issues and hallucinations in analysis results
                      </p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
{`class FlaggingSystem {
  constructor() {
    this.flagTypes = {
      HIGH_VARIANCE: 'high_variance',
      OUTLIERS: 'outliers',
      SEMANTIC_CONTRADICTION: 'semantic_contradiction',
      LOW_CONFIDENCE: 'low_confidence',
      INCONSISTENT_TREND: 'inconsistent_trend'
    };
  }

  detectFlags(confidenceResult) {
    const flags = [];

    // High variance flag
    if (confidenceResult.variance > 0.1) {
      flags.push({
        type: this.flagTypes.HIGH_VARIANCE,
        severity: 'warning',
        message: 'High variance detected across variants',
        recommendation: 'Review individual variant results'
      });
    }

    // Outliers flag
    if (confidenceResult.outliers.length > 0) {
      flags.push({
        type: this.flagTypes.OUTLIERS,
        severity: 'warning',
        message: \`\${confidenceResult.outliers.length} outlier variants detected\`,
        recommendation: 'Investigate outlier variants for anomalies'
      });
    }

    // Low confidence flag
    if (confidenceResult.overall < 0.6) {
      flags.push({
        type: this.flagTypes.LOW_CONFIDENCE,
        severity: 'error',
        message: 'Overall confidence score is low',
        recommendation: 'Consider additional preprocessing or manual review'
      });
    }

    // Semantic contradiction flag
    if (confidenceResult.semanticAgreement < 0.7) {
      flags.push({
        type: this.flagTypes.SEMANTIC_CONTRADICTION,
        severity: 'error',
        message: 'Semantic contradiction detected between variants',
        recommendation: 'Review semantic consistency across variants'
      });
    }

    return flags;
  }

  generateRecommendation(flags) {
    const errorFlags = flags.filter(f => f.severity === 'error');
    const warningFlags = flags.filter(f => f.severity === 'warning');

    if (errorFlags.length > 0) {
      return {
        level: 'critical',
        message: 'Critical issues detected - manual review required',
        actions: errorFlags.map(f => f.recommendation)
      };
    }

    if (warningFlags.length > 2) {
      return {
        level: 'warning',
        message: 'Multiple warnings detected - review recommended',
        actions: warningFlags.map(f => f.recommendation)
      };
    }

    if (warningFlags.length > 0) {
      return {
        level: 'caution',
        message: 'Minor issues detected - proceed with care',
        actions: warningFlags.map(f => f.recommendation)
      };
    }

    return {
      level: 'normal',
      message: 'No significant issues detected',
      actions: []
    };
  }

  prioritizeFlags(flags) {
    const severityOrder = { error: 3, warning: 2, info: 1 };
    return flags.sort((a, b) =>
      severityOrder[b.severity] - severityOrder[a.severity]
    );
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Adaptive Threshold System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Dynamic Threshold Adjustment</h4>
                      <p className="text-sm text-gray-600">
                        Automatically adjusts confidence thresholds based on context and historical data
                      </p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
{`class ThresholdManager {
  constructor() {
    this.baseThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
    this.contextFactors = {
      imageComplexity: 0.1,
      variantQuality: 0.1,
      historicalAccuracy: 0.05,
      domainSpecific: 0.05
    };
  }

  calculateAdaptiveThresholds(context) {
    const adjustments = this.calculateAdjustments(context);

    return {
      high: Math.max(0.5, Math.min(0.95,
        this.baseThresholds.high + adjustments.high)),
      medium: Math.max(0.3, Math.min(0.8,
        this.baseThresholds.medium + adjustments.medium)),
      low: Math.max(0.1, Math.min(0.6,
        this.baseThresholds.low + adjustments.low))
    };
  }

  calculateAdjustments(context) {
    const adjustments = {
      high: 0,
      medium: 0,
      low: 0
    };

    // Image complexity adjustment
    if (context.imageComplexity > 0.7) {
      adjustments.high -= 0.05;
      adjustments.medium -= 0.03;
    }

    // Variant quality adjustment
    if (context.variantQuality < 0.6) {
      adjustments.high -= 0.1;
      adjustments.medium -= 0.05;
    }

    // Historical accuracy adjustment
    if (context.historicalAccuracy < 0.8) {
      adjustments.high -= 0.08;
      adjustments.medium -= 0.05;
    }

    // Domain-specific adjustments
    if (context.domain === 'medical') {
      adjustments.high += 0.1;
      adjustments.medium += 0.05;
    }

    return adjustments;
  }

  getConfidenceLevel(score, thresholds) {
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.medium) return 'medium';
    return 'low';
  }

  updateThresholds(performance) {
    // Update thresholds based on recent performance
    const accuracy = performance.accuracy;
    const falsePositiveRate = performance.falsePositiveRate;
    const falseNegativeRate = performance.falseNegativeRate;

    if (accuracy < 0.8) {
      this.baseThresholds.high += 0.02;
      this.baseThresholds.medium += 0.01;
    }

    if (falsePositiveRate > 0.2) {
      this.baseThresholds.high += 0.03;
      this.baseThresholds.medium += 0.02;
    }

    if (falseNegativeRate > 0.2) {
      this.baseThresholds.high -= 0.02;
      this.baseThresholds.medium -= 0.01;
    }

    // Ensure thresholds stay within reasonable bounds
    this.baseThresholds.high = Math.max(0.6, Math.min(0.95, this.baseThresholds.high));
    this.baseThresholds.medium = Math.max(0.4, Math.min(0.8, this.baseThresholds.medium));
    this.baseThresholds.low = Math.max(0.2, Math.min(0.6, this.baseThresholds.low));
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefits & Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Hallucination Prevention</h4>
              <ul className="space-y-1">
                <li>• Early detection of inconsistent results</li>
                <li>• Automatic flagging of low-confidence predictions</li>
                <li>• Cross-variant validation reduces false positives</li>
                <li>• Semantic consistency checking</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-blue-600">Reliability Improvement</h4>
              <ul className="space-y-1">
                <li>• Quantifiable confidence metrics</li>
                <li>• Statistical consistency analysis</li>
                <li>• Adaptive threshold adjustment</li>
                <li>• Continuous learning from feedback</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-purple-600">User Experience</h4>
              <ul className="space-y-1">
                <li>• Transparent confidence scoring</li>
                <li>• Clear recommendations and warnings</li>
                <li>• Actionable feedback for improvement</li>
                <li>• Trust-building through transparency</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-orange-600">System Performance</h4>
              <ul className="space-y-1">
                <li>• Minimal computational overhead</li>
                <li>• Real-time confidence assessment</li>
                <li>• Scalable to high-volume processing</li>
                <li>• Integrates with existing workflows</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfidenceScoringSystem;
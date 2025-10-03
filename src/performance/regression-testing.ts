/**
 * TimeKeeper OS Performance Regression Testing System
 *
 * This system detects performance regressions by comparing current benchmark results
 * with historical baselines and identifying significant performance degradation.
 */

import { BenchmarkResult } from './benchmark-suite';

export interface PerformanceBaseline {
  id: string;
  name: string;
  component: string;
  averageTime: number;
  standardDeviation: number;
  throughput: number;
  memoryDelta: number;
  timestamp: string;
  environment: string;
  metadata?: Record<string, any>;
}

export interface RegressionTestResult {
  benchmarkName: string;
  component: string;
  status: 'passed' | 'warning' | 'failed';
  currentAverageTime: number;
  baselineAverageTime: number;
  timeDifference: number;
  timeDifferencePercent: number;
  currentThroughput: number;
  baselineThroughput: number;
  throughputDifference: number;
  throughputDifferencePercent: number;
  currentMemoryDelta: number;
  baselineMemoryDelta: number;
  memoryDifference: number;
  memoryDifferencePercent: number;
  timestamp: string;
  details: string;
}

export interface RegressionTestConfig {
  timeThresholdPercent: number; // Percentage increase in time to trigger warning
  throughputThresholdPercent: number; // Percentage decrease in throughput to trigger warning
  memoryThresholdPercent: number; // Percentage increase in memory to trigger warning
  strictMode: boolean; // If true, any regression fails the test
  autoSaveBaselines: boolean; // Automatically save new baselines for improvements
}

export class PerformanceRegressionTester {
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private config: RegressionTestConfig;
  private results: RegressionTestResult[] = [];

  constructor(config: Partial<RegressionTestConfig> = {}) {
    this.config = {
      timeThresholdPercent: 10, // 10% increase in time triggers warning
      throughputThresholdPercent: 10, // 10% decrease in throughput triggers warning
      memoryThresholdPercent: 15, // 15% increase in memory triggers warning
      strictMode: false,
      autoSaveBaselines: true,
      ...config
    };

    this.loadBaselines();
  }

  private loadBaselines(): void {
    // In a real implementation, this would load from a database or file
    // For now, we'll use some default baselines
    const defaultBaselines: PerformanceBaseline[] = [
      {
        id: 'kernel_chronon_creation',
        name: 'Chronon Creation',
        component: 'kernel',
        averageTime: 2.5,
        standardDeviation: 0.8,
        throughput: 400,
        memoryDelta: 2,
        timestamp: new Date().toISOString(),
        environment: 'production'
      },
      {
        id: 'process_creation',
        name: 'Process Creation',
        component: 'process',
        averageTime: 3.2,
        standardDeviation: 1.1,
        throughput: 312,
        memoryDelta: 3,
        timestamp: new Date().toISOString(),
        environment: 'production'
      },
      {
        id: 'filesystem_file_creation',
        name: 'File Creation',
        component: 'filesystem',
        averageTime: 4.8,
        standardDeviation: 1.9,
        throughput: 104,
        memoryDelta: 3,
        timestamp: new Date().toISOString(),
        environment: 'production'
      },
      {
        id: 'memory_allocation',
        name: 'Memory Allocation',
        component: 'memory',
        averageTime: 1.8,
        standardDeviation: 0.6,
        throughput: 555,
        memoryDelta: 4,
        timestamp: new Date().toISOString(),
        environment: 'production'
      },
      {
        id: 'network_packet_routing',
        name: 'Packet Routing',
        component: 'network',
        averageTime: 6.2,
        standardDeviation: 2.3,
        throughput: 129,
        memoryDelta: 2,
        timestamp: new Date().toISOString(),
        environment: 'production'
      },
      {
        id: 'security_authentication',
        name: 'Authentication',
        component: 'security',
        averageTime: 8.5,
        standardDeviation: 2.8,
        throughput: 70,
        memoryDelta: 3,
        timestamp: new Date().toISOString(),
        environment: 'production'
      }
    ];

    defaultBaselines.forEach(baseline => {
      this.baselines.set(baseline.id, baseline);
    });
  }

  private getBaselineId(benchmark: BenchmarkResult): string {
    return `${benchmark.component}_${benchmark.name.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private calculatePercentChange(current: number, baseline: number): number {
    if (baseline === 0) return 0;
    return ((current - baseline) / baseline) * 100;
  }

  private determineStatus(
    timeDiffPercent: number,
    throughputDiffPercent: number,
    memoryDiffPercent: number
  ): 'passed' | 'warning' | 'failed' {
    const timeRegressed = timeDiffPercent > this.config.timeThresholdPercent;
    const throughputRegressed = throughputDiffPercent < -this.config.throughputThresholdPercent;
    const memoryRegressed = memoryDiffPercent > this.config.memoryThresholdPercent;

    if (this.config.strictMode && (timeRegressed || throughputRegressed || memoryRegressed)) {
      return 'failed';
    }

    if (timeRegressed || throughputRegressed || memoryRegressed) {
      return 'warning';
    }

    return 'passed';
  }

  private generateDetails(result: RegressionTestResult): string {
    const details = [];

    if (result.timeDifferencePercent > this.config.timeThresholdPercent) {
      details.push(`Time increased by ${result.timeDifferencePercent.toFixed(1)}%`);
    }

    if (result.throughputDifferencePercent < -this.config.throughputThresholdPercent) {
      details.push(`Throughput decreased by ${Math.abs(result.throughputDifferencePercent).toFixed(1)}%`);
    }

    if (result.memoryDifferencePercent > this.config.memoryThresholdPercent) {
      details.push(`Memory usage increased by ${result.memoryDifferencePercent.toFixed(1)}%`);
    }

    if (details.length === 0) {
      return 'Performance within acceptable thresholds';
    }

    return details.join(', ');
  }

  public testRegression(benchmark: BenchmarkResult): RegressionTestResult {
    const baselineId = this.getBaselineId(benchmark);
    const baseline = this.baselines.get(baselineId);

    if (!baseline) {
      // No baseline found, create one if auto-save is enabled
      if (this.config.autoSaveBaselines) {
        this.saveBaseline(benchmark);
      }

      return {
        benchmarkName: benchmark.name,
        component: benchmark.component,
        status: 'passed',
        currentAverageTime: benchmark.averageTime,
        baselineAverageTime: 0,
        timeDifference: benchmark.averageTime,
        timeDifferencePercent: 0,
        currentThroughput: benchmark.throughput,
        baselineThroughput: 0,
        throughputDifference: benchmark.throughput,
        throughputDifferencePercent: 0,
        currentMemoryDelta: benchmark.memoryUsage.delta,
        baselineMemoryDelta: 0,
        memoryDifference: benchmark.memoryUsage.delta,
        memoryDifferencePercent: 0,
        timestamp: new Date().toISOString(),
        details: 'No baseline available for comparison'
      };
    }

    const timeDifference = benchmark.averageTime - baseline.averageTime;
    const timeDifferencePercent = this.calculatePercentChange(benchmark.averageTime, baseline.averageTime);

    const throughputDifference = benchmark.throughput - baseline.throughput;
    const throughputDifferencePercent = this.calculatePercentChange(benchmark.throughput, baseline.throughput);

    const memoryDifference = benchmark.memoryUsage.delta - baseline.memoryDelta;
    const memoryDifferencePercent = this.calculatePercentChange(benchmark.memoryUsage.delta, baseline.memoryDelta);

    const status = this.determineStatus(
      timeDifferencePercent,
      throughputDifferencePercent,
      memoryDifferencePercent
    );

    const result: RegressionTestResult = {
      benchmarkName: benchmark.name,
      component: benchmark.component,
      status,
      currentAverageTime: benchmark.averageTime,
      baselineAverageTime: baseline.averageTime,
      timeDifference,
      timeDifferencePercent,
      currentThroughput: benchmark.throughput,
      baselineThroughput: baseline.throughput,
      throughputDifference,
      throughputDifferencePercent,
      currentMemoryDelta: benchmark.memoryUsage.delta,
      baselineMemoryDelta: baseline.memoryDelta,
      memoryDifference,
      memoryDifferencePercent,
      timestamp: new Date().toISOString(),
      details: this.generateDetails({
        benchmarkName: benchmark.name,
        component: benchmark.component,
        status,
        currentAverageTime: benchmark.averageTime,
        baselineAverageTime: baseline.averageTime,
        timeDifference,
        timeDifferencePercent,
        currentThroughput: benchmark.throughput,
        baselineThroughput: baseline.throughput,
        throughputDifference,
        throughputDifferencePercent,
        currentMemoryDelta: benchmark.memoryUsage.delta,
        baselineMemoryDelta: baseline.memoryDelta,
        memoryDifference,
        memoryDifferencePercent,
        timestamp: new Date().toISOString(),
        details: ''
      })
    };

    this.results.push(result);

    // Auto-save baseline if performance improved significantly
    if (this.config.autoSaveBaselines && status === 'passed') {
      const timeImprovement = timeDifferencePercent < -this.config.timeThresholdPercent;
      const throughputImprovement = throughputDifferencePercent > this.config.throughputThresholdPercent;
      const memoryImprovement = memoryDifferencePercent < -this.config.memoryThresholdPercent;

      if (timeImprovement || throughputImprovement || memoryImprovement) {
        this.saveBaseline(benchmark);
      }
    }

    return result;
  }

  public testRegressions(benchmarks: BenchmarkResult[]): RegressionTestResult[] {
    this.results = [];
    return benchmarks.map(benchmark => this.testRegression(benchmark));
  }

  public saveBaseline(benchmark: BenchmarkResult): void {
    const baselineId = this.getBaselineId(benchmark);
    const baseline: PerformanceBaseline = {
      id: baselineId,
      name: benchmark.name,
      component: benchmark.component,
      averageTime: benchmark.averageTime,
      standardDeviation: benchmark.standardDeviation,
      throughput: benchmark.throughput,
      memoryDelta: benchmark.memoryUsage.delta,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    this.baselines.set(baselineId, baseline);
    console.log(`✅ Saved new baseline for ${benchmark.name}`);
  }

  public getBaselines(): PerformanceBaseline[] {
    return Array.from(this.baselines.values());
  }

  public getResults(): RegressionTestResult[] {
    return [...this.results];
  }

  public getSummary(): {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
    successRate: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      warnings,
      failed,
      successRate
    };
  }

  public generateReport(): string {
    const summary = this.getSummary();
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      summary,
      results: this.results,
      baselines: this.getBaselines()
    };

    return JSON.stringify(report, null, 2);
  }

  public exportResults(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'Benchmark Name', 'Component', 'Status', 'Current Time (ms)', 'Baseline Time (ms)',
        'Time Difference (%)', 'Current Throughput', 'Baseline Throughput', 'Throughput Difference (%)',
        'Current Memory (MB)', 'Baseline Memory (MB)', 'Memory Difference (%)', 'Details'
      ];

      const rows = this.results.map(result => [
        result.benchmarkName,
        result.component,
        result.status,
        result.currentAverageTime.toFixed(2),
        result.baselineAverageTime.toFixed(2),
        result.timeDifferencePercent.toFixed(2),
        result.currentThroughput.toFixed(0),
        result.baselineThroughput.toFixed(0),
        result.throughputDifferencePercent.toFixed(2),
        result.currentMemoryDelta.toFixed(2),
        result.baselineMemoryDelta.toFixed(2),
        result.memoryDifferencePercent.toFixed(2),
        `"${result.details}"`
      ]);

      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    return this.generateReport();
  }

  public clearResults(): void {
    this.results = [];
  }

  public resetBaselines(): void {
    this.baselines.clear();
    this.loadBaselines();
  }
}
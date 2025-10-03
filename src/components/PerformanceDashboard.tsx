'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Cpu, HardDrive, Network, Shield, Zap } from 'lucide-react';

interface BenchmarkResult {
  name: string;
  component: string;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  medianTime: number;
  standardDeviation: number;
  throughput: number;
  memoryUsage: {
    before: number;
    after: number;
    delta: number;
  };
  timestamp: string;
  success: boolean;
  error?: string;
}

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: string;
}

export const PerformanceDashboard: React.FC = () => {
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<PerformanceMetrics[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('all');

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetric: PerformanceMetrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 100,
        timestamp: new Date().toISOString()
      };

      setRealTimeMetrics(prev => {
        const updated = [...prev, newMetric];
        return updated.slice(-20); // Keep last 20 metrics
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const runBenchmarks = async () => {
    setIsRunning(true);
    try {
      // Simulate benchmark results
      const mockResults: BenchmarkResult[] = [
        {
          name: 'Chronon Creation',
          component: 'kernel',
          iterations: 1000,
          averageTime: 2.5,
          minTime: 1.2,
          maxTime: 5.8,
          medianTime: 2.3,
          standardDeviation: 0.8,
          throughput: 400,
          memoryUsage: { before: 50, after: 52, delta: 2 },
          timestamp: new Date().toISOString(),
          success: true
        },
        {
          name: 'Process Creation',
          component: 'process',
          iterations: 1000,
          averageTime: 3.2,
          minTime: 1.8,
          maxTime: 7.2,
          medianTime: 3.0,
          standardDeviation: 1.1,
          throughput: 312,
          memoryUsage: { before: 52, after: 55, delta: 3 },
          timestamp: new Date().toISOString(),
          success: true
        },
        {
          name: 'File Creation',
          component: 'filesystem',
          iterations: 500,
          averageTime: 4.8,
          minTime: 2.1,
          maxTime: 12.3,
          medianTime: 4.5,
          standardDeviation: 1.9,
          throughput: 104,
          memoryUsage: { before: 55, after: 58, delta: 3 },
          timestamp: new Date().toISOString(),
          success: true
        },
        {
          name: 'Memory Allocation',
          component: 'memory',
          iterations: 1000,
          averageTime: 1.8,
          minTime: 0.9,
          maxTime: 4.2,
          medianTime: 1.7,
          standardDeviation: 0.6,
          throughput: 555,
          memoryUsage: { before: 58, after: 62, delta: 4 },
          timestamp: new Date().toISOString(),
          success: true
        },
        {
          name: 'Packet Routing',
          component: 'network',
          iterations: 800,
          averageTime: 6.2,
          minTime: 3.1,
          maxTime: 15.8,
          medianTime: 5.9,
          standardDeviation: 2.3,
          throughput: 129,
          memoryUsage: { before: 62, after: 64, delta: 2 },
          timestamp: new Date().toISOString(),
          success: true
        },
        {
          name: 'Authentication',
          component: 'security',
          iterations: 600,
          averageTime: 8.5,
          minTime: 4.2,
          maxTime: 18.9,
          medianTime: 8.1,
          standardDeviation: 2.8,
          throughput: 70,
          memoryUsage: { before: 64, after: 67, delta: 3 },
          timestamp: new Date().toISOString(),
          success: true
        }
      ];

      setBenchmarkResults(mockResults);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults = selectedComponent === 'all'
    ? benchmarkResults
    : benchmarkResults.filter(r => r.component === selectedComponent);

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'kernel': return <Cpu className="h-4 w-4" />;
      case 'process': return <Activity className="h-4 w-4" />;
      case 'filesystem': return <HardDrive className="h-4 w-4" />;
      case 'memory': return <Zap className="h-4 w-4" />;
      case 'network': return <Network className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (time: number) => {
    if (time < 2) return 'text-green-600';
    if (time < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (time: number) => {
    if (time < 2) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (time < 5) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge variant="default" className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor TimeKeeper OS performance metrics</p>
        </div>
        <Button
          onClick={runBenchmarks}
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          {isRunning ? 'Running Benchmarks...' : 'Run Benchmarks'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].cpu.toFixed(1) : '0'}%
                </div>
                <Progress value={realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].cpu : 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].memory.toFixed(1) : '0'}%
                </div>
                <Progress value={realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].memory : 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk I/O</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].disk.toFixed(1) : '0'}%
                </div>
                <Progress value={realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].disk : 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].network.toFixed(1) : '0'}%
                </div>
                <Progress value={realTimeMetrics.length > 0 ? realTimeMetrics[realTimeMetrics.length - 1].network : 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Overall system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {benchmarkResults.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {benchmarkResults.length > 0 ? (benchmarkResults.reduce((acc, r) => acc + r.throughput, 0) / benchmarkResults.length).toFixed(0) : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Throughput</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {benchmarkResults.length > 0 ? (benchmarkResults.reduce((acc, r) => acc + r.averageTime, 0) / benchmarkResults.length).toFixed(2) : '0'}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Filter by Component:</span>
            <div className="flex gap-2">
              {['all', 'kernel', 'process', 'filesystem', 'memory', 'network', 'security'].map(component => (
                <Button
                  key={component}
                  variant={selectedComponent === component ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedComponent(component)}
                >
                  {component.charAt(0).toUpperCase() + component.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getComponentIcon(result.component)}
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <Badge variant="outline">{result.component}</Badge>
                    </div>
                    {getPerformanceBadge(result.averageTime)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Average Time</div>
                      <div className={`text-lg font-semibold ${getPerformanceColor(result.averageTime)}`}>
                        {result.averageTime.toFixed(2)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Min/Max</div>
                      <div className="text-lg font-semibold">
                        {result.minTime.toFixed(2)}ms / {result.maxTime.toFixed(2)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Throughput</div>
                      <div className="text-lg font-semibold">
                        {result.throughput.toFixed(0)} ops/s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Memory Delta</div>
                      <div className="text-lg font-semibold">
                        {result.memoryUsage.delta.toFixed(1)}MB
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time System Metrics</CardTitle>
              <CardDescription>Live performance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realTimeMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk %" />
                  <Line type="monotone" dataKey="network" stroke="#ff7300" name="Network %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Detailed performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarkResults}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageTime" fill="#8884d8" name="Average Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Throughput Analysis</CardTitle>
              <CardDescription>Operations per second by component</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarkResults}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="throughput" fill="#82ca9d" name="Throughput (ops/s)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
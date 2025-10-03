'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  alertsOverTime: Array<{
    date: string
    received: number
    delivered: number
    failed: number
  }>
  webhookPerformance: Array<{
    name: string
    alerts: number
    successRate: number
    avgResponseTime: number
  }>
  channelUsage: Array<{
    name: string
    value: number
    color: string
  }>
  systemMetrics: {
    uptime: string
    avgResponseTime: number
    errorRate: number
    throughput: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration - in real app, this would fetch from API
      const mockData: AnalyticsData = {
        alertsOverTime: generateTimeSeriesData(timeRange),
        webhookPerformance: [
          { name: 'Trading Signals', alerts: 145, successRate: 98, avgResponseTime: 120 },
          { name: 'Price Alerts', alerts: 89, successRate: 95, avgResponseTime: 150 },
          { name: 'Volume Alerts', alerts: 67, successRate: 92, avgResponseTime: 180 },
          { name: 'Technical Analysis', alerts: 234, successRate: 97, avgResponseTime: 110 },
          { name: 'News Alerts', alerts: 45, successRate: 89, avgResponseTime: 200 }
        ],
        channelUsage: [
          { name: 'Telegram', value: 45, color: '#0088FE' },
          { name: 'Discord', value: 30, color: '#00C49F' },
          { name: 'Email', value: 15, color: '#FFBB28' },
          { name: 'Slack', value: 10, color: '#FF8042' }
        ],
        systemMetrics: {
          uptime: '99.9%',
          avgResponseTime: 145,
          errorRate: 2.1,
          throughput: 1250
        }
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSeriesData = (range: string) => {
    const data = []
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      const received = Math.floor(Math.random() * 50) + 20
      const delivered = Math.floor(received * (0.85 + Math.random() * 0.15))
      const failed = received - delivered

      data.push({
        date: range === '24h' ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString(),
        received,
        delivered,
        failed
      })
    }

    return data
  }

  const formatTooltip = (value: any, name: string) => {
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
    return [value, formattedName]
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Analytics Data Unavailable</h2>
        <p className="text-muted-foreground mb-4">Unable to load analytics data at this time.</p>
        <Button onClick={fetchAnalyticsData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analyticsData.systemMetrics.uptime}</div>
            <p className="text-xs text-muted-foreground">Excellent reliability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analyticsData.systemMetrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Fast processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analyticsData.systemMetrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Within acceptable range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analyticsData.systemMetrics.throughput}/h</div>
            <p className="text-xs text-muted-foreground">High capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Alerts Over Time
            </CardTitle>
            <CardDescription>Alert volume and delivery performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.alertsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="received"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Received"
                />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Delivered"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stackId="3"
                  stroke="#ff7300"
                  fill="#ff7300"
                  fillOpacity={0.6}
                  name="Failed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Webhook Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Webhook Performance
            </CardTitle>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success rate by webhook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.webhookPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Bar dataKey="successRate" fill="#8884d8" name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Channel Usage
            </CardTitle>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribution by notification channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.channelUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.channelUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          <CardDescription>Key observations and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">Positive Trend</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Alert delivery success rate has improved by 5% over the last week
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-600">Attention Needed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Technical Analysis webhook shows higher response times, consider optimization
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">Channel Optimization</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Telegram channels handle 45% of all notifications, performing excellently
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
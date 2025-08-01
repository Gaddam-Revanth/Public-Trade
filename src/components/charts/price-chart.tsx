'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, BarChart3, Activity, Clock } from 'lucide-react'

interface ChartDataPoint {
  timestamp: number
  price: number
  volume: number
  change: number
}

interface ChartData {
  timeframe: string
  data: ChartDataPoint[]
  summary: {
    currentPrice: number
    highPrice: number
    lowPrice: number
    totalVolume: number
    dataPoints: number
  }
}

interface PriceChartProps {
  currentPrice?: number
  className?: string
}

export function PriceChart({ currentPrice = 1000, className = "" }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [timeframe, setTimeframe] = useState('1d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChartData(timeframe)
  }, [timeframe])

  const loadChartData = async (selectedTimeframe: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/charts?timeframe=${selectedTimeframe}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        setChartData(data)
      }
    } catch (error) {
      console.error('Failed to load chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffHours = diffMs / (1000 * 60 * 60)

    if (timeframe === '1d' && diffHours < 24) {
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (timeframe === '1w' && diffHours < 24 * 7) {
      return date.toLocaleDateString('en-IN', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit',
        month: 'short'
      })
    }
  }

  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  if (isLoading || !chartData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Price Chart</span>
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    )
  }

  const { data, summary } = chartData
  const priceChange = data.length > 1 ? data[data.length - 1].price - data[0].price : 0
  const priceChangePercent = data.length > 1 ? (priceChange / data[0].price) * 100 : 0
  const isPositive = priceChange >= 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Price Chart</CardTitle>
            <CardDescription>
              Historical price movements and trading volume
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="price" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="price" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTimestamp}
                    className="text-xs"
                  />
                  <YAxis 
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tickFormatter={formatCurrency}
                    className="text-xs"
                  />
                  <Tooltip 
                    labelFormatter={(value) => formatTimestamp(Number(value))}
                    formatter={(value: number) => [formatCurrency(value), 'Price']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                    fill={isPositive ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="volume" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTimestamp}
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={formatVolume}
                    className="text-xs"
                  />
                  <Tooltip 
                    labelFormatter={(value) => formatTimestamp(Number(value))}
                    formatter={(value: number) => [formatVolume(value), 'Volume']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar 
                    dataKey="volume" 
                    fill="hsl(var(--chart-3))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-slate-600">Current</div>
            <div className="font-semibold">{formatCurrency(summary.currentPrice)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">High</div>
            <div className="font-semibold text-green-600">{formatCurrency(summary.highPrice)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Low</div>
            <div className="font-semibold text-red-600">{formatCurrency(summary.lowPrice)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Volume</div>
            <div className="font-semibold">{formatVolume(summary.totalVolume)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
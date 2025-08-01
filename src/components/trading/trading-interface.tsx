'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PriceChart } from '@/components/charts/price-chart'
import { TradeHistory } from '@/components/charts/trade-history'

import { ArrowUp, ArrowDown, TrendingUp, Clock, AlertTriangle } from 'lucide-react'

interface Trade {
  id: string
  type: 'BUY' | 'SELL'
  shares: number
  price: number
  totalValue: number
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED'
  createdAt: string
  executedAt?: string
}

export function TradingInterface({ defaultTab = 'trade' }: { defaultTab?: 'trade' | 'charts' | 'history' | 'portfolio' }) {
  // Debug props
  useEffect(() => {
    console.log('TradingInterface defaultTab:', defaultTab)
  }, [defaultTab])
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Update activeTab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  
  const [demoUser, setDemoUser] = useState({
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    balance: 10000.00,
    portfolio: { shares: 50, avgPrice: 950.00 }
  });
  const [currentPrice, setCurrentPrice] = useState(1000.00)
  const [priceChange, setPriceChange] = useState(15.50)
  const [isPositive, setIsPositive] = useState(true)
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [shares, setShares] = useState('')
  const [price, setPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trades, setTrades] = useState<Trade[]>([])
  const [error, setError] = useState('')

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 10
      setCurrentPrice(prev => Math.max(prev + change, 100))
      setPriceChange(change)
      setIsPositive(change >= 0)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Load trades
  useEffect(() => {
    loadTrades()
  }, [demoUser])

  const loadTrades = async () => {
    try {
      const response = await fetch('/api/trade', {
        headers: {
          'Authorization': `Bearer ${demoUser.id}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTrades(data.trades)
      }
    } catch (error) {
      console.error('Failed to load trades:', error)
    }
  }

  const calculateTotal = () => {
    const sharesNum = parseFloat(shares) || 0
    const priceNum = parseFloat(price) || currentPrice
    return sharesNum * priceNum
  }

  const executeTrade = async () => {
    const sharesNum = parseFloat(shares)
    const priceNum = parseFloat(price) || currentPrice

    if (!sharesNum || sharesNum <= 0) {
      setError('Please enter a valid number of shares')
      return
    }

    if (tradeType === 'BUY' && calculateTotal() > demoUser.balance) {
      setError('Insufficient balance')
      return
    }

    if (tradeType === 'SELL' && (!demoUser.portfolio || demoUser.portfolio.shares < sharesNum)) {
      setError('Insufficient shares')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${demoUser.id}`
        },
        body: JSON.stringify({
          type: tradeType,
          shares: sharesNum,
          price: priceNum
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setShares('')
        setPrice('')
        setError('')
        
        // Reload trades and update user data
        await loadTrades()
        // You might want to update user context here as well
        
        // Show success message (you could use a toast here)
        alert(`Trade executed successfully! ${tradeType} ${sharesNum} shares at ₹${priceNum.toFixed(2)}`)
      } else {
        setError(data.error || 'Trade failed')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Market Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Market Overview</span>
              <Badge variant="secondary">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">₹{currentPrice.toFixed(2)}</div>
                <div className={`flex items-center justify-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="text-sm">
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({((priceChange / currentPrice) * 100).toFixed(2)}%)
                  </span>
                </div>
                <div className="text-xs text-slate-500">Current Price</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{demoUser.portfolio?.shares || 0}</div>
                    <div className="text-sm text-slate-600">Your Shares</div>
                    <div className="text-xs text-slate-500">
                      Avg: ₹{(demoUser.portfolio?.avgPrice || 0).toFixed(2)}
                    </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">₹{(demoUser.balance || 0).toFixed(2)}</div>
                    <div className="text-sm text-slate-600">Available Balance</div>
                    <div className="text-xs text-slate-500">For trading</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
  ₹{((demoUser.portfolio?.shares || 0) * currentPrice).toFixed(2)}
                </div>
                <div className="text-sm text-slate-600">Portfolio Value</div>
                <div className="text-xs text-slate-500">At current price</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(value: "trade" | "charts" | "history" | "portfolio") => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buy/Sell Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                  <CardDescription>
                    Buy or sell shares at your preferred price
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      variant={tradeType === 'BUY' ? 'default' : 'outline'}
                      onClick={() => setTradeType('BUY')}
                      className="flex-1"
                    >
                      Buy
                    </Button>
                    <Button
                      variant={tradeType === 'SELL' ? 'default' : 'outline'}
                      onClick={() => setTradeType('SELL')}
                      className="flex-1"
                    >
                      Sell
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shares">Number of Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      placeholder="Enter shares"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      min="1"
                      max={tradeType === 'SELL' ? (demoUser.portfolio?.shares || 0) : 1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Share (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0.01"
                      step="0.01"
                    />
                    <p className="text-xs text-slate-500">
                      Current market price: ₹{currentPrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Estimated Total:</span>
                      <span className="text-lg font-bold">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    {tradeType === 'BUY' && (
                      <div className="text-xs text-slate-600">
                        Available balance: ₹{demoUser.balance.toFixed(2)}
                      </div>
                    )}
                    {tradeType === 'SELL' && demoUser.portfolio && (
                      <div className="text-xs text-slate-600">
                        Available shares: {demoUser.portfolio?.shares || 0}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <Button 
                    onClick={executeTrade} 
                    disabled={isSubmitting || !shares}
                    className="w-full"
                  >
                    {isSubmitting ? 'Processing...' : `${tradeType} Shares`}
                  </Button>
                </CardContent>
              </Card>

              {/* Market Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Information</CardTitle>
                  <CardDescription>
                    Real-time market data and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">24h Volume</span>
                      <span className="font-medium">₹2.4M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Market Cap</span>
                      <span className="font-medium">₹10M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Shareholders</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Shares Outstanding</span>
                      <span className="font-medium">10,000</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Your Position</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Total Shares</span>
                        <span className="font-medium">{demoUser.portfolio?.shares || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Average Cost</span>
                        <span className="font-medium">
  ₹{(demoUser.portfolio?.avgPrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Current Value</span>
                        <span className="font-medium">
  ₹{((demoUser.portfolio?.shares || 0) * currentPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Profit/Loss</span>
                        <span className={`font-medium ${
  ((demoUser.portfolio?.shares || 0) * (currentPrice - (demoUser.portfolio?.avgPrice || 0))) >= 0
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
  ₹{((demoUser.portfolio?.shares || 0) * (currentPrice - (demoUser.portfolio?.avgPrice || 0))).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <PriceChart currentPrice={currentPrice} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <TradeHistory userId={demoUser.id} />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>
                  Detailed breakdown of your investment portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Investment</h3>
                    <p className="text-2xl font-bold text-blue-900">
  ₹{((demoUser.portfolio?.shares || 0) * (demoUser.portfolio?.avgPrice || 0)).toFixed(2)}
                    </p>
                    <p className="text-sm text-blue-700">Cost basis of your holdings</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Current Value</h3>
                    <p className="text-2xl font-bold text-green-900">
  ₹{((demoUser.portfolio?.shares || 0) * currentPrice).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-700">Market value at current price</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Total Returns</h3>
                    <p className={`text-2xl font-bold ${
  ((demoUser.portfolio?.shares || 0) * (currentPrice - (demoUser.portfolio?.avgPrice || 0))) >= 0
                        ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {((demoUser.portfolio?.shares || 0) * (currentPrice - (demoUser.portfolio?.avgPrice || 0))) >= 0 ? '+' : ''}
  ₹{((demoUser.portfolio?.shares || 0) * (currentPrice - (demoUser.portfolio?.avgPrice || 0))).toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-700">
                      {(
                        ((currentPrice - (demoUser.portfolio?.avgPrice || 0)) / (demoUser.portfolio?.avgPrice || 1)) * 100 || 0
                      ).toFixed(2)}% return
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">PublicTrade Shares</span>
                          <span className="font-medium">
                            {demoUser.portfolio?.shares || 0} shares
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cash Balance</span>
                          <span className="font-medium">
                            ₹{(demoUser.balance || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Portfolio Value</span>
                          <span className="font-medium">
  ₹{((demoUser.portfolio?.shares || 0) * currentPrice + (demoUser.balance || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Today's Change</span>
                          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Gain/Loss</span>
                          <span className={`font-medium ${
  ((demoUser.portfolio?.shares || 0) * (currentPrice - (demoUser.portfolio?.avgPrice || 0))) >= 0
                              ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {((demoUser.portfolio?.shares || 0) * (currentPrice - (demoUser.portfolio?.avgPrice || 0))) >= 0 ? '+' : ''}
                            {(
                              ((currentPrice - (demoUser.portfolio?.avgPrice || 0)) / (demoUser.portfolio?.avgPrice || 1)) * 100 || 0
                            ).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Share of Total Supply</span>
                          <span className="font-medium">
                            {(((demoUser.portfolio?.shares || 0) / 10000) * 100).toFixed(4)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
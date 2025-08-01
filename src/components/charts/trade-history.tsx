'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Search, Filter, Download, Eye } from 'lucide-react'

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

interface TradeHistoryProps {
  userId?: string
  className?: string
}

export function TradeHistory({ userId, className = "" }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadTrades()
  }, [userId])

  useEffect(() => {
    filterAndSortTrades()
  }, [trades, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const loadTrades = async () => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`
      }

      const response = await fetch('/api/trade', { headers })
      if (response.ok) {
        const data = await response.json()
        setTrades(data.trades || [])
      }
    } catch (error) {
      console.error('Failed to load trades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortTrades = () => {
    let filtered = [...trades]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trade => trade.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(trade => trade.type === typeFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'shares':
          aValue = a.shares
          bValue = b.shares
          break
        case 'totalValue':
          aValue = a.totalValue
          bValue = b.totalValue
          break
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredTrades(filtered)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`

  const getStatusBadge = (status: string) => {
    const variants = {
      EXECUTED: 'default',
      PENDING: 'secondary',
      CANCELLED: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const isBuy = type === 'BUY'
    return (
      <Badge variant={isBuy ? 'default' : 'secondary'} className={isBuy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {type}
      </Badge>
    )
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Shares', 'Price', 'Total Value', 'Status']
    const csvData = [
      headers.join(','),
      ...filteredTrades.map(trade => [
        formatDateTime(trade.createdAt),
        trade.type,
        trade.shares,
        trade.price,
        trade.totalValue,
        trade.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trade-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>Loading your trading activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>
              Complete record of all your trading activity
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="EXECUTED">Executed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="shares">Shares</SelectItem>
                <SelectItem value="totalValue">Total Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-slate-600">Total Trades</div>
            <div className="font-semibold">{filteredTrades.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Buy Orders</div>
            <div className="font-semibold text-green-600">
              {filteredTrades.filter(t => t.type === 'BUY').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Sell Orders</div>
            <div className="font-semibold text-red-600">
              {filteredTrades.filter(t => t.type === 'SELL').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Total Volume</div>
            <div className="font-semibold">
              {filteredTrades.reduce((sum, t) => sum + t.shares, 0)}
            </div>
          </div>
        </div>

        {/* Trade Table */}
        {filteredTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {trades.length === 0 ? 'No trades found.' : 'No trades match your filters.'}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{formatDateTime(trade.createdAt).split(',')[0]}</div>
                        <div className="text-xs text-slate-500">
                          {formatDateTime(trade.createdAt).split(',')[1]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(trade.type)}</TableCell>
                    <TableCell>{trade.shares.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(trade.price)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(trade.totalValue)}</TableCell>
                    <TableCell>{getStatusBadge(trade.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination could be added here for large datasets */}
      </CardContent>
    </Card>
  )
}
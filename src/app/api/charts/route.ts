// Remove duplicate import since it's already imported below
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '1d' // 1d, 1w, 1m
    const limit = parseInt(searchParams.get('limit') || '100')

    // Generate historical price data based on timeframe
    const now = new Date()
    let intervalMs = 0
    let numDataPoints = 0

    switch (timeframe) {
      case '1d':
        intervalMs = 5 * 60 * 1000 // 5 minutes
        numDataPoints = Math.min(288, limit) // 24 hours / 5 minutes
        break
      case '1w':
        intervalMs = 30 * 60 * 1000 // 30 minutes
        numDataPoints = Math.min(336, limit) // 7 days * 48 points per day
        break
      case '1m':
        intervalMs = 2 * 60 * 60 * 1000 // 2 hours
        numDataPoints = Math.min(360, limit) // 30 days * 12 points per day
        break
      default:
        intervalMs = 5 * 60 * 1000
        numDataPoints = Math.min(100, limit)
    }

    let chartData: { timestamp: number; price: number; volume: number; change: number }[] = []

    // Get actual stock prices from database
    const stockPrices = await db.stockPrice.findMany({
      orderBy: { timestamp: 'desc' },
      take: numDataPoints,
    })

    if (stockPrices.length > 0) {
      // Use real data
      chartData = stockPrices.map((price): {timestamp: number; price: number; volume: number; change: number} => ({
        timestamp: price.timestamp.getTime(),
        price: price.price,
        volume: price.volume,
        change: price.change,
      })).reverse()
    } else {
      // Generate realistic sample data if no real data exists
      let basePrice = 1000
      const now = new Date()
      
      for (let i = 0; i < numDataPoints; i++) {
        const timestamp = new Date(now.getTime() - (numDataPoints - 1 - i) * intervalMs)
        
        // Add some realistic price movement
        const change = (Math.random() - 0.5) * 20
        basePrice = Math.max(basePrice + change, 100)
        
        chartData.push({
          timestamp: timestamp.getTime(),
          price: parseFloat(basePrice.toFixed(2)),
          volume: Math.floor(Math.random() * 1000) + 100,
          change: parseFloat(change.toFixed(2)),
        });
      }

      // Save generated data to database for future use
      for (const data of chartData) {
        await db.stockPrice.create({
          data: {
            price: data.price,
            change: data.change as number,
            volume: data.volume,
            timestamp: new Date(data.timestamp),
          }
        })
      }
    }

    return NextResponse.json({
      timeframe,
      data: chartData,
      summary: {
        currentPrice: chartData[chartData.length - 1]?.price || 1000,
        highPrice: chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0,
        lowPrice: chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0,
        totalVolume: chartData.reduce((sum, d: { volume: number }) => sum + d.volume, 0),
        dataPoints: chartData.length,
      }
    })
  } catch (error) {
    console.error('Charts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
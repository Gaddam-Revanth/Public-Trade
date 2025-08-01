// Remove duplicate import since it's already imported below
import { db } from '@/lib/db'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const tradeSchema = z.object({
  type: z.enum(['BUY', 'SELL']),
  shares: z.number().min(1).max(1000),
  price: z.number().min(0.01),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, shares, price } = tradeSchema.parse(body)

        // Simulate user authentication for demo
    const userEmail = 'demo@example.com' // Replace with actual user email from your auth system

    const user = await db.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = user.id

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const portfolio = await db.portfolio.findUnique({
      where: { userId }
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    const totalValue = shares * price

    // Validate trade
    if (type === 'BUY') {
      if (user.balance < totalValue) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }
    } else if (type === 'SELL') {
      if (portfolio.shares < shares) {
        return NextResponse.json(
          { error: 'Insufficient shares' },
          { status: 400 }
        )
      }
    }

    // Create trade record
    const trade = await db.trade.create({
      data: {
        userId,
        type,
        shares,
        price,
        totalValue,
        status: 'EXECUTED',
        executedAt: new Date(),
      }
    })

    // Update user balance and portfolio
    if (type === 'BUY') {
      // Update user balance
      await db.user.update({
        where: { id: userId },
        data: {
          balance: user.balance - totalValue
        }
      })

      // Update portfolio
      const totalShares = portfolio.shares + shares
      const totalCost = (portfolio.shares * portfolio.avgPrice) + totalValue
      const newAvgPrice = totalCost / totalShares

      await db.portfolio.update({
        where: { userId },
        data: {
          shares: totalShares,
          avgPrice: newAvgPrice
        }
      })
    } else if (type === 'SELL') {
      // Update user balance
      await db.user.update({
        where: { id: userId },
        data: {
          balance: user.balance + totalValue
        }
      })

      // Update portfolio
      const remainingShares = portfolio.shares - shares
      
      await db.portfolio.update({
        where: { userId },
        data: {
          shares: remainingShares,
          // Keep average price the same for remaining shares
        }
      })
    }

    // Record stock price
    await db.stockPrice.create({
      data: {
        price,
        change: 0, // You might want to calculate this based on previous price
        volume: shares,
        timestamp: new Date(),
      }
    })

    return NextResponse.json({
      message: 'Trade executed successfully',
      trade: {
        id: trade.id,
        type: trade.type,
        shares: trade.shares,
        price: trade.price,
        totalValue: trade.totalValue,
        status: trade.status,
        executedAt: trade.executedAt,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Trade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simulate user authentication for demo
    const userEmail = 'demo@example.com' // Replace with actual user email from your auth system

    const user = await db.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = user.id

    // Get user's trade history
    const trades = await db.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 trades
    })

    return NextResponse.json({
      trades: trades.map(trade => ({
        id: trade.id,
        type: trade.type,
        shares: trade.shares,
        price: trade.price,
        totalValue: trade.totalValue,
        status: trade.status,
        createdAt: trade.createdAt,
        executedAt: trade.executedAt,
      }))
    })
  } catch (error) {
    console.error('Get trades error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
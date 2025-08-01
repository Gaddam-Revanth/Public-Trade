import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple admin authentication (in production, use proper auth)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-key'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get platform statistics
    const totalUsers = await db.user.count()
    const totalTrades = await db.trade.count()
    const totalVotes = await db.vote.count()
    
    // Get latest stock price
    const latestStockPrice = await db.stockPrice.findFirst({
      orderBy: { timestamp: 'desc' }
    })

    // Get recent trades
    const recentTrades = await db.trade.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Get user statistics
    const usersWithPortfolio = await db.user.findMany({
      include: {
        portfolio: true
      }
    })

    const totalSharesOwned = usersWithPortfolio.reduce((sum, user) => sum + (user.portfolio?.shares || 0), 0)
    const totalPortfolioValue = usersWithPortfolio.reduce((sum, user) => {
      return sum + ((user.portfolio?.shares || 0) * (latestStockPrice?.price || 1000))
    }, 0)

    // Calculate daily stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayTrades = await db.trade.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    const todayUsers = await db.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    return NextResponse.json({
      platform: {
        totalUsers,
        totalTrades,
        totalVotes,
        todayTrades,
        todayUsers,
        currentPrice: latestStockPrice?.price || 1000,
        totalSharesOwned,
        totalPortfolioValue,
        marketCap: 10000 * (latestStockPrice?.price || 1000) // 10,000 shares outstanding
      },
      recentTrades: recentTrades.map(trade => ({
        id: trade.id,
        type: trade.type,
        shares: trade.shares,
        price: trade.price,
        totalValue: trade.totalValue,
        status: trade.status,
        user: trade.user,
        createdAt: trade.createdAt
      })),
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'updatePrice':
        const { price } = body
        if (typeof price !== 'number' || price <= 0) {
          return NextResponse.json(
            { error: 'Invalid price' },
            { status: 400 }
          )
        }

        // Create new stock price entry
        const newPrice = await db.stockPrice.create({
          data: {
            price,
            change: 0, // Could calculate based on previous price
            volume: 0,
            timestamp: new Date(),
          }
        })

        return NextResponse.json({
          message: 'Price updated successfully',
          price: newPrice
        })

      case 'createProposal':
        const { title, description, deadline } = body
        if (!title || !description || !deadline) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        // In a real system, you'd create a proper proposal record
        return NextResponse.json({
          message: 'Proposal created successfully',
          proposal: {
            id: `proposal_${Date.now()}`,
            title,
            description,
            deadline: new Date(deadline),
            createdAt: new Date()
          }
        })

      case 'broadcastMessage':
        const { message } = body
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required' },
            { status: 400 }
          )
        }

        // In a real system, you'd broadcast this via WebSocket
        return NextResponse.json({
          message: 'Broadcast queued successfully',
          broadcast: {
            message,
            timestamp: new Date(),
            recipients: 'all'
          }
        })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
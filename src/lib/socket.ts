import { Server } from 'socket.io'

export interface StockUpdate {
  price: number
  change: number
  volume: number
  timestamp: number
}

export interface TradeUpdate {
  userId: string
  type: 'BUY' | 'SELL'
  shares: number
  price: number
  totalValue: number
  timestamp: number
}

export interface VoteUpdate {
  proposalId: string
  userId: string
  decision: boolean
  timestamp: number
}

export const setupSocket = (io: Server) => {
  // Store connected clients
  const connectedClients = new Set()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    connectedClients.add(socket.id)

    // Send current price to new client
    socket.emit('priceUpdate', {
      price: 1000 + Math.random() * 100,
      change: (Math.random() - 0.5) * 20,
      volume: Math.floor(Math.random() * 1000),
      timestamp: Date.now()
    })

    // Handle price updates
    socket.on('requestPriceUpdate', () => {
      const update = {
        price: 1000 + Math.random() * 100,
        change: (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 1000),
        timestamp: Date.now()
      }
      socket.emit('priceUpdate', update)
    })

    // Handle trade notifications
    socket.on('tradeExecuted', (trade: TradeUpdate) => {
      // Broadcast trade to all connected clients
      io.emit('tradeNotification', {
        ...trade,
        message: `New ${trade.type} order: ${trade.shares} shares at ₹${trade.price.toFixed(2)}`
      })
    })

    // Handle vote notifications
    socket.on('voteCast', (vote: VoteUpdate) => {
      // Broadcast vote to all connected clients
      io.emit('voteNotification', {
        ...vote,
        message: `New vote cast on proposal ${vote.proposalId}`
      })
    })

    // Handle messages (backward compatibility)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      connectedClients.delete(socket.id)
    })

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to PublicTrade Real-time Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    })
  })

  // Simulate real-time price updates every 5 seconds
  setInterval(() => {
    if (connectedClients.size > 0) {
      const update = {
        price: 1000 + Math.random() * 100,
        change: (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 1000),
        timestamp: Date.now()
      }
      io.emit('priceUpdate', update)
    }
  }, 5000)
}

export function getSocketIOClient() {
  if (typeof window !== 'undefined') {
    return (window as any).io
  }
  return null
}
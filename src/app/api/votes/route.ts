import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const voteSchema = z.object({
  proposal: z.string().min(1),
  decision: z.boolean(),
})

const createProposalSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  options: z.array(z.string()).min(2).max(5),
  deadline: z.string().transform(val => new Date(val)),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is a vote or creating a proposal
    if (body.proposal && body.decision !== undefined) {
      // This is a vote
      const { proposal, decision } = voteSchema.parse(body)

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

      // Check if user has already voted on this proposal
      const existingVote = await db.vote.findFirst({
        where: {
          userId,
          proposal,
        }
      })

      if (existingVote) {
        return NextResponse.json(
          { error: 'You have already voted on this proposal' },
          { status: 400 }
        )
      }

      // Record the vote
      const vote = await db.vote.create({
        data: {
          userId,
          proposal,
          decision,
        }
      })

      return NextResponse.json({
        message: 'Vote recorded successfully',
        vote: {
          id: vote.id,
          proposal: vote.proposal,
          decision: vote.decision,
          createdAt: vote.createdAt,
        }
      })
    } else if (body.title && body.description) {
      // This is creating a proposal (admin only)
      const { title, description, options, deadline } = createProposalSchema.parse(body)

      // For now, we'll store proposals as votes with a special format
      // In a real system, you'd have a separate Proposal model
      
      return NextResponse.json({
        message: 'Proposal created successfully',
        proposal: {
          id: `proposal_${Date.now()}`,
          title,
          description,
          options,
          deadline,
          createdAt: new Date(),
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Vote API error:', error)
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

    const { searchParams } = new URL(request.url)
    const proposalId = searchParams.get('proposal')

    if (proposalId) {
      // Get votes for a specific proposal
      const votes = await db.vote.findMany({
        where: { proposal: proposalId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const totalVotes = votes.length
      const yesVotes = votes.filter(v => v.decision).length
      const noVotes = votes.filter(v => !v.decision).length

      return NextResponse.json({
        proposal: proposalId,
        totalVotes,
        yesVotes,
        noVotes,
        yesPercentage: totalVotes > 0 ? (yesVotes / totalVotes * 100).toFixed(1) : 0,
        noPercentage: totalVotes > 0 ? (noVotes / totalVotes * 100).toFixed(1) : 0,
        votes: votes.map(vote => ({
          id: vote.id,
          user: vote.user,
          decision: vote.decision,
          createdAt: vote.createdAt,
        }))
      })
    } else {
      // Get all proposals (for demo, we'll return some sample proposals)
      const proposals = [
        {
          id: 'proposal_1',
          title: 'Expand Marketing Budget',
          description: 'Should we allocate additional funds for marketing and user acquisition campaigns?',
          options: ['Yes', 'No'],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          totalVotes: 0,
          status: 'active'
        },
        {
          id: 'proposal_2',
          title: 'Introduce Mobile App',
          description: 'Should we prioritize the development of a mobile application for the platform?',
          options: ['Yes', 'No'],
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          totalVotes: 0,
          status: 'active'
        },
        {
          id: 'proposal_3',
          title: 'Lower Trading Fees',
          description: 'Should we reduce the trading fees to attract more users to the platform?',
          options: ['Yes', 'No'],
          deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (expired)
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          totalVotes: 0,
          status: 'closed'
        }
      ]

      // Get actual vote counts for each proposal
      for (const proposal of proposals) {
        const votes = await db.vote.findMany({
          where: { proposal: proposal.id }
        })
        proposal.totalVotes = votes.length
      }

      return NextResponse.json({
        proposals
      })
    }
  } catch (error) {
    console.error('Get votes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
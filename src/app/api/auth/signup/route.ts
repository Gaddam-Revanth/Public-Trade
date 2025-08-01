import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        balance: 10000.00, // Starting balance
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        createdAt: true,
      }
    })

    // Create portfolio for user
    await db.portfolio.create({
      data: {
        userId: user.id,
        shares: 0,
        avgPrice: 0,
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
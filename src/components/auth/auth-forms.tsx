'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


import { Loader2 } from 'lucide-react'


interface AuthFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate login success for demo purposes
    if (email === 'demo@example.com' && password === 'password') {
      onSuccess?.();
    } else {
      setError('Invalid credentials. Use demo@example.com / password');
    }



    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Log In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
        <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
          <p className="font-medium">Demo Credentials:</p>
          <div className="flex justify-between items-center mt-1">
            <p>Email: demo@example.com</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEmail('demo@example.com');
                setPassword('password');
              }}
            >
              Auto-fill
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function SignupForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Simulate signup success for demo purposes
    if (email && name && password) {
      onSuccess?.();
    } else {
      setError('Please fill in all fields.');
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create a new account to start trading
        </CardDescription>
        <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
          <p className="font-medium">Demo Mode:</p>
          <div className="flex justify-between items-center mt-1">
            <p>Fill in any details to create a demo account</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setName('Demo User');
                setEmail('demo@example.com');
                setPassword('password');
                setConfirmPassword('password');
              }}
            >
              Auto-fill
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
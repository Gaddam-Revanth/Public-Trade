'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoginForm, SignupForm } from './auth-forms'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  authMode?: 'login' | 'signup'
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, authMode: initialAuthMode = 'login', onSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialAuthMode)

  // Update authMode when prop changes
  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
    }
  }, [initialAuthMode]);

  const handleAuthSuccess = () => {
    onClose();
    onSuccess?.();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center space-x-4 mb-4">
            <Button
              variant={authMode === 'login' ? 'default' : 'outline'}
              onClick={() => setAuthMode('login')}
            >
              Log In
            </Button>
            <Button
              variant={authMode === 'signup' ? 'default' : 'outline'}
              onClick={() => setAuthMode('signup')}
            >
              Sign Up
            </Button>
          </div>
          <DialogTitle className="sr-only">
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </DialogTitle>
        </DialogHeader>
        
        {authMode === 'login' ? (
          <LoginForm onSuccess={handleAuthSuccess} />
        ) : (
          <SignupForm onSuccess={handleAuthSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}
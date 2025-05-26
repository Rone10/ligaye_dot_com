'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Sign-in error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))]">
      <Card className="w-full max-w-md mx-auto glass-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-600">Oops! Something went wrong</CardTitle>
          <CardDescription className="text-center">
            We encountered an error while trying to process your sign-in request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={reset}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 
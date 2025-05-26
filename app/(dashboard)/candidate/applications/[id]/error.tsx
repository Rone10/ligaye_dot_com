'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application detail error:', error)
  }, [error])

  return (
          <div className="glass-card border-red-200 dark:border-red-800 overflow-hidden p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      
      <h1 className="text-xl font-bold text-foreground mb-3">Something went wrong</h1>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        We encountered an error while loading this application. Please try again or go back to your applications.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
          variant="outline"
          onClick={() => reset()}
          className="inline-flex items-center"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try again
        </Button>
        
        <Link href="/candidate/applications" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Back to Applications
          </Button>
        </Link>
      </div>
    </div>
  )
} 
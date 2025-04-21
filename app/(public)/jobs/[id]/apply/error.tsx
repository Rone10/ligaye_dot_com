'use client'

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
  
  return (
    <div className="container max-w-3xl mx-auto py-10 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-gray-dark mb-6">
          There was an error loading the application form.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
          <Button onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
} 
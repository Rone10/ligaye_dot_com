'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface HashFragmentHandlerProps {
  onSessionReady?: () => void
  children: React.ReactNode
}

export function HashFragmentHandler({ onSessionReady, children }: HashFragmentHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function handleHashFragment() {
      // Check if we have a hash fragment
      if (!window.location.hash) {
        setIsProcessing(false)
        return
      }

      try {
        // Parse hash fragment parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // Check if this is a recovery flow
        if (type === 'recovery' && accessToken && refreshToken) {
          const supabase = createClient()
          
          // Set the session using the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Session error:', sessionError)
            setError('Failed to authenticate. Please request a new password reset.')
            setIsProcessing(false)
            return
          }

          // Clean up the URL by removing the hash fragment
          const cleanUrl = window.location.href.split('#')[0]
          window.history.replaceState({}, document.title, cleanUrl)

          // Notify parent component that session is ready
          if (onSessionReady) {
            onSessionReady()
          }
        }
      } catch (err) {
        console.error('Hash fragment processing error:', err)
        setError('An error occurred while processing the reset link.')
      } finally {
        setIsProcessing(false)
      }
    }

    handleHashFragment()
  }, [onSessionReady, router])

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Processing reset link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Authentication Error</h2>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <a 
              href="/reset-password" 
              className="text-red-700 underline text-sm mt-2 inline-block"
            >
              Request a new reset link
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
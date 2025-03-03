'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token || type !== 'signup') {
          throw new Error('Invalid verification link')
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup',
        })

        if (error) throw error
        setIsVerified(true)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Verification failed',
        })
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, toast, supabase.auth])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Verifying your email address...'
              : isVerified
              ? 'Your email has been verified successfully!'
              : 'Email verification failed.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Button
              onClick={() => router.push('/sign-in')}
              className="w-full"
            >
              {isVerified ? 'Go to Sign In' : 'Try Again'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
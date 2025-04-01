import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

export type VerificationStatusProps = {
  status: 'success' | 'error' | 'pending'
  message?: string
}

export function VerificationStatus({ status, message }: VerificationStatusProps) {
  return (
    <Card className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-lg border border-gray/30 shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
          {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
          {status === 'pending' && <Clock className="h-12 w-12 text-amber-500" />}
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {status === 'success' && 'Email Verified'}
          {status === 'error' && 'Verification Failed'}
          {status === 'pending' && 'Verification Pending'}
        </CardTitle>
        <CardDescription className="text-center">
          {message || (
            <>
              {status === 'success' && 'Your email has been successfully verified. You can now sign in to your account.'}
              {status === 'error' && 'We encountered an error while verifying your email. The link may have expired or is invalid.'}
              {status === 'pending' && 'Please check your email for a verification link to complete the sign-up process.'}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {status === 'success' && (
          <Button asChild className="bg-primary-blue hover:bg-primary-blue-light">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
        {status === 'error' && (
          <Button asChild className="bg-primary-blue hover:bg-primary-blue-light">
            <Link href="/sign-in">Return to Sign In</Link>
          </Button>
        )}
        {status === 'pending' && (
          <Button asChild className="bg-primary-blue hover:bg-primary-blue-light">
            <Link href="/sign-in">Continue to Sign In</Link>
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <p className="text-sm text-gray-dark">
          Need help?{' '}
          <Link href="/contact" className="text-primary-blue hover:underline">
            Contact Support
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 
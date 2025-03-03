'use client'

import { Suspense } from 'react'
import { VerifyEmail } from './verify-email'

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="w-full max-w-md p-6 bg-card text-card-foreground rounded-lg shadow-sm">
          <div className="space-y-1.5 text-center">
            <h2 className="text-2xl font-semibold">Email Verification</h2>
            <p className="text-sm text-muted-foreground">
              Verifying your email address...
            </p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmail />
    </Suspense>
  )
} 
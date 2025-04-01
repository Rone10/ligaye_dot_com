# Authentication Implementation Plan for Ligaye.com

## Overview

This document outlines the implementation plan for authentication flows in the Ligaye.com job board platform. The authentication system will be built using Supabase Auth, with database interactions handled via Drizzle ORM. All implementations will strictly follow the Vertical Slice Architecture (VSA) as defined in the project's architecture guidelines.

## Core Architecture Principles

- All authentication-related code will reside within route segments under `app/(auth)/`
- Each route segment is a self-contained slice with its own components, actions, queries, and utils
- Server Actions will be used for all authentication operations
- Database interactions will be handled by functions in specific `_queries.ts` files
- Form validation will use React Hook Form (RHF) and Zod
- UI components will leverage Shadcn UI with Tailwind CSS, following the project's glassmorphic design system

## 1. Sign-Up Flow Implementation

### 1.1. File Structure

```
app/
└── (auth)/
    └── sign-up/
        ├── page.tsx                 # Server Component that renders SignUpForm
        ├── _components/
        │   └── SignUpForm.tsx       # Client Component with form logic
        ├── _actions.ts              # Server Action for sign-up logic
        ├── _queries.ts              # Database interactions for creating profile
        ├── _utils/
        │   └── validation.ts        # Zod schemas for form validation
        └── error.tsx                # Error boundary for the route
```

### 1.2. Detailed Component Implementation

#### `app/(auth)/sign-up/page.tsx`
Server Component that hosts the sign-up form and handles metadata.

```typescript
// Server Component
export const metadata = {
  title: 'Sign Up - Ligaye.com',
  description: 'Create an account on Ligaye.com'
}

export default function SignUpPage() {
  return (
    <div className="...">
      <SignUpForm />
    </div>
  )
}
```

#### `app/(auth)/sign-up/_components/SignUpForm.tsx`
Client Component that implements the sign-up form UI and logic.

```typescript
'use client'

// Imports for React Hook Form, Zod, Shadcn UI components, and the sign-up action

interface SignUpFormProps {}

export function SignUpForm({}: SignUpFormProps) {
  // React Hook Form implementation with Zod validation
  // Form UI with Shadcn UI components
  // Error handling and display
  // Submission handler that calls signUpUser action
}
```

#### `app/(auth)/sign-up/_utils/validation.ts`
Zod schemas for form validation specific to the sign-up flow.

```typescript
import { z } from 'zod'

export const signUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
```

#### `app/(auth)/sign-up/_actions.ts`
Server Action that handles the sign-up logic, including Supabase Auth integration and profile creation.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createUserProfile } from './_queries'
import { signUpSchema } from './_utils/validation'

export async function signUpUser(formData: FormData) {
  // 1. Validate form data using Zod schema
  // 2. Create Supabase server client
  // 3. Call supabase.auth.signUp() with email/password
  // 4. If successful, call createUserProfile() with userId, fullName, role
  // 5. Handle errors from both operations
  // 6. Redirect on success
}
```

#### `app/(auth)/sign-up/_queries.ts`
Database interactions for creating the user profile record in the profiles table.

```typescript
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { userRoleEnum } from '@/lib/db/schema'
import type { NewProfile } from '@/lib/db/schema'

export async function createUserProfile(
  userId: string,
  fullName: string,
  role: typeof userRoleEnum.enumValues[number] = 'candidate'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create user profile in profiles table using Drizzle
    await (await db())
      .insert(profiles)
      .values({
        userId,
        fullName,
        role,
      })
    
    return { success: true }
  } catch (error) {
    // Error handling
    return { success: false, error: 'Failed to create user profile' }
  }
}
```

#### `app/(auth)/sign-up/error.tsx`
Error boundary for the sign-up flow.

```typescript
'use client'

// Error boundary implementation
```

### 1.3. Data Flow

1. User fills out the sign-up form in `SignUpForm.tsx` (Client Component)
2. Form data is validated using Zod schema from `_utils/validation.ts`
3. On form submission, the `signUpUser` Server Action in `_actions.ts` is called
4. The Server Action validates the data, calls Supabase Auth's `signUp` method
5. If successful, the Server Action calls `createUserProfile` from `_queries.ts`
6. The `createUserProfile` function interacts with the database via Drizzle ORM
7. The user is redirected to a verification page on success, or shown errors on failure

## 2. Sign-In Flow Implementation

### 2.1. File Structure

```
app/
└── (auth)/
    └── sign-in/
        ├── page.tsx                 # Server Component that renders SignInForm
        ├── _components/
        │   └── SignInForm.tsx       # Client Component with form logic
        ├── _actions.ts              # Server Action for sign-in logic
        ├── _utils/
        │   └── validation.ts        # Zod schemas for form validation
        └── error.tsx                # Error boundary for the route
```

### 2.2. Detailed Component Implementation

#### `app/(auth)/sign-in/page.tsx`
Server Component that hosts the sign-in form.

```typescript
// Server Component
export const metadata = {
  title: 'Sign In - Ligaye.com',
  description: 'Sign in to your Ligaye.com account'
}

export default function SignInPage() {
  return (
    <div className="...">
      <SignInForm />
    </div>
  )
}
```

#### `app/(auth)/sign-in/_components/SignInForm.tsx`
Client Component that implements the sign-in form UI and logic.

```typescript
'use client'

// Imports for React Hook Form, Zod, Shadcn UI components, and the sign-in action

interface SignInFormProps {}

export function SignInForm({}: SignInFormProps) {
  // React Hook Form implementation with Zod validation
  // Form UI with Shadcn UI components
  // Error handling and display
  // Submission handler that calls signInUser action
}
```

#### `app/(auth)/sign-in/_utils/validation.ts`
Zod schemas for form validation specific to the sign-in flow.

```typescript
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignInFormData = z.infer<typeof signInSchema>
```

#### `app/(auth)/sign-in/_actions.ts`
Server Action that handles the sign-in logic using Supabase Auth.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInSchema } from './_utils/validation'

export async function signInUser(formData: FormData) {
  // 1. Validate form data using Zod schema
  // 2. Create Supabase server client
  // 3. Call supabase.auth.signInWithPassword() with email/password
  // 4. Handle errors (invalid credentials, etc.)
  // 5. Redirect on success to dashboard or specified redirect URL
}
```

### 2.3. Data Flow

1. User fills out the sign-in form in `SignInForm.tsx` (Client Component)
2. Form data is validated using Zod schema from `_utils/validation.ts`
3. On form submission, the `signInUser` Server Action in `_actions.ts` is called
4. The Server Action validates the data, calls Supabase Auth's `signInWithPassword` method
5. The user is redirected to the appropriate dashboard on success, or shown errors on failure

## 3. Email Verification Flow Implementation

### 3.1. File Structure

```
app/
└── (auth)/
    └── verify/
        ├── page.tsx                      # Server Component for verification logic
        ├── _components/
        │   └── VerificationStatus.tsx    # Component to display verification status
        └── _actions.ts                   # Server Action for verification if needed
```

### 3.2. Detailed Component Implementation

#### `app/(auth)/verify/page.tsx`
Server Component that handles verification token processing.

```typescript
// Server Component that processes verification
export default async function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  // 1. Extract token from search params if available
  // 2. Process verification if token exists
  // 3. Display appropriate VerificationStatus component
}
```

#### `app/(auth)/verify/_components/VerificationStatus.tsx`
Component to display verification status.

```typescript
// May be client or server component depending on needs
interface VerificationStatusProps {
  status: 'success' | 'error' | 'pending'
  message?: string
}

export function VerificationStatus({ status, message }: VerificationStatusProps) {
  // Display appropriate UI based on status
}
```

#### `app/(auth)/verify/_actions.ts`
Server Action for handling verification if needed beyond the automatic flow.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyEmail(token: string) {
  // Only needed if manual verification is required
  // Most Supabase implementations will handle this automatically
}
```

### 3.3. Data Flow

1. User clicks verification link in email, which directs to `/verify?token=xxx`
2. The `page.tsx` Server Component extracts the token from search params
3. Verification is processed (either automatically by Supabase or via a Server Action)
4. The appropriate status is displayed to the user
5. On successful verification, user may be redirected to sign-in or dashboard

## 4. Update Password Flow Implementation (for logged-in users)

### 4.1. File Structure

```
app/
└── (auth)/
    └── update-password/
        ├── page.tsx                       # Server Component that renders UpdatePasswordForm
        ├── _components/
        │   └── UpdatePasswordForm.tsx     # Client Component with form logic
        ├── _actions.ts                    # Server Action for password update
        ├── _utils/
        │   └── validation.ts              # Zod schemas for form validation
        └── error.tsx                      # Error boundary for the route
```

### 4.2. Detailed Component Implementation

#### `app/(auth)/update-password/page.tsx`
Server Component that hosts the update password form, with auth check.

```typescript
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Update Password - Ligaye.com',
  description: 'Update your account password'
}

export default async function UpdatePasswordPage() {
  const user = await getUser()
  
  // Redirect if user not logged in
  if (!user) {
    redirect('/sign-in')
  }
  
  return (
    <div className="...">
      <UpdatePasswordForm />
    </div>
  )
}
```

#### `app/(auth)/update-password/_components/UpdatePasswordForm.tsx`
Client Component that implements the password update form.

```typescript
'use client'

// Imports for React Hook Form, Zod, Shadcn UI components, and the update password action

interface UpdatePasswordFormProps {}

export function UpdatePasswordForm({}: UpdatePasswordFormProps) {
  // React Hook Form implementation with Zod validation
  // Form UI with Shadcn UI components
  // Error handling and display
  // Submission handler that calls updatePassword action
}
```

#### `app/(auth)/update-password/_utils/validation.ts`
Zod schemas for password update validation.

```typescript
import { z } from 'zod'

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
```

#### `app/(auth)/update-password/_actions.ts`
Server Action that handles the password update logic.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updatePasswordSchema } from './_utils/validation'

export async function updatePassword(formData: FormData) {
  // 1. Validate form data using Zod schema
  // 2. Create Supabase server client and get current user
  // 3. Call supabase.auth.updateUser() with new password
  // 4. Handle errors
  // 5. Provide success feedback or redirect
}
```

### 4.3. Data Flow

1. User fills out the update password form in `UpdatePasswordForm.tsx` (Client Component)
2. Form data is validated using Zod schema from `_utils/validation.ts`
3. On form submission, the `updatePassword` Server Action in `_actions.ts` is called
4. The Server Action validates the data, calls Supabase Auth's `updateUser` method
5. Success/error feedback is provided to the user

## 5. Reset Password Flow Implementation (for forgotten passwords)

### 5.1. Request Reset Flow

#### 5.1.1. File Structure

```
app/
└── (auth)/
    └── reset-password/
        ├── page.tsx                       # Server Component that renders RequestResetForm
        ├── _components/
        │   └── RequestResetForm.tsx       # Client Component with form logic
        ├── _actions.ts                    # Server Action for password reset request
        ├── _utils/
        │   └── validation.ts              # Zod schemas for form validation
        └── error.tsx                      # Error boundary for the route
```

#### 5.1.2. Detailed Component Implementation

##### `app/(auth)/reset-password/page.tsx`
Server Component that hosts the reset request form.

```typescript
export const metadata = {
  title: 'Reset Password - Ligaye.com',
  description: 'Reset your account password'
}

export default function ResetPasswordPage() {
  return (
    <div className="...">
      <RequestResetForm />
    </div>
  )
}
```

##### `app/(auth)/reset-password/_components/RequestResetForm.tsx`
Client Component for the reset request form.

```typescript
'use client'

// Imports for React Hook Form, Zod, Shadcn UI components, and the request reset action

interface RequestResetFormProps {}

export function RequestResetForm({}: RequestResetFormProps) {
  // React Hook Form implementation with Zod validation
  // Form UI with Shadcn UI components
  // Error handling and display
  // Submission handler that calls requestPasswordReset action
}
```

##### `app/(auth)/reset-password/_utils/validation.ts`
Zod schema for reset request validation.

```typescript
import { z } from 'zod'

export const requestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type RequestResetFormData = z.infer<typeof requestResetSchema>
```

##### `app/(auth)/reset-password/_actions.ts`
Server Action for requesting a password reset.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requestResetSchema } from './_utils/validation'

export async function requestPasswordReset(formData: FormData) {
  // 1. Validate form data using Zod schema
  // 2. Create Supabase server client
  // 3. Call supabase.auth.resetPasswordForEmail() with email and redirect URL
  // 4. Return generic success message (for security)
}
```

#### 5.1.3. Data Flow

1. User fills out the reset request form with their email
2. Form data is validated using Zod schema
3. On form submission, the `requestPasswordReset` Server Action is called
4. The Server Action validates the data, calls Supabase Auth's `resetPasswordForEmail` method
5. Generic success message is displayed (regardless of whether email exists for security)

### 5.2. Confirm Reset Flow

#### 5.2.1. File Structure

```
app/
└── (auth)/
    └── reset-password/
        └── confirm/
            ├── page.tsx                      # Server Component that renders ConfirmResetForm
            ├── _components/
            │   └── ConfirmResetForm.tsx      # Client Component with form logic
            ├── _actions.ts                   # Server Action for password reset confirmation
            ├── _utils/
            │   └── validation.ts             # Zod schemas for form validation
            └── error.tsx                     # Error boundary for the route
```

#### 5.2.2. Detailed Component Implementation

##### `app/(auth)/reset-password/confirm/page.tsx`
Server Component that hosts the reset confirmation form.

```typescript
export const metadata = {
  title: 'Set New Password - Ligaye.com',
  description: 'Set a new password for your account'
}

export default function ConfirmResetPage() {
  return (
    <div className="...">
      <ConfirmResetForm />
    </div>
  )
}
```

##### `app/(auth)/reset-password/confirm/_components/ConfirmResetForm.tsx`
Client Component for setting a new password.

```typescript
'use client'

// Imports for React Hook Form, Zod, Shadcn UI components, and the confirm reset action

interface ConfirmResetFormProps {}

export function ConfirmResetForm({}: ConfirmResetFormProps) {
  // React Hook Form implementation with Zod validation
  // Form UI with Shadcn UI components
  // Error handling and display
  // Submission handler that calls confirmPasswordReset action
}
```

##### `app/(auth)/reset-password/confirm/_utils/validation.ts`
Zod schema for password confirmation validation.

```typescript
import { z } from 'zod'

export const confirmResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type ConfirmResetFormData = z.infer<typeof confirmResetSchema>
```

##### `app/(auth)/reset-password/confirm/_actions.ts`
Server Action for confirming password reset.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { confirmResetSchema } from './_utils/validation'

export async function confirmPasswordReset(formData: FormData) {
  // 1. Validate form data using Zod schema
  // 2. Create Supabase server client
  // 3. Call supabase.auth.updateUser() with new password
  // 4. Handle errors (e.g., expired token)
  // 5. Redirect on success
}
```

#### 5.2.3. Data Flow

1. User receives reset email with link to `/reset-password/confirm`
2. User fills out the new password form
3. Form data is validated using Zod schema
4. On form submission, the `confirmPasswordReset` Server Action is called
5. The Server Action validates the data, calls Supabase Auth's `updateUser` method
6. User is redirected to sign-in page on success, or shown errors on failure

## Common UI Components and Styling

All authentication forms will follow the glassmorphic design principles outlined in the style guide, featuring:

- Frosted glass background with `rgba(255, 255, 255, 0.7)` and `backdrop-filter: blur(10px)`
- Consistent border radius of `16px` for containers
- Soft shadows with `0 8px 32px rgba(31, 38, 135, 0.1)`
- Primary blue buttons `#4a6cfa` with proper hover states
- Input fields with consistent styling, including focus states
- Proper spacing according to the 4-point grid system
- Font family, sizes, and weights as specified in the style guide

## Error Handling Strategy

1. **Form Validation Errors**:
   - Handled client-side using Zod schemas
   - Displayed inline with form fields
   - Clear, user-friendly messages

2. **Server Action Errors**:
   - Structured error objects returned from Server Actions
   - Displayed in the UI via React Hook Form error handling
   - Generic messages for security-sensitive errors

3. **System-level Errors**:
   - Caught by Next.js error boundaries (`error.tsx`)
   - Appropriate fallback UI with retry options

## Conclusion

This implementation plan provides a comprehensive approach to implementing authentication flows for Ligaye.com, adhering strictly to the project's Vertical Slice Architecture and conventions. Each authentication flow is isolated in its own route segment with dedicated components, actions, queries, and utils, ensuring modularity and maintainability.

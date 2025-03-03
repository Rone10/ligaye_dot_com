import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/candidate', '/employer']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get the pathname of the request
    const pathname = request.nextUrl.pathname

    // Check if the route requires authentication (starts with /candidate or /employer)
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

    // If the user is not signed in and trying to access a protected route
    if (!user && isProtectedRoute) {
      const redirectUrl = new URL('/sign-in', request.url)
      // Add the original URL as a search parameter to redirect back after sign-in
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is signed in
    if (user) {
      // Check if accessing sign-in/sign-up pages
      if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
        // Get their profile information
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // Redirect based on their role
        if (profile?.role === 'candidate') {
          return NextResponse.redirect(new URL('/candidate/dashboard', request.url))
        } else if (profile?.role === 'employer') {
          return NextResponse.redirect(new URL('/employer/dashboard', request.url))
        } else {
          // No role yet, redirect to create profile
          return NextResponse.redirect(new URL('/create-profile', request.url))
        }
      }

      // If they're trying to access role-specific areas
      if (isProtectedRoute) {
        // Get their profile to check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // If accessing candidate area but not a candidate
        if (pathname.startsWith('/candidate') && profile?.role !== 'candidate') {
          return NextResponse.redirect(new URL('/create-profile', request.url))
        }

        // If accessing employer area but not an employer
        if (pathname.startsWith('/employer') && profile?.role !== 'employer') {
          return NextResponse.redirect(new URL('/create-profile', request.url))
        }

        // If no role assigned yet, redirect to create profile
        if (!profile?.role) {
          return NextResponse.redirect(new URL('/create-profile', request.url))
        }
      }
    }

    return supabaseResponse
  } catch (error) {
    // If there's an error, redirect to sign-in as a fallback
    const redirectUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

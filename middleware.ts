import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up', '/reset-password', '/verify']

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

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!user && !isPublicRoute) {
      const redirectUrl = new URL('/sign-in', request.url)
      // Add the original URL as a search parameter to redirect back after sign-in
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is signed in and trying to access auth pages, redirect to home
    if (user && isPublicRoute) {
      // check if the user is a candidate or an employer
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile?.role === 'candidate') {
        return NextResponse.redirect(new URL('/candidate/dashboard', request.url))
      } else if (profile?.role === 'employer') {
        return NextResponse.redirect(new URL('/employer/dashboard', request.url))
      }

      return NextResponse.redirect(new URL('/onboarding', request.url))
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

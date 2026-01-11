import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createArcjet, publicRouteRateLimit } from '@/lib/arcjet'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check for maintenance mode
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    // Allow access to the maintenance page itself to prevent redirect loop
    if (!pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
    // If already on maintenance page, allow it
    return NextResponse.next();
  }

  // Rate limit public routes only (free tier optimization)
  // Public routes: homepage, jobs, tenders, about, contact, privacy, terms
  const isPublicRoute = pathname.match(/^\/($|jobs|tenders|about|contact-us|privacy|terms)/);

  if (isPublicRoute) {
    const aj = createArcjet([publicRouteRateLimit]);
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      console.log(`Rate limit exceeded for IP: ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'} on path: ${pathname}`);

      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter: 3600
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '3600',
            'X-RateLimit-Limit': '200',
            'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString()
          }
        }
      );
    }
  }
  
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes that require authentication
  const protectedRoutes = ['/update-password', '/candidate', '/employer', '/admin'] // Add other protected prefixes if needed
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // IMPORTANT: Return the original supabaseResponse to keep session handling intact
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth (Supabase auth callback routes) - IMPORTANT
     * - Static assets (images, fonts, etc.)
     * - .well-known (for various web standards)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/.*|\.well-known|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
}

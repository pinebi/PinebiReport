import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /dashboard)
  const path = request.nextUrl.pathname

  // Define paths that are public (don't require authentication)
  const isPublicPath = path === '/login'

  // Get token from localStorage (this won't work in middleware, so we'll handle auth in components)
  // For now, we'll let all requests through and handle auth in the layout wrapper

  // If the path is public, allow it
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For now, allow all requests through
  // Authentication will be handled in the LayoutWrapper component
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}


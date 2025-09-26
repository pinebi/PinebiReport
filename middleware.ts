import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Minimal middleware - just pass through everything
  // Auth is handled client-side for better performance
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Disable middleware completely for maximum performance
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}


import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware - Simplified
 * 
 * Auth protection is handled on individual pages to avoid cookie sync issues.
 * This middleware just passes requests through.
 */
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware for Route Protection
 * 
 * This middleware runs on every request and:
 * 1. Refreshes the user's session if needed
 * 2. Protects routes that require authentication
 * 3. Redirects unauthenticated users to login page
 * 
 * Routes that require authentication:
 * - /dashboard
 * - /match/*
 * 
 * Routes that should redirect to dashboard if already authenticated:
 * - /login
 * - /signup
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes - require authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/match')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};



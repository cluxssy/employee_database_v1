import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Define routes that do NOT require authentication
    // - / (Login page)
    // - /favicon.ico
    // - /_next/* (Next.js assets)
    // - /static/* (Static assets if served via Next.js, though ours are likely backend)
    // - /logo.png, etc.
    const isPublicPath = pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.');

    // 2. If User is NOT logged in and tries to access a protected route -> Redirect to Login
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. If User IS logged in and tries to access Login (/) -> Redirect to Dashboard
    if (token && pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure which paths the middleware runs on
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
};

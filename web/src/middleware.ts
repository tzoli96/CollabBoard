import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // Protected routes
    const protectedPaths = ['/dashboard', '/teams', '/projects'];
    const { pathname } = request.nextUrl;

    if (protectedPaths.some(path => pathname.startsWith(path))) {
        // Keycloak authentication check will be handled client-side
        // This middleware can be extended for additional checks
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
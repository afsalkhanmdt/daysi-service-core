import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import * as jwt from 'jose';

const secret = new TextEncoder().encode('test');

const validateToken = async (token: string) => {
    try {
        const decoded = await jwt.jwtVerify(token, secret);
        return decoded;
    } catch (err) {
        console.error('Token validation failed:', err);
        return undefined;
    }
};

const allowlist = [
    '/api/account/register',
    '/token',
    '/admin/login',
    '/admin/family-view',
];

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    let pathname = url.pathname;

  // Skip translation files
  if (pathname.startsWith('/locales/')) {
    console.log('Bypassing middleware for translation file:', pathname);
    return NextResponse.next();
  }

  // Skip static files and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

    // Force case-insensitive allowlist check
    if (allowlist.some((path) => pathname.toLowerCase() === path.toLowerCase())) {
        // If it's in the allowlist but has uppercase, rewrite instead of redirect
        if (pathname !== pathname.toLowerCase()) {
            const rewrittenUrl = url.clone();
            rewrittenUrl.pathname = pathname.toLowerCase();
            return NextResponse.rewrite(rewrittenUrl); // rewrite = no redirect, works in same request
        }
        return NextResponse.next();
    }

    // For all other API calls, normalize to lowercase if needed
    if (pathname.startsWith('/api') && pathname !== pathname.toLowerCase()) {
        const rewrittenUrl = url.clone();
        rewrittenUrl.pathname = pathname.toLowerCase();
        return NextResponse.rewrite(rewrittenUrl);
    }

    // Auth check
    const accessToken = request.headers.get('authorization')?.split(' ')[1];
    if (!accessToken) {
        return NextResponse.json({ message: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const decoded = await validateToken(accessToken);
    if (!decoded) {
        return NextResponse.json({ message: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const response = NextResponse.next();
    response.cookies.set('user-id', decoded.payload.id as string);
    return response;
}

export const config = {
    matcher: '/:path*',
};

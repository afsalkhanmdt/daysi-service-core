import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jwt from 'jose'

const secret = new TextEncoder().encode(
    'test',
)

const validateToken = async (token: string) => {
    try {
        const decoded = await jwt.jwtVerify(token, secret);
        return decoded;
    } catch (err) {
        console.error('Token validation failed:', err);
        return undefined;
    }
}

const allowlist = [
    '/api/account/register',
    '/token',
]

export async function middleware(request: NextRequest) {
    //Check the user is authenticated
    const url = request.nextUrl
    const pathname = url.pathname
    if ((pathname.startsWith('/api') || pathname.startsWith('/Token')) && pathname !== pathname.toLowerCase()) {
        const lowercaseURL = url.clone()
        lowercaseURL.pathname = pathname.toLowerCase()
        return NextResponse.redirect(lowercaseURL)
    }
    if (allowlist.some((path) => pathname === path)) {
        return NextResponse.next()
    }
    const accessToken = request.headers.get('authorization')?.split(' ')[1];
    if (!accessToken || await validateToken(accessToken) === undefined) {
        return NextResponse.json({
            message: 'Unauthorized',
            status: 401,
        }, {
            status: 401,
        })
    }
    return NextResponse.next()
}

export const config = {
    matcher: '/:path*',
}
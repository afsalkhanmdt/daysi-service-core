import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const url = request.nextUrl
    const pathname = url.pathname
    if ((pathname.startsWith('/api') || pathname.startsWith('/Token')) && pathname !== pathname.toLowerCase()) {
        const lowercaseURL = url.clone()
        lowercaseURL.pathname = pathname.toLowerCase()
        return NextResponse.redirect(lowercaseURL)
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/:path*',
}
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  

    try {
        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get('memberId');
        const deviceToken = searchParams.get('deviceToken');
        if (!memberId || !deviceToken) {
            return new Response('Bad Request: Missing parameters', { status: 400 });
        }
        const sessionId = (await cookies()).get('user-id')?.value;

        if (!sessionId) {
            return new Response('Unauthorized', { status: 401 });
        }
        const response = new Response('Logged out successfully', { status: 200 });

        response.headers.set(
            'Set-Cookie',
            'user-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
        );

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

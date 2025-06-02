import { cookies } from "next/headers";

export async function GET() {
    try {
        const sessionId = (await cookies()).get('user-id')?.value;
        console.log(`Session ID: ${sessionId}`);

        if (!sessionId) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Clear the cookie by setting it with past expiration
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

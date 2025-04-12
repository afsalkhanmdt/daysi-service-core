import { NextRequest } from "next/server";
import { z } from "zod";

export async function POST(
    request: NextRequest
) {
    const schema = z.object({
        email: z.string().email(),
        password: z.string(),
    });
    // Parse the request body
    const result = schema.safeParse(await request.json());
    if (!result.success) {
        return Response.json({
            message: 'Invalid input',
            errors: result.error.errors,
        }, { status: 400 });
    }
    const { email, password } = result.data;

    return Response.json({
        message: 'Login successful',
        email,
        password,
    });
}
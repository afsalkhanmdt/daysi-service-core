import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest
) {
    return Response.json({
        "Email": "sooraj44@gmail.com",
        "HasRegistered": true,
        "LoginProvider": null
    });
}
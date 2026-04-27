export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const url = req.nextUrl.searchParams.get("url");

        if (!url) {
            return new Response("Missing url", { status: 400 });
        }

        // 🔒 Allow only laget domain
        if (!url.includes("cal.laget.se")) {
            return new Response("Forbidden", { status: 403 });
        }

        const response = await fetch(url, {
            method: "GET",
        });

        if (!response.ok) {
            return new Response("Failed to fetch calendar", { status: response.status });
        }

        const data = await response.text();

        return new Response(data, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar",
            },
        });

    } catch (err) {
        console.error("Proxy error:", err);
        return new Response("Internal server error", { status: 500 });
    }
}
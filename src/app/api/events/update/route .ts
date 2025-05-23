import { NextRequest } from "next/server";
import dbConnect from "../../../../core/db/connect";

import { normalizeKeys } from "../../normalizeKeys";
import { EventUpdateSchema } from "./dto";


export async function POST(request: NextRequest) {
    const normalizedRequest = normalizeKeys(await request.json());
    const result = EventUpdateSchema.safeParse(normalizedRequest);

    if (!result.success) {
        return new Response(JSON.stringify(result.error.flatten()), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    await dbConnect();

    await Event





    return Response.json({

    });
}

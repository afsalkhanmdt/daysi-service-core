import { NextRequest } from "next/server";
import dbConnect from "../../../../core/db/connect";
import { normalizeKeys } from "../../normalizeKeys";
import { EventUpdateSchema } from "./dto";
import Event from "@/models/event";

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

    const { id, ...updateFields } = result.data;

    const event = await Event.findById(id);
    console.log(`Updating event with ID: ${id}`, event);
    
    if (!event) {
        return new Response('Event not found', { status: 404 });
    }

    Object.entries(updateFields).forEach(([key, value]) => {
        event.set(key, value);
    });

    await event.save();

    return new Response(JSON.stringify({ message: "Event updated successfully", event }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

import dbConnect from "@/core/db/connect";
import Event from "@/models/event";
import { NextRequest } from "next/server";

export async function DELETE(request:NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('id');

        if (!eventId) {
            return Response.json({ message: 'Event ID is required' }, { status: 400 });
        }

        await dbConnect();

        const event = await Event.findByIdAndDelete(eventId);
        console.log(`Deleting event with ID: ${eventId}`, event);
        

        if (!event) {
            return Response.json({ message: 'Event not found' }, { status: 404 });
        }

        return Response.json({ message: 'Event deleted successfully' }, { status: 200 });
    } catch (err) {
        console.error('Error deleting event:', err);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
    
}
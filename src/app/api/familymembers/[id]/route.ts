// /api/familymembers/:id
import { cookies } from "next/headers";
import dbConnect from "../../../../core/db/connect";
import User from "../../../../models/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        const userId = (await cookies()).get('user-id')?.value;
        if (!userId) return new Response('Missing user ID', { status: 400 });

        await dbConnect();

        const familyMember = await User.findById(context.params.id);
        if (!familyMember) return new Response('Not found', { status: 404 });

        return NextResponse.json(familyMember);
    } catch (err) {
        console.error("Error:", err);
        return new Response('Internal server error', { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        await dbConnect();

        const deleted = await User.findByIdAndDelete(context.params.id);
        if (!deleted) return new Response("User not found", { status: 404 });

        return NextResponse.json({ message: "User deleted", memberId: context.params.id });
    } catch (err) {
        console.error("Error:", err);
        return new Response("Internal Server Error", { status: 500 });
    }
}

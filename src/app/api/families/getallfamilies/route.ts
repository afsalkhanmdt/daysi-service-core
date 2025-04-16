import dbConnect from "../../../../core/db/connect";
import { cookies } from "next/headers";
import Family from "../../../../models/family";
import User from "../../../../models/users";

export async function GET() {
    const userId = (await cookies()).get('user-id')?.value;
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) return new Response("User not found", { status: 404 });

    const family = await Family.findOne({ familyId: user.familyId });
    if (!family) return new Response("Family not found", { status: 404 });

    const members = await User.find({ familyId: user.familyId });

    return Response.json({
        ...family.toObject(),
        members
    });
}

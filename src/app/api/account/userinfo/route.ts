import { cookies } from "next/headers";
import dbConnect from "../../../../core/db/connect";
import User from "../../../../models/users";

export async function GET(
) {
    const userId = (await cookies()).get('user-id')?.value;
    await dbConnect();
    const user = await User.findById(userId);
    return Response.json({
        "Email": user?.email,
        "HasRegistered": true,
        "LoginProvider": null
    });
}
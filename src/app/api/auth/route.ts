import dbConnect from "@/core/db/connect"
import User from '@/models/users';

export async function GET() {
    await dbConnect();
    const users = await User.find();
    return Response.json({
        users
    })
}
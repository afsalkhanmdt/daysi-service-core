import { NextRequest } from "next/server";
import dbConnect from "../../../../core/db/connect";
import { normalizeKeys } from "../../normalizeKeys";
import { FamilyMemberUpdateSchema } from "../update/dto";
import User from "../../../../models/users";

export async function POST(request: NextRequest) {

    try {
        const normalizedRequest = normalizeKeys(await request.json());
        console.log(normalizedRequest, 'normalizedRequest');

        const result = FamilyMemberUpdateSchema.safeParse(normalizedRequest);
        console.log(result, 'result');

        if (!result.success) {
            return new Response('100', { status: 500 });
        }
        await dbConnect();
        const user = await User.findOneAndUpdate(
            { familyId: result.data.familyid, _id: result.data.memberid },
            { $set: { counter: result.data.counter } },
            { new: true }
        );
        if (!user) return new Response('User not found', { status: 404 });
        await user.save();
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (err) {
        console.error("Error:", err);
        return new Response('Internal server error', { status: 500 });
    }

}
import { NextRequest } from "next/server";
import { RegisterSchema } from "./dto";
import dbConnect from "@/core/db/connect";
import User from "@/models/users";
import bcrypt from "bcrypt";
import Family from "@/models/family";

function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};
    for (const key in obj as object) {
        normalized[key.toLowerCase()] = obj[key];
    }
    return normalized;
}

export async function POST(
    request: NextRequest
) {
    const normalizedRequest = normalizeKeys(await request.json());

    const result = RegisterSchema.safeParse(normalizedRequest);
    if (!result.success) {
        return new Response('100', { status: 500 });
    }
    await dbConnect();
    const duplicateUser = await User.findOne({
        email: result.data.email,
    });
    if (duplicateUser) {
        return new Response("103", { status: 500 });
    }
    const password = await bcrypt.hash(result.data.password, 10);
    const family = new Family({
        name: result.data.familyname,
    });
    await family.save();
    console.log(family);

    const user = new User({
        familyName: result.data.familyname,
        firstName: result.data.firstname,
        email: result.data.email,
        password,
        familyId: family.familyId,

    });
    await user.save();
    return Response.json({ Promo: 0, Month: 0, FreeTrialPeriod: 30 / 30 });
}
import { NextRequest } from "next/server";
import { RegisterSchema } from "./dto";
import dbConnect from "@/core/db/connect";
import User from "@/models/users";
import bcrypt from "bcrypt";
import Family from "@/models/family";

function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};
    for (const key in obj) {
        normalized[key.toLowerCase()] = obj[key];
    }
    return normalized;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const normalizedRequest = normalizeKeys(body);

        const result = RegisterSchema.safeParse(normalizedRequest);

        if (!result.success) {
            const { fieldErrors, formErrors } = result.error.flatten();
            return Response.json({ fieldErrors, formErrors }, { status: 400 });
        }

        await dbConnect();

        const duplicateUser = await User.findOne({ email: result.data.email });
        if (duplicateUser) {
            return Response.json(
                { message: "A user with this email already exists." },
                { status: 409 }
            );
        }

        const password = await bcrypt.hash(result.data.password, 10);

        const family = new Family({
            firstName: result.data.familyname,
        });
        await family.save();

        const user = new User({
            familyName: result.data.familyname,
            firstName: result.data.firstname,
            email: result.data.email,
            password,
            familyId: family.familyId,
        });
        await user.save();

        return Response.json({ Promo: 0, Month: 0, FreeTrialPeriod: 30 / 30 });
    } catch (err) {
        console.error("Unhandled server error:", err);
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}
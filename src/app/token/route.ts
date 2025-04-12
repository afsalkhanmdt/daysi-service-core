import { NextRequest } from "next/server";
import { LoginSchema } from "./dto";
import dbConnect from "@/core/db/connect";
import User from "@/models/users";
import bcrypt from "bcrypt";

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
    const formData = await request.formData();
    const normalizedRequest = normalizeKeys(Object.fromEntries(formData));
    const result = LoginSchema.safeParse(normalizedRequest);
    if (!result.success) {
        return new Response('100', { status: 500 });
    }
    await dbConnect();
    const user = await User.findOne({
        email: result.data.username,
    });
    if (!user) {
        return Response.json({
            "error": "invalid_credential",
            "error_description": "invalid credential"
        }, { status: 400 });
    }
    const isValidPassword = await bcrypt.compare(result.data.password, user.password);
    if (!isValidPassword) {
        return Response.json({
            "error": "invalid_credential",
            "error_description": "invalid credential"
        }, { status: 400 });
    }
    return Response.json({ Promo: 0, Month: 0, FreeTrialPeriod: 30 / 30 });
}
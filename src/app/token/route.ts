import { NextRequest } from "next/server";
import { LoginSchema } from "./dto";
import dbConnect from "@/core/db/connect";
import User from "@/models/users";
import bcrypt from "bcrypt";
import * as jwt from "jose";

function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};
    for (const key in obj as object) {
        normalized[key.toLowerCase()] = obj[key];
    }
    return normalized;
}

const secret = new TextEncoder().encode(
    'test',
)

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
    const token = await new jwt.SignJWT({ id: (user._id as string).toString() })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
    return Response.json({
        access_token: token,
        token_type: "bearer",
        expires_in: 10 * 60 * 60 - 1,
        userName: user.email,
        familyId: "48173",
        validateTillDate: new Date(
            Date.now() + 3600 * 1000
        ).toLocaleString('en-US', {
            timeZone: 'Europe/Copenhagen',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        }),
        memberType: "0",
        promo: "0",
        memberId: user._id,
        countryCode: "",
        showPopup: "False",
        ".issued": new Date().toUTCString(),
        ".expires": new Date(Date.now() + 3600 * 1000).toUTCString(),
    });
}
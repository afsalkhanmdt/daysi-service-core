import { NextRequest, NextResponse } from "next/server";
import { normalizeKeys } from "../../normalizeKeys";
import { ChangePasswordSchema } from "./dto";
import dbConnect from "@/core/db/connect";
import bcrypt from "bcrypt";
import User from "@/models/users";
import { cookies } from "next/headers";

export async function POST(request:NextRequest) {
    try {
         const body = await request.json();
        const normalizedRequest = normalizeKeys(body);
        const result = ChangePasswordSchema.safeParse(normalizedRequest);

        const userId=(await cookies()).get('user-id')?.value;
        if (!userId) {
            return new Response('User not authenticated', { status: 401 });
        }
        
       if (!result.success) {
            const { fieldErrors, formErrors } = result.error.flatten();
            return Response.json({ fieldErrors, formErrors }, { status: 400 });
        }
        await dbConnect();

        const user=await User.findById(userId);
        if (!user) {
            return new Response('User not found', { status: 404 });
        }
         const password = await bcrypt.hash(result.data.newpassword, 10);
         user.password = password;
         await user.save();
        return Response.json({
            message: "Password changed successfully",});
        
    }


        
     catch (error) {
        console.error('Logout error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

import { cookies } from "next/headers";
import dbConnect from "../../../core/db/connect";
import User from "../../../models/users";
import { FamilyMemberCreateSchema } from "./dto";
import { NextRequest, NextResponse } from "next/server";
import { normalizeKeys } from "../normalizeKeys";
import bcrypt from "bcrypt";

export async function POST(
    request: NextRequest
) {
    const normalizedRequest = normalizeKeys(await request.json());
    const result = FamilyMemberCreateSchema.safeParse(normalizedRequest);

      if (!result.success) {
        return new Response(JSON.stringify(result.error.flatten()), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const password = result.data.password ? await bcrypt.hash(result.data.password, 10) : null;
    const userId = (await cookies()).get('user-id')?.value;
    await dbConnect();
    const currentUser = await User.findById(userId);


    const user = new User({
        firstName: result.data.firstname,
        email: result.data.email,
        familyId: currentUser?.familyId,
        password
        
    });
    await user.save();
    console.log(user);

    return Response.json({
        "Id": 673,
        "MemberId": user._id,
        "MemberName": user.firstName,
        "FirstName": user.firstName,
        "Email": user.email,
        "FamilyId": user.familyId,
        "SharedFamilyId": null,
        "MemberType": 2,
        "ColorCode": "color_nameFF5733",
        "UserFileResourceId": 689,
        "ResourceUrl": "https://api.daysi.dk/DaysiImages/638804016957181359.png",
        "Events": [],
        "Birthdate": null,
        "MembersUpdatedOn": null,
        "HolidaysCountryCode": null,
        "InvitationStatus": 2,
        "SharedInFamily": [],
        "AutoSubscription": "Pending",
        "ExternalEmail": "",
        "EmailSystem": 0,
        "IsPrivate": false,
        "ExternalCalendars": null,
        "Frequency": 0,
        "ExportEventUrl": "https://api.daysi.dk/api/FamilyMembers/GetDaysiEvents?token=",
        "DeleteAllAppointment": false,
        "DeleteOwnAppointment": false,
        "CreatePMTask": false,
        "PocketMoneyUser": true,
        "PMTaskApprovedSendConfirmation": true,
        "AmountEarned": 0.0,
        "CreateToDoGroup": false,
        "ShowDeletedToDoTasks": 0,
        "AccessToMembersToDo": null,
        "HasMasterScheduleAccess": false,
        "MasterSchedules": null,
        "Latitude": null,
        "Longitude": null,
        "HasLocationVisible": false,
        "HasMembersLocationAccess": false,
        "LastLocationUpdatedOn": null,
        "CanApprovePMTasks": false,
        "Locale": "en"
    }

    );
}



export async function GET() {
    try {
        const userId = (await cookies()).get('user-id')?.value;
        if (!userId) {
            return new Response('User ID not found in cookies', { status: 400 });
        }
        await dbConnect();
        const user = await User.findById(userId);
        if (!user) {
            return new Response('User not found', { status: 404 });
        }

        if (!user.familyId) {
            return new Response('Family ID not associated with user', { status: 404 });
        }

        const familyMembers = await User.find({ familyId: user.familyId });
        return NextResponse.json({ familyMembers });
    } catch (error) {
        console.error("API Error:", error);
        return new Response('Internal server error', { status: 500 });
    }
}

import { cookies } from "next/headers";
import dbConnect from "../../../core/db/connect";
import User from "../../../models/users";
import { FamilyMemberCreateSchema } from "./dto";
import { NextRequest } from "next/server";
import { normalizeKeys } from "../normalizeKeys";
import bcrypt from "bcrypt";

export async function POST(
    request: NextRequest
) {
    const normalizedRequest = normalizeKeys(await request.json());
    const result = FamilyMemberCreateSchema.safeParse(normalizedRequest);
    if (!result.success) {
        return new Response('100', { status: 500 });
    }

    if (!result.data.password) {
        return new Response("Password is required", { status: 400 });
    }

    const password = await bcrypt.hash(result.data.password, 10);
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
        "MemberName": user.name,
        "FirstName": user.firstName,
        "Email": user.email,
        "FamilyId": user.familyId,
        "SharedFamilyId": null,
        "MemberType": 2,
        "ColorCode": "color_nameFF5733",
        "UserFileResourceId": 689,
        "ResourceUrl": "https://dev.daysi.dk/DaysiImages/638804016957181359.png",
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
        "Counter": 0,
        "ExportEventUrl": "https://dev.daysi.dk/api/FamilyMembers/GetDaysiEvents?token=",
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
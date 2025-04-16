import { NextRequest } from "next/server";
import { normalizeKeys } from "../../normalizeKeys";
import { FamilyMemberUpdateSchema } from "./dto";
import { cookies } from "next/headers";
import dbConnect from "../../../../core/db/connect";
import User from "../../../../models/users";

export async function POST(
    request: NextRequest) {
    const normalizedRequest = normalizeKeys(await request.json());
    const result = FamilyMemberUpdateSchema.safeParse(normalizedRequest);
    if (!result.success) {
        return new Response('100', { status: 500 });
    }
    const userId = (await cookies()).get('user-id')?.value;
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
        return new Response('User not found', { status: 404 });
    }
    user.firstName = result.data.firstname;
    await user.save();

    return Response.json({
        Id: 666,
        MemberId: result.data.memberid,
        MemberName: result.data.email,
        FirstName: result.data.firstname,
        Email: null,
        FamilyId: result.data.familyid,
        SharedFamilyId: null,
        MemberType: 0,
        ColorCode: "color_nameFF5733",
        UserFileResourceId: 682,
        ResourceUrl: "https://dev.daysi.dk/DaysiImages/DefaultFamilyAdmin.png",
        Events: [],
        Birthdate: null,
        MembersUpdatedOn: null,
        HolidaysCountryCode: null,
        InvitationStatus: 2,
        SharedInFamily: [],
        AutoSubscription: "Pending",
        ExternalEmail: "",
        EmailSystem: 0,
        IsPrivate: false,
        ExternalCalendars: null,
        Frequency: 0,
        Counter: 0,
        ExportEventUrl: "https://dev.daysi.dk/api/FamilyMembers/GetDaysiEvents?token=Sfzj7kx33Ug12HklBziYTrNW9my%2fFVKU",
        DeleteAllAppointment: false,
        DeleteOwnAppointment: false,
        CreatePMTask: false,
        PocketMoneyUser: false,
        PMTaskApprovedSendConfirmation: false,
        AmountEarned: 0.0,
        CreateToDoGroup: false,
        ShowDeletedToDoTasks: 0,
        AccessToMembersToDo: null,
        HasMasterScheduleAccess: false,
        MasterSchedules: null,
        Latitude: null,
        Longitude: null,
        HasLocationVisible: false,
        HasMembersLocationAccess: false,
        LastLocationUpdatedOn: null,
        CanApprovePMTasks: true,
        Locale: ""
    }
    );

}
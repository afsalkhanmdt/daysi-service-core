import { NextRequest } from "next/server";
import dbConnect from "../../../../core/db/connect";
import Event from "../../../../models/event";
import { normalizeKeys } from "../../normalizeKeys";
import { EventCreateSchema } from "./dto";
import User from "../../../../models/users";

type ParticipantType = {
    memberid: string;
    localid: number;
}

export async function POST(request: NextRequest) {
    const normalizedRequest = normalizeKeys(await request.json());
    const result = EventCreateSchema.safeParse(normalizedRequest);

    if (!result.success) {
        return new Response(JSON.stringify(result.error.flatten()), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const participantsArray: string[] = result.data.participants.map((element: ParticipantType) => element.memberid);
    console.log(`Participants Array: ${participantsArray}`);

    await dbConnect();

    const event = new Event({
        EventsUpdatedOn: new Date(),
        participants: participantsArray,
        title: result.data.title,
        familyId: result.data.familyid,
        description: result.data.description,
        startDate: result.data.startdate,
        endDate: result.data.enddate,
    });

    await event.save();

    const userArray = await Promise.all(
        participantsArray.map(async (memberId) => {
            const user = await User.findById(memberId).lean();
            console.log(`User found: ${user}`);

            return user;
        })
    );

    return Response.json({
        EventData: [
            {
                Id: event._id,
                Title: event.title,
                Description: event.description,
                StartDate: event.startDate,
                EndDate: event.endDate,
                FamilyId: event.familyId,
                Participants: userArray.map(user => ({
                    LocalId: 6352, // Replace with actual field if needed
                    MemberName: user?.firstName, // Replace with correct name field
                    ParentEventId: "B082BBE5-67EE-CEA9-167B-047FC175C3F7",
                    UpdatedOn: new Date().getTime(),
                    Email: user?.email ?? '',
                    SendPushNotification: true
                })),
                EventsUpdatedOn: event.EventsUpdatedOn,
            }
        ]
    });
}

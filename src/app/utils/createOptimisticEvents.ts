import { MemberResponse } from "../types/familyMemberTypes";

 export const createOptimisticEvents = (data: any, members: MemberResponse[]) => {
    const familyMemberId = members[0]?.MemberId; // or however you identify family

    return (
      data.participants
        ?.filter((participant: any) => {
          const participantId =
            participant.ParticipantId || participant.MemberId;

          // Don't create an optimistic event for the family participant
          // unless this is a family event
          return Number(data.isForAll) === 1 || participantId !== familyMemberId;
        })
        .map((participant: any) => {
          const participantId =
            participant.ParticipantId || participant.MemberId;

          const member = members.find((m) => m.MemberId === participantId);

          return {
            id: `temp-${crypto.randomUUID()}`,
            title: data.title,
            start: new Date(data.startDate),
            end: new Date(data.endDate),
            allDay: Number(data.isAllDayEvent) === 1,
            resourceId: member?.Id ? String(member.Id) : undefined,
            extendedProps: {
              ...data,
              isOptimistic: true,
            },
          };
        }) || []
    );
  };
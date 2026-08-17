import { MemberResponse } from "../types/familyMemberTypes";

export const createOptimisticEvents = (data: any, members: MemberResponse[]) => {
  if (!members || members.length === 0) return [];
  const familyMember = members[0];
  const familyMemberId = familyMember?.MemberId;
  const isForAll = Number(data.isForAll) === 1;

  const baseExtendedProps = {
    ...data,
    description: data.description || "",
    location: data.location || "",
    IsAllDayEvent: Number(data.isAllDayEvent) === 1 ? 1 : 0,
    IsPrivateEvent: Number(data.isPrivateEvent) === 1 ? 1 : 0,
    IsSpecialEvent: Number(data.isSpecialEvent) === 1 ? 1 : 0,
    IsForAll: isForAll ? 1 : 0,
    EventParticipant: data.participants || [],
    participants: data.participants || [],
    eventGuID: data.eventGuID,
    isOptimistic: true,
    isUploading: true,
  };

  if (isForAll) {
    return [
      {
        id: `temp-${data.eventGuID || crypto.randomUUID()}-${familyMember?.Id || "family"}`,
        title: data.title,
        start: new Date(data.startDate),
        end: new Date(data.endDate),
        allDay: Number(data.isAllDayEvent) === 1,
        resourceId: familyMember?.Id ? String(familyMember.Id) : undefined,
        display: "block",
        extendedProps: baseExtendedProps,
      },
    ];
  }

  const validParticipants = (data.participants || []).filter((participant: any) => {
    const participantId =
      participant.ParticipantId || participant.MemberId || participant.id || participant.memberId;
    return participantId !== familyMemberId;
  });

  if (validParticipants.length === 0 && members.length > 1) {
    // If no individual participant matched, fallback to the second member (first individual)
    const fallbackMember = members[1];
    return [
      {
        id: `temp-${data.eventGuID || crypto.randomUUID()}-${fallbackMember.Id}`,
        title: data.title,
        start: new Date(data.startDate),
        end: new Date(data.endDate),
        allDay: Number(data.isAllDayEvent) === 1,
        resourceId: String(fallbackMember.Id),
        display: "block",
        extendedProps: baseExtendedProps,
      },
    ];
  }

  return validParticipants.map((participant: any) => {
    const participantId =
      participant.ParticipantId || participant.MemberId || participant.id || participant.memberId;

    const member = members.find(
      (m) =>
        m.MemberId === participantId ||
        String(m.Id) === String(participantId) ||
        m.FirstName === participant.name
    );

    return {
      id: `temp-${data.eventGuID || crypto.randomUUID()}-${member?.Id || participantId}`,
      title: data.title,
      start: new Date(data.startDate),
      end: new Date(data.endDate),
      allDay: Number(data.isAllDayEvent) === 1,
      resourceId: member?.Id ? String(member.Id) : undefined,
      display: "block",
      extendedProps: baseExtendedProps,
    };
  });
};
import { z } from 'zod';

const ParticipantSchema = z.object({
    localId: z.number({ required_error: 'Local ID is required' }),
    memberId: z.string().min(1, { message: 'Member ID is required' }),
    eventId: z.number().nullable().optional(), // Optional and nullable, as it's `int?` in C#
});

const SpecialEventSchema = z.any();
const RepeatSchema = z.any();
const AlertSchema = z.any();
const AlarmSchema = z.any();
const RecurrenceRuleSchema = z.any();

export const EventUpdateSchema = z.object({
    id: z.number({ required_error: 'Id is required' }),
    participants: z.array(ParticipantSchema, { required_error: 'Participants are required' }),
    familyUserId: z.string().optional(),
    familyId: z.number().optional(),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    specialEvent: SpecialEventSchema.optional(),
    repeat: RepeatSchema.optional(),
    repeatEndDate: z.coerce.date().nullable().optional(),
    alert: AlertSchema.optional(),
    isForAll: z.number().optional(),
    isAllDayEvent: z.number().optional(),
    isSpecialEvent: z.number().optional(),
    isPrivateEvent: z.number().optional(),
    eventPerson: z.string().optional(),
    eventsUpdatedOn: z.string().optional(),
    localStartDate: z.string().optional(),
    localEndDate: z.string().optional(),
    timeZone: z.string().optional(),
    offSet: z.string().optional(),
    locale: z.string().optional(),
    parentEventId: z.string().optional(),
    eventGuID: z.string().optional(),
    externalCalendarId: z.number().optional(),
    alarms: z.array(AlarmSchema).optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    recurrenceRule: RecurrenceRuleSchema.optional(),
});

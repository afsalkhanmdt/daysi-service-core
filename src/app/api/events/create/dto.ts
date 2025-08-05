import { z } from 'zod'

const ParticipantSchema = z.object({
    memberid: z.string().min(1, { message: 'Member ID is required' }),
    localid: z.number({ required_error: 'Local ID is required' }),
})

const SpecialEventSchema = z.any()
const RepeatSchema = z.any()
const AlertSchema = z.any()
const AlarmSchema = z.any()
const RecurrenceRuleSchema = z.any()

export const EventCreateSchema = z.object({
    participants: z.array(ParticipantSchema, { required_error: 'Participants are required' }),
    familyuserid: z.string().min(1, { message: 'Family user ID is required' }),
    familyid: z.number({ required_error: 'Family ID is required' }),
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    startdate: z.coerce.date().optional(),
    enddate: z.coerce.date().optional(),
    location: z.string().optional(),
    specialevent: SpecialEventSchema.optional(),
    repeat: RepeatSchema.optional(),
    repeatenddate: z.coerce.date().nullable().optional(),
    alert: AlertSchema.optional(),
    alarms: z.array(AlarmSchema).optional(),
    isforall: z.number().optional(),
    isalldayevent: z.number().optional(),
    isspecialevent: z.number().optional(),
    isprivateevent: z.number().optional(),
    eventperson: z.string().optional(),
    addedby: z.string().min(1, { message: 'Added by is required' }),
    eventsupdatedon: z.string().optional(),
    localstartdate: z.string().optional(),
    localenddate: z.string().optional(),
    timezone: z.string().optional(),
    offset: z.string().optional(),
    locale: z.string().optional(),
    parenteventid: z.string().optional(),
    eventguid: z.string().optional(),
    externalcalendarid: z.number().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    recurrencerule: RecurrenceRuleSchema.optional(),
    nopush: z.boolean().optional(),
})

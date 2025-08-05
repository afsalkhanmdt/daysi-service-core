import { z } from 'zod';
import { string } from 'zod/v4';



const SpecialEventSchema = z.any();
const RepeatSchema = z.any();
const AlertSchema = z.any();
const AlarmSchema = z.any();
const RecurrenceRuleSchema = z.any();

export const EventUpdateSchema = z.object({
    id: z.string({ required_error: 'Id is required' }),
    participants: z.array(z.string(), { required_error: 'Participants are required' }),
    familyUserid: z.string().optional(),
    familyid: z.number().optional(),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
    startdate: z.coerce.date().optional(),
    enddate: z.coerce.date().optional(),
    location: z.string().optional(),
    specialevent: SpecialEventSchema.optional(),
    repeat: RepeatSchema.optional(),
    repeatEnddate: z.coerce.date().nullable().optional(),
    alert: AlertSchema.optional(),
    isforall: z.number().optional(),
    isalldayevent: z.number().optional(),
    isspecialevent: z.number().optional(),
    isprivateevent: z.number().optional(),
    eventperson: z.string().optional(),
    eventsupdatedon: z.string().optional(),
    localstartdate: z.string().optional(),
    localenddate: z.string().optional(),
    timezone: z.string().optional(),
    offset: z.string().optional(),
    locale: z.string().optional(),
    parenteventid: z.string().optional(),
    eventguid: z.string().optional(),
    externalcalendarid: z.number().optional(),
    alarms: z.array(AlarmSchema).optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    recurrencerule: RecurrenceRuleSchema.optional(),
});

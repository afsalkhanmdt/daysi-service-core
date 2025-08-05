import { z } from 'zod';

export const ExternalCalendarCreateSchema = z.object({
    calendarname: z.string().optional(),
    calendarurl: z.string().min(1, { message: 'Calendar URL is required' }),
    memberid: z.string().min(1, { message: 'Member ID is required' }),
    familyid: z.number({ required_error: 'Family ID is required' }),
    membersupdatedon: z.string().optional(),
    filepath: z.string().optional(),
    filecontent: z.string().optional(),
    locale: z.string().optional()
});

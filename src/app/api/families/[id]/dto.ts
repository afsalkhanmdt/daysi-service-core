import { z } from 'zod';

const AlertSchema = z.object({
  type: z.string().optional(),
  time: z.string().optional(),
}).optional();

export const familyUpdateSchema = z.object({
  id: z.string(),
  firstname: z.string().min(1),
  holidayscountrycode: z.string().optional(),
  membersupdatedon: z.string().optional(),
  imagedata: z.string().optional(),
  autosubscription: z.string().optional(),
  defaultalarm: AlertSchema,
  colorcode: z.string().optional(),
  specialeventcolorcode: z.string().optional(),
  currencycode: z.string().optional(),
  everyonecreatepmtask: z.boolean().optional(),
});

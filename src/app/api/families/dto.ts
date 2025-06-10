import { z } from "zod";
export const SubscriptionType = z.enum(['Basis', 'Premium'])
export const MailChimpSubscriptionType = z.enum([
  'Basis',
  'Premium',
  'Voucher',
  'PremiumToBasis',
  'VoucherToBasis',
])

export const FamilySchema = z.object({
  name: z.string().min(1),
  holidayscountrycode: z.string().optional(),
  registereddate: z.coerce.date(),
  validtilldate: z.coerce.date().optional(),
  lastused: z.coerce.date().nullable().optional(),
  subscriptiontype: SubscriptionType.default('Basis'), // Default to Basis
  familyactive: z.boolean().optional(),
  familymemberqty: z.number().int().optional(),
  defaultalarm: z.number().int().optional(),
  specialeventcolorcode: z.string().optional(),
  currencycode: z.string().max(10).optional(),
  everyonecreatepmtask: z.boolean().default(false),
  region: z.string().optional(),
  mailchimpsubscriptiontype: MailChimpSubscriptionType.default('Basis'), // Default to Basis
});

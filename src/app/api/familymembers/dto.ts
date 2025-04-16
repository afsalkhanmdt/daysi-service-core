import { z } from 'zod'

export const FamilyMemberCreateSchema = z
    .object({
        membername: z.string().min(1, { message: 'Member name is required' }),
        email: z.string().optional().or(z.literal('')).or(z.string().email('Invalid email')),
        firstname: z.string().min(1, { message: 'First name is required' }),
        colorcode: z.string().min(1, { message: 'Color code is required' }),
        imagedata: z.string().min(1, { message: 'Image data is required' }),
        password: z.string().optional(),
        confirmpassword: z.string().optional(),
        birthdate: z.coerce.date().optional(),
        membersupdatedon: z.string().optional(),
        locale: z.string().optional(),
        externalemail: z.string().optional(),
        emailsystem: z.number().optional(),
        isprivate: z.boolean().optional(),
        localstartdate: z.string().optional(),
        localenddate: z.string().optional(),
        timezone: z.string().optional(),
        offset: z.string().optional(),
        deleteallappointment: z.boolean().optional(),
        deleteownappointment: z.boolean().optional(),
        createpmtask: z.boolean().default(false),
        pocketmoneyuser: z.boolean().default(true),
        pmtaskapprovedsendconfirmation: z.boolean().default(true),
        hasmasterscheduleaccess: z.boolean().optional(),
        haslocationvisible: z.boolean().optional(),
        hasmemberslocationaccess: z.boolean().optional(),
        canapprovepmtasks: z.boolean().default(false),
    })
    .refine((data) => data.password === data.confirmpassword, {
        path: ['confirmpassword'],
        message: 'The password and confirmation password do not match.',
    })

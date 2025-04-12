import { z } from 'zod'

export const RegisterSchema = z
    .object({
        firstname: z.string().min(1, { message: 'First name is required' }),
        email: z.string().min(1, { message: 'Email is required' }).email('Invalid email'),
        usercalendarcolor: z.string().min(1, { message: 'User calendar color is required' }),
        imagedata: z.string().optional(),
        familyname: z.string().min(1, { message: 'Family name is required' }),
        familycalendarcolor: z.string().min(1, { message: 'Family calendar color is required' }),
        birthdate: z.coerce.date().optional(),
        password: z.string().min(1, { message: 'Password is required' }),
        confirmpassword: z.string(),
        locale: z.string().optional(),
        localstartdate: z.string().optional(),
        localenddate: z.string().optional(),
        timezone: z.string().optional(),
        offset: z.string().optional(),
        discountcode: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        devicetoken: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmpassword, {
        path: ['confirmpassword'],
        message: 'The password and confirmation password do not match.',
    })

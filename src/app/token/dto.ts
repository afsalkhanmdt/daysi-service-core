import { z } from 'zod'

export const LoginSchema = z
    .object({
        username: z.string().min(1, { message: 'First name is required' }),
        password: z.string().min(1, { message: 'Password is required' }),
        grant_type: z.string(),
    })

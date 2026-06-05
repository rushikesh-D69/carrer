import { z } from 'zod'

export const contactLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  career_interest: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(5000),
  honeypot: z.string().optional(),
  turnstileToken: z.string().optional(),
})

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72)
      .regex(/[A-Za-z]/, 'Password must include a letter')
      .regex(/[0-9]/, 'Password must include a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export type ContactLeadInput = z.infer<typeof contactLeadSchema>

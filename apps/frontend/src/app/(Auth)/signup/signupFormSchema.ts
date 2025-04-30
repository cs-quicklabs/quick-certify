import { z } from 'zod';
import en from '@/constants/lang/en';

export const signupFormSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: en.common.fieldRequired }),
    lastName: z.string().trim().min(1, { message: en.common.fieldRequired }),
    email: z
      .string()
      .trim()
      .min(1, { message: en.common.fieldRequired })
      .email({ message: 'Invalid email address' }),
    organizationName: z
      .string()
      .trim()
      .min(1, { message: en.common.fieldRequired }),
    organizationWebsite: z
      .string()
      .trim()
      .min(1, { message: en.common.fieldRequired })
      .url({ message: 'Invalid URL' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Team Schemas - Zod validation for team forms
 */

import { z } from 'zod';

export const addTeamMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  roleId: z.string().min(1, 'Role is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[@$!%*?&]/, 'Must contain special character'),
});

export type AddTeamMemberFormData = z.infer<typeof addTeamMemberSchema>;

export const editTeamMemberSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'inactive']),
});

export type EditTeamMemberFormData = z.infer<typeof editTeamMemberSchema>;

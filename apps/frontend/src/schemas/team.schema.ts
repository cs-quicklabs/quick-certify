/**
 * Team Schemas - Zod validation for team forms
 */

import { z } from 'zod';

export const addTeamMemberSchema = z.object({
  firstName: z
    .string()
    .regex(/\S/, 'First name must not be only spaces')
    .min(1, 'First name is required'),
  lastName: z
    .string()
    .regex(/\S/, 'Last name must not be only spaces')
    .min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  roleId: z.string().min(1, 'Role is required'),
  password: z.string().optional(), // Optional for invitations
});

export type AddTeamMemberFormData = z.infer<typeof addTeamMemberSchema>;

export const editTeamMemberSchema = z.object({
  first_name: z.string().regex(/\S/, 'First name must not be only spaces').min(1, 'First name is required'),
  last_name: z.string().regex(/\S/, 'Last name must not be only spaces').min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'archived']).optional(),
});

export type EditTeamMemberFormData = z.infer<typeof editTeamMemberSchema>;

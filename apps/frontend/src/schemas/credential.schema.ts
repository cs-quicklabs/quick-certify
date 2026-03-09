import { z } from 'zod';

export const recipientRowSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .regex(/[a-zA-Z]/, 'Name must contain at least one letter'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export type RecipientRow = z.infer<typeof recipientRowSchema>;

export const issueCredentialStep1Schema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  recipients: z.array(recipientRowSchema).min(1, 'At least one recipient is required'),
});

export type IssueCredentialStep1Data = z.infer<typeof issueCredentialStep1Schema>;

export const issueCredentialStep2Schema = z.object({
  issuedDate: z.string().min(1, 'Issue date is required'),
  expirationDate: z.string().optional(),
  noExpiration: z.boolean().optional(),
});

export type IssueCredentialStep2Data = z.infer<typeof issueCredentialStep2Schema>;

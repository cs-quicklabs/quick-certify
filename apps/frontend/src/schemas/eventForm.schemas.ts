import { z } from 'zod';

export const step0Schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .transform((val) => val.trim()),
});

export const step1Schema = z
  .object({
    description: z
      .string()
      .max(5000, 'Description must not exceed 5000 characters')
      .optional()
      .transform((val) => val?.trim() || undefined),
    learningLink: z
      .string()
      .max(500, 'Learning link must not exceed 500 characters')
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),
    typeId: z.string({ error: 'Event type is required' }).min(1, 'Event type is required'),
    levelId: z.string({ error: 'Event level is required' }).min(1, 'Event level is required'),
    formatId: z.string({ error: 'Event format is required' }).min(1, 'Event format is required'),
    durationType: z.string().optional(),
    durationValue: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : val),
      z.coerce.number().int('Must be a whole number').min(1, 'Must be at least 1').optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.durationType && (data.durationValue === undefined || data.durationValue === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duration is required when duration type is selected',
        path: ['durationValue'],
      });
      return;
    }

    if (data.durationType && data.durationValue !== undefined) {
      const caps: Record<string, number> = { day: 365, week: 52, month: 12 };
      const cap = caps[data.durationType];
      if (cap && data.durationValue > cap) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Must not exceed ${cap} for ${data.durationType}s`,
          path: ['durationValue'],
        });
      }
    }
  });

export type Step0SchemaData = z.infer<typeof step0Schema>;
export type Step1SchemaData = z.infer<typeof step1Schema>;

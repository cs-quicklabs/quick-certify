import { DESIGN_TYPES } from '@/types';
import { z } from 'zod';

export const designSchema = z.object({
  name: z.string().min(1, 'Design name is required'),
  url: z.string().min(1, 'Image is required'),
  type: z.enum(DESIGN_TYPES),
});

export type DesignFormData = z.infer<typeof designSchema>;

import { DesignType } from '@/types/utils.enum';
import { z } from 'zod';

export const designSchema = z.object({
  name: z.string().min(1, 'Design name is required'),
  url: z.string().min(1, 'Image is required'),
  type: z.enum(DesignType),
});

export type DesignFormData = z.infer<typeof designSchema>;

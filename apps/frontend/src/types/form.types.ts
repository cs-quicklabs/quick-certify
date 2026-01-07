import { z } from 'zod';

export type FieldType = 'text' | 'email' | 'password' | 'checkbox' | 'select' | 'textarea' | 'file';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FieldOption[]; // For select fields
  accept?: string; // For file inputs
  rows?: number; // For textarea
  disabled?: boolean;
  className?: string;
  defaultValue?: string; // Default value for the field
}

export interface FormConfig<T extends z.ZodObject<z.ZodRawShape>> {
  title: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  schema: T;
  submitLabel?: string;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
}

export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

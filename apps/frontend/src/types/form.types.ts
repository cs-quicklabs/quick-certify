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
  tooltipText?: string; // Tooltip text to display next to the label
  required?: boolean;
  options?: FieldOption[]; // For select fields
  accept?: string; // For file inputs
  rows?: number; // For textarea
  disabled?: boolean;
  className?: string;
  defaultValue?: string; // Default value for the field
  icon?: string; // Icon to display next to the label
}

export interface FormConfig<T extends z.ZodObject<z.ZodRawShape>> {
  title: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  schema: T;
  submitLabel?: string;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  /**
   * Optional callback called after successful image upload
   * @param fieldName - Name of the field that was uploaded
   * @param imageUrl - URL of the uploaded image
   */
  onImageUpload?: (fieldName: string, imageUrl: string) => Promise<void> | void;
  /**
   * Optional callback called after image deletion
   * @param fieldName - Name of the field that was deleted
   */
  onImageDelete?: (fieldName: string) => Promise<void> | void;
}

export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

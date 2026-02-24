import { z } from 'zod';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'textarea'
  | 'file';

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
  /** Conditionally show/hide field based on current form data */
  visibleWhen?: (formData: Record<string, unknown>) => boolean;
}

export interface FormConfig<T extends z.ZodType> {
  title: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  schema: T;
  submitLabel?: string;
  /** Hide automatic submit UI - useful when controlling submit externally */
  showSubmit?: boolean;
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
  /**
  /** Optional layout type - 'vertical' (default), 'grid' for two-column layout, or 'grid-3' for three-column layout
   */
  layout?: 'vertical' | 'grid' | 'grid-3';
  /**
   * Optional cancel button configuration
   */
  onCancel?: () => void;
  cancelLabel?: string;
  /**
   * Reset form fields to empty after successful submission
   */
  resetOnSuccess?: boolean;
}

export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

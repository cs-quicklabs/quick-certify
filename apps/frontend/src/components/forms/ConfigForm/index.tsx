'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { formatZodErrors } from '@/lib/validation';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api-error';
import { FormFieldConfig, FormConfig } from '@/types/form.types';
import { Alert } from '@/components/ui';
import { InputField } from './fields/InputField';
import { TextareaField } from './fields/TextareaField';
import { CheckboxField } from './fields/CheckboxField';
import { SelectField } from './fields/SelectField';
import { FileField } from './fields/FileField';

interface ConfigFormProps<T extends z.ZodType> {
  config: FormConfig<T>;
  initialValues?: Partial<z.infer<T>>;
  isLoading?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  children?: React.ReactNode;
  onChange?: (values: Record<string, unknown>) => void;
}
const emptyObject = {};
export function ConfigForm<T extends z.ZodType>({
  config,
  initialValues = emptyObject,
  isLoading = false,
  formRef,
  children,
  onChange,
}: ConfigFormProps<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialValues as Record<string, unknown>,
  );

  // Keep in sync if initialValues loads async (e.g. edit mode)
  const prevInitialRef = useRef(initialValues);
  useEffect(() => {
    if (prevInitialRef.current !== initialValues) {
      prevInitialRef.current = initialValues;
      setFormData(initialValues as Record<string, unknown>);
    }
  }, [initialValues]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      const updated = {
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      };
      setFormData(updated);
      onChange?.(updated);

      if (errors[name]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    },
    [formData, onChange, errors],
  );

  const setFieldValue = useCallback(
    (name: string, value: unknown) => {
      const updated = {
        ...formData,
        [name]: value,
      };

      setFormData(updated);
      onChange?.(updated);

      if (errors[name]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    },
    [formData, onChange, errors],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const result = config.schema.safeParse(formData);

    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await config.onSubmit(result.data as z.infer<T>);

      // clear the current values back to the provided initial values
      // (or an empty object when none were supplied).
      if (config.resetOnSuccess) {
        setFormData(initialValues as Record<string, unknown>);
      }

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));

      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    // Skip rendering if visibleWhen returns false
    if (field.visibleWhen && !field.visibleWhen(formData)) {
      return null;
    }

    const value = formData[field.name];
    const error = errors[field.name];
    const isDisabled = field.disabled || isSubmitting || isLoading;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <InputField
            key={field.name}
            field={field}
            value={value}
            error={error}
            onChange={handleChange}
            isDisabled={isDisabled}
          />
        );
      case 'textarea':
        return (
          <TextareaField
            key={field.name}
            field={field}
            value={value}
            error={error}
            onChange={handleChange}
            isDisabled={isDisabled}
          />
        );
      case 'checkbox':
        return (
          <CheckboxField
            key={field.name}
            field={field}
            value={value}
            error={error}
            onChange={handleChange}
            isDisabled={isDisabled}
          />
        );
      case 'select':
        return (
          <SelectField
            key={field.name}
            field={field}
            value={value}
            error={error}
            onChange={handleChange}
            isDisabled={isDisabled}
          />
        );
      case 'file':
        return (
          <FileField
            key={field.name}
            field={field}
            value={value}
            error={error}
            onValueChange={(val) => setFieldValue(field.name, val)}
            onUpload={config.onImageUpload}
            onDelete={config.onImageDelete}
            isDisabled={isDisabled}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="form-title">{config.title}</h1>
      {config.subtitle && <p className="form-subtitle">{config.subtitle}</p>}

      {submitSuccess && (
        <Alert
          type="success"
          message="Changes saved successfully!"
          onClose={() => setSubmitSuccess(false)}
          className="mt-4"
        />
      )}

      {submitError && (
        <Alert
          type="error"
          message={submitError}
          onClose={() => setSubmitError(null)}
          className="mt-4"
        />
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className={`w-full mt-6 ${
          config.layout === 'grid'
            ? 'grid grid-cols-2 gap-4'
            : config.layout === 'grid-3'
              ? 'grid grid-cols-3 gap-4'
              : 'space-y-4'
        }`}
      >
        {config.fields.map(renderField)}

        {children && (
          <div
            className={config.layout === 'grid' || config.layout === 'grid-3' ? 'col-span-3' : ''}
          >
            {children}
          </div>
        )}

        {config.showSubmit !== false && (
          <div
            className={
              config.layout === 'grid'
                ? 'col-span-2'
                : config.layout === 'grid-3'
                  ? 'col-span-3'
                  : ''
            }
          >
            <div className="flex items-center justify-end gap-3">
              {config.onCancel && (
                <button
                  type="button"
                  onClick={config.onCancel}
                  disabled={isSubmitting || isLoading}
                  className="btn-secondary"
                >
                  {config.cancelLabel || 'Cancel'}
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : config.submitLabel || 'Save'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

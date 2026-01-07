'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { formatZodErrors } from '../lib/validation';
import { FormFieldConfig, FormConfig } from '../types/form.types';

interface ConfigFormProps<T extends z.ZodObject<z.ZodRawShape>> {
  config: FormConfig<T>;
  initialValues?: Partial<z.infer<T>>;
  isLoading?: boolean;
}

export function ConfigForm<T extends z.ZodObject<z.ZodRawShape>>({
  config,
  initialValues = {},
  isLoading = false,
}: ConfigFormProps<T>) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));

      // Clear field error on change
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate form data
    const result = config.schema.safeParse(formData);

    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await config.onSubmit(result.data as z.infer<T>);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];
    const isDisabled = field.disabled || isSubmitting || isLoading;

    switch (field.type) {
      case 'checkbox':
        return (
          <div key={field.name} className="flex mt-6">
            <div className="flex items-center h-5">
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={Boolean(value)}
                onChange={handleChange}
                disabled={isDisabled}
                className="checkbox"
              />
            </div>
            <div className="ms-2 text-sm">
              <label htmlFor={field.name} className="form-input-label">
                {field.label}
              </label>
              {field.description && (
                <p className="form-input-description -mt-2">{field.description}</p>
              )}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="form-input-label">
              {field.label}
            </label>
            <select
              id={field.name}
              name={field.name}
              value={String(value)}
              onChange={handleChange}
              disabled={isDisabled}
              className="form-input-field"
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.description && <p className="form-input-description">{field.description}</p>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="form-input-label">
              {field.label}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              value={String(value)}
              onChange={handleChange}
              placeholder={field.placeholder}
              disabled={isDisabled}
              rows={field.rows || 4}
              className="form-input-field"
            />
            {field.description && <p className="form-input-description">{field.description}</p>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );

      case 'file':
        const avatarSrc = String(value) || field.defaultValue || '';
        return (
          <div key={field.name} className="sm:col-span-2">
            <label className="form-input-label">{field.label}</label>
            <div className="items-center w-full sm:flex">
              {avatarSrc && (
                <img
                  className="w-20 h-20 mb-4 rounded-full sm:mr-4 sm:mb-0"
                  src={avatarSrc}
                  alt="Avatar"
                />
              )}
            </div>
            {field.description && <p className="form-input-description">{field.description}</p>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="form-input-label">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={String(value)}
              onChange={handleChange}
              placeholder={field.placeholder}
              disabled={isDisabled}
              required={field.required}
              className="form-input-field"
            />
            {field.description && <p className="form-input-description">{field.description}</p>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div>
      <h1 className="form-title">{config.title}</h1>
      {config.subtitle && <p className="form-subtitle">{config.subtitle}</p>}

      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mt-4">
          <p className="text-green-700 text-sm">Changes saved successfully!</p>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
        {config.fields.map(renderField)}

        <button type="submit" disabled={isSubmitting || isLoading} className="btn-primary">
          {isSubmitting ? 'Saving...' : config.submitLabel || 'Save'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { formatZodErrors } from '../lib/validation';
import { getApiErrorMessage, getApiFieldErrors } from '../lib/api-error';
import { FormFieldConfig, FormConfig } from '../types/form.types';
import { validateImageFile } from '../schemas/settings.schema';
import { InfoTooltip, ConfirmationDialog, Alert } from './ui';
import { replaceImage } from '../lib/image-upload';
import { FileCategory } from '../services/api/file.service';

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
  // Sanitize initial values: convert null to undefined for schema compatibility
  const sanitizedInitialValues = Object.entries(initialValues).reduce(
    (acc, [key, value]) => {
      acc[key] = value === null ? undefined : value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
  const initialFormDataRef = useRef<Record<string, unknown>>(sanitizedInitialValues);

  const [formData, setFormData] = useState<Record<string, unknown>>(sanitizedInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isDirty = useMemo(() => {
    const initialKeys = Object.keys(initialFormDataRef.current);
    const currentKeys = Object.keys(formData);
    const allKeys = [...new Set([...initialKeys, ...currentKeys])];
    return allKeys.some((key) => {
      const initial = initialFormDataRef.current[key] ?? '';
      const current = formData[key] ?? '';
      return initial !== current;
    });
  }, [formData]);

  // Determine if this is a new form (empty initial values) or edit form
  const isNewForm = useMemo(() => {
    return Object.keys(initialValues).length === 0;
  }, [initialValues]);

  // Note: Submit button is always enabled - validation happens on submit
  // This allows users to see validation errors when they click Save

  // Update form data when initialValues changes (e.g., after data fetch)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      // Sanitize null values to undefined or empty strings for schema validation
      const sanitizedValues = Object.entries(initialValues).reduce(
        (acc, [key, value]) => {
          acc[key] = value === null ? undefined : value;
          return acc;
        },
        {} as Record<string, unknown>,
      );
      setFormData(sanitizedValues);
      //reset baseline
      initialFormDataRef.current = sanitizedValues;
    }
  }, [initialValues]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [submitSuccess]);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, avatarUrl: validation.error || 'Invalid file' }));
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.avatarUrl;
      return newErrors;
    });
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.avatarUrl;
      return newErrors;
    });

    try {
      // Determine category based on field name
      const category: FileCategory = 'avatar';
      const currentImageUrl = formData.avatarUrl as string | undefined;

      // Upload image (and replace old one if exists)
      const result = await replaceImage(
        {
          file: selectedImage,
          category,
        },
        currentImageUrl,
      );

      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: result.url }));

        // Call onImageUpload callback if provided to save to DB immediately
        if (config.onImageUpload) {
          try {
            await config.onImageUpload('avatarUrl', result.url);
          } catch (error) {
            // If callback fails, show error but don't prevent form update
            console.error('Failed to save image URL:', error);
            setErrors((prev) => ({
              ...prev,
              avatarUrl: getApiErrorMessage(error, 'Image uploaded but failed to save URL'),
            }));
          }
        }

        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          avatarUrl: result.error || 'Failed to upload image',
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        avatarUrl: getApiErrorMessage(error, 'Failed to upload image'),
      }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageCancel = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmImageDelete = async () => {
    setFormData((prev) => ({ ...prev, avatarUrl: undefined }));
    setSelectedImage(null);
    setImagePreview(null);
    setShowDeleteConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Call onImageDelete callback if provided to save to DB immediately
    if (config.onImageDelete) {
      try {
        await config.onImageDelete('avatarUrl');
      } catch (error) {
        // If callback fails, show error
        console.error('Failed to delete image URL:', error);
        setErrors((prev) => ({
          ...prev,
          avatarUrl: getApiErrorMessage(error, 'Failed to delete image from database'),
        }));
      }
    }
  };

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
      // Reset form if resetOnSuccess is enabled
      if (config.resetOnSuccess) {
        setFormData({});
        initialFormDataRef.current = {};
      } else {
        initialFormDataRef.current = { ...formData };
      }
      setSubmitSuccess(true);
    } catch (error) {
      // Extract proper error message from API response
      setSubmitError(getApiErrorMessage(error));

      // Set field-specific errors if available
      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldLabel = (field: FormFieldConfig) => (
    <div className="flex items-center gap-2">
      <label htmlFor={field.name} className="form-input-label">
        {field.label}
      </label>
      {field.tooltipText && (
        <InfoTooltip
          tooltipText={field.tooltipText}
          id={`tooltip-${field.name}`}
        />
      )}
    </div>
  );

  const renderFieldIcon = (field: FormFieldConfig) => {
    switch (field.icon) {
      case 'linkedin':
        return <span
          className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-sm dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-linkedin w-4 h-4 text-gray-500 dark:text-gray-400">
            <path
              d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect
              width="4"
              height="12"
              x="2"
              y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </span>
      case 'facebook':
        return <span
          className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-sm dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-facebook w-4 h-4 text-gray-500 dark:text-gray-400"
          ><path
              d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
        </span>
      case 'twitter':
        return <span
          className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-sm dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-twitter w-4 h-4 text-gray-500 dark:text-gray-400"
          ><path
              d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
        </span>
      case 'globe':
        return <span
          className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-sm dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-globe w-4 h-4 text-gray-500 dark:text-gray-400"
          ><circle cx="12" cy="12" r="10" /><path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path
              d="M2 12h20" /></svg>
        </span>

      default:
        return null;
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];
    const isDisabled = field.disabled || isSubmitting || isLoading;

    // Skip email field if signup method is google
    // if (field.name === 'email' && formData.signupMethod === 'google') {
    //   return null;
    // }

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
              <div className="flex items-center gap-2">
                <label htmlFor={field.name} className="form-input-label">
                  {field.label}
                </label>
                {field.tooltipText && (
                  <InfoTooltip
                    tooltipText={field.tooltipText}
                    id={`tooltip-${field.name}`}
                    iconSize={14}
                  />
                )}
              </div>
              {field.description && (
                <p className="form-input-description -mt-2">{field.description}</p>
              )}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="relative">
            {renderFieldLabel(field)}
            <div className="relative">
              <select
                id={field.name}
                name={field.name}
                value={String(value)}
                onChange={handleChange}
                disabled={isDisabled}
                className="form-input-field pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select Role</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {field.description && <p className="form-input-description">{field.description}</p>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name}>
            {renderFieldLabel(field)}
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

      case 'file': {
        const currentImage = imagePreview || String(value) || field.defaultValue || '';
        const hasCustomImage = Boolean(value) && value !== field.defaultValue;

        return (
          <div key={field.name} className="sm:col-span-2">
            {renderFieldLabel(field)}
            <div className="items-center w-full">
              {/* Image with hover edit icon */}
              <div className="relative inline-block group">
                {currentImage && (
                  <img
                    className="w-20 h-20 rounded-full object-cover"
                    src={currentImage}
                    alt="Avatar"
                  />
                )}
                {/* Edit overlay on hover */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={field.accept || 'image/png,image/jpg,image/jpeg'}
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Upload/Cancel buttons when image is selected */}
              {selectedImage && (
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={isUploadingImage}
                    className="btn-primary text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={handleImageCancel}
                    disabled={isUploadingImage}
                    className="btn-secondary text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Delete button when custom image is set */}
              {hasCustomImage && !selectedImage && (
                <button
                  type="button"
                  onClick={handleImageDelete}
                  className="mt-3 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove photo
                </button>
              )}

              {/* Delete confirmation modal */}
              <ConfirmationDialog
                isOpen={showDeleteConfirm}
                title="Delete Profile Image?"
                message="Are you sure you want to remove your profile image? This will revert to the default image."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmVariant="danger"
                onConfirm={confirmImageDelete}
                onCancel={() => setShowDeleteConfirm(false)}
              />
            </div>
            {/* <p className="form-input-description mt-2">PNG, JPG, or JPEG (max 1MB)</p> */}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      }

      default:
        return (
          <div key={field.name}>
            {renderFieldLabel(field)}
            <div className="flex">
              {renderFieldIcon(field)}
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
            </div>
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
        onSubmit={handleSubmit}
        className={`w-full mt-6 ${config.layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'
          }`}
      >
        {config.fields.map(renderField)}

        <div className={config.layout === 'grid' ? 'col-span-2' : ''}>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isSubmitting || isLoading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : config.submitLabel || 'Save'}
            </button>
            {config.onCancel && (
              <button
                type="button"
                onClick={config.onCancel}
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {config.cancelLabel || 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

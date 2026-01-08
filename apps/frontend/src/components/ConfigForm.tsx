'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { formatZodErrors } from '../lib/validation';
import { getApiErrorMessage, getApiFieldErrors } from '../lib/api-error';
import { FormFieldConfig, FormConfig } from '../types/form.types';
import { validateImageFile } from '../schemas/settings.schema';

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

  // Update form data when initialValues changes (e.g., after data fetch)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleImageUpload = () => {
    if (selectedImage && imagePreview) {
      // In a real app, you'd upload the file to a server and get a URL back
      // For now, we'll use the preview URL
      setFormData((prev) => ({ ...prev, avatarUrl: imagePreview }));
      setSelectedImage(null);
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

  const confirmImageDelete = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    setSelectedImage(null);
    setImagePreview(null);
    setShowDeleteConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];
    const isDisabled = field.disabled || isSubmitting || isLoading;

    // Skip email field if signup method is google
    if (field.name === 'email' && formData.signupMethod === 'google') {
      return null;
    }

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

      case 'file': {
        const currentImage = imagePreview || String(value) || field.defaultValue || '';
        const hasCustomImage = Boolean(value) && value !== field.defaultValue;

        return (
          <div key={field.name} className="sm:col-span-2">
            <label className="form-input-label">{field.label}</label>
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
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={handleImageCancel}
                    className="btn-secondary text-xs px-3 py-1"
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
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <h3 className="text-lg font-semibold mb-2">Delete Profile Image?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Are you sure you want to remove your profile image? This will revert to the
                      default image.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmImageDelete}
                        className="btn-red text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="form-input-description mt-2">PNG, JPG, or JPEG (max 1MB)</p>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      }

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

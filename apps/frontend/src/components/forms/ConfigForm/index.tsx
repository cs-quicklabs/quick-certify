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

    // Update form data when initialValues changes
    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            const sanitizedValues = Object.entries(initialValues).reduce(
                (acc, [key, value]) => {
                    acc[key] = value === null ? undefined : value;
                    return acc;
                },
                {} as Record<string, unknown>,
            );
            setFormData(sanitizedValues);
            initialFormDataRef.current = sanitizedValues;
        }
    }, [initialValues]);

    // Auto-hide success message
    useEffect(() => {
        if (submitSuccess) {
            const timer = setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [submitSuccess]);

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

    // Helper for setting field value directly (used by FileField)
    const setFieldValue = useCallback((name: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

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

            if (config.resetOnSuccess) {
                setFormData({});
                initialFormDataRef.current = {};
            } else {
                initialFormDataRef.current = { ...formData };
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
        const value = formData[field.name];
        const error = errors[field.name];
        const isDisabled = field.disabled || isSubmitting || isLoading;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
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
                // Fallback or unhandled types
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
                onSubmit={handleSubmit}
                className={`w-full mt-6 ${config.layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}
            >
                {config.fields.map(renderField)}

                <div className={config.layout === 'grid' ? 'col-span-2' : ''}>
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
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

import { useRef, useState, ChangeEvent } from 'react';
import { FormFieldConfig } from '@/types/form.types';
import { FieldLabel } from '../FieldLabel';
import { ConfirmationDialog } from '@/components/ui';
import { validateImageFile } from '@/schemas/settings.schema';
import { useImageUpload } from '@/hooks/useImageUpload';

interface FileFieldProps {
    field: FormFieldConfig;
    value: unknown;
    error?: string;
    onValueChange: (value: string | undefined) => void;
    onUpload?: (fieldName: string, url: string) => void | Promise<void>;
    onDelete?: (fieldName: string) => void | Promise<void>;
    isDisabled?: boolean;
}

export function FileField({
    field,
    value,
    error,
    onValueChange,
    onUpload,
    onDelete,
    isDisabled,
}: FileFieldProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { upload, isUploading, error: uploadError, setError, remove } = useImageUpload({
        onSuccess: async (url) => {
            onValueChange(url);
            if (onUpload) {
                await onUpload(field.name, url);
            }
            // Reset local state
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onDelete: async () => {
            onValueChange(undefined);
            if (onDelete) {
                await onDelete(field.name);
            }
            setShowDeleteConfirm(false);
        }
    });

    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            setLocalError(validation.error || 'Invalid file');
            return;
        }
        setLocalError(null);
        setError(null);

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleUploadClick = async () => {
        if (!selectedImage) return;
        const currentUrl = typeof value === 'string' ? value : undefined;
        await upload(selectedImage, currentUrl);
    };

    const handleCancelClick = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setLocalError(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveClick = () => {
        setShowDeleteConfirm(true);
    };

    const currentImage = imagePreview || (typeof value === 'string' ? value : '') || field.defaultValue || '';
    const hasCustomImage = Boolean(value) && value !== field.defaultValue;
    const displayError = localError || uploadError || error;

    return (
        <div className="sm:col-span-2">
            <FieldLabel field={field} />
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
                    {!hasCustomImage && !isDisabled && (
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
                    )}

                    {hasCustomImage && !selectedImage && !isDisabled && (
                        <div
                            onClick={handleRemoveClick}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={field.accept || 'image/png,image/jpg,image/jpeg'}
                    onChange={handleImageSelect}
                    disabled={isDisabled || isUploading}
                    className="hidden"
                />

                {/* Upload/Cancel buttons when image is selected */}
                {selectedImage && (
                    <div className="flex gap-2 mt-3">
                        <button
                            type="button"
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className="btn-primary text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelClick}
                            disabled={isUploading}
                            className="btn-secondary text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Delete confirmation modal */}
                <ConfirmationDialog
                    isOpen={showDeleteConfirm}
                    title="Delete Profile Image?"
                    message="Are you sure you want to remove your profile image? This will revert to the default image."
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    confirmVariant="danger"
                    onConfirm={() => remove(currentImage)}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            </div>
            {displayError && <p className="text-red-500 text-xs mt-1">{displayError}</p>}
        </div>
    );
}

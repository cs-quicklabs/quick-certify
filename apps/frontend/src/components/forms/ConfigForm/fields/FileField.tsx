import { useRef, useState, ChangeEvent } from 'react';
import { FormFieldConfig } from '@/types/form.types';
import { FieldLabel } from '../FieldLabel';
import { ConfirmationDialog } from '@/components/ui';
import { validateImageFile } from '@/schemas/settings.schema';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Pen, Trash2Icon } from 'lucide-react';

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

  const {
    upload,
    isUploading,
    error: uploadError,
    setError,
    remove,
  } = useImageUpload({
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
    },
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

  const currentImage =
    imagePreview || (typeof value === 'string' ? value : '') || field.defaultValue || '';
  const hasCustomImage = Boolean(value) && value !== field.defaultValue;
  const displayError = localError || uploadError || error;

  return (
    <div className="sm:col-span-2">
      <FieldLabel field={field} />
      <div className="items-center w-full">
        {/* Image with hover edit icon */}
        <div className="relative inline-block group">
          {currentImage && (
            <img className="w-20 h-20 rounded-full object-cover" src={currentImage} alt="Avatar" />
          )}
          {/* Edit overlay on hover */}
          {!hasCustomImage && !isDisabled && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              <Pen className="w-6 h-6 text-white" />
            </div>
          )}

          {hasCustomImage && !selectedImage && !isDisabled && (
            <div
              onClick={handleRemoveClick}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <Trash2Icon className="w-6 h-6 text-white" />
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

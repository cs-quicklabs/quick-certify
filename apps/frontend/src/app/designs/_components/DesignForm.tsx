'use client';

import { useEffect, useRef, useState } from 'react';
import { validateImageAspectRatio } from '@/lib/design';
import { DesignEditor } from './DesignEditor';
import { DesignLayout } from '@/types';
import { UploadCloud } from 'lucide-react';

type DesignType = 'certificate' | 'badge';

type Props = {
  title: string;
  subtitle: string;
  mode: 'add' | 'edit';
  designType: DesignType;

  name: string;
  onNameChangeAction: (v: string) => void;

  imageUrl?: string;
  isUploading?: boolean;
  uploadError?: string | null;
  isSaveDisabled: boolean;

  onImageSelectAction: (file: File) => void;
  onSubmitAction: (data: { name: string }) => void;
};

export default function DesignForm({
  title,
  subtitle,
  mode,
  designType,
  name,
  onNameChangeAction,
  imageUrl,
  isUploading = false,
  uploadError,
  isSaveDisabled,
  onImageSelectAction,
  onSubmitAction,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [, setLayout] = useState<DesignLayout | null>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);

  const imageRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = Boolean(name.trim()) && Boolean(preview);

  useEffect(() => {
    setPreview(imageUrl ?? null);
    imageRef.current = null;
    setError(null);
  }, [imageUrl]);

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    if (preview) return;
    e.preventDefault();
  };

  const handleDragEnter = () => {
    if (!preview) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (preview) return;

    e.preventDefault();
    setIsDragging(false);

    await handleFile(e.dataTransfer.files);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFile(e.target.files);
    e.target.value = '';
  };

  const handleFile = async (files?: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      await validateImageAspectRatio(file, designType);
      imageRef.current = file;
      setPreview(URL.createObjectURL(file));
      onImageSelectAction(file);
      setError(null);
    } catch (err) {
      imageRef.current = null;
      setError(err instanceof Error ? err.message : 'Invalid image');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitAction({ name });
      }}
      className="mx-auto w-full max-w-xl px-4 pt-4 space-y-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {mode === 'edit' ? 'Edit Name' : 'Add Name'}
        </label>
        <input
          value={name}
          onChange={(e) => onNameChangeAction(e.target.value)}
          required
          className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Upload heading */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
        <p className="mt-1 text-xs text-gray-500">
          Upload A4 (1108x800 px) size image for certificate or (440x400 px) for badge
        </p>
      </div>

      {/* Dropzone */}
      <div className="w-full">
        <label
          htmlFor="design-upload"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
      relative block w-full
      rounded-sm
      border-2 border-dashed border-gray-300
      bg-gray-50
      overflow-hidden
      ${
        preview
          ? designType === 'certificate'
            ? 'aspect-11/8'
            : 'mx-auto w-64 aspect-square'
          : 'h-40'
      }
      ${preview ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
        ${isDragging ? 'border-blue-500 bg-blue-50' : ''}
    `}
          onClick={(e) => preview && e.preventDefault()}
        >
          {/* EMPTY STATE */}
          {!preview && (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <UploadCloud className="mb-3 h-12 w-12 stroke-[1.5]" />

              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>

              <p className="text-xs text-gray-400">
                {designType === 'certificate' ? 'A4 size image (1108×800)' : '440×400 image'}
              </p>
            </div>
          )}

          {/* PREVIEW STATE */}
          {preview && (
            <div className="relative h-full w-full bg-white border rounded-sm overflow-hidden">
              <DesignEditor backgroundUrl={preview} onLayoutChangeAction={setLayout} />
            </div>
          )}

          {/* LOADING OVERLAY */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="text-sm font-medium">Saving design…</span>
            </div>
          )}
        </label>
        <input
          id="design-upload"
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {(error || uploadError) && (
        <p className="text-sm font-medium text-red-600">{error || uploadError}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={isSaveDisabled || !isValid}
          className="rounded-sm bg-blue-700 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Save Design
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-sm border border-gray-300 px-6 py-2 text-sm font-medium hover:border-gray-400 disabled:opacity-50"
        >
          Replace Image
        </button>
      </div>
    </form>
  );
}

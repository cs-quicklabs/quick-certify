'use client';

import { useEffect, useRef, useState } from 'react';
import { validateImageDimensions } from '@/lib/design';
import { DesignEditor } from './DesignEditor';
import { DesignLayout } from '@/types';

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

  const imageRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = Boolean(name.trim()) && Boolean(preview);

  useEffect(() => {
    setPreview(imageUrl ?? null);
    imageRef.current = null;
    setError(null);
  }, [imageUrl]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitAction({ name });
      }}
      className="mx-auto max-w-xl px-5 py-6"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-medium font-semibold">{title}</h1>
        <p className="text-xs font-medium text-gray-500">{subtitle}</p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold">
          {mode === 'edit' ? 'Edit Name' : 'Add Name'}
        </label>
        <input
          value={name}
          onChange={(e) => onNameChangeAction(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold"
          required
        />
      </div>

      {/* Image Upload */}
      <div className="mb-8">
        <label className="mb-1 block text-sm font-semibold">Upload Image</label>
        <p className="mb-2 text-xs font-semibold text-gray-400">
          {designType === 'certificate'
            ? 'Upload A4 size certificate (1100 × 800)'
            : 'Upload badge image (440 × 400)'}
        </p>

        <label
          className={`relative block rounded-lg border-2 border-dashed p-10 text-center ${preview
            ? 'cursor-not-allowed bg-gray-100'
            : 'cursor-pointer hover:bg-gray-100'
            }`}
          onClick={(e) => preview && e.preventDefault()}
        >
          {preview ? (
            <div className="relative mx-auto aspect-11/8 w-full overflow-hidden rounded border bg-white">
              <DesignEditor
                backgroundUrl={preview}
                onLayoutChangeAction={setLayout}
              />
            </div>
          ) : (
            <p className="text-gray-400">Click to upload</p>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="text-sm font-semibold">Saving design…</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                await validateImageDimensions(file, designType);
                imageRef.current = file;
                setPreview(URL.createObjectURL(file));
                onImageSelectAction(file);
                setError(null);
              } catch (err) {
                imageRef.current = null;
                setError(
                  err instanceof Error ? err.message : 'Invalid image'
                );
                e.target.value = '';
              }
            }}
          />
        </label>

        {(error || uploadError) && (
          <p className="mt-2 text-sm font-medium text-red-600">
            {error || uploadError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={isSaveDisabled || !isValid}
          className="rounded-md bg-blue-800 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save Design
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-md border border-gray-200 px-6 py-2 text-sm font-semibold hover:border-gray-400 disabled:opacity-50"
        >
          Replace Image
        </button>
      </div>
    </form>
  );
}

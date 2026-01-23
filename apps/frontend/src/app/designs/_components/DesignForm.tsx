'use client';

import { useRef, useState, useEffect } from 'react';
import { validateImageDimensions } from '@/lib/design';

type DesignType = 'certificate' | 'badge';

type Props = {
  title: string;
  subtitle: string;
  mode: 'add' | 'edit';
  designType: DesignType;
  defaultName?: string;
  imageUrl?: string;
  isUploading?: boolean;
  uploadComplete?: boolean;
  onImageSelectAction: (file: File) => void;
  onSubmitAction: (data: { name: string; image: File | null }) => void;
};

export default function DesignForm({
  title,
  subtitle,
  mode,
  designType,
  defaultName = '',
  imageUrl,
  isUploading = false,
  uploadComplete = false,
  onImageSelectAction,
  onSubmitAction,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);

  const imageRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCertificate = designType === 'certificate';

  useEffect(() => {
    setName(defaultName ?? '');
    setPreview(imageUrl ?? null);
    imageRef.current = null;
    setError(null);
  }, [defaultName, imageUrl]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitAction({ name, image: imageRef.current });
      }}
      className="max-w-xl mx-auto py-6 px-5"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-medium font-semibold">{title}</h1>
        <p className="text-xs font-medium text-gray-500">{subtitle}</p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">
          {mode === 'edit' ? 'Edit Name' : 'Add Name'}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border text-sm border-gray-200 font-semibold rounded-md px-3 py-2"
          required
        />
      </div>

      {/* Image Upload */}
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-1">
          Upload Image
        </label>

        <p className="text-xs text-gray-400 mb-2 font-semibold">
          {isCertificate
            ? 'Upload A4 size certificate (11008 × 800)'
            : 'Upload badge image (440 × 400)'}
        </p>

        <label className="relative border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 p-10 text-center block">
          {preview ? (
            <img src={preview} className="mx-auto max-h-96 rounded" />
          ) : (
            <p className="text-gray-400">Click to upload</p>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold">Uploading…</span>
            </div>
          )}

          {uploadComplete && !isUploading && (
            <p className="mt-2 text-green-600 text-sm font-medium">
              Upload complete ✓
            </p>
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
              } catch (err: unknown) {
                imageRef.current = null;
                setError(err instanceof Error ? err.message : 'An error occurred');
                e.target.value = '';
              }
            }}
          />
        </label>

        {error && (
          <p className="mt-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center justify-between">
        <button
          type="submit"
          disabled={isUploading}
          className="bg-blue-800 disabled:opacity-50 font-semibold text-sm text-white px-6 py-2 rounded-md"
        >
          Save Design
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border px-6 py-2 rounded-md font-semibold text-sm border-gray-200 hover:border-gray-400"
        >
          Replace Image
        </button>
      </div>
    </form>
  );
}

'use client';

import { useRef, useState, useEffect } from 'react';
import { validateImageDimensions } from '@/lib/design';
import { DesignEditor } from './DesignEditor';
import { DesignLayout } from '@/types';

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
  const [layout, setLayout] = useState<DesignLayout | null>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const imageRef = useRef<File | null>(null);
  const canSubmit = name.trim() && (preview || imageRef.current);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCertificate = designType === 'certificate';

  useEffect(() => {
    setName(defaultName ?? '');
    setPreview(imageUrl ?? null);
    imageRef.current = null;
    setError(null);
    setHasNewImage(false);
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
            ? 'Upload A4 size certificate (1100 × 800)'
            : 'Upload badge image (440 × 400)'}
        </p>

        <label className={`relative border-2 border-dashed rounded-lg p-10 text-center block ${preview ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-100'}`}
          onClick={(e) => {
            if (preview) e.preventDefault();
          }}>


          {preview ? (
            <div className="relative w-full aspect-[11/8] mx-auto border rounded overflow-hidden bg-white">
              <DesignEditor backgroundUrl={preview}
                onLayoutChange={setLayout} />
            </div>
          ) : (
            <p className="text-gray-400">Click to upload</p>
          )}


          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold">Saving design…</span>
            </div>
          )}


          {hasNewImage && uploadComplete && !isUploading && (
            <p className="mt-2 text-green-600 text-sm font-medium">
              Upload complete
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
                setHasNewImage(true);
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
          disabled={isUploading || !canSubmit}
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

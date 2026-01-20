'use client';

import { useRef, useState } from 'react';

type DesignType = 'certificate' | 'badge';

type Props = {
  title: string;
  subtitle: string;
  mode: 'add' | 'edit';
  designType: DesignType;
  defaultName?: string;
  imageUrl?: string;
  onSubmit: (data: { name: string; image: File | null }) => void;
};

export default function DesignForm({
  title,
  subtitle,
  mode,
  designType,
  defaultName = '',
  imageUrl,
  onSubmit,
}: Props) {
  const [name, setName] = useState(defaultName);
  const imageRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === 'edit';
  const isCertificate = designType === 'certificate';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name,
          image: imageRef.current,
        });
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
          {isEdit ? 'Edit Name' : 'Add Name'}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border text-sm border-gray-200 font-semibold rounded-md px-3 py-2"
          placeholder="Name"
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

        <label className="border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 p-10 text-center block">
          {imageUrl ? (
            <img
              src={imageUrl}
              className="mx-auto max-h-96 rounded"
              alt="Preview"
            />
          ) : (
            <>
              <p className="text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                {isCertificate ? 'A4 format' : 'Square format'}
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                imageRef.current = e.target.files[0];
              }
            }}
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center justify-between">
        <button
          type="submit"
          className="bg-blue-800 font-semibold text-sm text-white px-6 py-2 rounded-md"
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

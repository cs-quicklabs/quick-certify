'use client';

interface DropzonePlaceholderProps {
  category: string;
  maxSizeMB: number;
}

export function DropzonePlaceholder({ category, maxSizeMB }: DropzonePlaceholderProps) {
  return (
    <>
      <svg
        className="w-10 h-10 mb-2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="mb-2 text-sm text-gray-500">
        <span className="font-semibold text-black-600">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-gray-500">
        {category === 'banner' ? 'Size: 1920x300' : `Max. File Size: ${maxSizeMB}MB`}
      </p>
    </>
  );
}

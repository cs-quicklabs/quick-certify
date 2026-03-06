'use client';

interface DropzoneImageErrorProps {
  imageSize: 'small' | 'large';
}

export function DropzoneImageError({ imageSize }: DropzoneImageErrorProps) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200 ${
        imageSize === 'large' ? 'min-w-[200px] min-h-[120px]' : ''
      }`}
    >
      <div className="text-center p-2">
        <svg
          className={`${imageSize === 'small' ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400 mx-auto mb-1`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs text-gray-500">Failed to load</p>
      </div>
    </div>
  );
}

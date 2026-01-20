'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DesignPreview({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) {
  const router = useRouter();

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [router]);

  return (
    // Overlay (click outside closes)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
      onClick={() => router.back()}
    >


      {/* Modal container (stop propagation so inside clicks don't close) */}
      <div
        className="relative bg-white w-full max-w-5xl mx-4 rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shadow-sm">

          {/* Close button */}
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex justify-center bg-gray-50">
          <img
            src={imageUrl}
            alt={name}
            className="max-h-[75vh] w-auto rounded"
          />
        </div>
      </div>
    </div>
  );
}

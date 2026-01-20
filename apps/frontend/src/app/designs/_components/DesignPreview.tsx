"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DesignPreview({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Prevent background scroll while modal open
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    // open animation trigger
    const t = setTimeout(() => setIsOpen(true), 10);
    return () => {
      clearTimeout(t);
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // close modal function (animated)
  const close = () => {
    setIsClosing(true);
    setIsOpen(false);
    // match transition duration below (200ms)
    setTimeout(() => router.back(), 220);
  };

  // Close on ESC key (animated)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    // Backdrop
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center backdrop-blur-sm transition-opacity duration-200 ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={close}
      aria-modal="true"
      role="dialog"
      aria-label={`Preview of ${name}`}
    >
      {/* Close button */}
      {typeof document !== "undefined" &&
        createPortal(
          <button onClick={(e) => {
                      e.stopPropagation();
                      close();
                      }}
                      className="fixed top-8 right-0 mr-10 mt-5 z-50 bg-white/95 hover:bg-red-600 text-gray-700 hover:text-white rounded-full p-2 shadow-lg transition-colors duration-300"
                      aria-label="Close preview"
                      title="Close preview"
                    >
                      <X className="w-5 h-5 group-hover:animate-spin" />
                    </button>,
          document.body
        )}

      {/* Modal container (stop propagation so inside clicks don't close) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex items-center justify-center w-full mx-4 max-w-225 transition-all duration-200 ease-out transform ${
          isOpen && !isClosing ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Centered image */}
        <div className="rounded-lg overflow-visible p-2 bg-transparent">
          <img
            src={imageUrl}
            alt={name}
            className="block mx-auto max-h-[80vh] w-auto drop-shadow-2xl rounded"
            style={{
              // make image appear large and crisp like the provided mock
              maxWidth: "min(90vw, 720px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

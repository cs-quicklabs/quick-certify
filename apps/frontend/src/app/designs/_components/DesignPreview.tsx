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

  // Lock background scroll + trigger open animation
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    const t = setTimeout(() => setIsOpen(true), 10);
    return () => {
      clearTimeout(t);
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const close = () => {
    setIsClosing(true);
    setIsOpen(false);
    setTimeout(() => router.back(), 220);
  };

  // ESC key
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${name}`}
      >

        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative transition-all duration-200 ease-out transform ${isOpen && !isClosing
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
            }`}
        >
          <img
            src={imageUrl}
            alt={name}
            className="block mx-auto max-h-[80vh] w-auto rounded shadow-2xl"
            style={{ maxWidth: "min(90vw, 720px)" }}
          />
        </div>
      </div>

      {/* Close Button */}
      {createPortal(
        <button
          onClick={close}
          className="fixed top-18 right-6 z-50 group bg-white/95 hover:bg-red-600 text-gray-700 hover:text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:rotate-360deg "
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>,
        document.body
      )}
    </>
  );
}

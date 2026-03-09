'use client';

import { ReactNode, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  /**
   * Title of the dialog
   */
  title: string | ReactNode;
  /**
   * Message/description to display
   */
  message: string | ReactNode;
  /**
   * Label for the confirm button
   */
  confirmLabel?: string;
  /**
   * Label for the confirm button when loading
   */
  confirmLoadingLabel?: string;
  /**
   * Label for the cancel button
   */
  cancelLabel?: string;
  /**
   * Variant of the confirm button (danger, primary, etc.)
   */
  confirmVariant?: 'danger' | 'primary' | 'secondary';
  /**
   * Whether the confirm action is in progress
   */
  isLoading?: boolean;
  /**
   * Callback when confirm is clicked
   */
  onConfirm: () => void;
  /**
   * Callback when cancel is clicked
   */
  onCancel: () => void;
  /**
   * Additional CSS classes for the dialog container
   */
  className?: string;
}

/**
 * ConfirmationDialog Component
 *
 * A reusable confirmation dialog/modal component that displays
 * a blurred background and a centered dialog with confirm/cancel actions.
 */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmLoadingLabel = 'Processing...',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
  className = 'p-10 max-w-120 max-h-80 rounded-xs',
}: ConfirmationDialogProps) {
  // Track mounted state for SSR safety
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  // Use portal to render outside DOM hierarchy (fixes hydration issues when inside tables)
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div className={`relative w-full ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-neutral-primary-soft border border-default rounded-2xl shadow-lg p-2 md:p-4">
          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-2 right-2 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-full text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer"
          >
            <svg
              className="w-3 h-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>

          {/* Content */}
          <div className="p-2 md:p-3 text-center ">
            <svg
              className="mx-auto mb-2 text-red-500 w-14 h-14"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>

            <h3 className="text-lg font-bold text-gray-700">{title}</h3>

            {message && (
              <div className="mb-6 text-xs text-slate-500 max-w-[90%] mx-auto">{message}</div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium rounded-sm text-sm px-4 py-2 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="text-white bg-danger hover:bg-danger-strong focus:ring-4 focus:ring-danger-medium shadow-xs font-medium text-sm px-4 py-2 focus:outline-none rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? confirmLoadingLabel : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

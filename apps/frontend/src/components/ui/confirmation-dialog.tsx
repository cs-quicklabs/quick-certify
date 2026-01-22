'use client';

import { ReactNode } from 'react';

export interface ConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  /**
   * Title of the dialog
   */
  title: string;
  /**
   * Message/description to display
   */
  message: string | ReactNode;
  /**
   * Label for the confirm button
   */
  confirmLabel?: string;
  /**
   * Label for the cancel button
   */
  cancelLabel?: string;
  /**
   * Variant of the confirm button (danger, primary, etc.)
   */
  confirmVariant?: 'danger' | 'primary' | 'secondary';
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
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  className,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const confirmButtonClasses = {
    danger: 'btn-red',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-white/10 dark:bg-black/10 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl ${
          className || ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">{message}</div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${confirmButtonClasses[confirmVariant]} text-sm`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

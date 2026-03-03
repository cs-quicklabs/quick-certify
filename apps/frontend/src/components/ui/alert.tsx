'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string | ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertStyles = {
  success: {
    container: 'bg-green-50 border-green-500',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  error: {
    container: 'bg-red-50 border-red-500',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-500',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
};

export function Alert({ type, title, message, onClose, className }: AlertProps) {
  const styles = alertStyles[type];
  // const Icon = icons[type];

  return (
    <div
      className={clsx('flex p-4 border-l-4 rounded-sm', styles.container, className)}
      role="alert"
    >
      {/* <Icon className={clsx('flex-shrink-0 w-5 h-5', styles.icon)} /> */}
      <div className="ml-3 flex-1">
        {title && <h3 className={clsx('text-sm font-medium', styles.title)}>{title}</h3>}
        <div className={clsx('text-sm', title && 'mt-1', styles.message)}>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className={clsx(
            'ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-gray-100',
            styles.icon,
          )}
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

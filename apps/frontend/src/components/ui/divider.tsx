'use client';

import { clsx } from 'clsx';

export interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className }: DividerProps) {
  if (text) {
    return (
      <div className={clsx('flex items-center', className)}>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">{text}</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
      </div>
    );
  }

  return <hr className={clsx('border-t border-gray-300 dark:border-gray-600', className)} />;
}

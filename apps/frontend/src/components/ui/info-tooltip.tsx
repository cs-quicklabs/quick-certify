'use client';
import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';
import { QuestionMarkSolid } from './icons';

export interface InfoTooltipProps {
  /**
   * The tooltip text to display
   */
  tooltipText: string | ReactNode;
  /**
   * Unique identifier for the tooltip (for accessibility)
   */
  id?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Icon size (default: 16px)
   */
  iconSize?: number;
  /**
   * Tooltip placement (default: 'top')
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * InfoTooltip Component
 *
 * A reusable tooltip component that displays an info icon and shows
 * helpful tooltip text on hover.
 */
export function InfoTooltip({
  tooltipText,
  id,
  className,
  iconSize = 16,
  placement = 'top',
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700 border-x-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-y-transparent border-r-transparent',
    right:
      'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-y-transparent border-l-transparent',
  };

  return (
    <div
      className={clsx('relative inline-flex mb-2 items-center', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full transition-colors"
        aria-describedby={id}
        aria-label="More information"
      >
        <QuestionMarkSolid className="w-4 h-4 text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-500" />
      </button>
      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className={clsx(
            'absolute z-50 w-100 p-2 text-xs font-normal text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg',
            placementClasses[placement],
          )}
        >
          {tooltipText}
          <div className={clsx('absolute w-0 h-0 border-4', arrowClasses[placement])} />
        </div>
      )}
    </div>
  );
}

'use client';

import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';

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
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
    bottom:
'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
    right:
'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
  };

  return (
    <div
      className={clsx('relative inline-flex mb-2 items-center', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full transition-colors"
        aria-describedby={id}
        aria-label="More information"
      >
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-gray-400 hover:text-gray-900"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className={clsx(
'absolute z-50 w-100 p-2 text-xs font-normal text-white bg-gray-900 rounded-md shadow-lg',
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

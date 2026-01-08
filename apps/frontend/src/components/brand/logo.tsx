'use client';

import { clsx } from 'clsx';
import Link from 'next/link';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  asLink?: boolean;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function Logo({ size = 'md', className, asLink = true }: LogoProps) {
  const content = (
    <div className={clsx('flex items-center gap-2', className)}>
      {/* Logo Icon */}
      <svg
        className={clsx('text-primary-600', {
          'w-6 h-6': size === 'sm',
          'w-8 h-8': size === 'md',
          'w-10 h-10': size === 'lg',
        })}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path
          d="M10 16L14 20L22 12"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Logo Text */}
      <span
        className={clsx(
          'font-bold text-gray-900 dark:text-white',
          sizeClasses[size],
        )}
      >
        Quick Certify
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}


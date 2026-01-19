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

  const title = "Quick Certify";
  const logo = "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg";

  const content = (
    <div className={clsx('flex items-center', className)}>
      <img className="w-8 h-8 mr-2" src={logo} alt="logo" />
      <span
        className={clsx(
          'font-semibold text-gray-900 dark:text-white',
          sizeClasses[size],
        )}
      >
        {title}
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


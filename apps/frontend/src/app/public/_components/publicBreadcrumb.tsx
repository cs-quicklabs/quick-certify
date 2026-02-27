'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PublicBreadcrumbProps {
  items: BreadcrumbItem[];
  title: string;
  subtitle?: string;
}

export function PublicBreadcrumb({ items, title, subtitle }: PublicBreadcrumbProps) {
  return (
    <div className="max-w-7xl mx-auto p-4 rounded-sm border border-gray-200 bg-white">
      {/* Mobile Back */}
      <nav className="sm:hidden" aria-label="Back">
        <Link
          href={items[0]?.href ?? '#'}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Back
        </Link>
      </nav>

      {/* Desktop Breadcrumb */}
      <nav className="hidden sm:flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && <span className="text-gray-400">›</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-2">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
      </div>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

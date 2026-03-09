'use client';

import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PathwayBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function PathwayBreadcrumb({ items }: PathwayBreadcrumbProps) {
  const backHref = items[items.length - 2]?.href ?? items[0]?.href ?? '#';

  return (
    <>
      {/* Mobile Back */}
      <nav className="sm:hidden" aria-label="Back">
        <Link
          href={backHref}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          &larr; Back
        </Link>
      </nav>

      {/* Desktop Breadcrumb */}
      <nav className="hidden sm:flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && <span className="text-gray-400">&rsaquo;</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-500">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

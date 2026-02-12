import React from 'react';

export interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Table Header Cell Component
 *
 * Provides consistent styling for table headers across the application
 * Matches design: https://github.com/cs-quicklabs/quicklabs-designs/blob/main/src/routes/quick-certify/settings/account/team/%2Bpage.svelte
 */

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <th className={`px-4 py-4 text-md font-semibold uppercase bg-gray-50 ${className}`}>
      {children}
    </th>
  );
}

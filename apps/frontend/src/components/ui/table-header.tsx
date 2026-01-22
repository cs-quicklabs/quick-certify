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
    <th scope="col" className={`px-4 py-2 text-xs text-gray-700 uppercase ${className}`}>
      {children}
    </th>
  );
}

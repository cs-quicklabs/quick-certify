'use client';

import Link from 'next/link';

interface RecipientCardProps {
  uuid: string;
  name: string;
  href: string;
}

export function RecipientCard({ uuid, name, href }: RecipientCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-sm border border-gray-300 bg-white px-4 py-3 hover:border-gray-400 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {/* Avatar with initials fallback */}
      <div className="relative h-10 w-10 shrink-0">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-700">{initials}</span>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
      </div>
    </Link>
  );
}

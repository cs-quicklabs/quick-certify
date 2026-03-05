'use client';

import { getInitials } from '@/utils';

export type AvatarProps = {
  avatarUrl: string;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'lg';
};

export function HeaderAvatar({ avatarUrl, firstName, lastName, size = 'sm' }: AvatarProps) {
  const cls = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  return (
    <div
      className={`${cls} flex items-center justify-center rounded-full bg-gray-400 text-white overflow-hidden`}
    >
      {avatarUrl ? (
        <img className="h-full w-full object-cover" src={avatarUrl} alt={firstName || 'User'} />
      ) : (
        <span className="text-lg font-medium">{getInitials(firstName, lastName)}</span>
      )}
    </div>
  );
}

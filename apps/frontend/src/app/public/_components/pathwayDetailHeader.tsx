'use client';

import clsx from 'clsx';
import { Clock, Users, FileText } from 'lucide-react';
import { PathwayBreadcrumb, BreadcrumbItem } from '@/components/pathways/PathwayBreadcrumb';

interface PathwayDetailHeaderProps {
  items: BreadcrumbItem[];
  name: string;
  description?: string | null;
  status: string;
  duration?: string;
  participantCount: number;
  credentialCount: number;
}

export function PathwayDetailHeader({
  items,
  name,
  description,
  status,
  duration,
  participantCount,
  credentialCount,
}: PathwayDetailHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto p-4 rounded-sm border border-gray-200 bg-white">
      <PathwayBreadcrumb items={items} />

      <div className="mt-2">
        <h2 className="text-2xl font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {name}
        </h2>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span
            className={clsx(
              'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm',
              status === 'active' && 'bg-green-100 text-green-800 border border-green-200',
              status === 'draft' && 'bg-yellow-100 text-yellow-800 border border-yellow-200',
              status !== 'active' && status !== 'draft' && 'bg-gray-100 text-gray-800 border border-gray-200',
            )}
          >
            <span
              className={clsx(
                'w-2 h-2 mr-1.5 rounded-full',
                status === 'active' && 'bg-green-500',
                status === 'draft' && 'bg-yellow-500',
                status !== 'active' && status !== 'draft' && 'bg-gray-500',
              )}
            />
            {status}
          </span>
          {duration && (
            <span className="text-gray-500 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {duration}
            </span>
          )}
          <span className="text-gray-500 text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {participantCount} participants
          </span>
          <span className="text-gray-500 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {credentialCount} credentials
          </span>
        </div>
      </div>
    </div>
  );
}

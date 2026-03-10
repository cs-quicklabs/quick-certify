'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createRoute } from '@/config/routes';
import { toTitleCase } from '@/utils/string.utils';
import type { Event } from '@/types';

interface RecentEventsListProps {
  events: Event[];
  isLoading: boolean;
}

export function RecentEventsList({ events, isLoading }: RecentEventsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No events yet. Create your first event to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {events.slice(0, 5).map((event) => (
        <div
          key={event.uuid}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{event.name}</p>
            <p className="text-sm text-gray-500">
              {toTitleCase(event.event_type?.name) || 'No type'} &bull;{' '}
              {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href={createRoute.eventDetail(event.uuid)}
            className="ml-4 text-sm text-primary-600 hover:text-primary-700 font-medium shrink-0"
          >
            View
          </Link>
        </div>
      ))}
    </div>
  );
}

'use client';

import { EventItem } from './EventItem';
import { Event } from '@/types';

export interface EventsTableProps {
  events: Event[];
  onDelete?: (uuid: string) => void;
  canDelete?: boolean;
  deletingEventId?: string | null;
}

export const EventsTable = ({
  events,
  onDelete,
  canDelete = true,
  deletingEventId,
}: EventsTableProps) => {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p>No events found</p>
      </div>
    );
  }

  return (
    <div className="border-gray-200">
      <table className="w-full text-sm text-left text-gray-500">
        <tbody>
          {events.map((event) => (
            <EventItem
              key={event.uuid}
              {...event}
              onDelete={onDelete}
              canDelete={canDelete}
              isDeleting={deletingEventId === event.uuid}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

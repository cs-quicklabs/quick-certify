'use client';

import { EventItem } from './EventItem';
import type { EventItemProps } from './EventItem';

export interface EventsTableProps {
  events: EventItemProps[];
}

export const EventsTable = ({ events }: EventsTableProps) => {
  return (
    <div className="border-gray-200">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <tbody>
          {events.map((e) => (
            <EventItem key={e.id} {...e} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

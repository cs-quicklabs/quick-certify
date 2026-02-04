'use client';

import Link from 'next/link';
import { Eye, Plus } from 'lucide-react';

export interface EventItemProps {
  id: string;
  name: string;
  createdAt: string;
  event_type?: { name: string };
  event_level?: { name: string };
  image?: string;
}

export const EventItem = ({ id, name, createdAt, event_type, event_level, image }: EventItemProps) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-600">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div>
            {image ? (
              <img src={image} alt={name} className="w-20 md:w-20 max-w-full shadow-md bg-gray-200" />
            ) : (
              <span className="p-5 w-20 md:w-20 max-w-full shadow-md bg-gray-200">Thumb</span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{name}</div>
            <div className="text-xs text-gray-500 flex gap-2">
              <span className="capitalize py-0.5 rounded">Created On: {new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex gap-2">
              <span className="capitalize bg-brand-softer border border-brand-subtle text-fg-brand-strong text-xs font-medium px-1.5 py-0.5 rounded">{event_type?.name || 'Badge'}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-1 text-right">
        <div className="flex justify-end gap-1">
          <Link href={`/events/${id}`} className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
            <Eye size={'16'} strokeWidth={'1.7px'} /> <span>View Credential</span>
          </Link>
          <button className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
            <Plus size={'16'} strokeWidth={'1.7px'} /> <span>Issue Credential</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

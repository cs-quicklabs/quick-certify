'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';
import { ROUTES } from '@/config/routes';

interface EventSelectorProps {
  eventId: string;
  eventName: string;
  onSelect: (uuid: string, name: string) => void;
  error?: string;
}

export function EventSelector({ eventId, eventName, onSelect, error }: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: eventsData, isLoading } = useEvents({ limit: 100 });
  const events = eventsData?.data ?? [];
  const filteredEvents = events.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (uuid: string, name: string) => {
    onSelect(uuid, name);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div>
      <label className="form-input-label">
        Event <span className="text-red-500">*</span>
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left bg-gray-50 border text-sm rounded-sm px-3 py-2.5 pr-10 cursor-pointer focus:ring-primary-600 focus:border-primary-600 focus:outline-none ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
        >
          <span className={`capitalize ${eventId ? 'text-gray-900' : 'text-gray-400'}`}>
            {eventName || 'Select an event...'}
          </span>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-4 text-center">
                  {search ? (
                    <p className="text-sm text-gray-500">No events match your search</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-3">No events available</p>
                      <Link
                        href={ROUTES.CREATE_EVENT}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
                        onClick={() => setIsOpen(false)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Create an event
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <button
                    key={event.uuid}
                    type="button"
                    onClick={() => handleSelect(event.uuid, event.name)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-blue-50 capitalize ${
                      eventId === event.uuid
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {event.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

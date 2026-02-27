'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { ChevronDown, Clock, ClipboardList } from 'lucide-react';
import { PathwayEvent } from '@/types';

interface CredentialTimelineProps {
  events: PathwayEvent[];
}

export function CredentialTimeline({ events }: CredentialTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState(-1);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Pathway Credentials</h3>
        <p className="text-sm text-gray-500 mt-1">
          Complete these credentials in order to earn the final certification.
        </p>
      </div>

      <ol className="relative border-l-2 border-gray-200 ml-4 sm:ml-6">
        {events.map((event, index) => {
          const isExpanded = expandedIndex === index;
          const imageUrl = event.design?.url ?? '/credential/image_720.png';
          const duration =
            event.duration_value && event.duration_type
              ? `${event.duration_value} ${event.duration_type}${event.duration_value > 1 ? 's' : ''}`
              : undefined;

          return (
            <li
              key={event.uuid}
              className={clsx('mb-0 ml-6 sm:ml-8', index !== events.length - 1 && 'pb-8')}
            >
              {/* Step number circle */}
              <span
                className={clsx(
                  'absolute -left-4 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white',
                  isExpanded ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600',
                )}
              >
                <span className="text-xs font-semibold">{index + 1}</span>
              </span>

              {/* Accordion Card */}
              <div className="border border-gray-200 rounded-sm overflow-hidden bg-white hover:shadow-sm transition-shadow">
                {/* Header */}
                <button
                  type="button"
                  className="cursor-pointer w-full text-left px-4 py-3 flex items-center gap-3 sm:gap-4 hover:bg-gray-50"
                  onClick={() => toggleAccordion(index)}
                >
                  <Image
                    src={imageUrl}
                    alt={event.name}
                    width={48}
                    height={48}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm object-cover shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{event.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{event.description}</p>
                  </div>
                  {duration && (
                    <span className="hidden sm:inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600 shrink-0">
                      {duration}
                    </span>
                  )}
                  <ChevronDown
                    className={clsx(
                      'w-5 h-5 text-gray-400 shrink-0 transition-transform',
                      isExpanded && 'rotate-180',
                    )}
                  />
                </button>

                {/* Expanded Body */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-4 py-4 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Image
                        src={imageUrl}
                        alt={event.name}
                        width={128}
                        height={128}
                        className="w-full sm:w-32 h-auto rounded-sm object-cover border border-gray-100"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Duration: {duration}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3.5 h-3.5" />
                            Step {index + 1} of {events.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

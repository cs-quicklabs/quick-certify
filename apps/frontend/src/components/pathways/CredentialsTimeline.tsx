'use client';

import { useState } from 'react';
import { PathwayEvent } from '@/types/pathway.types';
import { Clock, ImageIcon, ChevronDown, ClipboardList } from 'lucide-react';

interface CredentialsTimelineProps {
  credentials: PathwayEvent[];
}

export function CredentialsTimeline({ credentials }: CredentialsTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState(-1);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="form-title">Pathway Credentials</h3>
        <p className="form-subtitle">
          Complete these credentials in order to earn the final certification.
        </p>
      </div>

      <ol className="relative border-l-2 border-gray-200 ml-4 sm:ml-6">
        {credentials.map((credential, index) => (
          <li
            key={credential.uuid}
            className={`mb-0 ml-6 sm:ml-8 ${index === credentials.length - 1 ? '' : 'pb-8'}`}
          >
            <span
              className={`absolute -left-4 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white ${
                expandedIndex === index ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span className="text-xs font-semibold">{index + 1}</span>
            </span>

            <div className="border border-gray-200 rounded-sm overflow-hidden bg-white hover:shadow-sm transition-shadow">
              <button
                type="button"
                className="cursor-pointer w-full text-left px-4 py-3 flex items-center gap-3 sm:gap-4 hover:bg-gray-50"
                onClick={() => toggleAccordion(index)}
              >
                {credential.design?.url ? (
                  <img
                    src={credential.design.url}
                    alt={credential.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm shrink-0 border border-gray-100 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-gray-200 shrink-0 border border-gray-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {credential.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {credential.description || `Credential ${index + 1} of ${credentials.length}`}
                  </p>
                </div>

                {credential.duration_value && credential.duration_type && (
                  <span className="shrink-0 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-md hidden sm:block">
                    {credential.duration_value} {credential.duration_type}
                    {credential.duration_value > 1 ? 's' : ''}
                  </span>
                )}

                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="border-t border-gray-200 px-4 py-4 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {credential.design?.url ? (
                      <img
                        src={credential.design.url}
                        alt={credential.name}
                        className="w-full sm:w-32 h-24 rounded-sm border border-gray-100 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-full sm:w-32 h-24 rounded-sm bg-gray-200 border border-gray-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1">
                      {credential.description && (
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {credential.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {credential.duration_value && credential.duration_type && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Duration: {credential.duration_value} {credential.duration_type}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5" />
                          Step {index + 1} of {credentials.length}
                        </span>
                      </div>
                      <div className="mt-3">
                        <button className="text-primary-600 hover:text-primary-700 text-xs font-medium">
                          View credential details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

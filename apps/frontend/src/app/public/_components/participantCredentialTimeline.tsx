'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { Check, CheckCircle } from 'lucide-react';
import { PublicPathwayCredential } from '@/types';

interface ParticipantCredentialTimelineProps {
  credentials: PublicPathwayCredential[];
}

function getStatusBadge(status: 'earned' | 'not_earned') {
  if (status === 'earned') {
    return {
      text: 'Earned',
      classes: 'bg-green-100 text-green-800 border-green-200',
      dotClass: 'bg-green-500',
    };
  }
  return {
    text: 'Not Earned',
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  };
}

export function ParticipantCredentialTimeline({ credentials }: ParticipantCredentialTimelineProps) {
  console.log('Rendering ParticipantCredentialTimeline with credentials:', credentials);
  return (
    <div className="max-w-7xl mx-auto px-4 pb-6 rounded-sm border border-gray-200 bg-white mt-4">
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">Credential Progress</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track completion status for each credential in this pathway.
          </p>
        </div>

        <ol className="relative border-l-2 border-gray-200 ml-4 sm:ml-6">
          {credentials.map((credential, index) => {
            const badge = getStatusBadge(credential.status);
            const isEarned = credential.status === 'earned';
            const imageUrl = credential.image_url || '/credential/image_720.png';

            return (
              <li
                key={credential.uuid}
                className={clsx('mb-0 ml-6 sm:ml-8', index !== credentials.length - 1 && 'pb-8')}
              >
                {/* Step circle */}
                <span
                  className={clsx(
                    'absolute -left-4 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white',
                    isEarned ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {isEarned ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </span>

                {/* Card */}
                <div className="border border-gray-200 rounded-sm overflow-hidden bg-white hover:shadow-sm transition-shadow">
                  <div className="w-full text-left px-4 py-3 flex items-center gap-3 sm:gap-4">
                    <Image
                      src={imageUrl}
                      alt={credential.name}
                      width={48}
                      height={48}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm object-cover shrink-0 border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {credential.name}
                        </h4>
                        <span
                          className={clsx(
                            'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm border',
                            badge.classes,
                          )}
                        >
                          <span className={clsx('w-2 h-2 mr-1.5 rounded-full', badge.dotClass)} />
                          {badge.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{credential.summary}</p>
                      {credential.earned_date && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Earned on {credential.earned_date}
                        </p>
                      )}
                    </div>
                    {credential.duration && (
                      <span className="hidden sm:inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600 shrink-0">
                        {credential.duration}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

'use client';

import clsx from 'clsx';
import { Calendar, FileText } from 'lucide-react';
import { PublicPathwayParticipant } from '@/types';
import { ProgressOverview } from '@/app/public/_components/progressOverview';
import { ParticipantCredentialTimeline } from '@/app/public/_components/participantCredentialTimeline';

function formatStatus(status: string): { label: string; style: { badge: string; dot: string } } {
  const normalized = status.toLowerCase().replace(/_/g, ' ');
  const label = normalized
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  switch (normalized) {
    case 'completed':
      return {
        label,
        style: {
          badge: 'bg-green-100 text-green-800 border border-green-200',
          dot: 'bg-green-500',
        },
      };
    case 'in progress':
      return {
        label,
        style: {
          badge: 'bg-blue-100 text-blue-800 border border-blue-200',
          dot: 'bg-blue-500',
        },
      };
    default:
      return {
        label,
        style: {
          badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
          dot: 'bg-yellow-500',
        },
      };
  }
}

export function ParticipantDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="max-w-7xl mx-auto bg-white rounded-sm border border-gray-200 p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-3 mt-3">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-28" />
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto bg-white rounded-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 bg-gray-200 rounded-full" />
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ParticipantDetailContentProps {
  participant: PublicPathwayParticipant;
  breadcrumb?: React.ReactNode;
}

export function ParticipantDetailContent({
  participant,
  breadcrumb,
}: ParticipantDetailContentProps) {
  const { label: statusLabel, style: statusStyle } = formatStatus(participant.status);
  const credentials = participant.credentials ?? [];

  return (
    <>
      {/* Header Card */}
      <div className="max-w-7xl mx-auto p-4 rounded-sm border border-gray-200 bg-white">
        {breadcrumb}

        <div className={breadcrumb ? 'mt-2' : ''}>
          <h2 className="text-2xl font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {participant.name}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{participant.email}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span
              className={clsx(
                'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm',
                statusStyle.badge,
              )}
            >
              <span className={clsx('w-2 h-2 mr-1.5 rounded-full', statusStyle.dot)} />
              {statusLabel}
            </span>
            {participant.joined_date && (
              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Joined{' '}
                {new Date(participant.joined_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            {participant.pathway_name && (
              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {participant.pathway_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {credentials.length > 0 && <ProgressOverview credentials={credentials} />}

      {/* Credential Timeline */}
      {credentials.length > 0 && <ParticipantCredentialTimeline credentials={credentials} />}
    </>
  );
}

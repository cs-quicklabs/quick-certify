'use client';

import { useRouter } from 'next/navigation';
import { createRoute } from '@/config/routes';
import { Pathway, PathwayStatus } from '@/types/pathway.types';
import { Clock, Users, FileText, Pencil } from 'lucide-react';

const STATUS_BADGE: Record<
  PathwayStatus,
  { dot: string; bg: string; text: string; border: string; label: string }
> = {
  [PathwayStatus.ACTIVE]: {
    dot: 'bg-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Active',
  },
  [PathwayStatus.DRAFT]: {
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    label: 'Draft',
  },
  [PathwayStatus.ARCHIVED]: {
    dot: 'bg-gray-400',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    label: 'Archived',
  },
};

interface PathwayBannerProps {
  pathway: Pathway;
  pathwayId: string;
  totalEstimatedTime: string | null;
  participantCount: number;
  credentialCount: number;
}

export function PathwayBanner({
  pathway,
  pathwayId,
  totalEstimatedTime,
  participantCount,
  credentialCount,
}: PathwayBannerProps) {
  const router = useRouter();
  const statusConfig = STATUS_BADGE[pathway.status] ?? STATUS_BADGE[PathwayStatus.DRAFT];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-screen-2xl lg:px-8 pt-4">
        <div className="rounded-sm border border-gray-200 bg-white overflow-hidden">
          <div className="relative">
            {pathway.banner_url ? (
              <img
                src={pathway.banner_url}
                alt={`${pathway.name} banner`}
                className="h-32 w-full object-cover lg:h-48"
              />
            ) : (
              <div className="h-32 w-full bg-gradient-to-r from-gray-200 to-gray-300 lg:h-48" />
            )}
          </div>

          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
                  {pathway.name}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{pathway.description || ''}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}
                  >
                    <div className={`w-2 h-2 mr-1.5 ${statusConfig.dot} rounded-full`} />
                    {statusConfig.label}
                  </span>

                  {totalEstimatedTime && (
                    <span className="text-gray-500 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {totalEstimatedTime}
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
              <button
                onClick={() => router.push(createRoute.pathwayEdit(pathwayId))}
                className="btn-secondary shrink-0 flex items-center"
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { usePublicPathway } from '@/hooks/usePublic';
import { PathwayDetailHeader } from '@/app/public/_components/pathwayDetailHeader';
import { FinalCredentialCard } from '@/app/public/_components/finalCredentialCard';
import { CredentialTimeline } from '@/app/public/_components/credentialTimeline';
import { ParticipantsTab } from '@/app/public/_components/participantsTab';
import { ROUTES, createRoute } from '@/config/routes';

function PathwayDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="max-w-7xl mx-auto bg-white rounded-sm border border-gray-200 p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-3 mt-3">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded w-28" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto bg-white rounded-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-64 h-48 bg-gray-200 rounded" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicPathwayDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const uuid = params?.uuid as string;

  const [activeTab, setActiveTab] = useState<'credentials' | 'participants'>('credentials');

  const { data: pathway, isLoading, error } = usePublicPathway(slug, uuid);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4">
        <PathwayDetailSkeleton />
      </div>
    );
  }

  if (error || !pathway) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 flex items-center justify-center">
        <p className="text-red-600">Failed to load pathway details.</p>
      </div>
    );
  }

  const events = pathway.events ?? [];
  const finalEvent = events.find((e) => e.pathway_event?.is_final);
  const nonFinalEvents = events.filter((e) => !e.pathway_event?.is_final);

  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      {/* Breadcrumb + Header */}
      <PathwayDetailHeader
        items={[
          { label: 'Issuer Profile', href: `${ROUTES.PUBLIC.COMPANY}/${slug}` },
          { label: 'Pathways', href: createRoute.publicPathways(slug) },
          { label: pathway.name },
        ]}
        name={pathway.name}
        description={pathway.description}
        status={pathway.status}
        duration={pathway.duration}
        participantCount={pathway.participant_count}
        credentialCount={pathway.credential_count}
      />

      {/* Final Credential Card */}
      {finalEvent && (
        <FinalCredentialCard
          name={finalEvent.name}
          description={finalEvent.description ?? ''}
          imageUrl={finalEvent.design?.url ?? '/credential/image_720.png'}
        />
      )}

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 pb-6 rounded-sm border border-gray-200 bg-white mt-4 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <ul className="flex -mb-px">
            <li>
              <button
                type="button"
                className={clsx(
                  'cursor-pointer inline-flex items-center px-4 py-3 text-sm font-medium border-b-2',
                  activeTab === 'credentials'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                )}
                onClick={() => setActiveTab('credentials')}
              >
                Credentials
                <span
                  className={clsx(
                    'ml-1.5 text-xs px-1.5 py-0.5 rounded-sm',
                    activeTab === 'credentials'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {nonFinalEvents.length}
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={clsx(
                  'cursor-pointer inline-flex items-center px-4 py-3 text-sm font-medium border-b-2',
                  activeTab === 'participants'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                )}
                onClick={() => setActiveTab('participants')}
              >
                Participants
                <span
                  className={clsx(
                    'ml-1.5 text-xs px-1.5 py-0.5 rounded-sm',
                    activeTab === 'participants'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {pathway.participant_count}
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        {activeTab === 'credentials' && <CredentialTimeline events={nonFinalEvents} />}
        {activeTab === 'participants' && <ParticipantsTab slug={slug} pathwayUuid={uuid} />}
      </div>
    </div>
  );
}

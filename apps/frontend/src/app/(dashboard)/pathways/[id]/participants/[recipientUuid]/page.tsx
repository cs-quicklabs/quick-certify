'use client';

import { use } from 'react';
import { usePathwayParticipantDetail } from '@/hooks/usePathways';
import {
  ParticipantDetailContent,
  ParticipantDetailSkeleton,
} from '@/components/pathways/ParticipantDetailContent';

interface PathwayParticipantDetailPageProps {
  params: Promise<{ id: string; recipientUuid: string }>;
}

export default function PathwayParticipantDetailPage({ params }: PathwayParticipantDetailPageProps) {
  const { id, recipientUuid } = use(params);
  const { data: participant, isLoading, error } = usePathwayParticipantDetail(id, recipientUuid);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <ParticipantDetailSkeleton />
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Participant not found.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="px-4 mx-auto max-w-screen-2xl lg:px-8 py-6">
      <ParticipantDetailContent participant={participant} />
    </main>
  );
}

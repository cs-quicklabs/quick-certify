'use client';

import { useParams } from 'next/navigation';
import { usePublicPathwayParticipant } from '@/hooks/usePublic';
import { PathwayBreadcrumb } from '@/components/pathways/PathwayBreadcrumb';
import {
  ParticipantDetailContent,
  ParticipantDetailSkeleton,
} from '@/components/pathways/ParticipantDetailContent';
import { ROUTES, createRoute } from '@/config/routes';

export default function PublicPathwayParticipantPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const uuid = params?.uuid as string;
  const participantUuid = params?.participantUuid as string;

  const {
    data: participant,
    isLoading,
    error,
  } = usePublicPathwayParticipant(slug, uuid, participantUuid);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4">
        <ParticipantDetailSkeleton />
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 flex items-center justify-center">
        <p className="text-red-600">Failed to load participant details.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      <ParticipantDetailContent
        participant={participant}
        breadcrumb={
          <PathwayBreadcrumb
            items={[
              { label: 'Issuer Profile', href: `${ROUTES.PUBLIC.COMPANY}/${slug}` },
              { label: 'Pathways', href: createRoute.publicPathways(slug) },
              {
                label: participant.pathway_name ?? 'Pathway',
                href: createRoute.publicPathwayDetail(slug, uuid),
              },
              { label: participant.name },
            ]}
          />
        }
      />
    </div>
  );
}

'use client';

import { use, useState, useMemo } from 'react';
import { usePathway } from '@/hooks/usePathways';
import { PathwayBanner } from '@/components/pathways/PathwayBanner';
import { FinalCredentialCard } from '@/components/pathways/FinalCredentialCard';
import { CredentialsTimeline } from '@/components/pathways/CredentialsTimeline';
import { ParticipantsTab } from '@/components/pathways/ParticipantsTab';

interface PathwayDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PathwayDetailPage({ params }: PathwayDetailPageProps) {
  const { id } = use(params);
  const { data: pathway, isLoading } = usePathway(id);
  const [activeTab, setActiveTab] = useState<'credentials' | 'participants'>('credentials');

  const totalEstimatedTime = useMemo(() => {
    const events = pathway?.events ?? [];
    let totalWeeks = 0;
    for (const event of events) {
      if (event.duration_value && event.duration_type) {
        switch (event.duration_type) {
          case 'day':
            totalWeeks += event.duration_value / 7;
            break;
          case 'week':
            totalWeeks += event.duration_value;
            break;
          case 'month':
            totalWeeks += event.duration_value * 4;
            break;
        }
      }
    }
    if (totalWeeks === 0) return null;
    if (totalWeeks >= 4) {
      const months = Math.round(totalWeeks / 4);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const weeks = Math.round(totalWeeks);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }, [pathway?.events]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Pathway not found.</p>
        </div>
      </div>
    );
  }

  const credentials = [...(pathway.events ?? [])].sort(
    (a, b) => (a.pathway_event?.order ?? 0) - (b.pathway_event?.order ?? 0),
  );

  const finalEvent = credentials.find((c) => c.pathway_event?.is_final);
  const finalCredential = {
    name: finalEvent?.name ?? `${pathway.name} Certification`,
    description: finalEvent
      ? `Complete all required credentials to earn the ${finalEvent.name} certification.`
      : `This certification validates mastery across all credentials in the ${pathway.name} pathway.`,
    image: finalEvent?.design?.url ?? '',
  };

  return (
    <main>
      <PathwayBanner
        pathway={pathway}
        pathwayId={id}
        totalEstimatedTime={totalEstimatedTime}
        participantCount={pathway.participants?.length ?? 0}
        credentialCount={credentials.length}
      />

      <FinalCredentialCard finalCredential={finalCredential} />

      {/* Tabs Section */}
      <div className="px-4 mx-auto max-w-screen-2xl lg:px-8 mb-8">
        <div className="bg-white shadow-md rounded-sm border border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <ul className="flex -mb-px">
              <li>
                <button
                  className={`cursor-pointer ${activeTab === 'credentials' ? 'selected-tab' : 'unselected-tab'}`}
                  onClick={() => setActiveTab('credentials')}
                >
                  Credentials
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-sm ${
                      activeTab === 'credentials'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {credentials.length}
                  </span>
                </button>
              </li>
              <li>
                <button
                  className={`cursor-pointer ${activeTab === 'participants' ? 'selected-tab' : 'unselected-tab'}`}
                  onClick={() => setActiveTab('participants')}
                >
                  Participants
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-sm ${
                      activeTab === 'participants'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {pathway.participants?.length ?? 0}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {activeTab === 'credentials' && <CredentialsTimeline credentials={credentials} />}
          {activeTab === 'participants' && <ParticipantsTab pathwayId={id} />}
        </div>
      </div>
    </main>
  );
}

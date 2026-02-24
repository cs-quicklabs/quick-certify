'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePathway, useUpdatePathway } from '@/hooks/usePathways';
import { ROUTES } from '@/config/routes';
import { showSuccessToast } from '@/lib/toast';
import { PathwayForm, type PathwayFormValues } from '@/components/pathways/PathwayForm';

function EditPathwayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathwayId = searchParams.get('id') || '';

  const { data: pathway, isLoading } = usePathway(pathwayId);
  const updatePathway = useUpdatePathway();

  const initialValues = useMemo<PathwayFormValues | undefined>(() => {
    if (!pathway) return undefined;
    const sortedEvents = [...(pathway.events ?? [])].sort(
      (a, b) => (a.pathway_event?.order ?? 0) - (b.pathway_event?.order ?? 0),
    );
    return {
      name: pathway.name || '',
      description: pathway.description || '',
      bannerUrl: pathway.banner_url || null,
      selectedCredentials: sortedEvents.map((e) => ({
        uuid: e.uuid,
        name: e.name,
        isFinal: e.pathway_event?.is_final ?? false,
      })),
    };
  }, [pathway]);

  const handleSubmit = (values: PathwayFormValues, status: 'active' | 'draft') => {
    if (!pathwayId) return;

    updatePathway.mutate(
      {
        id: pathwayId,
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        bannerUrl: values.bannerUrl || undefined,
        status,
        events: values.selectedCredentials.map((c) => ({
          eventId: c.uuid,
          isFinal: c.isFinal,
        })),
      },
      {
        onSuccess: () => {
          showSuccessToast('Pathway updated successfully');
          router.push(ROUTES.PATHWAYS);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      </div>
    );
  }

  if (!pathway && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Pathway not found.</p>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      </div>
    );
  }

  return (
    <PathwayForm
      key={pathwayId}
      title="Edit Pathway"
      subtitle="Update the pathway details and credentials."
      initialValues={initialValues}
      isPending={updatePathway.isPending}
      onSubmit={handleSubmit}
    />
  );
}

export default function EditPathwayPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        </div>
      }
    >
      <EditPathwayContent />
    </Suspense>
  );
}

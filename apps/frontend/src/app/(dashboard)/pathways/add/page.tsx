'use client';

import { useRouter } from 'next/navigation';
import { useCreatePathway } from '@/hooks/usePathways';
import { ROUTES } from '@/config/routes';
import { showSuccessToast } from '@/lib/toast';
import { PathwayForm, type PathwayFormValues } from '@/components/pathways/PathwayForm';

export default function AddPathwayPage() {
  const router = useRouter();
  const createPathway = useCreatePathway();

  const handleSubmit = (values: PathwayFormValues, status: 'active' | 'draft') => {
    createPathway.mutate(
      {
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
          showSuccessToast('Pathway created successfully');
          router.push(ROUTES.PATHWAYS);
        },
      },
    );
  };

  return (
    <PathwayForm
      title="Create New Pathway"
      subtitle="Define a learning pathway by adding credentials in the order they should be completed."
      isPending={createPathway.isPending}
      onSubmit={handleSubmit}
    />
  );
}

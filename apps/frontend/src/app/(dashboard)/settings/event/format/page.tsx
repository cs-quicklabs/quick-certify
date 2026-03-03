'use client';

import {
  useEventFormatsInfinite,
  useCreateEventFormat,
  useUpdateEventFormat,
  useDeleteEventFormat,
} from '@/hooks/useEventFormats';
import EventSettingList from '../_components/event-setting-list';

export default function EventFormatSettingsPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: queryError,
  } = useEventFormatsInfinite();
  const createMutation = useCreateEventFormat();
  const updateMutation = useUpdateEventFormat();
  const deleteMutation = useDeleteEventFormat();

  return (
    <EventSettingList
      label="Event Format"
      subtitle="Event formats specify the structure of the event. You can add new event formats, edit existing ones, or delete them."
      items={data?.pages.flatMap((page) => page.data) ?? []}
      isLoading={isLoading}
      queryError={queryError}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      isCreating={createMutation.isPending}
      isUpdating={updateMutation.isPending}
      onCreate={(name) => createMutation.mutateAsync({ name })}
      onUpdate={(id, name) => updateMutation.mutateAsync({ id, name })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
    />
  );
}

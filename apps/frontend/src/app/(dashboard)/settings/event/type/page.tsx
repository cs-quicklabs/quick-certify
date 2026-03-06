'use client';

import {
  useEventTypesInfinite,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from '@/hooks/useEventTypes';
import EventSettingList from '../_components/event-setting-list';

export default function EventTypeSettingsPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: queryError,
  } = useEventTypesInfinite();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();

  return (
    <EventSettingList
      label="Event Type"
      subtitle="Event types specify the category of the event. For example, a conference, workshop, or seminar. You can add new event types, edit existing ones, or delete them."
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

'use client';

import {
  useEventLevelsInfinite,
  useCreateEventLevel,
  useUpdateEventLevel,
  useDeleteEventLevel,
} from '@/hooks/useEvents';
import EventSettingList from '../_components/event-setting-list';

export default function EventLevelSettingsPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: queryError,
  } = useEventLevelsInfinite();
  const createMutation = useCreateEventLevel();
  const updateMutation = useUpdateEventLevel();
  const deleteMutation = useDeleteEventLevel();

  return (
    <EventSettingList
      label="Event Level"
      subtitle="Event levels specify the difficulty or complexity of the event. For example, beginner, advanced, or expert. You can add new event levels, edit existing ones, or delete them."
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

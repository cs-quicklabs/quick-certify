'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableCredentialItem } from './SortableCredentialItem';

export interface SelectedCredential {
  uuid: string;
  name: string;
  isFinal: boolean;
}

interface SortableCredentialListProps {
  credentials: SelectedCredential[];
  onReorder: (credentials: SelectedCredential[]) => void;
  onToggleFinal: (index: number) => void;
  onRemove: (uuid: string) => void;
}

export function SortableCredentialList({
  credentials,
  onReorder,
  onToggleFinal,
  onRemove,
}: SortableCredentialListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = credentials.findIndex((c) => c.uuid === active.id);
      const newIndex = credentials.findIndex((c) => c.uuid === over.id);
      onReorder(arrayMove(credentials, oldIndex, newIndex));
    }
  }

  if (credentials.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-sm px-4 py-8 text-center text-sm text-gray-500 mb-6">
        No credentials added yet. Search and add credentials above.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden mb-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={credentials.map((c) => c.uuid)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="divide-y divide-gray-200">
            {credentials.map((credential, index) => (
              <SortableCredentialItem
                key={credential.uuid}
                credential={credential}
                index={index}
                onToggleFinal={() => onToggleFinal(index)}
                onRemove={() => onRemove(credential.uuid)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

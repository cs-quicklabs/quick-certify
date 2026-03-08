'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export interface EventItemProps {
  uuid: string;
  name: string;
  createdAt: string;
  event_type?: { name: string } | null;
  event_level?: { name: string } | null;
  event_format?: { name: string } | null;
  design?: { url: string; name?: string; type: string } | null;
  onDelete?: (uuid: string) => void;
  isDeleting?: boolean;
}

export const EventItem = ({
  uuid,
  name,
  createdAt,
  event_type,
  event_level,
  event_format,
  design,
  onDelete,
  isDeleting = false,
}: EventItemProps) => {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleRowClick = () => {
    router.push(`/events/edit?id=${uuid}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(uuid);
    setIsConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
  };

  const handleIssueCredential = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/credentials/issue?eventId=${uuid}`);
  };

  return (
    <>
      <tr
        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={handleRowClick}
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div>
              {design?.url ? (
                <img
                  src={design.url}
                  alt={design.name || name}
                  className="w-20 md:w-20 max-w-full shadow-md bg-gray-200 object-cover"
                />
              ) : (
                <span className="p-5 w-20 md:w-20 max-w-full shadow-md bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  No Image
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 capitalize">{name}</div>
              <div className="text-xs text-gray-500 flex gap-2">
                <span className="capitalize py-0.5 rounded">
                  Created On: {new Date(createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1.5">
                {design?.type && (
                  <span className="capitalize bg-brand-softer border border-brand-subtle text-fg-brand-strong text-xs font-medium px-1.5 py-0.5 rounded">
                    {design.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        <td className="px-4 py-1 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleIssueCredential}
              className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Plus size={16} strokeWidth={1.7} /> <span>Issue Credential</span>
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete event"
            >
              <Trash2 size={16} strokeWidth={1.7} />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </td>
      </tr>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Delete Event"
        message={
          <>
            Are you sure you want to delete <strong>&quot;{name}&quot;</strong>?
            <br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting..."
        cancelLabel="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

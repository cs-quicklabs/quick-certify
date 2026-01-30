'use client';

import { useState } from 'react';
import { Header, Sidebar, ConfirmationDialog } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';
import {
  useEventFormats,
  useCreateEventFormat,
  useUpdateEventFormat,
  useDeleteEventFormat,
} from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/lib/api-error';
import type { EventFormat } from '@/services/api/event.service';

/**
 * Event Formats Page (Settings Route)
 *
 * Manage event formats
 * Accessible from profile dropdown: Event Settings
 */
export default function EventFormatSettingsPage() {
  const [newEventFormat, setNewEventFormat] = useState('');
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    eventFormat: EventFormat | null;
  }>({ isOpen: false, eventFormat: null });

  const { data, isLoading, error: queryError } = useEventFormats({ limit: 20 });
  const createMutation = useCreateEventFormat();
  const updateMutation = useUpdateEventFormat(editingUuid || '');
  const deleteMutation = useDeleteEventFormat();

  const eventFormats = data?.data || [];

  const handleAdd = async () => {
    if (!newEventFormat.trim()) return;

    setError(null);
    try {
      await createMutation.mutateAsync({ name: newEventFormat.trim() });
      setNewEventFormat('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create event format'));
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingUuid(id);
    setEditingValue(currentName);
    setError(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingValue.trim()) return;

    setError(null);
    try {
      await updateMutation.mutateAsync({ name: editingValue.trim() });
      setEditingUuid(null);
      setEditingValue('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update event format'));
    }
  };

  const handleCancelEdit = () => {
    setEditingUuid(null);
    setEditingValue('');
    setError(null);
  };

  const handleDelete = (eventFormat: EventFormat) => {
    setConfirmDialog({ isOpen: true, eventFormat });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.eventFormat) return;

    setError(null);
    setDeletingId(confirmDialog.eventFormat.uuid);
    try {
      await deleteMutation.mutateAsync(confirmDialog.eventFormat.uuid);
      setConfirmDialog({ isOpen: false, eventFormat: null });
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete event format'));
      setConfirmDialog({ isOpen: false, eventFormat: null });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="px-2 py-6 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <Sidebar items={eventSidebarItems} />
          </aside>
          <div className="max-w-xl pb-12 px-4 lg:col-span-6">
            <div className="space-y-6">
              {/* Page Header */}
              <div>
                <h1 className="form-title">Event Formats</h1>
                <p className="form-subtitle">
                  Event formats specify the structure of the event. You can add new event formats,
                  edit existing ones, or delete them.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Add New Event Format */}
              <div className="">
                <h2 className="form-input-label mb-4">Add New Event Format</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      id="new-event-format"
                      value={newEventFormat}
                      onChange={(e) => setNewEventFormat(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      className="form-input-field w-full"
                      placeholder="New Event Format"
                      disabled={createMutation.isPending}
                    />
                  </div>
                  <button
                    onClick={handleAdd}
                    className="btn-primary"
                    disabled={createMutation.isPending || !newEventFormat.trim()}
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* API Error Message */}
              {queryError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                  Something went wrong
                </div>
              )}

              {/* Existing Event Formats */}
              <div className="overflow-hidden">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading...
                  </div>
                ) : queryError ? null : eventFormats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No event formats found. Create your first event format above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 font-bold text-sm text-left text-gray-700 dark:text-gray-300">
                            EVENT FORMAT
                          </th>
                          <th className="px-10 py-4 font-bold text-sm text-right text-gray-700 dark:text-gray-300">
                            ACTION
                          </th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {eventFormats.map((eventFormat, index) => (
                          <tr
                            key={eventFormat.uuid}
                            className={`border-b border-gray-200 dark:border-gray-700 ${
                              index === 0
                                ? 'bg-white dark:bg-gray-800'
                                : index % 2 === 1
                                  ? 'bg-gray-50 dark:bg-gray-700'
                                  : 'bg-white dark:bg-gray-800'
                            }`}
                          >
                            <td className="px-6 py-4">
                              {editingUuid === eventFormat.uuid ? (
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="form-input-field w-full text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit(eventFormat.uuid);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  disabled={updateMutation.isPending}
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {eventFormat.name}
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-4 text-right whitespace-nowrap">
                              {editingUuid === eventFormat.uuid ? (
                                <button
                                  onClick={() => handleSaveEdit(eventFormat.uuid)}
                                  className="btn-primary text-sm px-3 py-1.5"
                                  disabled={updateMutation.isPending || !editingValue.trim()}
                                >
                                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                              ) : (
                                <div className="flex items-center justify-end gap-4">
                                  <button
                                    onClick={() => handleEdit(eventFormat.uuid, eventFormat.name)}
                                    className="btn-inline-blue text-sm whitespace-nowrap"
                                    disabled={deletingId !== null}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(eventFormat)}
                                    className="btn-inline-red text-sm whitespace-nowrap"
                                    disabled={deletingId !== null}
                                  >
                                    {deletingId === eventFormat.uuid ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Event Format?"
        message={`Are you sure you want to delete "${confirmDialog.eventFormat?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, eventFormat: null })}
      />
    </>
  );
}

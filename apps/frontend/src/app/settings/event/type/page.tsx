'use client';

import { useState, useEffect, useRef } from 'react';
import { Header, Sidebar, ConfirmationDialog, Alert } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';
import {
  useEventTypesInfinite,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/lib/api-error';
import type { EventType } from '@/services/api/event.service';

/**
 * Event Types Page (Settings Route)
 *
 * Manage event types (e.g., Conference, Workshop, Seminar)
 * Accessible from profile dropdown: Event Settings
 * Implements infinite scroll pagination
 */
export default function EventTypeSettingsPage() {
  const [newEventType, setNewEventType] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showQueryError, setShowQueryError] = useState<boolean>(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    eventType: EventType | null;
  }>({ isOpen: false, eventType: null });
  const observerTarget = useRef<HTMLTableCellElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: queryError,
  } = useEventTypesInfinite();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType(editingId || '');
  const deleteMutation = useDeleteEventType();

  // Flatten all pages into a single array
  const eventTypes = data?.pages.flatMap((page) => page.data) || [];

  // Reset showQueryError when queryError changes
  useEffect(() => {
    if (queryError) {
      setShowQueryError(true);
    }
  }, [queryError]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAdd = async () => {
    if (!newEventType.trim()) return;

    setError(null);
    try {
      await createMutation.mutateAsync({ name: newEventType.trim() });
      setNewEventType('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create event type'));
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingValue(currentName);
    setError(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingValue.trim()) return;

    setError(null);
    try {
      await updateMutation.mutateAsync({ name: editingValue.trim() });
      setEditingId(null);
      setEditingValue('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update event type'));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
    setError(null);
  };

  const handleDelete = (eventType: EventType) => {
    setConfirmDialog({ isOpen: true, eventType });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.eventType) return;

    setError(null);
    setDeletingId(confirmDialog.eventType.id);
    try {
      await deleteMutation.mutateAsync(confirmDialog.eventType.id);
      setConfirmDialog({ isOpen: false, eventType: null });
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete event type'));
      setConfirmDialog({ isOpen: false, eventType: null });
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
                <h1 className="form-title">Event Types</h1>
                <p className="form-subtitle">
                  Event types specify the category of the event. For example, a conference, workshop, or
                  seminar. You can add new event types, edit existing ones, or delete them.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError(null)}
                />
              )}

              {/* Add New Event Type */}
              <div className="">
                <h2 className="form-input-label mb-4">
                  Add New Event Type
                </h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      id="new-event-type"
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      className="form-input-field w-full"
                      placeholder="New Event Type"
                      disabled={createMutation.isPending}
                    />
                  </div>
                  <button
                    onClick={handleAdd}
                    className="btn-primary"
                    disabled={createMutation.isPending || !newEventType.trim()}
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* API Error Message */}
              {queryError && showQueryError && (
                <Alert
                  type="error"
                  message={getApiErrorMessage(queryError)}
                  onClose={() => setShowQueryError(false)}
                />
              )}

              {/* Existing Event Types */}
              <div className="overflow-hidden">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
                ) : queryError && showQueryError ? null : eventTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No event types found. Create your first event type above.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-4 font-bold text-sm text-left text-gray-700 dark:text-gray-300">
                              EVENT TYPE
                            </th>
                            <th className="px-10 py-4 font-bold text-sm text-right text-gray-700 dark:text-gray-300">
                              ACTION
                            </th>
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          {eventTypes.map((eventType, index) => (
                            <tr
                              key={eventType.id}
                              className={`border-b border-gray-200 dark:border-gray-700 ${index === 0
                                ? 'bg-white dark:bg-gray-800'
                                : index % 2 === 1
                                  ? 'bg-gray-50 dark:bg-gray-700'
                                  : 'bg-white dark:bg-gray-800'
                                }`}
                            >
                              <td className="px-6 py-4">
                                {editingId === eventType.id ? (
                                  <input
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    className="form-input-field w-full text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveEdit(eventType.id);
                                      } else if (e.key === 'Escape') {
                                        handleCancelEdit();
                                      }
                                    }}
                                    disabled={updateMutation.isPending}
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-sm text-gray-900 dark:text-white">{eventType.name}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                {editingId === eventType.id ? (
                                  <button
                                    onClick={() => handleSaveEdit(eventType.id)}
                                    className="btn-primary text-sm px-3 py-1.5"
                                    disabled={updateMutation.isPending || !editingValue.trim()}
                                  >
                                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-end gap-4">
                                    <button
                                      onClick={() => handleEdit(eventType.id, eventType.name)}
                                      className="btn-inline-blue text-sm whitespace-nowrap"
                                      disabled={deletingId !== null}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(eventType)}
                                      className="btn-inline-red text-sm whitespace-nowrap"
                                      disabled={deletingId !== null}
                                    >
                                      {deletingId === eventType.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                          {/* Infinite scroll trigger - placed after the 15th item (when 5 remain) */}
                          {eventTypes.length >= 15 && hasNextPage && (
                            <tr>
                              <td colSpan={2} ref={observerTarget} className="h-4 p-0" />
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {isFetchingNextPage && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        Loading more...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Event Type?"
        message={`Are you sure you want to delete "${confirmDialog.eventType?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, eventType: null })}
      />
    </>
  );
}

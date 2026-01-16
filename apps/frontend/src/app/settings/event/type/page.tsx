'use client';

import { useState, useEffect, useRef } from 'react';
import { Header, Sidebar } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';
import {
  useEventTypesInfinite,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/lib/api-error';

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return;

    setError(null);
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete event type'));
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Types</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Event types specify the category of the event. For example, a conference, workshop, or
                  seminar. You can add new event types, edit existing ones, or delete them.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Add New Event Type */}
              <div className="">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Event Type
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="new-event-type"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      New Event Type
                    </label>
                    <input
                      type="text"
                      id="new-event-type"
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      className="form-input-field w-full"
                      placeholder="Enter event type name"
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

              {/* Existing Event Types */}
              <div className="overflow-hidden">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
                ) : queryError ? (
                  <div className="text-center py-8 text-red-500">
                    {getApiErrorMessage(queryError, 'Failed to load event types')}
                  </div>
                ) : eventTypes.length === 0 ? (
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
                                      onClick={() => handleDelete(eventType.id)}
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
    </>
  );
}

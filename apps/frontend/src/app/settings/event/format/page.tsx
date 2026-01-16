'use client';

import { useState } from 'react';
import { Header, Sidebar } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';
import {
    useEventFormats,
    useCreateEventFormat,
    useUpdateEventFormat,
    useDeleteEventFormat,
} from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * Event Formats Page (Settings Route)
 *
 * Manage event formats
 * Accessible from profile dropdown: Event Settings
 */
export default function EventFormatSettingsPage() {
    const [newEventFormat, setNewEventFormat] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data, isLoading, error: queryError } = useEventFormats({ limit: 20 });
    const createMutation = useCreateEventFormat();
    const updateMutation = useUpdateEventFormat(editingId || '');
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
            setError(getApiErrorMessage(err, 'Failed to update event format'));
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingValue('');
        setError(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event format?')) return;

        setError(null);
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to delete event format'));
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Formats</h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Event formats specify the structure of the event. You can add new event formats, edit
                                    existing ones, or delete them.
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Add New Event Format
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="new-event-format"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            New Event Format
                                        </label>
                                        <input
                                            type="text"
                                            id="new-event-format"
                                            value={newEventFormat}
                                            onChange={(e) => setNewEventFormat(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                            className="form-input-field w-full"
                                            placeholder="New event format"
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

                            {/* Existing Event Formats */}
                            <div className="overflow-hidden">
                                {isLoading ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
                                ) : queryError ? (
                                    <div className="text-center py-8 text-red-500">
                                        {getApiErrorMessage(queryError, 'Failed to load event formats')}
                                    </div>
                                ) : eventFormats.length === 0 ? (
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
                                                        key={eventFormat.id}
                                                        className={`border-b border-gray-200 dark:border-gray-700 ${index === 0
                                                            ? 'bg-white dark:bg-gray-800'
                                                            : index % 2 === 1
                                                                ? 'bg-gray-50 dark:bg-gray-700'
                                                                : 'bg-white dark:bg-gray-800'
                                                            }`}
                                                    >
                                                        <td className="px-6 py-4">
                                                            {editingId === eventFormat.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingValue}
                                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                                    className="form-input-field w-full text-sm"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleSaveEdit(eventFormat.id);
                                                                        } else if (e.key === 'Escape') {
                                                                            handleCancelEdit();
                                                                        }
                                                                    }}
                                                                    disabled={updateMutation.isPending}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span className="text-sm text-gray-900 dark:text-white">{eventFormat.name}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-4 text-right whitespace-nowrap">
                                                            {editingId === eventFormat.id ? (
                                                                <button
                                                                    onClick={() => handleSaveEdit(eventFormat.id)}
                                                                    className="btn-primary text-sm px-3 py-1.5"
                                                                    disabled={updateMutation.isPending || !editingValue.trim()}
                                                                >
                                                                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center justify-end gap-4">
                                                                    <button
                                                                        onClick={() => handleEdit(eventFormat.id, eventFormat.name)}
                                                                        className="btn-inline-blue text-sm whitespace-nowrap"
                                                                        disabled={deleteMutation.isPending}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(eventFormat.id)}
                                                                        className="btn-inline-red text-sm whitespace-nowrap"
                                                                        disabled={deleteMutation.isPending}
                                                                    >
                                                                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
        </>
    );
}

'use client';

import { useState } from 'react';

/**
 * Event Formats Page
 *
 * Manage event formats
 */
export default function EventFormatsPage() {
    const [newEventFormat, setNewEventFormat] = useState('');
    const [eventFormats, setEventFormats] = useState<string[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAdd = () => {
        if (newEventFormat.trim()) {
            setEventFormats([...eventFormats, newEventFormat.trim()]);
            setNewEventFormat('');
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditingValue(eventFormats[index]);
    };

    const handleSaveEdit = (index: number) => {
        if (editingValue.trim()) {
            const updated = [...eventFormats];
            updated[index] = editingValue.trim();
            setEventFormats(updated);
            setEditingIndex(null);
            setEditingValue('');
        }
    };

    const handleDelete = (index: number) => {
        if (confirm('Are you sure you want to delete this event format?')) {
            setEventFormats(eventFormats.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Formats</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Event formats specify the format or delivery method of the event. You can add new event
                    formats, edit existing ones, or delete them.
                </p>
            </div>

            {/* Add New Event Format */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                            className="form-input-field w-full"
                            placeholder="Enter event format name"
                        />
                    </div>
                    <button onClick={handleAdd} className="btn-primary">
                        Save
                    </button>
                </div>
            </div>

            {/* Existing Event Formats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Existing Event Formats</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="table-head">EVENT FORMAT</th>
                                <th className="table-head">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {eventFormats.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="table-cell text-center text-gray-500 dark:text-gray-400 py-8">
                                        No event formats yet. Add your first event format above.
                                    </td>
                                </tr>
                            ) : (
                                eventFormats.map((eventFormat, index) => (
                                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="table-cell">
                                            {editingIndex === index ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingValue}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        className="form-input-field flex-1"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                                                    />
                                                    <button
                                                        onClick={() => handleSaveEdit(index)}
                                                        className="btn-primary text-sm px-3 py-1"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-900 dark:text-white">{eventFormat}</span>
                                            )}
                                        </td>
                                        <td className="table-cell">
                                            {editingIndex !== index && (
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleEdit(index)}
                                                        className="btn-inline-blue"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(index)}
                                                        className="btn-inline-red"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


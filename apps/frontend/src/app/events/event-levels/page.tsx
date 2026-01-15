'use client';

import { useState } from 'react';

/**
 * Event Levels Page
 *
 * Manage event levels
 */
export default function EventLevelsPage() {
    const [newEventLevel, setNewEventLevel] = useState('');
    const [eventLevels, setEventLevels] = useState<string[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAdd = () => {
        if (newEventLevel.trim()) {
            setEventLevels([...eventLevels, newEventLevel.trim()]);
            setNewEventLevel('');
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditingValue(eventLevels[index]);
    };

    const handleSaveEdit = (index: number) => {
        if (editingValue.trim()) {
            const updated = [...eventLevels];
            updated[index] = editingValue.trim();
            setEventLevels(updated);
            setEditingIndex(null);
            setEditingValue('');
        }
    };

    const handleDelete = (index: number) => {
        if (confirm('Are you sure you want to delete this event level?')) {
            setEventLevels(eventLevels.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Levels</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Event levels specify the level or tier of the event. You can add new event levels, edit
                    existing ones, or delete them.
                </p>
            </div>

            {/* Add New Event Level */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Add New Event Level
                </h2>
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="new-event-level"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            New Event Level
                        </label>
                        <input
                            type="text"
                            id="new-event-level"
                            value={newEventLevel}
                            onChange={(e) => setNewEventLevel(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                            className="form-input-field w-full"
                            placeholder="Enter event level name"
                        />
                    </div>
                    <button onClick={handleAdd} className="btn-primary">
                        Save
                    </button>
                </div>
            </div>

            {/* Existing Event Levels */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Existing Event Levels</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="table-head">EVENT LEVEL</th>
                                <th className="table-head">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {eventLevels.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="table-cell text-center text-gray-500 dark:text-gray-400 py-8">
                                        No event levels yet. Add your first event level above.
                                    </td>
                                </tr>
                            ) : (
                                eventLevels.map((eventLevel, index) => (
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
                                                <span className="text-gray-900 dark:text-white">{eventLevel}</span>
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


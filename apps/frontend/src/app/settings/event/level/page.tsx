'use client';

import { useState } from 'react';
import { Header, Sidebar } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';

/**
 * Event Levels Page (Settings Route)
 *
 * Manage event levels
 * Accessible from profile dropdown: Event Settings
 */
export default function EventLevelSettingsPage() {
    const [newEventLevel, setNewEventLevel] = useState('');
    const [eventLevels, setEventLevels] = useState<string[]>([
        'Introductory',
        'Foundational',
        'Intermediate',
        'Advanced',
        'Professional',
    ]);
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Levels</h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Event levels specify the difficulty or complexity of the event. For example, beginner,
                                    advanced, or expert. You can add new event levels, edit existing ones, or delete them.
                                </p>
                            </div>

                            {/* Add New Event Level */}
                            <div className="">
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
                                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                            className="form-input-field w-full"
                                            placeholder="New event Level"
                                        />
                                    </div>
                                    <button onClick={handleAdd} className="btn-primary">
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Existing Event Levels */}
                            <div className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-4 font-bold text-sm text-left text-gray-700">EVENT LEVEL</th>
                                                <th className="px-10 py-4 font-bold text-sm text-right text-gray-700">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-body">
                                            {eventLevels.map((eventLevel, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b border-gray-200 dark:border-gray-700 ${index === 0
                                                        ? 'bg-white dark:bg-gray-800'
                                                        : index % 2 === 1
                                                            ? 'bg-gray-50 dark:bg-gray-700'
                                                            : 'bg-white dark:bg-gray-800'
                                                        }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        {editingIndex === index ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingValue}
                                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                                    className="form-input-field flex-1 text-sm"
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveEdit(index)}
                                                                    className="btn-primary text-sm px-3 py-1.5"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-900 dark:text-white">{eventLevel}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {editingIndex !== index && (
                                                            <div className="flex items-center justify-end gap-4 w-full">
                                                                <button
                                                                    onClick={() => handleEdit(index)}
                                                                    className="btn-inline-blue text-sm"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(index)}
                                                                    className="btn-inline-red text-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}


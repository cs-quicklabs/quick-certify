'use client';

import { useState } from 'react';
import { Header, Sidebar } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';

/**
 * Event Types Page (Settings Route)
 *
 * Manage event types (e.g., Conference, Workshop, Seminar)
 * Accessible from profile dropdown: Event Settings
 */
export default function EventTypeSettingsPage() {
    const [newEventType, setNewEventType] = useState('');
    const [eventTypes, setEventTypes] = useState([
        'Achievement Award',
        'Certification',
        'Conference',
        'Course',
        'Membership',
        'Licence',
        'Training',
        'Webinar',
    ]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAdd = () => {
        if (newEventType.trim()) {
            setEventTypes([...eventTypes, newEventType.trim()]);
            setNewEventType('');
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditingValue(eventTypes[index]);
    };

    const handleSaveEdit = (index: number) => {
        if (editingValue.trim()) {
            const updated = [...eventTypes];
            updated[index] = editingValue.trim();
            setEventTypes(updated);
            setEditingIndex(null);
            setEditingValue('');
        }
    };

    const handleDelete = (index: number) => {
        if (confirm('Are you sure you want to delete this event type?')) {
            setEventTypes(eventTypes.filter((_, i) => i !== index));
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
                                        />
                                    </div>
                                    <button onClick={handleAdd} className="btn-primary">
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Existing Event Types */}
                            <div className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-4 font-bold text-sm text-left text-gray-700 ">EVENT TYPE</th>
                                                <th className="px-10 py-4 font-bold text-sm text-right text-gray-700 ">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-body">
                                            {eventTypes.map((eventType, index) => (
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
                                                            <span className="text-sm text-gray-900 dark:text-white">
                                                                {eventType}
                                                            </span>
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


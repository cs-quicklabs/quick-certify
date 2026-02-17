'use client';

import { useState, useEffect, useRef } from 'react';
import { Header, Sidebar, ConfirmationDialog, Alert } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';
import { getApiErrorMessage } from '@/lib/api-error';
import type { IBaseEvent } from '@/types';

interface EventSettingListProps {
  /** Singular display name, e.g. "Event Type". Page title is derived as "{label}s". */
  label: string;
  subtitle: string;
  items: IBaseEvent[];
  isLoading: boolean;
  queryError: unknown;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  onCreate: (name: string) => Promise<{ message: string }>;
  onUpdate: (id: string, name: string) => Promise<{ message: string }>;
  onDelete: (id: string) => Promise<{ message: string }>;
}

export default function EventSettingList({
  label,
  subtitle,
  items,
  isLoading,
  queryError,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isCreating,
  isUpdating,
  onCreate,
  onUpdate,
  onDelete,
}: EventSettingListProps) {
  const title = `${label}s`;
  const lowerLabel = label.toLowerCase();

  const [newValue, setNewValue] = useState('');
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showQueryError, setShowQueryError] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    item: IBaseEvent | null;
  }>({ isOpen: false, item: null });
  const observerTarget = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (queryError) {
      setShowQueryError(true);
    }
  }, [queryError]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage?.();
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
    if (!newValue.trim()) return;
    setError(null);
    try {
      const result = await onCreate(newValue.trim());
      setNewValue('');
      setSuccessMessage(result.message);
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to create ${lowerLabel}`));
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingUuid(id);
    setEditingValue(currentName);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUuid || !editingValue.trim()) return;
    setError(null);
    try {
      const result = await onUpdate(editingUuid, editingValue.trim());
      setEditingUuid(null);
      setEditingValue('');
      setSuccessMessage(result.message);
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to update ${lowerLabel}`));
    }
  };

  const handleCancelEdit = () => {
    setEditingUuid(null);
    setEditingValue('');
    setError(null);
  };

  const confirmDelete = async () => {
    if (!confirmDialog.item) return;
    setError(null);
    setDeletingId(confirmDialog.item.uuid);
    try {
      const result = await onDelete(confirmDialog.item.uuid);
      setConfirmDialog({ isOpen: false, item: null });
      setSuccessMessage(result.message);
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to delete ${lowerLabel}`));
      setConfirmDialog({ isOpen: false, item: null });
    } finally {
      setDeletingId(null);
    }
  };

  const renderItemsList = () => {
    if (isLoading) {
      return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    if (queryError && showQueryError) {
      return null;
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 ">
          No {title.toLowerCase()} found. Create your first {lowerLabel} above.
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="table w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-full">{label.toUpperCase()}</th>
                <th className="px-6 py-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {items.map((item) => (
                <tr
                  key={item.uuid}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 border-b border-gray-200"
                >
                  {editingUuid === item.uuid ? (
                    <td className="p-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="form-input-field font-bold w-full"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          else if (e.key === 'Escape') handleCancelEdit();
                        }}
                        disabled={isUpdating}
                        autoFocus
                      />
                    </td>
                  ) : (
                    <td className="px-6 py-4 form-text-normal">{item.name}</td>
                  )}
                  {editingUuid === item.uuid ? (
                    <td className="p-2">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={handleSaveEdit}
                          className="btn-primary text-sm px-3 py-1.5"
                          disabled={isUpdating || !editingValue.trim()}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-inline-blue text-sm whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td className="px-6 py-4 inline-flex">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => handleEdit(item.uuid, item.name)}
                          className="btn-inline-blue"
                          disabled={deletingId !== null}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDialog({ isOpen: true, item })}
                          className="ml-2 btn-inline-red"
                          disabled={deletingId !== null}
                        >
                          {deletingId === item.uuid ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {items.length >= 15 && hasNextPage && (
                <tr>
                  <td colSpan={2} ref={observerTarget} className="h-4 p-0" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isFetchingNextPage && (
          <div className="text-center py-4 text-gray-500">Loading more...</div>
        )}
      </>
    );
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
              <div>
                <h1 className="form-title">{title}</h1>
                <p className="form-subtitle">{subtitle}</p>
              </div>

              {successMessage && (
                <Alert
                  type="success"
                  message={successMessage}
                  onClose={() => setSuccessMessage(null)}
                />
              )}
              {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

              <div>
                <h2 className="form-input-label mb-4">Add New {label}</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="form-input-field w-full"
                    placeholder={`New ${label}`}
                    disabled={isCreating}
                  />
                  <button
                    onClick={handleAdd}
                    className="btn-primary"
                    disabled={isCreating || !newValue.trim()}
                  >
                    {isCreating ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {!!queryError && showQueryError && (
                <Alert
                  type="error"
                  message={getApiErrorMessage(queryError)}
                  onClose={() => setShowQueryError(false)}
                />
              )}

              <div className="overflow-hidden">{renderItemsList()}</div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={`Delete ${label}?`}
        message={`Are you sure you want to delete "${confirmDialog.item?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null })}
      />
    </>
  );
}

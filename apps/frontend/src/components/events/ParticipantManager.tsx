'use client';

import React, { useState, useCallback } from 'react';
import { X, Loader2, Pencil, Trash2, Check, UserPlus } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export interface Participant {
  uuid?: string;
  name: string;
  email: string;
}

interface ParticipantManagerProps {
  participants: Participant[];
  onAdd: (participant: Omit<Participant, 'uuid'>) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, participant: Omit<Participant, 'uuid'>) => void;
  isLoading?: boolean;
  maxParticipants?: number;
}

const MAX_PARTICIPANTS_DEFAULT = 20;

export function ParticipantManager({
  participants,
  onAdd,
  onRemove,
  onUpdate,
  isLoading = false,
  maxParticipants = MAX_PARTICIPANTS_DEFAULT,
}: ParticipantManagerProps) {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; index: number | null; participant: Participant | null }>({
    isOpen: false,
    index: null,
    participant: null,
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAdd = useCallback(() => {
    setError(null);

    const trimmedName = newName.trim();
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    const isDuplicate = participants.some(
      (p) => p.email.toLowerCase() === trimmedEmail
    );
    if (isDuplicate) {
      setError('A participant with this email already exists');
      return;
    }

    if (participants.length >= maxParticipants) {
      setError(`Maximum ${maxParticipants} participants allowed`);
      return;
    }

    onAdd({ name: trimmedName, email: trimmedEmail });
    setNewName('');
    setNewEmail('');
  }, [newName, newEmail, participants, maxParticipants, onAdd]);

  const handleEditStart = useCallback((index: number) => {
    const participant = participants[index];
    setEditingIndex(index);
    setEditName(participant.name);
    setEditEmail(participant.email);
    setError(null);
  }, [participants]);

  const handleEditSave = useCallback(() => {
    if (editingIndex === null) return;

    setError(null);

    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check for duplicates (excluding the current editing item)
    const isDuplicate = participants.some(
      (p, idx) => idx !== editingIndex && p.email.toLowerCase() === trimmedEmail
    );
    if (isDuplicate) {
      setError('A participant with this email already exists');
      return;
    }

    onUpdate(editingIndex, { name: trimmedName, email: trimmedEmail });
    setEditingIndex(null);
    setEditName('');
    setEditEmail('');
  }, [editingIndex, editName, editEmail, participants, onUpdate]);

  const handleEditCancel = useCallback(() => {
    setEditingIndex(null);
    setEditName('');
    setEditEmail('');
    setError(null);
  }, []);

  const handleDeleteClick = useCallback((index: number) => {
    const participant = participants[index];
    setDeleteConfirm({
      isOpen: true,
      index,
      participant,
    });
  }, [participants]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirm.index !== null) {
      onRemove(deleteConfirm.index);
    }
    setDeleteConfirm({ isOpen: false, index: null, participant: null });
  }, [deleteConfirm.index, onRemove]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ isOpen: false, index: null, participant: null });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add participants who will receive credentials for this event.
          {participants.length > 0 && (
            <span className="ml-1 text-gray-400">
              ({participants.length}/{maxParticipants})
            </span>
          )}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Add Participant Form */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Participant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="participantName" className="form-input-label">
              Name
            </label>
            <input
              type="text"
              id="participantName"
              className="form-input-field"
              placeholder="Enter participant name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading || participants.length >= maxParticipants}
            />
          </div>
          <div>
            <label htmlFor="participantEmail" className="form-input-label">
              Email
            </label>
            <input
              type="email"
              id="participantEmail"
              className="form-input-field"
              placeholder="Enter participant email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading || participants.length >= maxParticipants}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || participants.length >= maxParticipants}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Add Participant
            </>
          )}
        </button>
      </div>

      {/* Participants List */}
      {participants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4">NAME</th>
                <th className="px-6 py-4">EMAIL</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {participants.map((participant, index) => (
                <tr
                  key={participant.uuid || index}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  {editingIndex === index ? (
                    <>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            setError(null);
                          }}
                          onKeyDown={handleEditKeyDown}
                          className="form-input-field w-full"
                          autoFocus
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => {
                            setEditEmail(e.target.value);
                            setError(null);
                          }}
                          onKeyDown={handleEditKeyDown}
                          className="form-input-field w-full"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleEditSave}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{participant.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{participant.email}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEditStart(index)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            disabled={isLoading}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            disabled={isLoading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {participants.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <UserPlus size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No participants added yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Add participants above to register them for this event
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Participant?"
        message={`Are you sure you want to delete "${deleteConfirm.participant?.name}" (${deleteConfirm.participant?.email})? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

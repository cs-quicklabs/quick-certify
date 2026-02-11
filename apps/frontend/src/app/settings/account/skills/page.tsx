'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSkills, useCreateSkill, useDeleteSkill, SKILL_KEYS } from '@/hooks/useSkills';
import { useAuthStore } from '@/store/auth.store';
import { Alert, ConfirmationDialog } from '@/components';
import type { Skill } from '@/services/api/skill.service';
import { skillService } from '@/services';
import { getApiErrorMessage } from '@/lib/api-error';
import { useQueryClient } from '@tanstack/react-query';
import {
  checkIfUserIsAdmin,
  checkIfUserIsNonAdmin,
  checkIfUserIsSuperAdmin,
  checkIfUserIsSystemAdmin,
} from '@/utils';

/**
 * Skills Page
 * Design: https://designs.quicklabs.in/quick-certify/settings/account/skill
 */
export default function SkillsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editSkillName, setEditSkillName] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    skill: Skill | null;
  }>({ isOpen: false, skill: null });
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showQueryError, setShowQueryError] = useState<boolean>(true);

  const createSkillMutation = useCreateSkill();
  const deleteSkillMutation = useDeleteSkill();

  // Authorization check - only Admin and Super Admin can access
  useEffect(() => {
    if (user && checkIfUserIsNonAdmin(user)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const {
    data,
    isLoading,
    error: queryError,
  } = useSkills({
    limit: 100,
    sortBy: 'name',
    sortOrder: 'ASC',
  });

  const skills = data?.data || [];

  // Reset showQueryError when queryError changes
  useEffect(() => {
    if (queryError) {
      setShowQueryError(true);
    }
  }, [queryError]);

  // Don't render if user is not authorized
  if (user && checkIfUserIsNonAdmin(user)) {
    return null;
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = newSkillName.trim();
    if (!trimmedName) {
      setError('Skill name cannot be empty or only spaces');
      return;
    }

    try {
      await createSkillMutation.mutateAsync({ name: trimmedName });
      setNewSkillName('');
      setError(null);
    } catch (error) {
      setError(getApiErrorMessage(error));
    }
  };

  const handleEditStart = (skill: Skill) => {
    setEditingSkill(skill);
    setEditSkillName(skill.name);
    setError(null);
  };

  const handleEditCancel = () => {
    setEditingSkill(null);
    setEditSkillName('');
    setError(null);
  };

  const handleEditSave = async (skillUuid: string) => {
    setError(null);
    setIsUpdating(true);

    const trimmedName = editSkillName.trim();
    if (!trimmedName) {
      setError('Skill name cannot be empty or only spaces');
      setIsUpdating(false);
      return;
    }

    try {
      await skillService.updateSkill(skillUuid, { name: trimmedName });
      queryClient.invalidateQueries({ queryKey: SKILL_KEYS.lists() });
      setEditingSkill(null);
      setEditSkillName('');
      setError(null);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (skill: Skill) => {
    setConfirmDialog({ isOpen: true, skill });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.skill) return;

    setError(null);
    setDeletingId(confirmDialog.skill.uuid);
    try {
      await deleteSkillMutation.mutateAsync(confirmDialog.skill.uuid);
      setConfirmDialog({ isOpen: false, skill: null });
      setError(null);
    } catch (error) {
      setError(getApiErrorMessage(error));
      setConfirmDialog({ isOpen: false, skill: null });
    } finally {
      setDeletingId(null);
    }
  };

  const isAuthorized =
    user &&
    (checkIfUserIsAdmin(user) || checkIfUserIsSuperAdmin(user) || checkIfUserIsSystemAdmin(user));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="form-title">Skills</h1>
        <p className="form-subtitle">
          Skills help categorize participants based on expertise. You can add, edit, or delete
          skills as needed.
        </p>
      </div>

      {/* Error Message */}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Add New Skill Form */}
      {isAuthorized && (
        <form onSubmit={handleAddSkill} className="w-full mb-4">
          <div className="mb-4 mt-4">
            <label htmlFor="skill" className="form-input-label">
              Add New Skill
            </label>
            <input
              type="text"
              id="skill"
              className="form-input-field"
              placeholder="Enter skill name"
              value={newSkillName}
              onChange={(e) => {
                setNewSkillName(e.target.value);
                setError(null);
              }}
              disabled={createSkillMutation.isPending}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={createSkillMutation.isPending}
          >
            {createSkillMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      {/* API Error Message */}
      {queryError && showQueryError && (
        <Alert
          type="error"
          message={getApiErrorMessage(queryError)}
          onClose={() => setShowQueryError(false)}
        />
      )}

      {/* Skills Table */}
      <div className="relative overflow-x-auto mt-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : queryError && showQueryError ? null : skills.length === 0 ? null : (
          <div className="overflow-x-auto">
            <table className="table w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4 w-full">SKILL</th>
                  <th className="px-6 py-4">ACTION</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {skills.map((skill, index) => (
                  <tr
                    key={skill.uuid}
                    className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                  >
                    {editingSkill?.uuid === skill.uuid ? (
                      <td className="p-2">
                        <input
                          type="text"
                          value={editSkillName}
                          onChange={(e) => {
                            setEditSkillName(e.target.value);
                            setError(null);
                          }}
                          className="form-input-field font-bold w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditSave(skill.uuid);
                            } else if (e.key === 'Escape') {
                              handleEditCancel();
                            }
                          }}
                          disabled={isUpdating}
                          autoFocus
                        />
                      </td>
                    ) : (
                      <td className="px-6 py-4">
                        <span className="form-text-normal">{skill.name}</span>
                      </td>
                    )}
                    {!isAuthorized ? (
                      <td className="px-6 py-4">
                        <span className="text-gray-400">—</span>
                      </td>
                    ) : editingSkill?.uuid === skill.uuid ? (
                      <td>
                        <button
                          onClick={() => handleEditSave(skill.uuid)}
                          className="btn-primary text-sm px-3 py-1.5 ml-2"
                          disabled={isUpdating || !editSkillName.trim()}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    ) : (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => handleEditStart(skill)}
                            className="btn-inline-blue text-sm whitespace-nowrap"
                            disabled={deletingId !== null}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(skill)}
                            className="btn-inline-red text-sm whitespace-nowrap"
                            disabled={deletingId !== null}
                          >
                            {deletingId === skill.uuid ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Skill?"
        message={`Are you sure you want to delete "${confirmDialog.skill?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, skill: null })}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSkills, useCreateSkill, useDeleteSkill } from '@/hooks/useSkills';
import { useAuthStore } from '@/store/auth.store';
import { ConfirmationDialog } from '@/components';
import type { Skill } from '@/services/api/skill.service';
import { skillService } from '@/services';
import { getApiErrorMessage } from '@/lib/api-error';
import { useQueryClient } from '@tanstack/react-query';
import { SKILL_KEYS } from '@/hooks/useSkills';

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

    const createSkillMutation = useCreateSkill();
    const deleteSkillMutation = useDeleteSkill();

    // Authorization check - only Admin and Super Admin can access
    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const { data, isLoading, error: queryError } = useSkills({
        limit: 100,
        sortBy: 'name',
        sortOrder: 'ASC',
    });

    const skills = data?.data || [];

    // Don't render if user is not authorized
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
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

    const handleEditSave = async (skillId: string) => {
        setError(null);
        setIsUpdating(true);

        const trimmedName = editSkillName.trim();
        if (!trimmedName) {
            setError('Skill name cannot be empty or only spaces');
            setIsUpdating(false);
            return;
        }

        try {
            await skillService.updateSkill(skillId, { name: trimmedName });
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
        setDeletingId(confirmDialog.skill.id);
        try {
            await deleteSkillMutation.mutateAsync(confirmDialog.skill.id);
            setConfirmDialog({ isOpen: false, skill: null });
            setError(null);
        } catch (error) {
            setError(getApiErrorMessage(error));
            setConfirmDialog({ isOpen: false, skill: null });
        } finally {
            setDeletingId(null);
        }
    };

    const isAuthorized = user && (user.role === 'admin' || user.role === 'super_admin');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="form-title">Skills</h1>
                <p className="form-subtitle">
                    Skills help categorize participants based on expertise. You can add, edit, or delete
                    skills as needed.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Add New Skill Form */}
            {isAuthorized && (
                <form onSubmit={handleAddSkill} className="w-full mt-6">
                    <div className="mb-4 mt-6">
                        <label htmlFor="skill" className="form-input-label">Add New Skill</label>
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
                            required />
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
            {queryError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                    Something went wrong
                </div>
            )}

            {/* Skills Table */}
            <div className="overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
                ) : queryError ? null : skills.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No skills found. Create your first skill above.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-sm text-left text-gray-700 dark:text-gray-300">
                                        SKILL
                                    </th>
                                    <th className="px-10 py-4 font-bold text-sm text-right text-gray-700 dark:text-gray-300">
                                        ACTION
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {skills.map((skill, index) => (
                                    <tr
                                        key={skill.id}
                                        className={`border-b border-gray-200 dark:border-gray-700 ${index === 0
                                            ? 'bg-white dark:bg-gray-800'
                                            : index % 2 === 1
                                                ? 'bg-gray-50 dark:bg-gray-700'
                                                : 'bg-white dark:bg-gray-800'
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            {editingSkill?.id === skill.id ? (
                                                <input
                                                    type="text"
                                                    value={editSkillName}
                                                    onChange={(e) => {
                                                        setEditSkillName(e.target.value);
                                                        setError(null);
                                                    }}
                                                    className="form-input-field w-full text-sm"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleEditSave(skill.id);
                                                        } else if (e.key === 'Escape') {
                                                            handleEditCancel();
                                                        }
                                                    }}
                                                    disabled={isUpdating}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-900 dark:text-white">{skill.name}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {!isAuthorized ? (
                                                <span className="text-gray-400">—</span>
                                            ) : editingSkill?.id === skill.id ? (
                                                <button
                                                    onClick={() => handleEditSave(skill.id)}
                                                    className="btn-primary text-sm px-3 py-1.5"
                                                    disabled={isUpdating || !editSkillName.trim()}
                                                >
                                                    {isUpdating ? 'Saving...' : 'Save'}
                                                </button>
                                            ) : (
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
                                                        {deletingId === skill.id ? 'Deleting...' : 'Delete'}
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


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSkills, useCreateSkill, useDeleteSkill } from '@/hooks/useSkills';
import { useAuthStore } from '@/store/auth.store';
import { ConfirmationDialog, Table } from '@/components';
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

    const createSkillMutation = useCreateSkill();
    const deleteSkillMutation = useDeleteSkill();

    // Authorization check - only Admin and Super Admin can access
    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const { data, isLoading } = useSkills({
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

        try {
            await deleteSkillMutation.mutateAsync(confirmDialog.skill.id);
            setConfirmDialog({ isOpen: false, skill: null });
            setError(null);
        } catch (error) {
            setError(getApiErrorMessage(error));
            setConfirmDialog({ isOpen: false, skill: null });
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
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 text-sm">{error}</p>
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
                        disabled={createSkillMutation.isPending || !newSkillName.trim()}
                    >
                        {createSkillMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                </form>
            )}

            {/* Skills Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <style dangerouslySetInnerHTML={{
                    __html: `
                        .skills-table-wrapper table {
                            table-layout: fixed;
                        }
                        .skills-table-wrapper table td:first-child,
                        .skills-table-wrapper table th:first-child {
                            width: 60%;
                        }
                        .skills-table-wrapper table td:last-child,
                        .skills-table-wrapper table th:last-child {
                            width: 30%;
                        }
                    `
                }} />
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading skills...</div>
                ) : skills.length === 0 ? (
                    <div />
                ) : (
                    <div className="skills-table-wrapper">
                        <Table
                            data={skills}
                            columns={[
                                {
                                    key: 'name',
                                    header: 'Skill',
                                    className: 'text-left py-4',
                                    headerClassName: 'text-left py-4',
                                    render: (skill: Skill) => (
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {editingSkill?.id === skill.id ? (
                                                <div className="flex w-full gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={editSkillName}
                                                        onChange={(e) => {
                                                            setEditSkillName(e.target.value);
                                                            setError(null);
                                                        }}
                                                        className="flex-1 form-input-field text-sm"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                skill.name
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: 'Action',
                                    className: 'text-right  py-4',
                                    headerClassName: 'text-right py-4',
                                    render: (skill: Skill) => {
                                        if (!isAuthorized) return <span className="text-gray-400">—</span>;
                                        if (editingSkill?.id === skill.id) {
                                            return <div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditSave(skill.id)}
                                                    className="px-3 py-1 text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={!editSkillName.trim() || isUpdating}
                                                >
                                                    {isUpdating ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleEditCancel}
                                                    className="ml-2 px-3 py-1 text-sm btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>;
                                        }



                                        return (
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditStart(skill)}
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors"
                                                    aria-label="Edit Skill"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(skill)}
                                                    className="text-red-600 hover:text-red-800 font-bold text-sm transition-colors"
                                                    aria-label="Delete Skill"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        );
                                    },
                                },
                            ]}
                        />
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


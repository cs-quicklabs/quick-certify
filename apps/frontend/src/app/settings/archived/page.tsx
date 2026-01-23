'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamMembers, useRestoreUser, useDeleteTeamMember } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import { ConfirmationDialog } from '@/components';
import type { TeamMember } from '@/services/api/team.service';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

/**
 * Archived Members Page
 * Redesigned to match custom list view
 */
export default function ArchivedMembersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Debounce search could be added, but for now simple state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [memberToRestore, setMemberToRestore] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const pageSize = 10;

  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteTeamMember();

  // Authorization check
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const { data, isLoading } = useTeamMembers({
    page: currentPage,
    limit: pageSize,
    status: 'archived',
    search: searchQuery || undefined,
    sortBy: 'updated_at',
    sortOrder: 'DESC',
  });

  const members = data?.data || [];
  const totalPages = data?.meta?.totalPages || 0;

  const handleRestoreClick = (member: TeamMember) => {
    setMemberToRestore(member);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
  };

  const handleConfirmRestore = () => {
    if (memberToRestore) {
      restoreUser(memberToRestore.uuid, {
        onSuccess: () => {
          setMemberToRestore(null);
          toast.success('User restored successfully');
          setSearchQuery('');
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteUser(memberToDelete.uuid, {
        onSuccess: () => {
          setMemberToDelete(null);
        },
      });
    }
  };

  if (user && user.role !== 'admin' && user.role !== 'super_admin') {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      designer: 'Designer',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="px-4 pb-12 lg:col-span-8">
      <div className="pb-4">
        <h1 className="text-lg font-medium text-gray-900">Archived Users</h1>
        <p className="mt-1 text-sm text-gray-500">Following users have been deactivated.</p>
      </div>

      {/* Search */}
      <div className="relative rounded-md shadow-sm">
        <input
          type="text"
          className="block w-full rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4 font-bold text-blue-900" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="border-separate mt-6 w-full">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">Loading...</div>
        ) : members.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">No archived members found.</div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="bg-white mb-4 border-gray-100  flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex text-sm font-medium text-gray-600 truncate">
                  <span className="text-sm font-medium text-gray-700">
                    {member.first_name} {member.last_name}
                  </span>
                  <span className="ml-1 font-normal text-gray-500">
                    {getRoleDisplay(member.role?.role)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>

                  <span>
                    Deactivated on {formatDate(member.updatedAt)}
                    {/* "by User" is omitted as it's not available in API currently */}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => handleRestoreClick(member)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleDeleteClick(member)}
                  className="text-sm font-semibold text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (Simple) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Restore Dialog */}
      <ConfirmationDialog
        isOpen={!!memberToRestore}
        title="Restore Member"
        message={`Are you sure you want to restore ${memberToRestore?.first_name} ${memberToRestore?.last_name}?`}
        confirmLabel={isRestoring ? 'Restoring...' : 'Restore'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmRestore}
        onCancel={() => setMemberToRestore(null)}
      />

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={false}
        title="Delete Member"
        message={`Are you sure you want to permanently delete ${memberToDelete?.first_name} ${memberToDelete?.last_name}? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}

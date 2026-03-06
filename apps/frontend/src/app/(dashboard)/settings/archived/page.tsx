'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamMembers, useRestoreUser, usePermanentlyDeleteTeamMember } from '@/hooks/useTeam';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/auth.store';
import { ConfirmationDialog } from '@/components';
import { Pagination } from '@/components/ui/pagination';
import type { TeamMember } from '@/services/api/team.service';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { checkIfUserIsNonAdmin, checkIfUserIsSuperAdmin, checkIfUserIsSystemAdmin } from '@/utils';

/**
 * Archived Members Page
 * Redesigned to match custom list view
 * Only super_admin can permanently delete archived users
 */
export default function ArchivedMembersPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [memberToRestore, setMemberToRestore] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const isDeletePermission =
    isInitialized && !!(user && (checkIfUserIsSuperAdmin(user) || checkIfUserIsSystemAdmin(user)));
  const pageSize = 10;

  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser();
  const { mutate: permanentlyDeleteUser, isPending: isDeleting } = usePermanentlyDeleteTeamMember();

  // Authorization check
  useEffect(() => {
    if (isInitialized && user && checkIfUserIsNonAdmin(user)) {
      router.push('/dashboard');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useTeamMembers({
    page: currentPage,
    limit: pageSize,
    status: 'archived',
    search: debouncedSearch || undefined,
    sortBy: 'updated_at',
    sortOrder: 'DESC',
  });

  const members = data?.data || [];
  const totalPages = data?.meta?.totalPages || 0;

  const handleRestoreClick = (member: TeamMember) => {
    setMemberToRestore(member);
  };

  const handleDeleteClick = (member: TeamMember) => {
    if (!isDeletePermission) {
      toast.error('Only Super Admins can permanently delete archived users');
      return;
    }
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
      permanentlyDeleteUser(memberToDelete.uuid, {
        onSuccess: () => {
          setMemberToDelete(null);
          toast.success('User permanently deleted');
        },
      });
    }
  };

  if (!isInitialized) return null;
  if (user && checkIfUserIsNonAdmin(user)) return null;

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

  const getArchivedBy = (member: TeamMember): string => {
    const archiveLog = member.audit_logs?.[0];
    return archiveLog?.actor?.full_name ?? 'Unknown';
  };

  function renderList() {
    if (isLoading) {
      return <div className="py-10 text-center text-sm text-gray-500">Loading...</div>;
    }

    if (members.length === 0) {
      return (
        <div className="py-10 text-center text-sm text-gray-500">No archived members found.</div>
      );
    }

    return members.map((member) => (
      <div
        key={member.id}
        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between"
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
              className="shrink-0 mr-1.5 h-5 w-5 text-gray-400"
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

            <div>
              Deactivated on {formatDate(member.updatedAt)} by{' '}
              <span className="font-medium text-gray-700">{getArchivedBy(member)}</span>{' '}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => handleRestoreClick(member)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            disabled={isRestoring}
          >
            Activate
          </button>
          <button
            onClick={() => handleDeleteClick(member)}
            className={`text-sm font-semibold ${
              isDeletePermission
                ? 'text-red-600 hover:text-red-800 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isDeletePermission || isDeleting}
            title={isDeletePermission ? 'Only Super Admins can delete' : ''}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  }

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
      <div className="mt-6 bg-white shadow-md sm:rounded-sm px-4 divide-y divide-gray-100">
        {renderList()}
      </div>

      {/* Pagination */}
      <div className="pt-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          variant="compact"
        />
      </div>

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

      {/* Delete Dialog - Only for Super Admin */}
      <ConfirmationDialog
        isOpen={!!memberToDelete}
        title={
          <span className="font-bold text-lg block">
            Are you sure you want to delete this user?
          </span>
        }
        message={
          <div className="flex flex-col gap-1">
            <p>
              All the information regarding this user will be lost. If this user has created
              content, it will be assigned to the super admin.
            </p>
          </div>
        }
        confirmLabel={isDeleting ? 'Deleting...' : 'Yes, Delete'}
        confirmVariant="danger"
        cancelLabel="No, Cancel"
        className="max-w-md w-full rounded-sm"
        onConfirm={handleConfirmDelete}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}

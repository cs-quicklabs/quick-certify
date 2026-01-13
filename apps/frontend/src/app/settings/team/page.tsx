'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeamMembers, useCancelInvitation, useDeleteTeamMember, useResendInvitation, useRestoreUser } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import { ConfirmationDialog } from '@/components';
import type { TeamMember } from '@/services/api/team.service';

/**
 * Team Listing Page
 * Design: https://designs.quicklabs.in/quick-certify/settings/account/team
 */
export default function TeamsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'remove' | 'invite' | 'activate' | null;
    member: TeamMember | null;
  }>({ isOpen: false, type: null, member: null });
  const pageSize = 10;
  const menuRef = useRef<HTMLDivElement>(null);

  const cancelInvitationMutation = useCancelInvitation();
  const deleteTeamMemberMutation = useDeleteTeamMember();
  const resendInvitationMutation = useResendInvitation();
  const restoreUserMutation = useRestoreUser();

  // Authorization check - only Admin and Super Admin can access
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Use backend filtering instead of client-side
  const { data, isLoading } = useTeamMembers({
    page: currentPage,
    limit: pageSize,
    role: roleFilter || undefined,
    search: searchQuery || undefined,
  });

  const totalCount = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 0;
  const members = data?.data || [];

  // Don't render if user is not authorized
  if (user && user.role !== 'admin' && user.role !== 'super_admin') {
    return null;
  }

  // Format date like "Nov 11, 2022"
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      designer: 'Designer',
    };
    return roleMap[role] || role;
  };

  // Person icon for role badge
  const PersonIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(roleFilter === role ? '' : role);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleMenuToggle = (memberId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === memberId ? null : memberId);
  };

  const handleEdit = (memberUuid: string) => {
    setOpenMenuId(null);
    router.push(`/settings/team/${memberUuid}/edit`);
  };

  const handleCancelInvitation = (member: TeamMember) => {
    setOpenMenuId(null);
    setConfirmDialog({ isOpen: true, type: 'cancel', member: { ...member } });
  };

  const handleRemove = (member: TeamMember) => {
    setOpenMenuId(null);
    setConfirmDialog({ isOpen: true, type: 'remove', member: { ...member } });
  };

  const handleInvite = (member: TeamMember) => {
    setOpenMenuId(null);
    setConfirmDialog({ isOpen: true, type: 'invite', member: { ...member } });
  };

  const handleActivate = (member: TeamMember) => {
    setOpenMenuId(null);
    setConfirmDialog({ isOpen: true, type: 'activate', member: { ...member } });
  };

  const handleConfirmCancel = async () => {
    if (!confirmDialog.member) return;
    const memberUuid = confirmDialog.member.uuid || confirmDialog.member.id;
    if (!memberUuid) return;

    try {
      await cancelInvitationMutation.mutateAsync(memberUuid);
      setConfirmDialog({ isOpen: false, type: null, member: null });
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    }
  };

  const handleConfirmRemove = async () => {
    if (!confirmDialog.member) return;
    const memberUuid = confirmDialog.member.uuid || confirmDialog.member.id;
    if (!memberUuid) return;

    try {
      await deleteTeamMemberMutation.mutateAsync(memberUuid);
      setConfirmDialog({ isOpen: false, type: null, member: null });
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  const handleConfirmInvite = async () => {
    if (!confirmDialog.member) return;
    const memberUuid = confirmDialog.member.uuid || confirmDialog.member.id;
    if (!memberUuid) return;

    try {
      await resendInvitationMutation.mutateAsync(memberUuid);
      setConfirmDialog({ isOpen: false, type: null, member: null });
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const handleConfirmActivate = async () => {
    if (!confirmDialog.member) return;
    const memberUuid = confirmDialog.member.uuid || confirmDialog.member.id;
    if (!memberUuid) return;

    try {
      await restoreUserMutation.mutateAsync(memberUuid);
      setConfirmDialog({ isOpen: false, type: null, member: null });
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ isOpen: false, type: null, member: null });
  };

  const getConfirmDialogTitle = () => {
    switch (confirmDialog.type) {
      case 'cancel':
        return 'Cancel Invitation?';
      case 'invite':
        return 'Resend Invitation?';
      case 'activate':
        return 'Activate User?';
      case 'remove':
        return 'Remove Team Member?';
      default:
        return '';
    }
  };

  const getConfirmDialogMessage = () => {
    const memberName = `${confirmDialog.member?.first_name} ${confirmDialog.member?.last_name}`;
    switch (confirmDialog.type) {
      case 'cancel':
        return `Are you sure you want to cancel the invitation for ${memberName}? They will not be able to accept the invitation or login.`;
      case 'invite':
        return `Are you sure you want to resend the invitation to ${memberName}? They will receive a new invitation email.`;
      case 'activate':
        return `Are you sure you want to activate ${memberName}? They will be able to access the system again.`;
      case 'remove':
        return `Are you sure you want to remove ${memberName}? They will be archived and logged out from all devices. They can be restored later.`;
      default:
        return '';
    }
  };

  const getConfirmLabel = () => {
    switch (confirmDialog.type) {
      case 'cancel':
        return 'Cancel Invitation';
      case 'invite':
        return 'Send Invitation';
      case 'activate':
        return 'Activate';
      case 'remove':
        return 'Remove';
      default:
        return 'Confirm';
    }
  };

  const getConfirmHandler = () => {
    switch (confirmDialog.type) {
      case 'cancel':
        return handleConfirmCancel;
      case 'invite':
        return handleConfirmInvite;
      case 'activate':
        return handleConfirmActivate;
      case 'remove':
        return handleConfirmRemove;
      default:
        return handleCloseDialog;
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your existing <span className="font-semibold text-gray-900">{totalCount}</span> team member{totalCount !== 1 ? 's' : ''} or add a new one.
          </p>
        </div>
        <Link
          href="/settings/team/add"
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Add new member
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-5 space-y-4 border-b border-gray-200">
        {/* Search */}
        {/* <div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search member..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div> */}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-gray-600">Show records only for:</span>

          {/* Admin Radio */}
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="roleFilter"
              checked={roleFilter === 'admin'}
              onChange={() => handleRoleFilterChange('admin')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="ml-2 text-sm text-gray-700">Admin</span>
          </label>

          {/* Managers Radio */}
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="roleFilter"
              checked={roleFilter === 'manager'}
              onChange={() => handleRoleFilterChange('manager')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="ml-2 text-sm text-gray-700">Managers</span>
          </label>

          {/* Designers Radio */}
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="roleFilter"
              checked={roleFilter === 'designer'}
              onChange={() => handleRoleFilterChange('designer')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="ml-2 text-sm text-gray-700">Designers</span>
          </label>

          {/* Show All Link */}
          <button
            onClick={() => {
              setRoleFilter('');
              setCurrentPage(1);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Show All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-200 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Added On
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery ? 'No matching team members found.' : 'No team members found.'}
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/settings/team/${member.uuid}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {member.first_name} {member.last_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                      <PersonIcon />
                      <span>{getRoleDisplay(member.role?.role)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${member.status === 'active'
                          ? 'bg-green-500'
                          : member.status === 'inactive'
                            ? 'bg-yellow-500'
                            : member.status === 'invited'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                      />
                      <span className="text-sm text-gray-900 capitalize">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.last_login_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <div className="relative" ref={openMenuId === member.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={(e) => handleMenuToggle(member.id, e)}
                        className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label="Actions"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === member.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu">
                            <button
                              onClick={() => handleEdit(member.uuid)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Edit
                            </button>
                            {member.status === 'invited' ? (
                              <button
                                onClick={() => handleCancelInvitation(member)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                Cancel
                              </button>
                            ) : member.status === 'inactive' ? (
                              <button
                                onClick={() => handleInvite(member)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                Invite
                              </button>
                            ) : member.status === 'archived' ? (
                              <button
                                onClick={() => handleActivate(member)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemove(member)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                role="menuitem"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {members.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={getConfirmDialogTitle()}
        message={getConfirmDialogMessage()}
        confirmLabel={getConfirmLabel()}
        cancelLabel="Cancel"
        confirmVariant={confirmDialog.type === 'remove' ? 'danger' : 'primary'}
        onConfirm={getConfirmHandler()}
        onCancel={handleCloseDialog}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, X, Mail, UserCheck, Eye } from 'lucide-react';
import { useTeamMembers, useCancelInvitation, useDeleteTeamMember, useResendInvitation, useRestoreUser } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import { ConfirmationDialog, Table } from '@/components';
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'remove' | 'invite' | 'activate' | null;
    member: TeamMember | null;
  }>({ isOpen: false, type: null, member: null });
  const pageSize = 10;

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


  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(roleFilter === role ? '' : role);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleView = (memberUuid: string) => {
    router.push(`/settings/team/${memberUuid}`);
  };

  const handleEdit = (memberUuid: string) => {
    router.push(`/settings/team/${memberUuid}/edit`);
  };

  const handleCancelInvitation = (member: TeamMember) => {
    setConfirmDialog({ isOpen: true, type: 'cancel', member: { ...member } });
  };

  const handleRemove = (member: TeamMember) => {
    setConfirmDialog({ isOpen: true, type: 'remove', member: { ...member } });
  };

  const handleInvite = (member: TeamMember) => {
    setConfirmDialog({ isOpen: true, type: 'invite', member: { ...member } });
  };

  const handleActivate = (member: TeamMember) => {
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
        <div className="flex space-x-4">
          <div className="flex space-x-2 items-center w-full">
            <Link
              href="/settings/team/add"
              className="btn-primary w-full"
            >
              Add new member
            </Link>
          </div>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="px-4 py-5 space-y-4 border-b border-gray-200">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Show records only for:</span>
          {/* Admin Radio */}
          <label className="ml-4 inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="roleFilter"
              checked={roleFilter === 'admin'}
              onChange={() => handleRoleFilterChange('admin')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="ml-2 text-sm font-semibold text-gray-700">Admin</span>
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
            <span className="ml-2 text-sm font-semibold text-gray-700">Managers</span>
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
            <span className="ml-2 text-sm font-semibold text-gray-700">Designers</span>
          </label>

          {/* Show All Link */}
          <button
            onClick={() => {
              setRoleFilter('');
              setCurrentPage(1);
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            Show All
          </button>
        </div>
      </div>

      {/* Table */}
      <div>
        <Table<TeamMember>
          columns={[
            {
              key: 'user',
              header: 'User',
              render: (member) => {
                const isCurrentUser = user?.email === member.email;
                return (
                  <Link
                    href={`/settings/team/${member.uuid || member.id}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    {member.first_name} {member.last_name}
                    {isCurrentUser && <span className="text-gray-500 ml-1">(You)</span>}
                  </Link>
                );
              },
            },
            {
              key: 'role',
              header: 'Role',
              render: (member) => (
                <span className="inline-flex font-semibold items-center bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300 gap-1">
                  <svg
                    className="h-3.5 w-3.5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    />
                  </svg>
                  <span>{getRoleDisplay(member.role?.role)}</span>
                </span>
              ),
            },
            {
              key: 'email',
              header: 'Email',
              render: (member) => <span className="text-sm text-gray-500">{member.email}</span>,
            },
            {
              key: 'status',
              header: 'Status',
              render: (member) => (
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
              ),
            },
            {
              key: 'last_login_at',
              header: 'Last Login',
              render: (member) => (
                <span className="text-sm text-gray-500">{formatDate(member.last_login_at)}</span>
              ),
            },
            {
              key: 'createdAt',
              header: 'Added On',
              render: (member) => (
                <span className="text-sm text-gray-500">{formatDate(member.createdAt)}</span>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (member) => {
                const isCurrentUser = user?.email === member.email;
                return (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(member.uuid || member.id);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                      aria-label="View"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!isCurrentUser && member.status === 'active' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(member.uuid || member.id);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {!isCurrentUser && member.status === 'invited' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelInvitation(member);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                        aria-label="Cancel Invitation"
                        title="Cancel Invitation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : !isCurrentUser && member.status === 'inactive' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvite(member);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                        aria-label="Resend Invitation"
                        title="Resend Invitation"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    ) : !isCurrentUser && member.status === 'archived' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivate(member);
                        }}
                        className="p-2 text-gray-600 hover:text-green-600 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                        aria-label="Activate"
                        title="Activate"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    ) : !isCurrentUser && member.status === 'active' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(member);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                        aria-label="Remove"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
          data={members}
          isLoading={isLoading}
          emptyMessage={searchQuery ? 'No matching team members found.' : 'No team members found.'}
        />
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

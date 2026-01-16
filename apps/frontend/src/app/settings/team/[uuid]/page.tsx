'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTeamMember, useCancelInvitation, useDeleteTeamMember, useResendInvitation, useRestoreUser } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import { ConfirmationDialog } from '@/components/ui';

/**
 * Team Member Detail Page
 */
export default function TeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid as string;
  const { user } = useAuthStore();

  const { data: member, isLoading, refetch } = useTeamMember(uuid);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'remove' | 'invite' | 'activate' | null;
  }>({ isOpen: false, type: null });

  const cancelInvitationMutation = useCancelInvitation();
  const deleteTeamMemberMutation = useDeleteTeamMember();
  const resendInvitationMutation = useResendInvitation();
  const restoreUserMutation = useRestoreUser();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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

  const isCurrentUser = user?.email === member?.email;

  const handleCancelInvitation = () => {
    setConfirmDialog({ isOpen: true, type: 'cancel' });
  };

  const handleRemove = () => {
    setConfirmDialog({ isOpen: true, type: 'remove' });
  };

  const handleInvite = () => {
    setConfirmDialog({ isOpen: true, type: 'invite' });
  };

  const handleActivate = () => {
    setConfirmDialog({ isOpen: true, type: 'activate' });
  };

  const handleConfirmCancel = async () => {
    if (!uuid) return;
    try {
      await cancelInvitationMutation.mutateAsync(uuid);
      setConfirmDialog({ isOpen: false, type: null });
      router.push('/settings/team');
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    }
  };

  const handleConfirmRemove = async () => {
    if (!uuid) return;
    try {
      await deleteTeamMemberMutation.mutateAsync(uuid);
      setConfirmDialog({ isOpen: false, type: null });
      router.push('/settings/team');
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  const handleConfirmInvite = async () => {
    if (!uuid) return;
    try {
      await resendInvitationMutation.mutateAsync(uuid);
      setConfirmDialog({ isOpen: false, type: null });
      refetch();
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const handleConfirmActivate = async () => {
    if (!uuid) return;
    try {
      await restoreUserMutation.mutateAsync(uuid);
      setConfirmDialog({ isOpen: false, type: null });
      refetch();
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ isOpen: false, type: null });
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
    const memberName = `${member?.first_name} ${member?.last_name}`;
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Team member not found.</p>
        <button
          onClick={() => router.push('/settings/team')}
          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back to team
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {member.first_name} {member.last_name}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 ml-8">Team member details</p>
        </div>
        {!isCurrentUser && (
          <div className="flex items-center">
            {member.status === 'active' && (
              <>
                <Link
                  href={`/settings/team/${uuid}/edit`}
                  className="btn-primary"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="btn-red"
                >
                  Remove
                </button>
              </>
            )}
            {member.status === 'invited' && (
              <button
                type="button"
                onClick={handleCancelInvitation}
                className="btn-red"
              >
                Cancel Invitation
              </button>
            )}
            {member.status === 'inactive' && (
              <button
                type="button"
                onClick={handleInvite}
                className="btn-primary"
              >
                Resend Invitation
              </button>
            )}
            {member.status === 'archived' && (
              <button
                type="button"
                onClick={handleActivate}
                className="btn-primary"
              >
                Activate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 text-sm text-gray-900">{member.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                {getRoleDisplay(member.role?.role)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-1 flex items-center gap-2">
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
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Login</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(member.last_login_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Added On</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(member.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={getConfirmDialogTitle()}
        message={getConfirmDialogMessage()}
        confirmLabel={getConfirmLabel()}
        cancelLabel="Cancel"
        confirmVariant={confirmDialog.type === 'remove' || confirmDialog.type === 'cancel' ? 'danger' : 'primary'}
        onConfirm={getConfirmHandler()}
        onCancel={handleCloseDialog}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConfigForm } from '@/components/ConfigForm';
import { editTeamMemberFormFields } from '@/config/team.config';
import { editTeamMemberSchema, EditTeamMemberFormData } from '@/schemas/team.schema';
import { useTeamMember, useUpdateTeamMember, useRoles } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import { FormConfig } from '@/types/form.types';

/**
 * Edit Team Member Page
 * Design: https://designs.quicklabs.in/quick-certify/settings/account/team/edit
 */
export default function EditTeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid as string;
  const { user } = useAuthStore();

  // Authorization check - only Admin and Super Admin can access
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const { data: member, isLoading: memberLoading } = useTeamMember(uuid);
  const updateMutation = useUpdateTeamMember(uuid);
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Don't render if user is not authorized
  if (user && user.role !== 'admin' && user.role !== 'super_admin') {
    return null;
  }

  // Filter roles and create options for select
  const filteredRoles = useMemo(() => {
    return roles?.filter((role) =>
      ['admin', 'manager', 'designer'].includes(role.role.toLowerCase())
    ) || [];
  }, [roles]);

  // Create form fields with role options
  const formFields = useMemo(() => {
    const roleField = editTeamMemberFormFields.find((field) => field.name === 'roleId');
    if (roleField) {
      return editTeamMemberFormFields.map((field) => {
        if (field.name === 'roleId') {
          return {
            ...field,
            options: filteredRoles.map((role) => ({
              label: role.role === 'admin' ? 'Admin' : role.role === 'manager' ? 'Manager' : 'Designer',
              value: role.id,
            })),
          };
        }
        return field;
      });
    }
    return editTeamMemberFormFields;
  }, [filteredRoles]);

  const formConfig: FormConfig<typeof editTeamMemberSchema> = {
    title: 'Edit Team Member',
    subtitle: 'Please update details to edit team member.',
    fields: formFields,
    schema: editTeamMemberSchema,
    submitLabel: 'Edit Member',
    layout: 'grid',
    onCancel: () => router.back(),
    cancelLabel: 'Cancel',
    onSubmit: async (data: EditTeamMemberFormData) => {
      // Map form data to API request format
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        roleId: data.roleId,
        status: data.status || undefined,
      };
      await updateMutation.mutateAsync(updateData);
      router.push('/settings/team');
    },
  };

  // Prepare initial values from member data
  const initialValues = member
    ? {
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      roleId: member.role_id || '',
      status: (member.status === 'active' ? 'active' : 'archived') as 'active' | 'archived',
    }
    : undefined;

  if (memberLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-xl text-center">
          <p className="text-gray-500 mb-4">Team member not found.</p>
          <button
            onClick={() => router.push('/settings/team')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-8 justify-center">
      <div className="w-full max-w-2xl">
        <ConfigForm
          config={formConfig}
          initialValues={initialValues}
          isLoading={memberLoading || rolesLoading}
        />
      </div>
    </div>
  );
}

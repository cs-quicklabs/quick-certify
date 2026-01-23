'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ConfigForm } from '@/components/ConfigForm';
import { addTeamMemberFormFields } from '@/config/team.config';
import { addTeamMemberSchema, AddTeamMemberFormData } from '@/schemas/team.schema';
import { useCreateTeamMember, useRoles } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import { FormConfig } from '@/types/form.types';

/**
 * Add Team Member Page
 * Design: https://designs.quicklabs.in/quick-certify/settings/account/team/add
 */
export default function AddTeamMemberPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Authorization check - only Admin and Super Admin can access
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const createMutation = useCreateTeamMember();
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Don't render if user is not authorized
  if (user && user.role !== 'admin' && user.role !== 'super_admin') {
    return null;
  }

  // Filter roles and create options for select
  const filteredRoles = useMemo(() => {
    return (
      roles?.filter((role) => ['admin', 'manager', 'designer'].includes(role.role.toLowerCase())) ||
      []
    );
  }, [roles]);

  // Create form fields with role options
  const formFields = useMemo(() => {
    const roleField = addTeamMemberFormFields.find((field) => field.name === 'roleId');
    if (roleField) {
      return addTeamMemberFormFields.map((field) => {
        if (field.name === 'roleId') {
          return {
            ...field,
            options: filteredRoles.map((role) => ({
              label:
                role.role === 'admin' ? 'Admin' : role.role === 'manager' ? 'Manager' : 'Designer',
              value: role.id,
            })),
          };
        }
        return field;
      });
    }
    return addTeamMemberFormFields;
  }, [filteredRoles]);

  const formConfig: FormConfig<typeof addTeamMemberSchema> = {
    title: 'Add New Team Member',
    subtitle:
      'Please fill in details of new team member to send them an invitation to join your team.',
    fields: formFields,
    schema: addTeamMemberSchema,
    submitLabel: 'Send Invitation',
    layout: 'grid',
    onCancel: () => router.back(),
    cancelLabel: 'Cancel',
    onSubmit: async (data: AddTeamMemberFormData) => {
      if (!user?.organizationId) {
        throw new Error('Organization ID is missing');
      }
      await createMutation.mutateAsync({
        ...data,
        organizationId: user.organizationId,
      });
      router.push('/settings/team');
    },
  };

  return (
    <div className="flex mt-8 justify-center">
      <div className="w-full max-w-2xl">
        <ConfigForm config={formConfig} isLoading={rolesLoading} />
      </div>
    </div>
  );
}

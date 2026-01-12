'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editTeamMemberSchema, EditTeamMemberFormData } from '@/schemas/team.schema';
import { useTeamMember, useUpdateTeamMember, useRoles } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditTeamMemberFormData>({
    resolver: zodResolver(editTeamMemberSchema),
  });

  useEffect(() => {
    if (member) {
      reset({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        roleId: member.role_id,
        status: member.status as 'active' | 'inactive',
      });
    }
  }, [member, reset]);

  const onSubmit = async (data: EditTeamMemberFormData) => {
    try {
      await updateMutation.mutateAsync(data);
      router.push('/dashboard/teams');
    } catch (error) {
      console.error('Failed to update team member:', error);
    }
  };

  // Filter roles to show only Admin, Manager, Designer
  const filteredRoles = roles?.filter((role) =>
    ['admin', 'manager', 'designer'].includes(role.role.toLowerCase())
  );

  const InfoIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );

  if (memberLoading) {
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
          onClick={() => router.push('/dashboard/teams')}
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
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Edit Team Member</h1>
        <p className="mt-1 text-sm text-gray-500">
          Please update details to edit team member.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            {...register('first_name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            {...register('last_name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* User Role */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-700">User Role</label>
            <span className="text-gray-400 cursor-help" title="A team member can be either Admin, Manager or Designer.">
              <InfoIcon />
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            A team member can be either Admin, Manager or Designer.
          </p>
          <div className="flex gap-4">
            {filteredRoles?.map((role) => (
              <label key={role.id} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('roleId')}
                  value={role.id}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {role.role === 'admin' ? 'Admin' : role.role === 'manager' ? 'Manager' : 'Designer'}
                </span>
              </label>
            ))}
          </div>
          {errors.roleId && (
            <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
          )}
        </div>

        {/* Active Status */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-700">Active</label>
            <span className="text-gray-400 cursor-help" title="Mark member as active or inactive.">
              <InfoIcon />
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Mark member as active or inactive.
          </p>
          <div className="flex gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                {...register('status')}
                value="active"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                {...register('status')}
                value="inactive"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Inactive</span>
            </label>
          </div>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || rolesLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Edit Member'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

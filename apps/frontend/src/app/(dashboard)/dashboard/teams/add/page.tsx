'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addTeamMemberSchema, AddTeamMemberFormData } from '@/schemas/team.schema';
import { useCreateTeamMember, useRoles } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddTeamMemberFormData>({
    resolver: zodResolver(addTeamMemberSchema),
  });

  const onSubmit = async (data: AddTeamMemberFormData) => {
    try {
      await createMutation.mutateAsync(data);
      router.push('/dashboard/teams');
    } catch (error) {
      console.error('Failed to create team member:', error);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Add New Team Member</h1>
        <p className="mt-1 text-sm text-gray-500">
          Please fill in details of new team member to send them an invitation to join your team.
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
            {...register('firstName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            {...register('lastName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
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
            placeholder="member@example.com"
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

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || rolesLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
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

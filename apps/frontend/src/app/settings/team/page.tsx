'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRoles, useTeamMembers } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import type { TeamMember } from '@/services/api/team.service';
import { capitalizeFirst, filterAndSortRoles } from '@/utils/helpers';

/**
 * Team Listing Page
 * Design: https://designs.quicklabs.in/quick-certify/settings/account/team
 */
export default function TeamsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const { data: roles } = useRoles();

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
    sortBy: 'last_login_at',
    sortOrder: 'DESC',
  });

  const totalCount = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 0;
  // Filter out archived users and current logged-in user on frontend (backend should also filter, but adding safety check)
  const members = (data?.data || []).filter(
    (member) => member.status !== 'archived' && member.id !== user?.id && member.uuid !== user?.id,
  );

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
    //setCurrentPage(1); // Reset to first page on filter change
  };

  const handleRowClick = (member: TeamMember) => {
    // Disable click for invited users
    if (member.status === 'invited') {
      return;
    }
    // Navigate directly to edit page
    router.push(`/settings/team/${member.uuid || member.id}/edit`);
  };

  return (
    <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      {/* Header */}

      <div className="divide-y dark:divide-gray-700">
        <div className="flex-row items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4">
          <div>
            <h1 className="mr-3 form-title">Team</h1>
            <p className="form-subtitle">
              Manage all your existing <span className="font-bold">{members.length}</span> team
              member
              {totalCount !== 1 ? 's' : ''} or add a new one.
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="flex space-x-2 items-center w-full">
              <a type="button" href="/settings/team/add" className="btn-primary w-full">
                Add new member
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap pt-1 pb-4 border-t border-b border-gray-200 dark:border-gray-200 px-4 space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="items-center hidden mt-3 mr-4 text-sm font-medium text-gray-900 md:flex dark:text-white">
          Show records only for:
        </div>

        <div className="flex flex-wrap">
          {filterAndSortRoles(roles).map(({ label, value }) => {
            const inputId = `role-${value}`;

            return (
              <Link href="" key={value}>
                <div className="flex items-center mt-3 mr-4">
                  <input
                    id={inputId}
                    type="radio"
                    name="show-only"
                    checked={roleFilter === value}
                    onChange={() => handleRoleFilterChange(value)}
                    className="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                  <label
                    htmlFor={inputId}
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    {label}
                  </label>
                </div>
              </Link>
            );
          })}

          {roleFilter && (
            <button
              type="button"
              onClick={() => {
                setRoleFilter('');
                setCurrentPage(1);
              }}
              className="underline mt-3 mr-4 font-medium text-blue-600 hover:underline text-sm cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">
                User
              </th>
              <th scope="col" className="px-4 py-3">
                Role
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Last Login
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Added On
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  No team members found.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr
                  key={member.id || member.uuid}
                  className="border-b border-gray-200 dark:border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(member)}
                >
                  <th scope="row" className="px-4 py-2 form-text-normal">
                    <div className="flex items-center">
                      <span className="ml-2 hover:underline cursor-pointer">
                        {capitalizeFirst(member.first_name)} {capitalizeFirst(member.last_name)}
                      </span>
                    </div>
                  </th>
                  <td className="px-4 py-2">
                    <div className="inline-flex items-center bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        ></path>
                      </svg>{' '}
                      {getRoleDisplay(member.role?.role)}
                    </div>
                  </td>
                  <td className="px-4 py-2">{member.email}</td>
                  <td className="px-4 py-2 form-text-normal">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 mr-2 border rounded-full ${
                          member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></div>{' '}
                      <span className="capitalize">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">{formatDate(member.last_login_at)}</td>
                  <td className="px-4 py-2">{formatDate(member.createdAt)}</td>
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
    </div>
  );
}

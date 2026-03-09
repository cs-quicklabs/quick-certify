'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { useRoles, useTeamMembers } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/auth.store';
import type { TeamMember } from '@/services/api/team.service';
import { Pagination } from '@/components/ui/pagination';
import { capitalizeFirst, checkIfUserIsNonAdmin, filterAndSortRoles } from '@/utils/helpers';
import { X } from 'lucide-react';

/**
 * Team Listing Page
 * Design: https://designs.quicklabs.in/quick-certify/settings/account/team
 */
export default function TeamsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const { data: roles } = useRoles();

  // Authorization check - only Admin and Super Admin can access
  useEffect(() => {
    if (user && checkIfUserIsNonAdmin(user)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Use backend filtering instead of client-side
  const { data, isLoading } = useTeamMembers({
    page: currentPage,
    limit: pageSize,
    role: roleFilter || undefined,
    search: debouncedSearch || undefined,
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
  if (user && checkIfUserIsNonAdmin(user)) {
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
    // Navigate directly to edit page
    router.push(`/settings/team/${member.uuid || member.id}/edit`);
  };

  return (
    <>
      <div className="relative overflow-x-hidden bg-white shadow-md pb-0 sm:rounded-sm">
        {/* Header */}

        <div className="divide-y">
          <div className="flex-row items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4">
            <div>
              <h1 className="mr-3 form-title">Team</h1>
              <p className="form-subtitle">
                Manage all your existing <span className="font-bold">{members.length}</span> team
                member
                {totalCount !== 1 ? 's' : ''} or add a new one.
              </p>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="relative">
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4 text-blue-900" />
                  </button>
                )}
              </div>
              <a type="button" href="/settings/team/add" className="btn-primary whitespace-nowrap">
                Add new member
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap pt-1 pb-4 border-t border-b border-gray-200 px-4 space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="items-center hidden mt-3 mr-4 text-sm font-medium text-gray-900 md:flex">
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
                      className="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor={inputId} className="ml-2 text-sm font-medium text-gray-900">
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
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2">
                  User
                </th>
                <th scope="col" className="px-4 py-2">
                  Role
                </th>
                <th scope="col" className="px-4 py-2">
                  Email
                </th>
                <th scope="col" className="px-4 py-2">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 whitespace-nowrap">
                  Last Login
                </th>
                <th scope="col" className="px-4 py-2 whitespace-nowrap">
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
                    className="border-b border-gray-200 hover:bg-gray-100"
                    onClick={() => handleRowClick(member)}
                  >
                    <th scope="row" className="px-4 py-2 form-text-normal">
                      <div className="flex items-center">
                        <span className="hover:underline cursor-pointer">
                          {capitalizeFirst(member.first_name)} {capitalizeFirst(member.last_name)}
                        </span>
                      </div>
                    </th>
                    <td className="px-4 py-2">
                      <div className="inline-flex items-center bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded">
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
                          className={`w-3 h-3 mr-2 rounded-full ${
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
      </div>
      {/* Pagination */}
      <div className="flex justify-end px-4 py-3 border-t border-gray-200">
        {/* <p className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-medium">
            {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
          </span>{' '}
          to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
          <span className="font-medium">{totalCount}</span> members
        </p> */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      </div>
    </>
  );
}

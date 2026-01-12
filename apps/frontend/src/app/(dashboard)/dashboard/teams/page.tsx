'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTeamMembers } from '@/hooks/useTeam';

/**
 * Team Listing Page
 * Design: https://designs.quicklabs.in/quick-certify/settings/account/team
 */
export default function TeamsPage() {
  const [roleFilter, setRoleFilter] = useState<string>('');

  const { data, isLoading } = useTeamMembers({ limit: 100 });

  // Filter members by role
  const filteredMembers = useMemo(() => {
    if (!data?.data) return [];
    if (!roleFilter) return data.data;
    return data.data.filter((member) => {
      const role = member.role?.role?.toLowerCase();
      if (roleFilter === 'admin') {
        return role === 'admin' || role === 'super_admin';
      }
      return role === roleFilter.toLowerCase();
    });
  }, [data?.data, roleFilter]);

  const totalCount = data?.meta?.total || 0;

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your existing <span className="font-semibold text-gray-900">{totalCount}</span> team member{totalCount !== 1 ? 's' : ''} or add a new one.
          </p>
        </div>
        <Link
          href="/dashboard/teams/add"
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Add new member
        </Link>
      </div>

      {/* Filters */}
      <div className="px-6 pb-5 flex items-center gap-4">
        <span className="text-sm text-gray-600">Show records only for:</span>
        
        {/* Admin Radio */}
        <label className="inline-flex items-center cursor-pointer ml-2">
          <input
            type="radio"
            name="roleFilter"
            checked={roleFilter === 'admin'}
            onChange={() => setRoleFilter(roleFilter === 'admin' ? '' : 'admin')}
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
            onChange={() => setRoleFilter(roleFilter === 'manager' ? '' : 'manager')}
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
            onChange={() => setRoleFilter(roleFilter === 'designer' ? '' : 'designer')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className="ml-2 text-sm text-gray-700">Designers</span>
        </label>

        {/* Show All Link */}
        <button
          onClick={() => setRoleFilter('')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Show All
        </button>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No team members found.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/dashboard/teams/${member.uuid}`}
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
                        className={`w-2 h-2 rounded-full ${
                          member.status === 'active'
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

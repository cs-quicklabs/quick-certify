'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTeamMember } from '@/hooks/useTeam';

/**
 * Team Member Detail Page
 */
export default function TeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid as string;

  const { data: member, isLoading } = useTeamMember(uuid);

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
        <Link
          href={`/settings/team/${uuid}/edit`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit Member
        </Link>
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
                className={`w-2 h-2 rounded-full ${
                  member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
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
            <p className="mt-1 text-sm text-gray-900">{formatDate(member.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

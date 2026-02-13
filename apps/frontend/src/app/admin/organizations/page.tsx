'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useOrganizations, useDeleteOrganization } from '@/hooks/useOrganizationAdmin';
import type { Organization } from '@/services/api/organization-admin.service';
import { Pagination } from '@/components/ui/pagination';
import { capitalizeFirst } from '@/utils/helpers';
import { ConfirmationDialog } from '@/components';

/**
 * System Admin - Organizations Listing Page
 *
 * Allows system admins to view and permanently delete organizations
 */

const tableColumns = [
  { header: 'Organization', accessor: 'name' },
  { header: 'Owner', accessor: 'owner' },
  { header: 'Created On', accessor: 'createdAt', className: 'whitespace-nowrap' },
  { header: 'Actions', accessor: 'actions', className: 'text-right pr-6' },
];

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);
  const pageSize = 10;

  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useOrganizations({
    page: currentPage,
    limit: pageSize,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const deleteOrganization = useDeleteOrganization();

  // Authorization check - only system_admin can access
  useEffect(() => {
    if (user && user.role !== 'system_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Don't render if user is not authorized
  if (user && user.role !== 'system_admin') {
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

  // Get owner display name
  const getOwnerDisplay = (org: Organization) => {
    if (org.users.length == 0) return '—';
    const firstName = capitalizeFirst(org.users[0].first_name || '');
    const lastName = capitalizeFirst(org.users[0].last_name || '');
    return `${firstName} ${lastName}`.trim() || org.users[0].email;
  };

  const handleDeleteClick = (org: Organization, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrganizationToDelete(org);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!organizationToDelete) return;

    try {
      await deleteOrganization.mutateAsync(organizationToDelete.uuid);
      setDeleteModalOpen(false);
      setOrganizationToDelete(null);
    } catch {
      // Error handling is done by the mutation
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setOrganizationToDelete(null);
  };

  const organizations = paginatedData?.data ?? [];
  const meta = paginatedData?.meta ?? {
    total: 0,
    page: 1,
    limit: pageSize,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  function renderTableBody() {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-8 text-center">
            Loading...
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-8 text-center text-red-500">
            Failed to load organizations. Please try again.
          </td>
        </tr>
      );
    }

    if (organizations.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-8 text-center">
            No organizations found.
          </td>
        </tr>
      );
    }

    return organizations.map((org) => (
      <tr
        key={org.id || org.uuid}
        className="border-b border-gray-200 dark:border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <th scope="row" className="px-4 py-2 form-text-normal">
          <div className="flex items-center">
            <span className="ml-2">{org.name}</span>
          </div>
        </th>
        <td className="px-4 py-2">
          <div className="flex flex-col">
            <span>{getOwnerDisplay(org)}</span>
            {org.users[0].email && (
              <span className="text-xs text-gray-400">{org.users[0].email}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-2">{formatDate(org.createdAt)}</td>
        <td className="px-4 py-2 text-right">
          <button
            type="button"
            onClick={(e) => handleDeleteClick(org, e)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            Delete
          </button>
        </td>
      </tr>
    ));
  }

  return (
    <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      {/* Header */}
      <div className="divide-y dark:divide-gray-700">
        <div className="flex-row items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4">
          <div>
            <h1 className="mr-3 form-title">Organizations</h1>
            <p className="form-subtitle">
              Manage all <span className="font-bold">{meta.total}</span> organization
              {meta.total > 1 ? 's' : ''} on the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {tableColumns.map((column) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className={`px-4 py-3 ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          totalCount={meta.total}
          pageSize={pageSize}
          variant="compact"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        className="p-3 max-w-md rounded-sm"
        isOpen={deleteModalOpen && !!organizationToDelete}
        title="Delete Organization"
        message={
          <>
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold">{organizationToDelete?.name}</span>? This action cannot
            be undone and will delete all associated data including users, credentials, and
            settings.
          </>
        }
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting..."
        cancelLabel="Cancel"
        isLoading={deleteOrganization.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

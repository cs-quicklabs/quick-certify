'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Team Member Detail Page
 * Redirects to edit page - detail page has been removed
 */
export default function TeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid as string;

  // Redirect to edit page
  useEffect(() => {
    if (uuid) {
      router.replace(`/settings/team/${uuid}/edit`);
    } else {
      router.replace('/settings/team');
    }
  }, [uuid, router]);

  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>
  );
}

'use client';

import React from 'react';
import PublicHeader from '../../_components/header';
import PublicFooter from '../../_components/footer';
import { usePublicOrganization } from '@/hooks/usePublic';
import { OrgPageState } from '../../_components/orgPageState';

export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const { data: org, isLoading, error } = usePublicOrganization(slug);

  if (isLoading) return <OrgPageState isLoading />;
  if (error) return <OrgPageState error={error} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader slug={slug} logoUrl={org?.logo_url} orgName={org?.name} />
      <main className="flex-1">{children}</main>
      <PublicFooter logoUrl={org?.logo_url} orgName={org?.name} slogan={org?.slogan} slug={slug} />
    </div>
  );
}

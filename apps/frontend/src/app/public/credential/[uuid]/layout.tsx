'use client';

import React from 'react';
import PublicHeader from '../../_components/header';
import PublicFooter from '../../_components/footer';
import { usePublicCredential } from '@/hooks/usePublic';

export default function CredentialLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ uuid: string }>;
}) {
  const resolvedParams = React.use(params);
  console.log('resolved params:', resolvedParams); // log the whole object
  const { uuid } = resolvedParams;
  const { data: credential } = usePublicCredential(uuid);
  console.log('layout uuid:', uuid);
  console.log('layout credential:', credential);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader
        slug={credential?.organization.slug ?? ''}
        logoUrl={credential?.organization.logoUrl}
        orgName={credential?.organization.name}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter
        logoUrl={credential?.organization.logoUrl}
        orgName={credential?.organization.name}
        slogan={credential?.organization.slogan}
        slug={credential?.organization.slug ?? ''}
      />
    </div>
  );
}

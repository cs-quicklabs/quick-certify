'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { credentialService } from '@/services/api/credential.service';
import { CREDENTIAL_KEYS } from '@/hooks/useCredentials';
import { ROUTES } from '@/config/routes';
import { Award, Download, Link as LinkIcon, Check, Mail, GithubIcon } from 'lucide-react';

interface PublicCredentialPageProps {
  params: Promise<{ uuid: string }>;
}

export default function PublicCredentialPage({ params }: PublicCredentialPageProps) {
  const { uuid } = use(params);
  const [copied, setCopied] = useState(false);

  const {
    data: credential,
    isLoading,
    error,
  } = useQuery({
    queryKey: CREDENTIAL_KEYS.publicDetail(uuid),
    queryFn: () => credentialService.getPublicCredential(uuid),
    enabled: !!uuid,
  });

  const getCredentialUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const handleAddToLinkedIn = () => {
    if (!credential) return;
    const issueDate = credential.issuedDate ? new Date(credential.issuedDate) : new Date();
    const linkedInParams = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: credential.eventName,
      organizationName: credential.organization.name,
      issueYear: issueDate.getFullYear().toString(),
      issueMonth: (issueDate.getMonth() + 1).toString(),
      certUrl: getCredentialUrl(),
      certId: credential.uuid,
    });
    window.open(
      `https://www.linkedin.com/profile/add?${linkedInParams.toString()}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCredentialUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  const handleDownload = () => {
    if (!credential?.certificatePdfUrl) return;
    const link = document.createElement('a');
    link.href = credential.certificatePdfUrl;
    link.download = `${credential.eventName}-Certificate.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Award className="h-12 w-12 text-gray-300 mx-auto" />
          <h1 className="text-xl font-semibold text-gray-900">Credential Not Found</h1>
          <p className="text-sm text-gray-500">
            This credential may have been removed or is not publicly available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex flex-col border-b border-gray-200 bg-white antialiased">
        <nav className="order-1 mx-auto w-full max-w-7xl bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link href={credential.organization.website || ''} className="mr-6 flex">
                {credential.organization.logoUrl ? (
                  <img
                    src={credential.organization.logoUrl}
                    className="mr-3 h-8 object-contain"
                    alt={credential.organization.name}
                  />
                ) : (
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <span className="self-center whitespace-nowrap text-2xl font-semibold">
                  {credential.organization.name}
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-between lg:order-2">
              <ul className="mr-4 mt-0 hidden w-full flex-col text-base font-medium text-gray-900 md:flex md:flex-row">
                <li>
                  <Link href={ROUTES.PUBLIC.COMPANY} className="px-4 py-3 hover:underline">
                    Issuer Profile
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.PUBLIC.EVENT} className="px-4 py-3 hover:underline">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.PUBLIC.RECIPIENTS} className="px-4 py-3 hover:underline">
                    Recipients
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex min-h-full flex-col bg-gray-50">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          {/* Credential Image */}
          {credential.certificateUrl ? (
            <img src={credential.certificateUrl} className="w-full rounded-sm" alt="Credential" />
          ) : (
            <div className="flex items-center justify-center rounded-sm bg-gray-100 py-20">
              <p className="text-sm text-gray-400">Certificate image not available</p>
            </div>
          )}
          <div className="flex w-full items-center justify-between">
            <p className="mt-1 text-xs font-normal text-gray-500">
              Credential ID:{' '}
              <span className="cursor-pointer text-green-700 hover:underline">
                {credential.uuid}
              </span>
            </p>
            <p className="mt-1 text-xs font-normal text-gray-500">
              Distributed By:{' '}
              <span className="cursor-pointer font-bold text-gray-900 hover:underline">
                Quick Certify
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-gray-50">
        {/* 3 column wrapper */}
        <div className="mx-auto w-full max-w-7xl grow bg-gray-50 lg:flex xl:px-2">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 xl:flex">
            <div className="py-6 lg:w-96 lg:pl-8 xl:shrink-0 xl:pl-4">
              {/* Left column area - Issued To Card */}
              <div className="overflow-hidden rounded-sm border border-gray-100 bg-white">
                <div className="flex flex-col gap-3 overflow-hidden rounded-sm border border-gray-200 bg-white p-4 md:p-4">
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-medium uppercase leading-6 text-blue-500">
                        Issued to
                      </h4>
                      <h2 className="text-2xl font-medium">{credential.recipientName}</h2>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <button
                      type="button"
                      onClick={handleAddToLinkedIn}
                      className="me-2 w-full justify-center rounded-sm border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                      Add to Linkedin Profile
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center rounded-sm border border-gray-200 p-2.5 text-center text-sm font-medium hover:border-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center rounded-sm border border-gray-200 p-2.5 text-center text-sm font-medium hover:border-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <LinkIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy link</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <p className="text-sm leading-6">Want to report a typo or a mistake?</p>
                    <p className="text-gray-500">
                      <a
                        href={
                          credential.organization.website
                            ? `mailto:${credential.organization.website}`
                            : '#'
                        }
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                      >
                        <Mail className="me-1 h-4 w-4" />
                        Contact Issuer
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-6 lg:pl-8 xl:flex-1 xl:pl-6">
              {/* Main area - Issued By Card */}
              <div className="flex flex-col gap-3 overflow-hidden rounded-sm border border-gray-200 bg-white p-4 md:p-4">
                <div className="flex w-full justify-between">
                  <div className="flex min-h-14 w-full items-center gap-3">
                    <div className="flex w-full flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium uppercase leading-6 text-blue-500">
                          Issued by
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        <h2 className="text-2xl font-medium leading-[26px]">
                          {credential.organization.name}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
                {credential.organization.description && (
                  <p className="text-sm leading-6">{credential.organization.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <Link href={ROUTES.PUBLIC.HOME} className="flex items-center">
                {credential.organization.logoUrl ? (
                  <img
                    src={credential.organization.logoUrl}
                    className="mr-3 h-8 object-contain"
                    alt={credential.organization.name}
                  />
                ) : (
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </Link>
              <span className="self-center whitespace-nowrap text-2xl font-semibold">
                {credential.organization.name}
              </span>
              {credential.organization.slogan && (
                <p className="mt-1 text-sm font-normal text-gray-500">
                  {credential.organization.slogan}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-6">
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900">Directories</h2>
                <ul className="text-sm text-gray-600">
                  <li className="mb-4">
                    <Link href={ROUTES.PUBLIC.EVENT} className="hover:underline">
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PUBLIC.RECIPIENTS} className="hover:underline">
                      Recipients
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900">Credentials</h2>
                <ul className="text-sm text-gray-600">
                  <li className="mb-4">
                    <Link href={ROUTES.PUBLIC.VERIFY} className="hover:underline">
                      Credentials Verification
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PUBLIC.RETRIEVE} className="hover:underline">
                      Credentials Retrieval
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500 sm:text-center">
              &copy; {new Date().getFullYear()}{' '}
              <Link href={ROUTES.PUBLIC.HOME} className="hover:underline">
                Quick Certify
              </Link>
              . All Rights Reserved.
            </span>
            <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

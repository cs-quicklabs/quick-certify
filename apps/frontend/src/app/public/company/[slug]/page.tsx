'use client';

import {
  usePublicGetRecentIssuedCredentials,
  usePublicOrganization,
  usePublicSendEmail,
} from '@/hooks/usePublic';
import { LinkedIn, X } from '@/utils/icons';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Credential } from '@/types';
import Link from 'next/link';

export default function PublicCompanyPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, error } = usePublicOrganization(slug);
  const {
    data: recentCredentials,
    isLoading: isLoadingCredentials,
    error: credentialsError,
  } = usePublicGetRecentIssuedCredentials(slug, {
    page: 1,
    limit: 3,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  if (isLoading) return <OrgLoadingState />;
  if (error) return <OrgErrorState message={error.message} />;
  if (!data) return <OrgNotFoundState />;

  const organization = data;
  const credentials = (recentCredentials?.data ?? []) as Credential[];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Card */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="relative">
          <Image
            src={
              organization.banner_url ||
              'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
            }
            alt="Company banner"
            width={1950}
            height={400}
            className="h-32 w-full object-cover lg:h-48"
          />
          <Image
            src={organization.logo_url || 'https://flowbite.s3.amazonaws.com/logo.svg'}
            alt={`${organization.name} Logo`}
            width={80}
            height={80}
            className="absolute left-6 -bottom-10 rounded-full border-4 border-white bg-white"
          />
        </div>
        <div className="px-6 pb-4 pt-12">
          <h2 className="truncate text-2xl font-bold text-gray-900 sm:text-3xl">
            {organization.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {organization.slogan || 'IT Services and Consulting'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-8 lg:flex-row">
        {/* Left Column */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded border border-gray-200 bg-white p-4">
            <h4 className="mb-2 font-medium text-gray-700">About</h4>
            <p className="text-sm text-gray-600">{organization.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {organization.website && (
              <InfoItem title="Website">
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {organization.website.replace(/^https?:\/\//, '')}
                </a>
              </InfoItem>
            )}

            {organization.support_email && (
              <InfoItem title="Email">
                <a
                  href={`mailto:${organization.support_email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {organization.support_email}
                </a>
              </InfoItem>
            )}

            {organization.support_phone && (
              <InfoItem title="Phone">
                <p className="text-sm text-gray-600">{organization.support_phone}</p>
              </InfoItem>
            )}

            {organization.linkedin_url && (
              <InfoItem title="LinkedIn">
                <a
                  href={organization.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <LinkedIn className="w-4 h-4" />
                  {organization.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </InfoItem>
            )}

            {organization.twitter_url && (
              <InfoItem title="X">
                <a
                  href={organization.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <X className="w-4 h-4" />
                  {organization.twitter_url.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </InfoItem>
            )}

            <InfoItem title="Browse">
              <div className="flex flex-col gap-1">
                <Link
                  href={`/public/company/${slug}/events`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  → View all Events
                </Link>
                <Link
                  href={`/public/company/${slug}/recipients`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  → View all Recipients
                </Link>
              </div>
            </InfoItem>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-1 flex-col gap-6">
          <RecentCertificates
            credentials={credentials}
            isLoading={isLoadingCredentials}
            error={credentialsError}
          />
          <ContactForm organizationName={organization.name} slug={slug} />
        </div>
      </div>
    </div>
  );
}

// Skeleton Components
function OrgHeaderSkeleton() {
  return (
    <div className="mx-auto max-w-7xl overflow-hidden rounded-sm border border-gray-200 bg-white animate-pulse">
      <div className="relative">
        <div className="h-32 lg:h-48 bg-gray-200" />
        <div className="absolute left-6 -bottom-10 h-20 w-20 rounded-full bg-gray-300 border-4 border-white" />
      </div>
      <div className="px-6 pb-4 pt-12 space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

function InfoSectionSkeleton() {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 animate-pulse space-y-3">
      <div className="h-5 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

function ContactInfoSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function RecentCertificatesSkeleton() {
  return (
    <ul className="divide-y divide-gray-100 rounded-sm border border-gray-200 bg-white">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex gap-3 p-4 animate-pulse">
          <div className="h-14 w-20 bg-gray-200 rounded-sm" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// State Components

function OrgLoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <OrgHeaderSkeleton />
      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <InfoSectionSkeleton />
          <ContactInfoSkeleton />
        </div>
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <div className="mb-3 h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
            <RecentCertificatesSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600">Error: {message}</p>
      </div>
    </div>
  );
}

function OrgNotFoundState() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Organization not found</p>
      </div>
    </div>
  );
}

// Helper Components

function InfoItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mb-1 font-medium text-gray-700">{title}</h5>
      {children}
    </div>
  );
}

function RecentCertificates({
  credentials,
  isLoading,
  error,
}: {
  credentials: Credential[];
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <div>
      <h4 className="mb-3 text-lg font-semibold text-gray-800">Recent Certificates Issued</h4>

      {isLoading ? (
        <RecentCertificatesSkeleton />
      ) : error ? (
        <div className="rounded-sm border border-gray-200 bg-white p-4">
          <p className="text-sm text-red-600">Failed to load recent certificates</p>
        </div>
      ) : credentials.length > 0 ? (
        <ul className="divide-y divide-gray-100 rounded-sm border border-gray-200 bg-white">
          {credentials.map((credential) => (
            <li key={credential.uuid} className="flex gap-3 p-4">
              <Image
                src={credential.certificate_url || '/credential/image_720.png'}
                alt="Certificate thumbnail"
                width={80}
                height={56}
                className="h-14 w-20 rounded-sm border object-cover shadow-md"
              />
              <div>
                <div className="font-medium text-gray-900">
                  {credential.event?.name || 'Certificate'}
                </div>
                <div className="text-xs text-gray-500">{credential.issued_date}</div>
                <div className="mt-1 text-xs text-gray-500">
                  Issued to {credential.recipient?.name || 'Recipient'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-sm border border-gray-200 bg-white p-8">
          <p className="text-center text-sm text-gray-500">No certificates issued yet</p>
        </div>
      )}
    </div>
  );
}

function ContactForm({ organizationName, slug }: { organizationName: string; slug: string }) {
  const sendEmailMutation = usePublicSendEmail(slug);

  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    if (sendEmailMutation.isPending) {
      setFormStatus({ type: 'loading' });
    } else if (sendEmailMutation.isSuccess) {
      setFormStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.',
      });
      setFormState({ name: '', email: '', message: '' });
      setTimeout(() => {
        setFormStatus({ type: 'idle' });
        sendEmailMutation.reset();
      }, 5000);
    } else if (sendEmailMutation.isError) {
      setFormStatus({
        type: 'error',
        message:
          sendEmailMutation.error instanceof Error
            ? sendEmailMutation.error.message
            : 'Failed to send message',
      });
    }
  }, [
    sendEmailMutation.isPending,
    sendEmailMutation.isSuccess,
    sendEmailMutation.isError,
    sendEmailMutation.error,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailMutation.mutate(formState);
  };

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h4 className="mb-4 font-semibold text-gray-800">Contact {organizationName}</h4>

      {formStatus.type === 'success' && (
        <div className="mb-4 rounded-sm bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          {formStatus.message}
        </div>
      )}

      {formStatus.type === 'error' && (
        <div className="mb-4 rounded-sm bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {formStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formState.name}
          onChange={handleInputChange}
          className="rounded-sm border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
          disabled={formStatus.type === 'loading'}
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formState.email}
          onChange={handleInputChange}
          className="rounded-sm border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
          disabled={formStatus.type === 'loading'}
        />
        <textarea
          name="message"
          placeholder="Write your message..."
          rows={4}
          value={formState.message}
          onChange={handleInputChange}
          required
          disabled={formStatus.type === 'loading'}
          className="resize-none rounded-sm border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={formStatus.type === 'loading'}
          className="mt-1 rounded-sm bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

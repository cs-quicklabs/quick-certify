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

export default function PublicCompanyPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, error } = usePublicOrganization(slug);
  const sendEmailMutation = usePublicSendEmail(slug);
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

  console.log(recentCredentials);
  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  // Sync mutation state with formStatus
  useEffect(() => {
    if (sendEmailMutation.isPending) {
      setFormStatus({ type: 'loading' });
    } else if (sendEmailMutation.isSuccess) {
      setFormStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.',
      });
      // Reset form
      setFormState({ name: '', email: '', message: '' });
      // Clear success message after 5 seconds
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailMutation.mutate(formState);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Organization not found</p>
        </div>
      </div>
    );
  }

  const organization = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Card */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="relative">
          {/* Banner */}
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

          {/* Logo */}
          <Image
            src={organization.logo_url || 'https://flowbite.s3.amazonaws.com/logo.svg'}
            alt={`${organization.name} Logo`}
            width={80}
            height={80}
            className="absolute left-6 -bottom-10 rounded-full border-4 border-white bg-white"
          />
        </div>

        {/* Company Info */}
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
          {/* About */}
          <div className="rounded border border-gray-200 bg-white p-4">
            <h4 className="mb-2 font-medium text-gray-700">About</h4>
            <p className="text-sm text-gray-600">{organization.description}</p>
          </div>

          {/* Contact Info */}
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
                  <LinkedIn className="w-4 h-4" />{' '}
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
                  <X className="w-4 h-4" />{' '}
                  {organization.twitter_url.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </InfoItem>
            )}
          </div>
        </div>

        {/* Right Column */}
        {/* Right Column */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Recent Certificates */}
          <div>
            <h4 className="mb-3 text-lg font-semibold text-gray-800">Recent Certificates Issued</h4>

            {isLoadingCredentials ? (
              <div className="rounded-sm border border-gray-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700"></div>
                </div>
              </div>
            ) : credentialsError ? (
              <div className="rounded-sm border border-gray-200 bg-white p-4">
                <p className="text-sm text-red-600">Failed to load recent certificates</p>
              </div>
            ) : recentCredentials?.data && recentCredentials.data.length > 0 ? (
              <ul className="divide-y divide-gray-100 rounded-sm border border-gray-200 bg-white">
                {recentCredentials.data.map((credential: Credential) => (
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

          {/* Contact Form */}
          <div className="rounded border border-gray-200 bg-white p-4">
            <h4 className="mb-4 font-semibold text-gray-800">Contact {organization.name}</h4>

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
        </div>
      </div>
    </div>
  );
}

/* Helper component */
function InfoItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mb-1 font-medium text-gray-700">{title}</h5>
      {children}
    </div>
  );
}

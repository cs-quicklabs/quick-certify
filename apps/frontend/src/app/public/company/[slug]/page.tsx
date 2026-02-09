'use client';

import { usePublicOrganization } from '@/hooks/usePublic';
import { LinkedIn, X } from '@/utils/icons';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function PublicCompanyPage() {
  const params = useParams();
  const slug = params?.slug as string; // Changed from uuid to slug

  const { data, isLoading, error } = usePublicOrganization(slug); // Changed from uuid to slug

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
          <div className="rounded border border-gray-200 bg-gray-50 p-4">
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
                  className="text-sm text-blue-600 hover:underline"
                >
                  {organization.website.replace(/^https?:\/\//, '')}
                </a>
              </InfoItem>
            )}

            {/* {organization.email && (
              <InfoItem title="Email">
                <a
                  href={`mailto:${organization.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {organization.email}
                </a>
              </InfoItem>
            )} */}

            {/* {organization.phone && (
              <InfoItem title="Phone">
                <p className="text-sm text-gray-600">{organization.phone}</p>
              </InfoItem>
            )} */}

            {organization.linkedin_url && (
              <InfoItem title="LinkedIn">
                <a
                  href={organization.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5
                text-sm text-blue-600 hover:underline"
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
                  className="flex items-center gap-1.5
                text-sm text-blue-600 hover:underline"
                >
                  <X className="w-4 h-4" />{' '}
                  {organization.twitter_url.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </InfoItem>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Recent Certificates */}
          <div>
            <h4 className="mb-3 text-lg font-semibold text-gray-800">Recent Certificates Issued</h4>

            <ul className="divide-y divide-gray-100 rounded-sm border border-gray-200 bg-white">
              {[
                {
                  title: 'Certificate of Excellence',
                  date: '25 Jun 2024',
                  issuedTo: 'Ankit Jain',
                },
                {
                  title: 'Top Performer Badge',
                  date: '18 Jun 2024',
                  issuedTo: 'Riya Shah',
                },
                {
                  title: 'Course Completion Certificate',
                  date: '04 Jun 2024',
                  issuedTo: 'Rahul Kumar',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3 p-4">
                  <Image
                    src="/credential/image_720.png"
                    alt="Certificate thumbnail"
                    width={80}
                    height={56}
                    className="h-14 w-20 rounded-sm border object-cover shadow-md"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                    <div className="mt-1 text-xs text-gray-500">Issued to {item.issuedTo}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Form */}
          <div className="rounded border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-4 font-semibold text-gray-800">Contact {organization.name}</h4>
            <form className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your Name"
                className="rounded-sm border border-gray-300 px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="rounded-sm border border-gray-300 px-3 py-2 text-sm"
                required
              />
              <textarea
                placeholder="Write your message..."
                rows={4}
                className="resize-none rounded-sm border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="mt-1 rounded-sm bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Send Message
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

'use client';

import Image from 'next/image';

export default function PublicCompanyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Card */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="relative">
          {/* Banner */}
          <Image
            src="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Company banner"
            width={1950}
            height={400}
            className="h-32 w-full object-cover lg:h-48"
          />

          {/* Logo */}
          <Image
            src="https://flowbite.s3.amazonaws.com/logo.svg"
            alt="Crownstack Logo"
            width={80}
            height={80}
            className="absolute left-6 -bottom-10 rounded-full border-4 border-white bg-white"
          />
        </div>

        {/* Company Info */}
        <div className="px-6 pb-4 pt-12">
          <h2 className="truncate text-2xl font-bold text-gray-900 sm:text-3xl">
            Crownstack Technologies
          </h2>
          <p className="mt-1 text-sm text-gray-500">IT Services and Consulting</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-8 lg:flex-row">
        {/* Left Column */}
        <div className="flex flex-1 flex-col gap-4">
          {/* About */}
          <div className="rounded border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 font-medium text-gray-700">About</h4>
            <p className="text-sm text-gray-600">
              Crownstack Technologies is a leading provider of digital solutions, offering expertise
              in enterprise software, web and mobile app development, and digital transformation for
              companies worldwide.
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoItem title="Website">
              <a
                href="https://crownstack.com"
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                crownstack.com
              </a>
            </InfoItem>

            <InfoItem title="Email">
              <a
                href="mailto:info@crownstack.com"
                className="text-sm text-blue-600 hover:underline"
              >
                info@crownstack.com
              </a>
            </InfoItem>

            <InfoItem title="Phone">
              <p className="text-sm text-gray-600">+91 12345 67890</p>
            </InfoItem>

            <InfoItem title="LinkedIn">
              <a
                href="https://linkedin.com/company/crownstack"
                target="_blank"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                linkedin.com/company/crownstack
              </a>
            </InfoItem>

            <InfoItem title="Twitter">
              <a
                href="https://twitter.com/crownstack"
                target="_blank"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                twitter.com/crownstack
              </a>
            </InfoItem>
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
                    src="/quick-certify/rashi.png"
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
            <h4 className="mb-4 font-semibold text-gray-800">Contact Crownstack</h4>
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
                className="mt-1 rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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

'use client';

import Link from 'next/link';

export default function PublicCompanyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="https://flowbite.s3.amazonaws.com/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-gray-900">Crownstack Technologies</span>
          </Link>

          <ul className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <li>
              <Link href="#" className="hover:text-blue-600">
                Issuer Profile
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-600">
                Events
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-600">
                Recipients
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* COVER + LOGO */}
      <section className="mx-auto max-w-7xl mt-6 bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="relative">
          {/* Cover image */}
          <img
            src="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?auto=format&fit=crop&w=1950&q=80"
            alt="Cover"
            className="h-32 w-full object-cover lg:h-48"
          />

          {/* Logo */}
          <img
            src="https://flowbite.s3.amazonaws.com/logo.svg"
            alt="Company logo"
            className="absolute left-6 -bottom-10 h-20 w-20 rounded-full border-4 border-white bg-white object-cover"
          />
        </div>

        <div className="pt-12 px-6 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Crownstack Technologies</h1>
          <p className="mt-1 text-sm text-gray-500">IT Services and Consulting</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl mt-6 bg-gray-50 rounded border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">
                Crownstack Technologies is a leading provider of digital solutions, offering
                expertise in enterprise software, web and mobile app development, and digital
                transformation for companies worldwide.
              </p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              <Info label="Website" value="crownstack.com" link />
              <Info label="Email" value="info@crownstack.com" link />
              <Info label="Phone" value="+91 12345 67890" />
              <Info label="LinkedIn" value="linkedin.com/company/crownstack" link />
              <Info label="Twitter" value="twitter.com/crownstack" link />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Recent Certificates */}
            <div className="bg-white rounded-md border border-gray-200">
              <h3 className="px-6 py-4 text-lg font-semibold text-gray-900 border-b">
                Recent Certificates Issued
              </h3>

              <ul className="divide-y">
                {[
                  {
                    title: 'Certificate of Excellence',
                    date: '25 Jun 2024',
                    name: 'Ankit Jain',
                  },
                  {
                    title: 'Top Performer Badge',
                    date: '18 Jun 2024',
                    name: 'Riya Shah',
                  },
                  {
                    title: 'Course Completion Certificate',
                    date: '04 Jun 2024',
                    name: 'Rahul Kumar',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4 p-6">
                    <img
                      src="/quick-certify/rashi.png"
                      alt="Certificate"
                      className="h-16 w-24 rounded border object-cover"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                      <p className="text-sm text-gray-500 mt-1">Issued to {item.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Crownstack</h3>

              <form className="space-y-4">
                <input
                  placeholder="Your Name"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
                <input
                  placeholder="Your Email"
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
                <textarea
                  rows={4}
                  placeholder="Write your message..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm resize-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Small helper component */
function Info({ label, value, link = false }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
      {link ? (
        <a href="#" className="text-blue-600 text-sm hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-600">{value}</p>
      )}
    </div>
  );
}

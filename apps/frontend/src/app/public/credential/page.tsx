'use client';

import Link from 'next/link';

// Credential data - this would typically come from API/props
const credentialData = {
  id: '019c617e-58c1-4de1-a975-73c20737580e',
  name: 'CC Badge - Life Long Learning',
  recipientName: 'Rashi Gupta',
  issuerName: 'Keka HR',
  issuerDescription:
    'Keka is a cloud-based HR platform that simplifies and automates various HR processes, including payroll, time tracking, employee benefits, and performance management.',
  issueDate: {
    month: 12, // December
    year: 2024,
  },
  credentialUrl: '', // Will be set dynamically based on current URL
  distributedBy: 'Quick Certify',
};

export default function PublicCredentialPage() {
  // Get the current credential URL
  const getCredentialUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || ''}/public/credential/${credentialData.id}`;
  };

  // Generate LinkedIn Add to Profile URL
  const getLinkedInUrl = () => {
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: credentialData.name,
      organizationName: credentialData.issuerName,
      issueYear: credentialData.issueDate.year.toString(),
      issueMonth: credentialData.issueDate.month.toString(),
      certUrl: getCredentialUrl(),
      certId: credentialData.id,
    });
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  };

  const handleAddToLinkedIn = () => {
    window.open(getLinkedInUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCredentialUrl());
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownload = () => {
    // Download the credential image
    const link = document.createElement('a');
    link.href = '/credential/image_720.png';
    link.download = `credential-${credentialData.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex flex-col border-b border-gray-200 bg-white antialiased">
        <nav className="order-1 mx-auto w-full max-w-7xl bg-white px-4 py-4 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link href="/" className="mr-6 flex">
                <img
                  src="https://flowbite.s3.amazonaws.com/logo.svg"
                  className="mr-3 h-8"
                  alt="Logo"
                />
                <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                  {credentialData.issuerName}
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-between lg:order-2">
              <ul className="mr-4 mt-0 hidden w-full flex-col text-base font-medium text-gray-900 md:flex md:flex-row dark:text-white">
                <li>
                  <Link
                    href="/public/company"
                    className="px-4 py-3 hover:underline dark:hover:text-blue-500"
                    aria-current="page"
                  >
                    Issuer Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/event"
                    className="px-4 py-3 hover:underline dark:hover:text-blue-500"
                    aria-current="page"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/recipients"
                    className="px-4 py-3 hover:underline dark:hover:text-blue-500"
                    aria-current="page"
                  >
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
          {/* Main area - Credential Image */}
          <img
            src="/credential/image_720.png"
            className="w-full rounded-sm"
            alt="Credential"
          />
          <div className="flex w-full items-center justify-between">
            <p
              className="mt-1 text-xs font-normal text-gray-500"
              id="file_input_help"
            >
              Credential ID:{' '}
              <span className="cursor-pointer text-green-700 hover:underline">
                {credentialData.id}
              </span>
            </p>
            <p
              className="mt-1 text-xs font-normal text-gray-500"
              id="file_input_help"
            >
              Distributed By:{' '}
              <span className="cursor-pointer font-bold text-gray-900 hover:underline">
                {credentialData.distributedBy}
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
                      <h2 className="text-2xl font-medium">{credentialData.recipientName}</h2>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn-blue inline-flex w-full items-center justify-center gap-x-1.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                        />
                      </svg>
                      Share Your Award
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <button
                      type="button"
                      onClick={handleAddToLinkedIn}
                      className="btn-secondary me-2 w-full justify-center"
                    >
                      Add to Linkedin Profile
                    </button>
                    <div className="flex gap-2">
                      <div className="hidden md:block">
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="inline-flex items-center rounded-sm border border-gray-200 p-2.5 text-center text-sm font-medium hover:border-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-gray-500 dark:hover:bg-blue-500 dark:hover:text-blue-800 dark:focus:ring-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          <span className="sr-only">Download</span>
                        </button>
                      </div>
                      <div className="flex-1 md:hidden">
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="inline-flex items-center rounded-sm border border-gray-200 p-2.5 text-center text-sm font-medium hover:border-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-gray-500 dark:hover:bg-blue-500 dark:hover:text-blue-800 dark:focus:ring-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          <span className="sr-only">Download</span>
                        </button>
                      </div>
                      <span>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="inline-flex items-center rounded-sm border border-gray-200 p-2.5 text-center text-sm font-medium hover:border-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-gray-500 dark:hover:bg-blue-500 dark:hover:text-blue-800 dark:focus:ring-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                            />
                          </svg>
                          <span className="sr-only">Copy link</span>
                        </button>
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <p className="text-sm leading-6">
                      Want to report a typo or a mistake?
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      <a href="#" className="link inline-flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="me-1 h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                          />
                        </svg>
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
                          {credentialData.issuerName}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-6">
                  {credentialData.issuerDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white p-4 sm:p-6 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <Link href="/" className="flex items-center">
                <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="mr-3 h-8"
                  alt="Logo"
                />
              </Link>
              <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                {credentialData.issuerName}
              </span>
              <p className="text-base">Building Sustainable Solutions</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-6">
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                  Directories
                </h2>
                <ul className="text-sm text-gray-600 dark:text-gray-400">
                  <li className="mb-4">
                    <Link href="/public/event" className="hover:underline">
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link href="/public/recipients" className="hover:underline">
                      Recipients
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                  Credentials
                </h2>
                <ul className="text-sm text-gray-600 dark:text-gray-400">
                  <li className="mb-4">
                    <Link href="/public/verify" className="hover:underline">
                      Credentials Verification
                    </Link>
                  </li>
                  <li>
                    <Link href="/public/retrieve" className="hover:underline">
                      Credentials Retrieval
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © 2025{' '}
              <Link href="/" className="hover:underline">
                Quick Certify
              </Link>
              . All Rights Reserved.
            </span>
            <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

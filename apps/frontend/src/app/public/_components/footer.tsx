'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Globe } from 'lucide-react';

const DIRECTORY_LINKS = [
  { label: 'Events', href: '/public/event' },
  { label: 'Recipients', href: '/public/recipients' },
];

const CREDENTIAL_LINKS = [
  { label: 'Credential Verification', href: '/verify' },
  { label: 'Credential Retrieval', href: '/retrieve' },
];

const SOCIAL_LINKS = [
  { href: 'https://github.com/cs-quicklabs/quickcertify', label: 'GitHub', icon: Github },
  { href: 'https://github.com/cs-quicklabs/quick-certify', label: 'Website', icon: Globe },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Top */}
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="https://flowbite.com/docs/images/logo.svg"
                alt="Crownstack Logo"
                width={32}
                height={32}
              />
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                Crownstack
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Building Sustainable Solutions
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 text-sm">
            {/* Directories */}
            <div>
              <h3 className="mb-4 font-semibold uppercase text-gray-900 dark:text-white">
                Directories
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                {DIRECTORY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Credentials */}
            <div>
              <h3 className="mb-4 font-semibold uppercase text-gray-900 dark:text-white">
                Credentials
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                {CREDENTIAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-200 dark:border-gray-700" />

        {/* Bottom */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            © 2025{' '}
            <Link href="/" className="hover:underline">
              Quick Certify
            </Link>
            . All rights reserved.
          </span>

          {/* Social */}
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                aria-label={label}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Globe } from 'lucide-react';
import { createRoute } from '@/config/routes';

type PublicFooterProps = {
  logoUrl?: string | null;
  orgName?: string | null;
  slogan?: string | null;
  slug: string;
};

// const CREDENTIAL_LINKS = [
//   { label: 'Credential Verification', href: '/verify' },
//   { label: 'Credential Retrieval', href: '/retrieve' },
// ];

const SOCIAL_LINKS = [
  { href: 'https://github.com/cs-quicklabs/quickcertify', label: 'GitHub', icon: Github },
  { href: 'https://github.com/cs-quicklabs/quick-certify', label: 'Website', icon: Globe },
];

export default function PublicFooter({ logoUrl, orgName, slogan, slug }: PublicFooterProps) {
  const displayName = orgName ?? 'Quick Certify';
  const DIRECTORY_LINKS = [
    { label: 'Events', href: createRoute.publicCompanyEvents(slug) },
    { label: 'Recipients', href: createRoute.publicCompanyRecipients(slug) },
    { label: 'Pathways', href: createRoute.publicPathways(slug) },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                  {displayName[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="text-2xl font-semibold text-gray-900">{displayName}</span>
            </Link>
            <p className="mt-2 text-sm text-gray-600">{slogan ?? ''}</p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <h3 className="mb-4 font-semibold uppercase text-gray-900">Directories</h3>
              <ul className="space-y-3 text-gray-600">
                {DIRECTORY_LINKS.map((link) => (
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

        <hr className="my-8 border-gray-200" />

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm text-gray-500">
            © 2025{' '}
            <Link href="/" className="hover:underline">
              Quick Certify
            </Link>
            . All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                aria-label={label}
                className="text-gray-500 hover:text-gray-900"
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

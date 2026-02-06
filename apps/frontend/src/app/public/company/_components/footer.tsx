'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Globe } from 'lucide-react';

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
            <div>
              <h3 className="mb-4 font-semibold uppercase text-gray-900 dark:text-white">
                Directories
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
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
              <h3 className="mb-4 font-semibold uppercase text-gray-900 dark:text-white">
                Credentials
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/verify" className="hover:underline">
                    Credential Verification
                  </Link>
                </li>
                <li>
                  <Link href="/retrieve" className="hover:underline">
                    Credential Retrieval
                  </Link>
                </li>
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

          <div className="flex items-center gap-5">
            <Link
              href="https://github.com"
              target="_blank"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <Github className="h-5 w-5" />
            </Link>

            <Link
              href="https://quickcertify.io"
              target="_blank"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <Globe className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

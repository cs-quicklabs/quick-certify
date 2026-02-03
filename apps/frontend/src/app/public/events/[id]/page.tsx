'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEvent } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';

export default function PublicEventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError } = useEvent(id);
  const event = data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Event not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex flex-col border-b border-gray-200 bg-white antialiased">
        <nav className="order-1 mx-auto w-full max-w-7xl bg-white px-4 py-4 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link href="/" className="mr-6 flex">
                <img src="/logo.png" className="mr-3 h-8" alt="Logo" />
                <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                  Quick Certify
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
                    href="/public/events"
                    className="px-4 py-3 hover:underline dark:hover:text-blue-500 font-medium text-blue-600"
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

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-sm border border-gray-200 bg-white p-6">
          <div className="mb-6 h-56 w-full bg-gray-100 rounded-sm flex items-center justify-center text-gray-400">
            <span className="text-sm">Event banner</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{event.name}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {event.event_type?.name || 'General'} • {new Date(event.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-6 prose max-w-none text-gray-700">
            <p>
              This is a public view for the event. More details about the event would appear here.
            </p>
            <p>
              Event ID: <code>{event.id}</code>
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            <Link href="/public/events" className="btn-outline px-4 py-2">
              Back to Events
            </Link>
            <button className="btn-blue px-4 py-2">Register</button>
          </div>
        </div>
      </main>
    </div>
  );
}

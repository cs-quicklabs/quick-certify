'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useEvents } from '@/hooks/useEvents';
import { useCredentials } from '@/hooks/useCredentials';
import { useDesignList } from '@/hooks/useDesigns';
import { ROUTES, createRoute } from '@/config/routes';
import type { Event } from '@/types';
import { RoleType } from '@/types';
import { Calendar, Users, Award, Palette, Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard Stats Card
 */
function StatsCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLoading ? (
            <Loader2 className="mt-2 w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          )}
        </div>
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
}

/**
 * Recent Events List
 */
function RecentEventsList({ events, isLoading }: { events: Event[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No events yet. Create your first event to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {events.slice(0, 5).map((event) => (
        <div
          key={event.uuid}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{event.name}</p>
            <p className="text-sm text-gray-500">
              {event.event_type?.name ?? 'No type'} &bull;{' '}
              {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href={createRoute.eventDetail(event.uuid)}
            className="ml-4 text-sm text-primary-600 hover:text-primary-700 font-medium shrink-0"
          >
            View
          </Link>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Page
 *
 * Main dashboard for authenticated users showing real data from APIs
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === RoleType.Designer) {
      router.replace(ROUTES.DESIGNS);
    }
  }, [user, router]);

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const { data: credentialsData, isLoading: credentialsLoading } = useCredentials({ limit: 1 });
  const { meta: designsMeta, loading: designsLoading } = useDesignList({ page: 1, limit: 1 });

  const totalEvents = eventsData?.meta?.total ?? 0;
  const totalCredentials = credentialsData?.meta?.total ?? 0;
  const totalDesigns = designsMeta?.total ?? 0;
  const recentEvents = eventsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here&apos;s an overview of your credential management platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Events', value: totalEvents, icon: Calendar, isLoading: eventsLoading },
          {
            title: 'Total Credentials',
            value: totalCredentials,
            icon: Award,
            isLoading: credentialsLoading,
          },
          { title: 'Total Designs', value: totalDesigns, icon: Palette, isLoading: designsLoading },
          {
            title: 'Active Events',
            value: recentEvents.filter((e) => e.is_active).length,
            icon: Users,
            isLoading: eventsLoading,
          },
        ].map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          </div>
          <div className="p-6">
            <RecentEventsList events={recentEvents} isLoading={eventsLoading} />
            <Link
              href={ROUTES.EVENTS}
              className="mt-4 block w-full py-2 text-sm text-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View all events →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  name: 'Create Event',
                  icon: Calendar,
                  color: 'bg-blue-500',
                  href: ROUTES.CREAT_EVENT,
                },
                {
                  name: 'Issue Credentials',
                  icon: Award,
                  color: 'bg-purple-500',
                  href: ROUTES.CREDENTIALS_ISSUE,
                },
                {
                  name: 'Manage Designs',
                  icon: Palette,
                  color: 'bg-green-500',
                  href: ROUTES.DESIGNS,
                },
                {
                  name: 'View Credentials',
                  icon: Users,
                  color: 'bg-orange-500',
                  href: ROUTES.CREDENTIALS,
                },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-3 ${action.color} rounded-lg mb-3`}>
                      <ActionIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

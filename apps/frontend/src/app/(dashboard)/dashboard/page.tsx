'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/auth.store';
import { useEvents } from '@/hooks/useEvents';
import { useCredentials } from '@/hooks/useCredentials';
import { useDesignList } from '@/hooks/useDesigns';
import { ROUTES } from '@/config/routes';
import { RoleType } from '@/types';
import { Calendar, Users, Award, Palette } from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentEventsList } from '@/components/dashboard/RecentEventsList';

/**
 * Dashboard Page
 *
 * Main dashboard for authenticated users showing real data from APIs
 */
export default function DashboardPage() {
  const router = useRouter();
  const user = useUser();

  const shouldRedirect = user?.role === RoleType.Designer || user?.role === RoleType.Manager;

  useEffect(() => {
    if (user?.role === RoleType.Designer) {
      router.replace(ROUTES.DESIGNS);
    } else if (user?.role === RoleType.Manager) {
      router.replace(ROUTES.EVENTS);
    }
  }, [user, router]);

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    enabled: !shouldRedirect,
  });
  const { data: credentialsData, isLoading: credentialsLoading } = useCredentials({
    limit: 1,
    enabled: !shouldRedirect,
  });
  const { meta: designsMeta, loading: designsLoading } = useDesignList({
    page: 1,
    limit: 1,
    enabled: !shouldRedirect,
  });

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
                  href: ROUTES.CREATE_EVENT,
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

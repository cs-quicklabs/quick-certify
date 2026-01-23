'use client';

import { useAuthStore } from '@/store/auth.store';
import { Calendar, Users, Award, TrendingUp } from 'lucide-react';

/**
 * Dashboard Stats Card
 */
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  trendLabel?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {trendLabel && (
            <p className={`mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendLabel}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Page
 *
 * Main dashboard for authenticated users
 */
export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Here&apos;s what&apos;s happening with your certificates today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events"
          value={12}
          icon={Calendar}
          trend="up"
          trendLabel="2 this week"
        />
        <StatsCard
          title="Total Participants"
          value={1248}
          icon={Users}
          trend="up"
          trendLabel="124 new"
        />
        <StatsCard
          title="Certificates Issued"
          value={856}
          icon={Award}
          trend="up"
          trendLabel="56 this month"
        />
        <StatsCard
          title="Verification Rate"
          value="94%"
          icon={TrendingUp}
          trend="up"
          trendLabel="2% increase"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Events</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Annual Tech Conference 2024', participants: 450, date: 'Jan 15, 2024' },
                { name: 'Leadership Workshop', participants: 32, date: 'Jan 10, 2024' },
                { name: 'Product Launch Webinar', participants: 180, date: 'Jan 5, 2024' },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.participants} participants • {event.date}
                    </p>
                  </div>
                  <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                    View
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
              View all events →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Create Event', icon: Calendar, color: 'bg-blue-500' },
                { name: 'Add Participants', icon: Users, color: 'bg-green-500' },
                { name: 'Issue Certificates', icon: Award, color: 'bg-purple-500' },
                { name: 'View Analytics', icon: TrendingUp, color: 'bg-orange-500' },
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`p-3 ${action.color} rounded-lg mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Loader2 } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}

export function StatsCard({ title, value, icon: Icon, isLoading }: StatsCardProps) {
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

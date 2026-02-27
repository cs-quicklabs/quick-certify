'use client';

import { PublicPathwayCredential } from '@/types';

interface ProgressOverviewProps {
  credentials: PublicPathwayCredential[];
}

export function ProgressOverview({ credentials }: ProgressOverviewProps) {
  const totalCount = credentials.length;
  const earnedCount = credentials.filter((c) => c.status === 'earned').length;
  const notEarnedCount = credentials.filter((c) => c.status === 'not_earned').length;
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // SVG donut chart calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const earnedArc = totalCount > 0 ? (earnedCount / totalCount) * circumference : 0;

  return (
    <div className="max-w-7xl mx-auto rounded-sm border border-gray-200 bg-white mt-4">
      <div className="p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Pathway Progress</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Donut Chart */}
          <div className="relative shrink-0">
            <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Background ring (gray) */}
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#d1d5db" strokeWidth="16" />
              {/* Earned ring (green) */}
              {earnedCount > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="16"
                  strokeDasharray={`${earnedArc} ${circumference - earnedArc}`}
                  strokeDashoffset="0"
                />
              )}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
              <span className="text-xs text-gray-500">Complete</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-green-50 rounded-sm p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-800">Earned</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{earnedCount}</p>
              <p className="text-xs text-green-600">of {totalCount} credentials</p>
            </div>
            <div className="bg-gray-50 rounded-sm p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm font-medium text-gray-700">Not Earned</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{notEarnedCount}</p>
              <p className="text-xs text-gray-500">of {totalCount} credentials</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {earnedCount}/{totalCount} credentials
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

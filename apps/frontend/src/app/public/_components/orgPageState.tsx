import { getApiErrorStatus, getApiErrorMessage } from '@/lib/api-error';

export function OrgPageState({ error, isLoading }: { error?: unknown; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <OrgHeaderSkeleton />
        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-8 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <InfoSectionSkeleton />
            <ContactInfoSkeleton />
          </div>
          <div className="flex flex-1 flex-col gap-6">
            <div>
              <div className="mb-3 h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
              <RecentCertificatesSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = getApiErrorStatus(error);

  const { title, message } = (() => {
    switch (status) {
      case 403:
        return {
          title: 'Page Unavailable',
          message: "This issuer hasn't enabled their public page.",
        };
      case 404:
        return { title: 'Not Found', message: 'Organization not found.' };
      default:
        return { title: 'Something went wrong', message: getApiErrorMessage(error) };
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-gray-700 text-lg font-medium">{title}</p>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

// Skeleton Components
function OrgHeaderSkeleton() {
  return (
    <div className="mx-auto max-w-7xl overflow-hidden rounded-sm border border-gray-200 bg-white animate-pulse">
      <div className="relative">
        <div className="h-32 lg:h-48 bg-gray-200" />
        <div className="absolute left-6 -bottom-10 h-20 w-20 rounded-full bg-gray-300 border-4 border-white" />
      </div>
      <div className="px-6 pb-4 pt-12 space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

function InfoSectionSkeleton() {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 animate-pulse space-y-3">
      <div className="h-5 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

function ContactInfoSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function RecentCertificatesSkeleton() {
  return (
    <ul className="divide-y divide-gray-100 rounded-sm border border-gray-200 bg-white">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex gap-3 p-4 animate-pulse">
          <div className="h-14 w-20 bg-gray-200 rounded-sm" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

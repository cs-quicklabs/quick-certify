'use client';

import { useSearchParams } from 'next/navigation';
import { EventForm } from '@/components/events/EventForm';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Edit Event Page
 */
function EditEventContent() {
  const searchParams = useSearchParams();
  const eventUuid = searchParams.get('id');
  const stepParam = searchParams.get('step');
  
  // Parse step from URL, default to 0 (first step)
  const initialStep = stepParam ? parseInt(stepParam, 10) : 0;

  if (!eventUuid) {
    return (
      <div className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12 text-red-500">
          <p>Event ID is required</p>
        </div>
      </div>
    );
  }

  return <EventForm mode="edit" eventUuid={eventUuid} initialStep={initialStep} />;
}

export default function EditEventPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        </div>
      }
    >
      <EditEventContent />
    </Suspense>
  );
}

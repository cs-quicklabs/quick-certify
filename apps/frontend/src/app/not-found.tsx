import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <FileX className="mx-auto h-24 w-24 text-gray-400" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>

        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="space-y-4">
          <div className="text-center mt-4">
            <Link href="/dashboard">
              <Button variant="primary" size="md">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center mt-4">
            <Link href="/login">
              <Button variant="outline" size="md">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

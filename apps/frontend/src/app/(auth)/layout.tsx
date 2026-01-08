import { Logo } from '@/components';

/**
 * Auth Layout
 *
 * Shared layout for authentication pages (login, signup, forgot-password, etc.)
 * Features a centered card design with logo
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      {/* Logo */}
      <div className="mb-6">
        <Logo size="lg" />
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Quick Certify. All rights reserved.</p>
      </div>
    </div>
  );
}


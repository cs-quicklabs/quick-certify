import { Logo } from '@/components';

/**
 * Auth Layout
 *
 * Shared layout for authentication pages (login, signup, forgot-password, etc.)
 * Features a centered card design with logo matching Flowbite design
 * Based on: https://designs.quicklabs.in/quick-certify/login
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0">
        {/* Logo */}
        <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <Logo size="lg" />
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          {children}
        </div>
      </div>
    </section>
  );
}

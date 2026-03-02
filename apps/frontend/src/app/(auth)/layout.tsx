import { Logo } from '@/components';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-gray-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0">
        {/* Logo */}
        <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
          <Logo size="lg" />
        </div>
        {children}
      </div>
    </section>
  );
}

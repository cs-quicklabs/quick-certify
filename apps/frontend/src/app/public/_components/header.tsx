import Link from 'next/link';

export default function PublicHeader() {
  return (
    <div>
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/public/company" className="flex items-center gap-3">
            <img src="https://flowbite.s3.amazonaws.com/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-gray-900">Crownstack Technologies</span>
          </Link>

          <ul className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <li>
              <Link href="company" className="hover:text-blue-600">
                Issuer Profile
              </Link>
            </li>
            <li>
              <Link href="events" className="hover:text-blue-600">
                Events
              </Link>
            </li>
            <li>
              <Link href="recipients" className="hover:text-blue-600">
                Recipients
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}

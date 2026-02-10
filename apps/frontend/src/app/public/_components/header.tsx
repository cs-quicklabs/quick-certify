import Link from 'next/link';

type PublicHeaderProps = {
  slug: string;
};

const getNavItems = (slug: string) => [
  { label: 'Issuer Profile', href: `/public/company/${slug}` },
  { label: 'Events', href: `/public/company/${slug}/events` },
  { label: 'Recipients', href: `/public/company/${slug}/recipients` },
];

export default function PublicHeader({ slug }: PublicHeaderProps) {
  const navItems = getNavItems(slug);

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/public/company/${slug}`} className="flex items-center gap-3">
          <img src="https://flowbite.s3.amazonaws.com/logo.svg" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-semibold text-gray-900">Crownstack Technologies</span>
        </Link>

        {/* Navigation */}
        <ul className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

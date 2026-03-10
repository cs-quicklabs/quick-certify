import Link from 'next/link';
import Image from 'next/image';
import { createRoute } from '@/config/routes';

type PublicHeaderProps = {
  slug: string;
  logoUrl?: string | null;
  orgName?: string | null;
};

const getNavItems = (slug: string) => [
  { label: 'Issuer Profile', href: createRoute.publicCompany(slug) },
  { label: 'Events', href: createRoute.publicCompanyEvents(slug) },
  { label: 'Recipients', href: createRoute.publicCompanyRecipients(slug) },
  { label: 'Pathways', href: createRoute.publicPathways(slug) },
];

export default function PublicHeader({ slug, logoUrl, orgName }: PublicHeaderProps) {
  const navItems = getNavItems(slug);

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href={`/public/company/${slug}`} className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={orgName ?? 'Logo'}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
              {orgName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          {orgName && <span className="text-xl font-semibold text-gray-900">{orgName}</span>}
        </Link>

        <ul className="md:flex gap-6 text-md font-medium px-4 text-gray-900">
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

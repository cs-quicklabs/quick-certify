'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarItem } from '../../types/sidebar.types';
import { profileSidebarItems } from '../../config/sidebar.config';

interface SidebarProps {
  items?: SidebarItem[];
}

export function Sidebar({ items = profileSidebarItems }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={isActive(item.href) ? 'selected-sidebar-nav' : 'sidebar-nav'}
        >
          {item.icon}
          <span className="truncate ml-2">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

import { ReactNode } from 'react';

export interface SidebarItem {
  name: string;
  label: string;
  href: string;
  icon: ReactNode;
}

export interface SidebarConfig {
  items: SidebarItem[];
}

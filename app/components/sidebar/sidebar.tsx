'use client';

import { 
  Home, 
  FileText, 
  Bookmark, 
  Search, 
  User, 
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from './sidebar-item';
import { UserInfo } from './user-info';

const sidebarItems = [
  {
    icon: Home,
    label: 'Dashboard',
    href: '/candidate/dashboard'
  },
  {
    icon: FileText,
    label: 'My Applications',
    href: '/candidate/applications'
  },
  {
    icon: Bookmark,
    label: 'Saved Jobs',
    href: '/candidate/saved-jobs'
  },
  {
    icon: Search,
    label: 'Search Jobs',
    href: '/jobs'
  },
  {
    icon: User,
    label: 'Profile',
    href: '/candidate/profile'
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    href: '/candidate/messages',
    badge: '3'
  }
] as const;

const bottomItems = [
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings'
  },
  {
    icon: HelpCircle,
    label: 'Help/Support',
    href: '/support'
  },
  {
    icon: LogOut,
    label: 'Logout',
    href: '/logout',
    variant: 'danger' as const
  }
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 hidden lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600">JobSeeker</span>
      </div>

      {/* User Info */}
      <UserInfo />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarItems.map((item) => (
          <SidebarItem 
            key={item.label} 
            {...item} 
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Bottom Items */}
      <div className="border-t p-4 space-y-1">
        {bottomItems.map((item) => (
          <SidebarItem
            key={item.label}
            {...item}
            active={pathname === item.href}
          />
        ))}
      </div>
    </aside>
  );
}
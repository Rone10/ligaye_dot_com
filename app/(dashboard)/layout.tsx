'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  FileSpreadsheet,
  MessageSquare,
  Settings,
  Search,
  BookMarked,
  GraduationCap,
  Heart,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const employerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'My Jobs', href: '/employer/jobs', icon: Briefcase },
  { label: 'Create Job', href: '/employer/jobs/create', icon: FileText },
  { label: 'Applicants', href: '/employer/applicants', icon: Users },
  { label: 'Company Profile', href: '/employer/company', icon: Building2 },
  { label: 'Tenders', href: '/employer/tenders', icon: FileSpreadsheet },
  // { label: 'Messages', href: '/employer/messages', icon: MessageSquare },
  { label: 'Settings', href: '/employer/settings', icon: Settings },
];

const candidateNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
  { label: 'Find Jobs', href: '/candidate/jobs', icon: Search },
  { label: 'My Applications', href: '/candidate/applications', icon: BookMarked },
  { label: 'My Resume', href: '/candidate/resume', icon: GraduationCap },
  { label: 'Saved Jobs', href: '/candidate/saved', icon: Heart },
  // { label: 'Messages', href: '/candidate/messages', icon: MessageSquare },
  { label: 'Settings', href: '/candidate/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Determine if we're in the employer section based on the URL path
  const isEmployer = pathname.startsWith('/employer');
  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEmployer ? 'Employer Portal' : 'Candidate Portal'}
          </h2>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
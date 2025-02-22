'use client';

import { useState } from 'react';
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
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  { label: 'Find Jobs', href: '/jobs', icon: Search },
  { label: 'My Applications', href: '/candidate/applications', icon: BookMarked },
  { label: 'My Resume', href: '#', icon: GraduationCap },
  { label: 'Saved Jobs', href: '#', icon: Heart },
  // { label: 'Messages', href: '/candidate/messages', icon: MessageSquare },
  { label: 'Settings', href: '#', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Determine if we're in the employer section based on the URL path
  const isEmployer = pathname.startsWith('/employer');
  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  const SidebarContent = () => (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Drawer */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r hidden lg:block overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
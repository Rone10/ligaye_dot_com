'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const employerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'My Jobs', href: '/employer/jobs', icon: Briefcase },
  { label: 'Post Job', href: '/employer/jobs/new', icon: FileText },
  { label: 'Applicants', href: '/employer/applicants', icon: Users },
  { label: 'Company Profile', href: '/employer/company', icon: Building2 },
  { label: 'Tenders', href: '/employer/tenders', icon: FileSpreadsheet },
  { label: 'Settings', href: '/employer/settings', icon: Settings },
];

const candidateNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
  { label: 'Find Jobs', href: '/jobs', icon: Search },
  { label: 'My Applications', href: '/candidate/applications', icon: BookMarked },
  { label: 'My Profile', href: '/candidate/profile', icon: GraduationCap },
  { label: 'Saved Jobs', href: '/candidate/saved-jobs', icon: Heart },
  { label: 'Settings', href: '/candidate/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Determine if we're in the employer section based on the URL path
  const isEmployer = pathname.startsWith('/employer');
  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  // Handle user logout
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      router.push('/sign-in');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log out",
      });
    }
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b">
        <h2 className="text-xl font-semibold">
          {isEmployer ? 'Employer Portal' : 'Candidate Portal'}
        </h2>
      </div>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <nav className="p-4 space-y-2 flex-1">
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
        
        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>
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
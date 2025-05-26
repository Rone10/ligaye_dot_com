'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav, type MainNavItem } from "./SidebarNav";
import { SidebarThemeToggle } from "./SidebarThemeToggle";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles,
  PanelLeft,
  PanelRight,
  LogOut,
  LayoutDashboard,
  Briefcase,
  FileText,
  User2,
  BookmarkIcon,
  Building2,
  Users,
  Menu,
  X,
  Gavel,
  Info,
  Mail,
  BookOpen,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { createClient } from '@/lib/supabase/client';

// Navigation items for different user roles
const candidateNavItems: MainNavItem[] = [
  { href: "/candidate", label: "Dashboard Overview", iconName: "LayoutDashboard" },
  { href: "/jobs", label: "Browse Jobs", iconName: "Search" },
  { href: "/candidate/applications", label: "My Applications", iconName: "Briefcase" },
  { href: "/candidate/saved-jobs", label: "Saved Jobs", iconName: "BookmarkIcon" },
  { href: "/candidate/profile?tab=resume", label: "My Resume", iconName: "FileText" },
  { href: "/candidate/profile", label: "Profile", iconName: "User2" },
];

const employerNavItems: MainNavItem[] = [
  { href: "/employer", label: "Dashboard Overview", iconName: "LayoutDashboard" },
  { href: "/employer/jobs/new", label: "Post a Job", iconName: "FileText" },
  { href: "/employer/jobs", label: "My Job Postings", iconName: "Briefcase" },
  { href: "/employer/profile", label: "Company Profile", iconName: "Building2" },
  { href: "/employer/jobs/applicants", label: "Applicants", iconName: "Users" },
];

const additionalNavItems: MainNavItem[] = [
  { href: "/tenders", label: "Tenders", iconName: "Gavel" },
  { href: "/about", label: "About", iconName: "Info" },
  { href: "/contact", label: "Contact", iconName: "Mail" },
  { href: "/blog", label: "Blog", iconName: "BookOpen" },
];

interface UnifiedSidebarProps {
  userRole: 'candidate' | 'employer';
}

interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
  userRole: 'candidate' | 'employer';
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarHeader({ isExpanded, onToggle, userRole, isMobileOpen, onMobileClose }: SidebarHeaderProps) {
  const title = userRole === 'candidate' ? 'Candidate Portal' : 'Employer Portal';
  
  return (
    <div className={cn("flex h-16 shrink-0 items-center border-b px-3", isExpanded ? "justify-between" : "justify-center")}>
      {isExpanded && (
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-[#1a1e2d]">
          <Sparkles className="h-7 w-7 text-[#4a6cfa]" />
          <span>{title}</span>
        </Link>
      )}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full hover:bg-[#4a6cfa]/10"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-[#1a1e2d]" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle} 
          className="hidden md:flex rounded-lg hover:bg-[#4a6cfa]/10 ml-auto"
        >
          {isExpanded ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    </div>
  );
}



interface SidebarUserProfileProps {
  isSidebarExpanded: boolean;
  userData: any;
  loading: boolean;
  onLogout: () => void;
}

function SidebarUserProfile({ isSidebarExpanded, userData, loading, onLogout }: SidebarUserProfileProps) {
  const userName = userData?.user_metadata?.first_name || 
                   userData?.user_metadata?.name || 
                   userData?.email?.split('@')[0] || 
                   'User';
  
  const userEmail = userData?.email || '';
  
  const getInitials = () => {
    if (!userName) return 'U';
    
    const initials = userData?.user_metadata?.first_name?.charAt(0) + userData?.user_metadata?.last_name?.charAt(0);
    return initials || userName.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className={`flex ${isSidebarExpanded ? 'items-center space-x-3' : 'justify-center'}`}>
        <Skeleton className="h-8 w-8 rounded-full" />
        {isSidebarExpanded && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        )}
      </div>
    );
  }

  if (!isSidebarExpanded) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Avatar className="h-full w-full">
                <AvatarImage src={userData?.user_metadata?.avatar_url} alt={userName} />
                <AvatarFallback className="bg-[#4a6cfa]/10 text-[#4a6cfa] text-xs font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{userName}</p>
            {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="mt-1 h-auto p-0 text-xs text-destructive hover:underline"
            >
              <LogOut className="mr-1.5 h-3 w-3" /> Log out
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex w-full items-center gap-2.5">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={userData?.user_metadata?.avatar_url} alt={userName} />
        <AvatarFallback className="bg-[#4a6cfa]/10 text-[#4a6cfa] text-xs font-semibold">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium leading-tight text-[#1a1e2d]">{userName}</p>
        {userEmail && (
          <p className="truncate text-xs leading-tight text-[#9aa3bc]">
            {userEmail}
          </p>
        )}
      </div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout}
              className="ml-auto shrink-0 rounded-lg hover:bg-[#4a6cfa]/10"
            >
              <LogOut className="h-5 w-5 text-[#9aa3bc]" />
              <span className="sr-only">Log out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Log out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function UnifiedSidebar({ userRole }: UnifiedSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserData(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width-value', isExpanded ? '16rem' : '4rem');
  }, [isExpanded]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = userRole === 'candidate' ? candidateNavItems : employerNavItems;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 left-4 z-50 md:hidden ${isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-[rgba(255,255,255,0.3)] bg-background/95 backdrop-blur-md shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-all duration-300 ease-in-out",
          "md:static",
          isExpanded ? "w-64" : "w-16",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      <SidebarHeader 
        isExpanded={isExpanded} 
        onToggle={toggleSidebar} 
        userRole={userRole}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      
      <ScrollArea className="flex-1 py-2">
        <SidebarNav 
          mainNavItems={navItems} 
          groupNavItems={[]} 
          additionalNavItems={additionalNavItems}
          isSidebarExpanded={isExpanded} 
        />
      </ScrollArea>
      
      <div className={cn("mt-auto space-y-2 border-t border-[rgba(255,255,255,0.3)] p-2", !isExpanded && "items-center flex flex-col")}>
        <SidebarThemeToggle isSidebarExpanded={isExpanded} />
        <SidebarUserProfile 
          isSidebarExpanded={isExpanded} 
          userData={userData}
          loading={loading}
          onLogout={handleLogout}
        />
      </div>
    </aside>
    </>
  );
} 
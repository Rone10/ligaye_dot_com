'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav, type MainNavItem, type GroupNavItem } from "./SidebarNav";
import { SidebarThemeToggle } from "./SidebarThemeToggle";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Sparkles,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Updated navigation items
const mainNavItemsData: MainNavItem[] = [
  { href: "/dashboard", label: "Dashboard", iconName: "Home" },
  { href: "/transactions", label: "Transactions", iconName: "BarChart3" },
  { href: "/bank-accounts", label: "Bank Accounts", iconName: "CheckSquare" },
  { href: "/banks", label: "Banks", iconName: "Users" },
  { href: "/currencies", label: "Currencies", iconName: "Bell" }, 
  { href: "/revaluations", label: "Revaluations", iconName: "Settings" },
  { href: "/impaired-capital", label: "Impaired Capital", iconName: "FileText" },
  { href: "/reports", label: "Reports", iconName: "LifeBuoy" }, 
];

const groupNavItemsData: GroupNavItem[] = [
  { href: "/group/kretya-studio", label: "Kretya Studio", dotColor: "bg-green-500" },
  { href: "/group/design-system", label: "Design System", dotColor: "bg-blue-500" },
  { href: "/group/kampus-biu", label: "Kampus BIU", dotColor: "bg-yellow-400" },
];

interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
}

function SidebarHeader({ isExpanded, onToggle }: SidebarHeaderProps) {
  return (
    <div className={cn("flex h-16 shrink-0 items-center border-b px-3", isExpanded ? "justify-between" : "justify-center")}>
      {isExpanded && (
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-7 w-7 text-primary" />
          <span>Kretya Studio</span>
        </Link>
      )}
      <Button variant="ghost" size="icon" onClick={onToggle} className="rounded-lg">
        {isExpanded ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </div>
  );
}

// Internal component for Search, rendered only when sidebar is expanded.
function SidebarSearchInputInternal() {
  return (
    <div className="relative mt-4 mb-2 px-4">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="w-full rounded-lg bg-muted pl-8 text-sm"
      />
    </div>
  );
}

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  // const user = await getUser(); // Fetching user data needs to be handled if Sidebar becomes client. 
                                // Consider a separate server component for user data or a global store.

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width-value', isExpanded ? '16rem' : '4rem');
    // Optional: Add body classes if needed for other global styles dependent on sidebar state
    // document.body.classList.toggle('sidebar-expanded', isExpanded);
    // document.body.classList.toggle('sidebar-collapsed', !isExpanded);
    // return () => {
    //   document.documentElement.style.removeProperty('--sidebar-width-value');
    //   document.body.classList.remove('sidebar-expanded', 'sidebar-collapsed');
    // };
  }, [isExpanded]);

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background shadow-lg transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16" // Simplified width: 16rem (256px) or 4rem (64px)
      )}
    >
      <SidebarHeader isExpanded={isExpanded} onToggle={toggleSidebar} />
      {isExpanded && <SidebarSearchInputInternal />}
      
      <ScrollArea className="flex-1 py-2">
        <SidebarNav mainNavItems={mainNavItemsData} groupNavItems={groupNavItemsData} isSidebarExpanded={isExpanded} />
      </ScrollArea>
      
      <div className={cn("mt-auto space-y-2 border-t p-2", !isExpanded && "items-center flex flex-col")}>
        <SidebarThemeToggle isSidebarExpanded={isExpanded} />
        <SidebarUserProfile isSidebarExpanded={isExpanded} /* user={user} */ />
      </div>
    </aside>
  );
} 
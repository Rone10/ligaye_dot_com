'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  Home,
  BarChart3,
  CheckSquare,
  Users,
  Bell,
  Settings,
  FileText,
  LifeBuoy,
  LayoutDashboard,
  Briefcase,
  User2,
  BookmarkIcon,
  Building2,
  Search,
  Gavel,
  Info,
  Mail,
  BookOpen,
  CreditCard,
  Tag
} from "lucide-react";

// Map of icon names to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  Home,
  BarChart3,
  CheckSquare,
  Users,
  Bell,
  Settings,
  FileText,
  LifeBuoy,
  LayoutDashboard,
  Briefcase,
  User2,
  BookmarkIcon,
  Building2,
  Search,
  Gavel,
  Info,
  Mail,
  BookOpen,
  CreditCard,
  Tag
};

export interface MainNavItem {
  href: string;
  label: string;
  iconName: string; // Changed from icon: LucideIcon
  badgeCount?: number;
}

export interface GroupNavItem {
  href: string;
  label: string;
  dotColor: string; // e.g., 'bg-green-500'
}

interface SidebarNavProps {
  mainNavItems: MainNavItem[];
  groupNavItems: GroupNavItem[];
  additionalNavItems?: MainNavItem[];
  isSidebarExpanded?: boolean; // Added prop
}

export function AdminSidebarNav({ mainNavItems, groupNavItems, additionalNavItems = [], isSidebarExpanded }: SidebarNavProps) {
  const pathname = usePathname();
  console.log('pathname', pathname);

  return (
    <nav className={cn("grid px-2", isSidebarExpanded ? "gap-y-6 lg:px-3" : "gap-y-1")}>
      {/* Menu Section */}
      <div>
        {isSidebarExpanded && (
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
            Menu
          </h3>
        )}
        <ul className="space-y-0.5">
          {mainNavItems.map((item) => {
            const IconComponent = iconMap[item.iconName];
            return (
              <li key={item.href}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out",
                          pathname === item.href
                            ? "bg-primary-blue text-white"
                            : "text-theme-gray-dark hover:bg-primary-blue/10 hover:text-theme-dark",
                          !isSidebarExpanded && "justify-center"
                        )}
                      >
                        {IconComponent && <IconComponent className="h-5 w-5 shrink-0" />}
                        {isSidebarExpanded && (
                           <span className="flex-1">{item.label}</span>
                        )}
                        {isSidebarExpanded && item.badgeCount && (
                          <Badge className="ml-auto rounded-full px-1.5 py-0 text-[10px] font-semibold">
                            {item.badgeCount}
                          </Badge>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {!isSidebarExpanded && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                        {item.badgeCount && <Badge className="ml-1.5 rounded-full px-1.5 py-0 text-[10px] font-semibold">{item.badgeCount}</Badge>}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Group Section - only shown if expanded */}
      {isSidebarExpanded && groupNavItems.length > 0 && (
        <div>
          {/* Separator line between MENU and GROUP */}
          <div className="mx-2 my-4 border-t border-theme-gray"></div>
          
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
            Group
          </h3>
          <ul className="space-y-0.5">
            {groupNavItems.map((item) => (
              <li key={item.href}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out",
                          pathname === item.href
                            ? "bg-primary-blue text-white"
                            : "text-theme-gray-dark hover:bg-primary-blue/10 hover:text-theme-dark",
                           !isSidebarExpanded && "justify-center"
                        )}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          <span className={cn("h-2.5 w-2.5 rounded-full", item.dotColor)} />
                        </span>
                        {isSidebarExpanded && (
                          <span className="flex-1">{item.label}</span>
                        )}
                        {isSidebarExpanded && (
                          <ChevronRight className="ml-auto h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
                        )}
                      </Link>
                    </TooltipTrigger>
                     {!isSidebarExpanded && (
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Navigation Items - only shown if expanded */}
      {isSidebarExpanded && additionalNavItems.length > 0 && (
        <div>
          {/* Separator line */}
          <div className="mx-2 my-4 border-t border-theme-gray"></div>
          
          <ul className="space-y-0.5">
            {additionalNavItems.map((item) => {
              const IconComponent = iconMap[item.iconName];
              return (
                <li key={item.href}>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out",
                            pathname === item.href
                              ? "bg-primary-blue text-white"
                              : "text-theme-gray-dark hover:bg-primary-blue/10 hover:text-theme-dark",
                            !isSidebarExpanded && "justify-center"
                          )}
                        >
                          {IconComponent && <IconComponent className="h-5 w-5 shrink-0" />}
                          {isSidebarExpanded && (
                             <span className="flex-1">{item.label}</span>
                          )}
                          {isSidebarExpanded && item.badgeCount && (
                            <Badge className="ml-auto rounded-full px-1.5 py-0 text-[10px] font-semibold">
                              {item.badgeCount}
                            </Badge>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {!isSidebarExpanded && (
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                          {item.badgeCount && <Badge className="ml-1.5 rounded-full px-1.5 py-0 text-[10px] font-semibold">{item.badgeCount}</Badge>}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
} 
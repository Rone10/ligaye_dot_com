'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  variant?: 'default' | 'danger';
}

export function SidebarItem({ 
  icon: Icon, 
  label, 
  href, 
  active, 
  badge,
  variant = 'default'
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active 
          ? 'bg-blue-50 text-blue-600' 
          : variant === 'danger'
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {badge && (
        <Badge 
          variant="secondary" 
          className={cn(
            'ml-auto',
            active ? 'bg-blue-100' : 'bg-gray-100'
          )}
        >
          {badge}
        </Badge>
      )}
    </Link>
  );
}
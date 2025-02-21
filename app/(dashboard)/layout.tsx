'use client';

import { Sidebar } from '@/app/components/sidebar/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
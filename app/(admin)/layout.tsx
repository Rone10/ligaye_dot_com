import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/lib/supabase/server";
import AdminSidebar from "./admin/_components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard - Ligaye.com",
  description: "Admin dashboard for Ligaye.com job board platform",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get logged-in user and profile
  const { user, isAdmin } = await getUserWithProfile();

  // Handle unauthorized access
  if (!user || !isAdmin) {
    redirect('/sign-in');
  }
  
  // New layout structure with Sidebar
  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:px-8">
          {/* Render children directly within the main scrollable area */}
          {children}
        </main>
      </div>
    </div>
  );
} 
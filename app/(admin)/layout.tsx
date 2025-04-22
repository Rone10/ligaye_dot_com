import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
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
  // Get logged-in user
  const user = await getUser();
  
  // Handle unauthorized access
  if (!user) {
    redirect('/sign-in');
  }
  
  // Check if user is admin
  if (user.user_metadata.role !== 'admin') {
    redirect('/sign-in'); // Or maybe redirect to a different unauthorized page? For now, sign-in.
  }
  
  // New layout structure with Sidebar
  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
      <AdminSidebar /> 
      <main className="flex-1 overflow-y-auto p-6 lg:px-8">
        {/* Render children directly within the main scrollable area */}
        {children}
      </main>
    </div>
  );
} 
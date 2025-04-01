import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

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
  
  // Check if user has a profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  
  if (!profile) {
    redirect('/sign-in');
  }
  
  if (profile.role !== 'admin') {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Ligaye.com Admin Panel</h1>
          <p className="text-gray-500">Manage users, jobs, and platform settings</p>
        </header>
        
        <main>{children}</main>
      </div>
    </div>
  );
} 
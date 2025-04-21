import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminUserProfileView, getAvailableSkills, getAllIndustries, getAllLocations } from "./_queries";
import { ProfileTabs } from "./_components/ProfileTabs";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{id: string}>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = (await params).id;
  const userData = await getAdminUserProfileView(id);

  if (!userData) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `User Profile: ${userData.profile.fullName} - Ligaye Admin`,
    description: `Manage profile for ${userData.profile.fullName}`,
  };
}

export default async function AdminUserProfilePage({ params }: PageProps) {
  // Get user ID from params
  const id = (await params).id;
  
  // Fetch user profile data
  const userData = await getAdminUserProfileView(id);
  
  if (!userData) {
    notFound();
  }
  
  // Fetch available skills, industries, and locations for selections
  const availableSkills = await getAvailableSkills();
  const allIndustries = await getAllIndustries();
  const allLocations = await getAllLocations();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center container mx-auto">
        <div>
          <div className="mb-3">
            <Link href="/users">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-4 w-4" />
                Back to Users
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">User Profile: {userData.profile.fullName}</h1>
          <p className="text-gray-500">
            Manage profile details and related information for this user
          </p>
        </div>
      </div>
      
      <div className="p-6 bg-white/70 backdrop-blur-md rounded-lg shadow-sm border border-gray-100">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{userData.profile.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium capitalize">{userData.profile.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{new Date(userData.profile.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated</p>
              <p className="font-medium">{new Date(userData.profile.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center">
                <span className={`font-medium ${userData.profile.deleted ? "text-red-600" : "text-green-600"}`}>
                  {userData.profile.deleted ? "Deleted" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile management tabs */}
        <div className="mt-8">
          <ProfileTabs 
            userData={userData} 
            profileId={id} 
            availableSkills={availableSkills} 
            allIndustries={allIndustries} 
            allLocations={allLocations} 
          />
        </div>
      </div>
    </div>
  );
} 
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminUserProfileView, getAvailableSkills, getAllIndustries, getAllLocations } from "./_queries";

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
      <div>
        <h1 className="text-2xl font-bold">User Profile: {userData.profile.fullName}</h1>
        <p className="text-gray-500">
          Manage profile details and related information for this user
        </p>
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
              <p className={`font-medium ${userData.profile.deleted ? "text-red-600" : "text-green-600"}`}>
                {userData.profile.deleted ? "Deleted" : "Active"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Placeholder for tabs and role-specific content */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">
            {userData.profile.role === "candidate" 
              ? "Candidate Profile" 
              : userData.profile.role === "employer" 
                ? "Employer Profile" 
                : "Admin Profile"}
          </h2>
          <p className="text-gray-500">
            This section would contain the full profile management interface with tabs for editing
            different sections of the user's profile.
          </p>
        </div>
      </div>
    </div>
  );
} 
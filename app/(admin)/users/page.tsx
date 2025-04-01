import { Metadata } from "next";
import { getAllUsers } from "./_queries";
import UsersTable from "./_components/users-table";

export const metadata: Metadata = {
  title: "Manage Users - Ligaye Admin",
  description: "Manage all users on the Ligaye.com platform",
};

export default async function UsersPage() {
  // Fetch all users
  const users = await getAllUsers();
  
  // Count total, active, and deleted users
  const totalUsers = users.length;
  const activeUsers = users.filter(user => !user.deleted).length;
  const deletedUsers = users.filter(user => user.deleted).length;
  
  // Count by role
  const candidateCount = users.filter(user => user.role === "candidate").length;
  const employerCount = users.filter(user => user.role === "employer").length;
  const adminCount = users.filter(user => user.role === "admin").length;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-gray-500">View and manage all users on the platform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
          <div className="text-xl font-bold text-blue-600">{totalUsers}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        
        <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
          <div className="flex gap-4">
            <div>
              <div className="text-xl font-bold text-green-600">{activeUsers}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="text-xl font-bold text-red-600">{deletedUsers}</div>
              <div className="text-sm text-gray-500">Deleted</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
          <div className="flex gap-4">
            <div>
              <div className="text-xl font-bold text-green-600">{candidateCount}</div>
              <div className="text-sm text-gray-500">Candidates</div>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="text-xl font-bold text-blue-600">{employerCount}</div>
              <div className="text-sm text-gray-500">Employers</div>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="text-xl font-bold text-purple-600">{adminCount}</div>
              <div className="text-sm text-gray-500">Admins</div>
            </div>
          </div>
        </div>
      </div>
      
      <UsersTable users={users} />
    </div>
  );
} 
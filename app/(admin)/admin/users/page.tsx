import { Metadata } from "next";
import { getAllUsers } from "./_queries";
import UsersTable from "./_components/users-table";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Manage Users - Ligaye Admin",
  description: "Manage all users on the Ligaye.com platform",
};

export default async function UsersPage() {
  // Fetch all users
  const users = await getAllUsers();

  // console.log('users', users)
  
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
        <p className="text-muted-foreground">View and manage all users on the platform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-primary-blue">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-secondary-green">{activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-destructive">{deletedUsers}</div>
            <div className="text-sm text-muted-foreground">Deleted</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-theme-dark">{adminCount}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-primary-blue">{candidateCount}</div>
            <div className="text-sm text-muted-foreground">Candidates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-primary-blue">{employerCount}</div>
            <div className="text-sm text-muted-foreground">Employers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-theme-dark">{adminCount}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
      </div>
      
      <UsersTable users={users} />
    </div>
  );
} 
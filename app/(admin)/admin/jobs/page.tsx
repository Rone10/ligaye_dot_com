import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, CheckCircle, XCircle, DollarSign, FileText } from "lucide-react";
import { JobsTable } from "./_components/JobsTable";
import { getJobsStats, getAdminJobs } from "./_queries";
import { JobFilters } from "./_components/JobFilters";

export const metadata: Metadata = {
  title: "Jobs Management | Admin",
  description: "Manage all job postings on the platform",
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    location?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const params = await searchParams;
  const stats = await getJobsStats();
  const { jobs, totalCount } = await getAdminJobs({
    status: params.status,
    search: params.search,
    location: params.location,
    page: params.page ? parseInt(params.page) : 1,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder as "asc" | "desc" | undefined,
  });

  const statCards = [
    {
      title: "Total Jobs",
      value: stats.total,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Jobs",
      value: stats.active,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Payment",
      value: stats.pendingPayment,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Draft Jobs",
      value: stats.draft,
      icon: FileText,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Expired Jobs",
      value: stats.expired,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Deleted Jobs",
      value: stats.deleted,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Jobs Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all job postings on the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <JobFilters />
          <JobsTable jobs={jobs} totalCount={totalCount} />
        </CardContent>
      </Card>
    </div>
  );
}
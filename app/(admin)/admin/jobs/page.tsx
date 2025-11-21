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
      color: "text-slate-600",
    },
    {
      title: "Active Jobs",
      value: stats.active,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Pending Payment",
      value: stats.pendingPayment,
      icon: DollarSign,
      color: "text-amber-600",
    },
    {
      title: "Draft Jobs",
      value: stats.draft,
      icon: FileText,
      color: "text-gray-500",
    },
    {
      title: "Expired Jobs",
      value: stats.expired,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Deleted Jobs",
      value: stats.deleted,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Jobs Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all job postings on the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow duration-200 border-gray-200/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color} opacity-70`} />
            </CardHeader>
            <CardContent className="pb-5">
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-gray-200/60">
        <CardHeader className="border-b border-gray-100 bg-gray-50/30">
          <CardTitle className="text-lg font-semibold">All Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <JobFilters />
          <JobsTable jobs={jobs} totalCount={totalCount} />
        </CardContent>
      </Card>
    </div>
  );
}
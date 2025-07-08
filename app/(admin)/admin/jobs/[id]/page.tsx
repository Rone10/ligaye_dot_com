import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getJobById } from "../_queries";
import { JobDetails } from "./_components/JobDetails";
import { JobActions } from "./_components/JobActions";

export const metadata: Metadata = {
  title: "Job Details | Admin",
  description: "View and manage job posting details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground mt-2">
              Posted by {job.employer?.companyName || "Unknown Company"}
            </p>
          </div>
          <JobActions job={job} />
        </div>

        <JobDetails job={job} />
      </div>
    </div>
  );
}
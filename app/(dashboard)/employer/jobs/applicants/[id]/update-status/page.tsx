import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UpdateStatusForm from "../_components/update-status-form"
import { getUser } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { getApplicationDetails } from "../_queries"

interface UpdateStatusPageProps {
  params: Promise<{ id: string }> // Next.js 15 props are promises
}

export default async function UpdateStatusPage({ params }: UpdateStatusPageProps) {
  // Check authentication and authorization
  const user = await getUser()
  
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/employer/jobs/applicants")
  }
  
  if (user.user_metadata?.role !== 'employer' && user.user_metadata?.role !== 'admin') {
    redirect("/dashboard")
  }
  
  // In Next.js 15 params are promises
  const paramValue = await params;
  const id = paramValue.id;
  
  // Get application details
  const applicationDetails = await getApplicationDetails(id)
  
  if (!applicationDetails) {
    notFound()
  }
  
  return (
    <div className="container py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Update Application Status</CardTitle>
          <CardDescription>
            Change the status of {applicationDetails.candidateName}&apos;s application for {applicationDetails.jobTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateStatusForm 
            applicationId={id}
            currentStatus={applicationDetails.status}
          />
        </CardContent>
      </Card>
    </div>
  )
} 
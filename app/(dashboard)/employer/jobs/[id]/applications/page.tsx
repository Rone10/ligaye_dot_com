import { getJobApplicationsData } from './_queries'
import { columns } from './_components/columns'
import { ApplicationsDataTable } from './_components/ApplicationsDataTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'

// Interface for page props according to base-knowledge.md Next.js 15 convention
interface PageProps {
    params: Promise<{ id: string }>; // params is the Promise wrapping the id object
}

export default async function JobApplicationsPage({ params }: PageProps) {
    // Await the params promise first, then access id
    const awaitedParams = await params;
    const jobId = awaitedParams.id; 
    
    // Fetch job applications data
    const { job, applications } = await getJobApplicationsData(jobId);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div className="mb-4">
                <Button variant="outline" size="sm" asChild className="text-sm">
                    <Link href={`/employer/jobs/${jobId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Job Details
                    </Link>
                </Button>
            </div>

            {/* Header Card */}
            <Card className="overflow-hidden shadow-sm border-[#e1e5f2]">
                <CardHeader className="bg-gray-50/70 p-5">
                    <CardTitle className="text-xl md:text-2xl font-semibold text-[#1a1e2d]">
                        Applications for: {job.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-[#9aa3bc]">
                        Review candidates who applied for this position.
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="p-5">
                    <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-[#4a6cfa]" />
                        <span className="text-lg font-medium text-[#1a1e2d]">
                            {applications.length} Application{applications.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Applications Table Card */}
             <Card className="overflow-hidden shadow-sm border-[#e1e5f2]">
                <CardContent className="p-0">
                    {/* Render the DataTable component */}
                    <ApplicationsDataTable columns={columns} data={applications} />
                </CardContent>
            </Card>
        </div>
    )
} 
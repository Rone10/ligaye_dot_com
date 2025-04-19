import Link from 'next/link'
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  ListFilter,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime, formatApplicationStatus } from '../_utils/formatters'
import { Badge } from '@/components/ui/badge'

interface ApplicationStat {
  status: string
  count: number
}

interface Application {
  id: string
  status: string
  appliedAt: string | Date
  candidateProfileId: string
  candidateName?: string | null
}

interface ApplicationsSummaryProps {
  jobId: string
  applicationStats: {
    byStatus: ApplicationStat[]
    total: number
  }
  recentApplications: Application[]
}

export default function ApplicationsSummary({
  jobId,
  applicationStats,
  recentApplications
}: ApplicationsSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications Card */}
        <Card className="shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9aa3bc]">Total Applications</p>
                <h3 className="text-2xl font-semibold text-[#1a1e2d] mt-1">
                  {applicationStats.total}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#4a6cfa]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Applications Card - Shows APPLIED status */}
        <Card className="shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9aa3bc]">New Applications</p>
                <h3 className="text-2xl font-semibold text-[#1a1e2d] mt-1">
                  {applicationStats.byStatus.find(s => s.status === 'APPLIED')?.count || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shortlisted Card */}
        <Card className="shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9aa3bc]">Shortlisted</p>
                <h3 className="text-2xl font-semibold text-[#1a1e2d] mt-1">
                  {applicationStats.byStatus.find(s => s.status === 'SHORTLISTED')?.count || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Scheduled Card */}
        <Card className="shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9aa3bc]">Interviews</p>
                <h3 className="text-2xl font-semibold text-[#1a1e2d] mt-1">
                  {(applicationStats.byStatus.find(s => s.status === 'INTERVIEW_SCHEDULED')?.count || 0) +
                   (applicationStats.byStatus.find(s => s.status === 'INTERVIEWED')?.count || 0)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href={`/employer/jobs/${jobId}/applications`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <span>All Applications</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {recentApplications.length > 0 ? (
            <div className="divide-y">
              {recentApplications.map((application) => {
                const statusInfo = formatApplicationStatus(application.status)
                
                return (
                  <Link 
                    key={application.id} 
                    href={`/employer/jobs/${jobId}/applications/${application.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {/* You can render a candidate initial or avatar here */}
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <Link href={`/employer/jobs/applicants/${application.id}`} className="font-medium hover:underline">
                            {application.candidateName || `Candidate ${application.candidateProfileId.slice(0, 8)}...`}
                          </Link>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock3 className="mr-1 h-3 w-3" />
                            {formatRelativeTime(application.appliedAt)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No applications received yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { getApplicationById } from './_queries'
import ApplicationDetailHeader from './_components/ApplicationDetailHeader'
import ApplicationDocuments from './_components/ApplicationDocuments'
import EmployerFeedback from './_components/EmployerFeedback'
import ApplicationWithdrawDialog from './_components/ApplicationWithdrawDialog'

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  // Get application ID from params
  const { id } = await params
  
  // Fetch application details
  const { data, error } = await getApplicationById(id)
  
  // Handle not found or errors
  if (error || !data) {
    notFound()
  }
  
  const { application, job, employer } = data
  
  // Check if application is already withdrawn or rejected
  const isWithdrawnOrRejected = application.status === 'WITHDRAWN' || application.status === 'REJECTED'
  
  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <Link 
        href="/candidate/applications" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Applications
      </Link>
      
      {/* Application header */}
      <ApplicationDetailHeader 
        application={application}
        job={job}
        employer={employer}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Documents section */}
          <ApplicationDocuments 
            resumeUrl={application.resumeUrl}
            resumeFilename={application.resumeFilename}
            coverLetterUrl={application.coverLetterUrl}
            coverLetterFilename={application.coverLetterFilename}
            coverLetterText={application.coverLetterText}
          />
          
          {/* Employer feedback */}
          <EmployerFeedback notes={application.notes} />
        </div>
        
        <div className="space-y-6">
          {/* Application status & actions */}
          <div className="glass-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Application Actions</h2>
              
              <div className="space-y-4">
                {/* Action buttons */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Withdraw application button - Only show if not already withdrawn/rejected */}
                  {!isWithdrawnOrRejected && (
                    <ApplicationWithdrawDialog 
                      applicationId={application.id}
                      jobTitle={job.title}
                      employerName={employer.companyName}
                    />
                  )}
                  
                  {/* View job listings link */}
                  <Link href={`/jobs/${job.id}?from=application`} passHref>
                    <button className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors">
                      View Full Job Listing
                    </button>
                  </Link>
                </div>
                
                {/* Status message for withdrawn/rejected applications */}
                {isWithdrawnOrRejected && (
                  <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
                    {application.status === 'WITHDRAWN' 
                      ? 'You have withdrawn this application.' 
                      : 'This application was not selected by the employer.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
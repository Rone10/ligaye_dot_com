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
        className="inline-flex items-center text-sm text-[#9aa3bc] hover:text-[#4a6cfa] mb-2"
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
          <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[#1a1e2d] mb-4">Application Actions</h2>
              
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
                  <Link href={`/jobs/${job.id}`} passHref>
                    <button className="w-full py-2 px-4 bg-[#4a6cfa] hover:bg-[#3a5be9] text-white font-medium rounded-lg transition-colors">
                      View Full Job Listing
                    </button>
                  </Link>
                </div>
                
                {/* Status message for withdrawn/rejected applications */}
                {isWithdrawnOrRejected && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-[#9aa3bc] text-center">
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
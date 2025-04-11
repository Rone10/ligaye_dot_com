import { Suspense } from 'react';
import Link from 'next/link';
import { getJobById, getRelatedJobs } from './_queries';
import { 
  jobTypeLabels, 
  workLocationLabels, 
  experienceLevelLabels,
  formatSalaryDisplay
} from '../_utils/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  // Extract the job ID from params
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Fetch job details
  const job = await getJobById(id);
  
  // Fetch related jobs
  const relatedJobs = await getRelatedJobs(id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/jobs" className="text-gray-700 hover:text-blue-600">
                  Jobs
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{job.title}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Job header section */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            
            <div className="mt-4 flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                {job.company.companyLogoUrl ? (
                  <img src={job.company.companyLogoUrl} alt={job.company.companyName || 'Company logo'} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {job.company.companyName?.charAt(0) || 'C'}
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800">{job.company.companyName}</h2>
                <p className="text-gray-600">
                  {job.location?.city && job.location.region 
                    ? `${job.location.city}, ${job.location.region}` 
                    : workLocationLabels[job.workLocation]}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Job Type</h3>
                <p className="mt-1 text-gray-900">{jobTypeLabels[job.jobType]}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Work Location</h3>
                <p className="mt-1 text-gray-900">{workLocationLabels[job.workLocation]}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                <p className="mt-1 text-gray-900">
                  {job.experienceLevel ? experienceLevelLabels[job.experienceLevel] : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Salary</h3>
                <p className="mt-1 text-gray-900">
                  {formatSalaryDisplay({
                    min: job.salaryRangeMin,
                    max: job.salaryRangeMax,
                    currency: job.salaryCurrency,
                    frequency: job.salaryFrequency,
                    displayType: job.salaryDisplayType
                  })}
                </p>
              </div>
            </div>

            {/* Apply button */}
            <div className="mt-8">
              <a
                href="#apply"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Now
              </a>
            </div>
          </div>

          {/* Job description */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
          </div>

          {/* Job requirements */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Experience</h3>
              <p className="mt-1 text-gray-600">{job.experienceRequirements || 'Not specified'}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Education</h3>
              <p className="mt-1 text-gray-600">{job.educationRequirements || 'Not specified'}</p>
            </div>
            
            {job.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span 
                      key={skill.id} 
                      className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Application section */}
          <div id="apply" className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Apply</h2>
            
            {job.applicationInstructions && (
              <div className="mb-4">
                <p className="text-gray-700">{job.applicationInstructions}</p>
              </div>
            )}
            
            <div className="mt-4">
              {job.applicationMethod === 'EMAIL' && job.applicationEmail && (
                <a
                  href={`mailto:${job.applicationEmail}?subject=Application for ${job.title}`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply via Email
                </a>
              )}
              
              {job.applicationMethod === 'WEBSITE' && job.applicationUrl && (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply on Company Website
                </a>
              )}
              
              {job.applicationMethod === 'PLATFORM' && (
                <p>Platform application form to be implemented here</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Company information */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Company</h2>
            
            {job.company.companyDescription ? (
              <p className="text-gray-700">{job.company.companyDescription}</p>
            ) : (
              <p className="text-gray-500 italic">No company description available</p>
            )}
            
            {job.company.website && (
              <div className="mt-4">
                <a 
                  href={job.company.website} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
          
          {/* Job details */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
            
            <div className="space-y-4">
              {job.publishedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Posted</h3>
                  <p className="mt-1 text-gray-900">{job.publishedAt.toLocaleDateString()}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Job Type</h3>
                <p className="mt-1 text-gray-900">{jobTypeLabels[job.jobType]}</p>
              </div>
              
              {job.industries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                  <div className="mt-1">
                    {job.industries.map(industry => (
                      <p key={industry.id} className="text-gray-900">{industry.name}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {job.numberOfOpenings && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Number of Positions</h3>
                  <p className="mt-1 text-gray-900">{job.numberOfOpenings}</p>
                </div>
              )}
              
              {job.applicationDeadline && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Application Deadline</h3>
                  <p className="mt-1 text-gray-900">{job.applicationDeadline.toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Similar jobs */}
          {relatedJobs.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Jobs</h2>
              
              <div className="space-y-4">
                {relatedJobs.map(relatedJob => (
                  <div key={relatedJob.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <h3 className="font-medium">
                      <Link href={`/jobs/${relatedJob.slug || relatedJob.id}`} className="text-blue-600 hover:text-blue-800">
                        {relatedJob.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {jobTypeLabels[relatedJob.jobType]} • {relatedJob.locationName || 'Remote'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
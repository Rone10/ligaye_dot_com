'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Define the shape of the props
type ApplicationStatusProps = {
  stats?: {
    applicationStats: Array<{
      status: string | null;
      count: unknown;
    }>;
    recentApplications: unknown;
    savedJobsCount: unknown;
  }
}

// Helper function to get status display name
function getStatusDisplayName(status: string): string {
  switch(status) {
    case 'PENDING': return 'Applied';
    case 'REVIEWING': return 'Under Review';
    case 'SHORTLISTED': return 'Shortlisted';
    case 'INTERVIEW_SCHEDULED': return 'Interview Scheduled';
    case 'INTERVIEWED': return 'Interviewed';
    case 'OFFER_EXTENDED': return 'Offer Extended';
    case 'HIRED': return 'Hired';
    case 'REJECTED': return 'Rejected';
    default: return 'Unknown';
  }
}

// Helper function to get status color
function getStatusColor(status: string): string {
  switch(status) {
    case 'PENDING':
    case 'REVIEWING':
      return 'bg-yellow-50 text-yellow-600';
    case 'SHORTLISTED':
    case 'INTERVIEW_SCHEDULED':
      return 'bg-green-50 text-green-600';
    case 'INTERVIEWED':
      return 'bg-blue-50 text-blue-600';
    case 'OFFER_EXTENDED':
    case 'HIRED':
      return 'bg-green-50 text-green-600';
    case 'REJECTED':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
}

export function ApplicationStatus({ stats }: ApplicationStatusProps) {
  // If no stats provided, show fallback UI
  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Application Status</h2>
          <Button variant="link" className="text-blue-600" asChild>
            <Link href="/candidate/applications">View All Applications</Link>
          </Button>
        </div>
        <div className="text-center py-8 text-gray-500">
          Application statistics are loading...
        </div>
      </motion.div>
    );
  }

  // Get application counts by status
  const pendingCount = stats.applicationStats.find(s => s.status === 'PENDING')?.count || 0;
  const interviewCount = stats.applicationStats.find(s => s.status === 'INTERVIEW_SCHEDULED')?.count || 0;
  const recentCount = Number(stats.recentApplications) || 0;

  // Prepare stats for display
  const displayStats = [
    {
      label: 'Applications',
      value: String(pendingCount),
      subtext: 'Pending Review',
      className: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Interview',
      value: String(interviewCount),
      subtext: 'Scheduled',
      className: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Applications',
      value: String(recentCount),
      subtext: 'Sent This Week',
      className: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  // Get 3 most recent applications to display
  const recentApplications = stats.applicationStats.slice(0, 3).map(stat => ({
    position: 'Application',
    company: '',
    status: stat.status
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Application Status</h2>
        <Button variant="link" className="text-blue-600" asChild>
          <Link href="/candidate/applications">View All Applications</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {displayStats.map((stat, index) => (
          <div key={index} className={`rounded-lg p-4 ${stat.className}`}>
            <div className={`font-semibold ${stat.textColor}`}>
              {stat.value} {stat.label}
            </div>
            <div className="text-sm text-gray-600">{stat.subtext}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {stats.applicationStats.length > 0 ? (
          stats.applicationStats.slice(0, 3).map((app, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <div className="font-medium">Applications</div>
                <div className="text-sm text-gray-600">Status: {getStatusDisplayName(app.status || 'PENDING')}</div>
              </div>
              <Badge
                className={getStatusColor(app.status || 'PENDING')}
              >
                {String(app.count)} {getStatusDisplayName(app.status || 'PENDING')}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No applications yet
          </div>
        )}
      </div>
    </motion.div>
  );
}
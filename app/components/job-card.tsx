'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Building2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobPosting } from '@/app/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
interface JobCardProps {
  job: JobPosting;
  index: number;
}

export function JobCard({ job, index }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border hover:shadow-md transition-shadow p-6 space-y-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-700">
            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <p className="text-gray-700 mt-1">{job.company}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-4 text-gray-600">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-1" />
          <span>{job.workLocation}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>{job.type}</span>
        </div>
      </div>

      <p className="text-gray-600 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2">
        {job.skills && job.skills.length > 0 ? (
          job.skills.map((skill) => (
            <Badge 
              key={skill} 
              variant="secondary" 
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              {skill}
            </Badge>
          ))
        ) : (
          <span className="text-gray-400 text-sm">No skills listed</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="space-x-2 text-gray-700">
          <span className="font-medium">${job.salaryRange.min.toLocaleString()}</span>
          <span>-</span>
          <span className="font-medium">${job.salaryRange.max.toLocaleString()}</span>
          <span className="text-gray-500">/ year</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Posted {formatDistanceToNow(job.postedDate, { addSuffix: true })}
          </span>
          <Link href={`/jobs/${job.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">View Job</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export function JobDetailsSidebar({ job }: { job: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <h2 className="text-xl font-semibold mb-6">Job Details</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill: string) => (
              <Badge
                key={skill}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Experience Level</h3>
          <p className="text-gray-600">{job.experienceLevel}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Education</h3>
          <p className="text-gray-600">{job.education}</p>
        </div>
      </div>
    </motion.div>
  );
}
'use client';

import { motion } from 'framer-motion';

export function JobDescription({ job }: { job: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-lg border p-6"
    >
      <h2 className="text-xl font-semibold mb-4">Job Description</h2>
      <p className="text-gray-600 mb-6">{job.description}</p>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Responsibilities:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {job.responsibilities.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Requirements:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {job.requirements.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
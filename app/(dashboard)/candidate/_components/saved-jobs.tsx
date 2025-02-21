'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function SavedJobs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Saved Jobs</h2>
        <Badge>5 saved</Badge>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        You have 5 saved jobs. Don't forget to apply before they expire!
      </p>
      <Button variant="link" className="text-blue-600 p-0">
        View Saved Jobs →
      </Button>
    </motion.div>
  );
}
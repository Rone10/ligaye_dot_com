'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const profileSections = [
  { name: 'Basic Information', completed: true },
  { name: 'Work Experience', completed: true },
  { name: 'Skills Assessment', completed: false },
  { name: 'Portfolio', completed: false },
];

export function ProfileCompleteness() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Profile Completeness</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>75%</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        <div className="space-y-3">
          {profileSections.map((section, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${
                section.completed ? 'bg-green-500' : 'bg-gray-200'
              }`} />
              <span className="text-sm">{section.name}</span>
            </div>
          ))}
        </div>
        <Button className="w-full bg-blue-600">Complete Profile</Button>
      </div>
    </motion.div>
  );
}
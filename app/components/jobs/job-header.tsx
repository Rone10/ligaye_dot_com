'use client';

import { Building2, MapPin, Clock, DollarSign, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function JobHeader({ job }: { job: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <a href="#" className="text-blue-600 hover:underline">{job.company.name}</a>
          
          <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span>{job.workLocation}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}/year</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button className="bg-blue-600 hover:bg-blue-700 px-8">Apply Now</Button>
        <Button variant="outline" className="gap-2">
          <Heart className="w-4 h-4" />
          Save Job
        </Button>
      </div>
    </motion.div>
  );
}
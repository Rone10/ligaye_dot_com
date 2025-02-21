'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobType, WorkLocation, ExperienceLevel } from '@/app/types';

const jobTypes: JobType[] = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
const workLocations: WorkLocation[] = ['Remote', 'Hybrid', 'On-site'];
const experienceLevels: ExperienceLevel[] = ['Entry', 'Mid', 'Senior'];

export function Filters() {
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [salaryRange, setSalaryRange] = useState([0, 200000]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full md:w-64 p-6 space-y-6 bg-white rounded-lg border"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold">Filters</h2>
        <Button variant="link" size="sm" className="text-blue-600" onClick={() => {
          setSelectedJobTypes([]);
          setSalaryRange([0, 200000]);
        }}>
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Job Type</h3>
          {jobTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={type}
                checked={selectedJobTypes.includes(type)}
                className="rounded border-gray-300"
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedJobTypes([...selectedJobTypes, type]);
                  } else {
                    setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
                  }
                }}
              />
              <label htmlFor={type} className="text-sm text-gray-600">{type}</label>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Work Location</h3>
          {workLocations.map((location) => (
            <div key={location} className="flex items-center space-x-2 mb-2">
              <Checkbox id={location} className="rounded border-gray-300" />
              <label htmlFor={location} className="text-sm text-gray-600">{location}</label>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Experience Level</h3>
          {experienceLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2 mb-2">
              <Checkbox id={level} className="rounded border-gray-300" />
              <label htmlFor={level} className="text-sm text-gray-600">{level}</label>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Salary Range</h3>
          <Slider
            defaultValue={[0, 200000]}
            max={200000}
            step={1000}
            value={salaryRange}
            onValueChange={setSalaryRange}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>$0</span>
            <span>$200k+</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Date Posted</h3>
          <Select defaultValue="any">
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="day">Past 24 hours</SelectItem>
              <SelectItem value="week">Past week</SelectItem>
              <SelectItem value="month">Past month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
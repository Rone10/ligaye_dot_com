'use client';

import { motion } from 'framer-motion';
import { Search, Eye, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const applications = [
  {
    id: '1',
    position: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    appliedDate: 'Jan 15, 2025',
    status: 'Interview Scheduled',
  },
  {
    id: '2',
    position: 'UX Designer',
    company: 'Design Studio',
    location: 'Remote',
    appliedDate: 'Jan 12, 2025',
    status: 'Pending Review',
  },
  {
    id: '3',
    position: 'Product Manager',
    company: 'Tech Innovations',
    location: 'New York, NY',
    appliedDate: 'Jan 10, 2025',
    status: 'Not Selected',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Interview Scheduled':
      return 'bg-yellow-50 text-yellow-800';
    case 'Pending Review':
      return 'bg-blue-50 text-blue-800';
    case 'Not Selected':
      return 'bg-red-50 text-red-800';
    default:
      return 'bg-gray-50 text-gray-800';
  }
};

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">My Applications</h1>
          <p className="text-gray-600">Track and manage your job applications</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="interview">Interview Scheduled</SelectItem>
                <SelectItem value="rejected">Not Selected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="date">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="company">Sort by Company</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {applications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{application.position}</h3>
                  <p className="text-gray-600">
                    {application.company} • {application.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied on {application.appliedDate}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" className="text-blue-600" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Application
                    </Button>
                    <Button variant="outline" className="text-red-600" size="sm">
                      <XCircle className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Showing 1 to 3 of 12 results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-gray-600"
              disabled
            >
              Previous
            </Button>
            <Button variant="outline" className="bg-blue-600 text-white">
              1
            </Button>
            <Button variant="outline" className="text-gray-600">
              2
            </Button>
            <Button variant="outline" className="text-gray-600">
              3
            </Button>
            <Button variant="outline" className="text-gray-600">
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
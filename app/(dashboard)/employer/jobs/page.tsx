'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPin,
  Search,
  Clock,
  Users,
  Calendar,
  DollarSign,
  GraduationCap,
  Plus,
  Briefcase,
  Timer,
} from 'lucide-react';
import { 
  fetchJobStats, 
  fetchJobs, 
  fetchJobLocations, 
  updateJobActiveStatus, 
  removeJob,
  type Job 
} from '@/app/actions/employer/jobs';
import { jobFilters } from '@/app/actions/employer/job-filters';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function EmployerJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    applications: 0,
    expiringSoon: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Employer Jobs Page: Starting data fetch");
        
        const [jobsData, statsData, locationsData] = await Promise.all([
          fetchJobs(),
          fetchJobStats(),
          fetchJobLocations(),
        ]);

        console.log("Employer Jobs Page: Data fetch complete");
        console.log("Employer Jobs Page: Jobs data:", jobsData ? `Found ${jobsData.length} jobs` : "No jobs data");
        console.log("Employer Jobs Page: Stats data:", statsData || "No stats data");
        console.log("Employer Jobs Page: Locations data:", locationsData ? `Found ${locationsData.length} locations` : "No locations data");

        if (jobsData) setJobs(jobsData);
        if (statsData) setStats(statsData);
        if (locationsData) setLocations(locationsData);
      } catch (error) {
        console.error('Employer Jobs Page: Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || 
      (selectedStatus === 'Active' && job.isActive) || 
      (selectedStatus === 'Inactive' && !job.isActive);
    const matchesType = selectedType === 'All' || job.jobType === selectedType;
    const matchesLocation = selectedLocation === 'All' || job.workLocation === selectedLocation;

    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  // Handle job status update
  const handleStatusUpdate = async (jobId: string, isActive: boolean) => {
    const success = await updateJobActiveStatus(jobId, isActive);
    if (success) {
      // Update local state to avoid refetching
      setJobs(prev => 
        prev.map(job => 
          job.id === jobId ? { ...job, isActive } : job
        )
      );
    }
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const success = await removeJob(jobId);
      if (success) {
        // Update local state to avoid refetching
        setJobs(prev => prev.filter(job => job.id !== jobId));
      }
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600';
  };

  // Format salary range
  const formatSalary = (job: Job) => {
    if (!job.salaryRangeMin && !job.salaryRangeMax) return 'Not specified';
    
    const currency = job.salaryCurrency || 'GMD';
    const min = job.salaryRangeMin ? `${currency} ${job.salaryRangeMin.toLocaleString()}` : '';
    const max = job.salaryRangeMax ? `${currency} ${job.salaryRangeMax.toLocaleString()}` : '';
    
    if (min && max) return `${min} - ${max}`;
    if (min) return `From ${min}`;
    if (max) return `Up to ${max}`;
    
    return 'Not specified';
  };

  // Format expiry date
  const formatExpiry = (expiresAt: Date | null) => {
    if (!expiresAt) return 'No expiry';
    
    const now = new Date();
    if (expiresAt < now) return 'Expired';
    
    return `Expires in ${formatDistanceToNow(expiresAt)}`;
  };

  // Stats for the dashboard
  const jobStats = [
    {
      label: 'Total Jobs',
      value: stats.total.toString(),
      icon: Briefcase,
      className: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Jobs',
      value: stats.active.toString(),
      icon: Clock,
      className: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Total Applications',
      value: stats.applications.toString(),
      icon: Users,
      className: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Jobs Expiring Soon',
      value: stats.expiringSoon.toString(),
      icon: Timer,
      className: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Jobs</h1>
            <p className="text-gray-600">Manage and track your job postings</p>
          </div>
          <Button className="bg-blue-600" asChild>
            <a href="/employer/jobs/create">
              <Plus className="w-4 h-4 mr-2" />
              Create New Job
            </a>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`${stat.className} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Filter Jobs</CardTitle>
            <CardDescription>Use the filters below to find specific jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {jobFilters.status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  {jobFilters.type.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Work Location" />
                </SelectTrigger>
                <SelectContent>
                  {jobFilters.workLocation.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedType('All');
                setSelectedLocation('All');
              }}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-6">
              {jobs.length === 0 
                ? "You haven't created any jobs yet." 
                : "No jobs match your current filters."}
            </p>
            {jobs.length > 0 && (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedType('All');
                setSelectedLocation('All');
              }}>
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {/* Jobs List */}
        {!loading && filteredJobs.length > 0 && (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border p-6 relative group hover:shadow-md transition-shadow duration-200"
              >
                {/* Clickable overlay that links to job details */}
                <Link href={`/employer/jobs/${job.id}`} className="absolute inset-0 z-10 cursor-pointer" aria-label={`View details for ${job.title}`}>
                  <span className="sr-only">View job details</span>
                </Link>
                
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <Badge className={getStatusColor(job.isActive)}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.workLocation.replace('_', ' ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {job.jobType.replace('_', ' ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(job)}
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {job.experienceLevel}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 z-20 relative">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applicantCount} applicants
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatExpiry(job.expiresAt)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStatusUpdate(job.id, !job.isActive);
                        }}
                        className="z-20 relative"
                      >
                        {job.isActive ? 'Pause' : 'Activate'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 z-20 relative"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteJob(job.id);
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        className="z-20 relative"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        asChild
                      >
                        <Link href={`/employer/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 
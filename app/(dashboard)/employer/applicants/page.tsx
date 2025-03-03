'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
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
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Download,
  Eye,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { 
  fetchApplicantStats, 
  fetchApplicants, 
  fetchDepartments, 
  updateApplicantStatus,
  type Applicant 
} from '@/app/actions/employer/applicants';
import { applicantFilters } from '@/app/actions/employer/applicant-filters';
import { applicationStatusEnum } from '@/lib/db/schema';

export default function EmployerApplicantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [applicantsData, statsData, departmentsData] = await Promise.all([
          fetchApplicants(),
          fetchApplicantStats(),
          fetchDepartments(),
        ]);

        if (applicantsData) setApplicants(applicantsData);
        if (statsData) setStats(statsData);
        if (departmentsData) setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter applicants based on search and filters
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch = 
      applicant.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (applicant.candidateTitle && applicant.candidateTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || applicant.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'All' || applicant.jobTitle === selectedDepartment;
    const matchesExperience = selectedExperience === 'All' || applicant.candidateExperienceLevel === selectedExperience;

    return matchesSearch && matchesStatus && matchesDepartment && matchesExperience;
  });

  // Handle status update
  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    const success = await updateApplicantStatus(applicationId, newStatus);
    if (success) {
      // Update local state to avoid refetching
      setApplicants(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-600';
      case 'SHORTLISTED':
        return 'bg-blue-50 text-blue-600';
      case 'INTERVIEWED':
        return 'bg-purple-50 text-purple-600';
      case 'HIRED':
      case 'OFFER_EXTENDED':
        return 'bg-green-50 text-green-600';
      case 'REJECTED':
        return 'bg-red-50 text-red-600';
      case 'REVIEWING':
        return 'bg-orange-50 text-orange-600';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-indigo-50 text-indigo-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  // Stats for the dashboard
  const applicantStats = [
    {
      label: 'Total Applicants',
      value: stats.total.toString(),
      icon: Users,
      className: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Shortlisted',
      value: stats.shortlisted.toString(),
      icon: CheckCircle2,
      className: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Pending Review',
      value: stats.pending.toString(),
      icon: Clock,
      className: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Rejected',
      value: stats.rejected.toString(),
      icon: XCircle,
      className: 'bg-red-50',
      iconColor: 'text-red-600',
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
        <div>
          <h1 className="text-2xl font-bold mb-2">Applicants</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {applicantStats.map((stat, index) => {
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
            <CardTitle>Search and Filter Applicants</CardTitle>
            <CardDescription>Use the filters below to find specific applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applicants..."
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
                  {applicantFilters.status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="All">All</SelectItem> */}
                  {applicantFilters.experience.map((experience) => (
                    <SelectItem key={experience} value={experience}>
                      {experience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedDepartment('All');
                setSelectedExperience('All');
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
        {!loading && filteredApplicants.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No applicants found</h3>
            <p className="text-gray-500 mb-6">
              {applicants.length === 0 
                ? "You don't have any applicants yet." 
                : "No applicants match your current filters."}
            </p>
            {applicants.length > 0 && (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedDepartment('All');
                setSelectedExperience('All');
              }}>
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {/* Applicants List */}
        {!loading && filteredApplicants.length > 0 && (
          <div className="space-y-4">
            {filteredApplicants.map((applicant) => (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Applicant Info */}
                  <div className="flex items-start gap-4 lg:w-1/3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={applicant.candidateAvatar || ''} alt={applicant.candidateName} />
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{applicant.candidateName}</h3>
                        <Badge className={getStatusColor(applicant.status)}>
                          {applicant.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Applied for {applicant.jobTitle}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {applicant.candidateSkills && applicant.candidateSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-100">
                            {skill}
                          </Badge>
                        ))}
                        {applicant.candidateSkills && applicant.candidateSkills.length > 3 && (
                          <Badge variant="secondary" className="bg-gray-100">
                            +{applicant.candidateSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-1/3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {applicant.candidateEmail}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      {applicant.candidateExperienceLevel}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      {applicant.candidateTitle}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:w-1/3 lg:justify-end">
                    {applicant.resumeUrl && (
                      <Button variant="outline" className="flex items-center gap-2" asChild>
                        <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                          Download CV
                        </a>
                      </Button>
                    )}
                    <Select 
                      value={applicant.status} 
                      onValueChange={(value) => handleStatusUpdate(applicant.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicantFilters.status.slice(1).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
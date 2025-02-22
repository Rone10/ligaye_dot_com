'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { applicants, applicantStats, applicantFilters, type Applicant } from '@/app/actions/employer/applicants-mock-data';

export default function EmployerApplicantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');

  // Filter applicants based on search and filters
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch = 
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.appliedFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || applicant.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'All' || applicant.department === selectedDepartment;
    const matchesExperience = selectedExperience === 'All' || applicant.experience === selectedExperience;

    return matchesSearch && matchesStatus && matchesDepartment && matchesExperience;
  });

  const getStatusColor = (status: Applicant['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-600';
      case 'Shortlisted':
        return 'bg-blue-50 text-blue-600';
      case 'Interviewed':
        return 'bg-purple-50 text-purple-600';
      case 'Hired':
        return 'bg-green-50 text-green-600';
      case 'Rejected':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

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
                  {applicantFilters.department.map((department) => (
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

        {/* Applicants List */}
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
                    <AvatarImage src={applicant.avatar} alt={applicant.name} />
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{applicant.name}</h3>
                      <Badge className={getStatusColor(applicant.status)}>
                        {applicant.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Applied for {applicant.appliedFor}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {applicant.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                      {applicant.skills.length > 3 && (
                        <Badge variant="secondary" className="bg-gray-100">
                          +{applicant.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-1/3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {applicant.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {applicant.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {applicant.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Applied {new Date(applicant.appliedDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {applicant.experience}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    {applicant.education}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 lg:w-1/3 lg:justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download CV
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  <Button>Review Application</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 
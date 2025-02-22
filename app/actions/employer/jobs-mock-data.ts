import { 
  Briefcase, 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  DollarSign,
  GraduationCap,
  Timer,
} from 'lucide-react';

export interface Job {
  id: string;
  title: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary: string;
  department: string;
  experience: string;
  postedDate: string;
  expiresIn: string;
  applicants: number;
  status: 'Active' | 'Paused' | 'Expired' | 'Draft';
  description: string;
  requirements: string[];
}

export const jobFilters = {
  status: ['All', 'Active', 'Paused', 'Expired', 'Draft'],
  type: ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'],
  location: ['All', 'Banjul', 'Serekunda', 'Remote', 'Hybrid'],
};

export const jobStats = [
  {
    label: 'Total Jobs',
    value: '24',
    icon: Briefcase,
    className: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Active Jobs',
    value: '12',
    icon: Clock,
    className: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Total Applications',
    value: '248',
    icon: Users,
    className: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Jobs Expiring Soon',
    value: '5',
    icon: Timer,
    className: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
];

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    location: 'Banjul',
    type: 'Full-time',
    salary: '$60,000 - $80,000',
    department: 'Engineering',
    experience: '5+ years',
    postedDate: '2024-02-01',
    expiresIn: '15 days',
    applicants: 12,
    status: 'Active',
    description: 'We are looking for a Senior Frontend Developer to join our team...',
    requirements: [
      'Expert in React, TypeScript, and modern frontend frameworks',
      'Experience with state management solutions',
      'Strong understanding of web performance optimization',
    ],
  },
  {
    id: '2',
    title: 'Marketing Manager',
    location: 'Remote',
    type: 'Contract',
    salary: '$50,000 - $65,000',
    department: 'Marketing',
    experience: '3-5 years',
    postedDate: '2024-02-05',
    expiresIn: '20 days',
    applicants: 8,
    status: 'Active',
    description: 'We are seeking a Marketing Manager to lead our marketing initiatives...',
    requirements: [
      'Proven experience in digital marketing',
      'Strong analytical and strategic thinking skills',
      'Experience with marketing automation tools',
    ],
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    location: 'Serekunda',
    type: 'Full-time',
    salary: '$45,000 - $60,000',
    department: 'Design',
    experience: '2-4 years',
    postedDate: '2024-02-10',
    expiresIn: '25 days',
    applicants: 5,
    status: 'Active',
    description: 'Looking for a talented UI/UX Designer to create beautiful interfaces...',
    requirements: [
      'Proficiency in Figma and design tools',
      'Strong portfolio demonstrating UI/UX projects',
      'Understanding of user-centered design principles',
    ],
  },
  {
    id: '4',
    title: 'Backend Developer',
    location: 'Hybrid',
    type: 'Full-time',
    salary: '$55,000 - $75,000',
    department: 'Engineering',
    experience: '4+ years',
    postedDate: '2024-02-12',
    expiresIn: '18 days',
    applicants: 10,
    status: 'Active',
    description: 'Seeking a Backend Developer to build scalable services...',
    requirements: [
      'Strong experience with Node.js and TypeScript',
      'Knowledge of database design and optimization',
      'Experience with cloud services (AWS/GCP)',
    ],
  },
  {
    id: '5',
    title: 'Content Writer',
    location: 'Remote',
    type: 'Part-time',
    salary: '$30,000 - $40,000',
    department: 'Content',
    experience: '2+ years',
    postedDate: '2024-02-15',
    expiresIn: '30 days',
    applicants: 15,
    status: 'Active',
    description: 'Looking for a Content Writer to create engaging content...',
    requirements: [
      'Excellent writing and editing skills',
      'SEO knowledge',
      'Experience with content management systems',
    ],
  },
]; 
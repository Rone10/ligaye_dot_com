import { 
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  appliedFor: string;
  department: string;
  experience: string;
  education: string;
  appliedDate: string;
  status: 'Pending' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired';
  avatar: string;
  coverLetter: string;
  skills: string[];
  resumeUrl: string;
}

export const applicantFilters = {
  status: ['All', 'Pending', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'],
  department: ['All', 'Engineering', 'Marketing', 'Design', 'Content', 'Sales'],
  experience: ['All', '0-2 years', '2-5 years', '5+ years'],
};

export const applicantStats = [
  {
    label: 'Total Applicants',
    value: '248',
    icon: Users,
    className: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Shortlisted',
    value: '45',
    icon: CheckCircle2,
    className: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Pending Review',
    value: '128',
    icon: Clock,
    className: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
  {
    label: 'Rejected',
    value: '75',
    icon: XCircle,
    className: 'bg-red-50',
    iconColor: 'text-red-600',
  },
];

export const applicants: Applicant[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+220 7123 4567',
    location: 'Banjul',
    appliedFor: 'Senior Frontend Developer',
    department: 'Engineering',
    experience: '5+ years',
    education: 'BSc Computer Science',
    appliedDate: '2024-02-15',
    status: 'Shortlisted',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL'],
    resumeUrl: '/resumes/sarah-wilson-cv.pdf',
  },
  {
    id: '2',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+220 7234 5678',
    location: 'Serekunda',
    appliedFor: 'Marketing Manager',
    department: 'Marketing',
    experience: '3-5 years',
    education: 'MBA Marketing',
    appliedDate: '2024-02-14',
    status: 'Interviewed',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    coverLetter: 'With my experience in digital marketing and team leadership...',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    resumeUrl: '/resumes/michael-brown-cv.pdf',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+220 7345 6789',
    location: 'Remote',
    appliedFor: 'UI/UX Designer',
    department: 'Design',
    experience: '2-5 years',
    education: 'BA Design',
    appliedDate: '2024-02-13',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    coverLetter: 'As a passionate UI/UX designer with experience in...',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    resumeUrl: '/resumes/emily-davis-cv.pdf',
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    phone: '+220 7456 7890',
    location: 'Banjul',
    appliedFor: 'Backend Developer',
    department: 'Engineering',
    experience: '4+ years',
    education: 'MSc Software Engineering',
    appliedDate: '2024-02-12',
    status: 'Hired',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    coverLetter: 'I am writing to express my interest in the Backend Developer position...',
    skills: ['Node.js', 'Python', 'AWS', 'MongoDB', 'Docker'],
    resumeUrl: '/resumes/james-wilson-cv.pdf',
  },
  {
    id: '5',
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    phone: '+220 7567 8901',
    location: 'Remote',
    appliedFor: 'Content Writer',
    department: 'Content',
    experience: '2-5 years',
    education: 'BA English Literature',
    appliedDate: '2024-02-11',
    status: 'Rejected',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    coverLetter: 'As an experienced content writer with a passion for...',
    skills: ['Content Writing', 'SEO', 'Copywriting', 'WordPress'],
    resumeUrl: '/resumes/sophia-chen-cv.pdf',
  },
]; 
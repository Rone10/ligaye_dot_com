import { Briefcase, Users, Eye, Clock, LightbulbIcon, TrendingUp } from 'lucide-react';

export const stats = [
  {
    label: 'Active Jobs',
    value: '12',
    icon: Briefcase,
    className: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Total Applicants',
    value: '248',
    icon: Users,
    className: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Job Views',
    value: '1.4k',
    icon: Eye,
    className: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Pending Reviews',
    value: '18',
    icon: Clock,
    className: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
];

export const activeJobs = [
  {
    title: 'Senior Frontend Developer',
    location: 'Banjul',
    type: 'Full-time',
    applicants: 12,
    expiresIn: '15 days',
  },
  {
    title: 'Marketing Manager',
    location: 'Remote',
    type: 'Contract',
    applicants: 8,
    expiresIn: '20 days',
  },
  {
    title: 'UI/UX Designer',
    location: 'Serekunda',
    type: 'Full-time',
    applicants: 5,
    expiresIn: '25 days',
  },
];

export const recentApplicants = [
  {
    name: 'Sarah Wilson',
    position: 'Senior Frontend Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    timeAgo: '2h ago',
  },
  {
    name: 'Michael Brown',
    position: 'Marketing Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    timeAgo: '5h ago',
  },
  {
    name: 'Emily Davis',
    position: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    timeAgo: '1d ago',
  },
];

export const quickTips = [
  {
    title: 'Write Better Job Descriptions',
    description: 'Learn how to write compelling job descriptions that attract top talent.',
    icon: LightbulbIcon,
  },
  {
    title: 'Improve Your Hiring Process',
    description: 'Tips for streamlining your recruitment and selection process.',
    icon: TrendingUp,
  },
]; 
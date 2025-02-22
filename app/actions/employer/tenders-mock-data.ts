import { 
  FileSpreadsheet,
  Clock,
  Users,
  CheckCircle2,
  Building2,
  Calendar,
  DollarSign,
  Timer,
} from 'lucide-react';

export interface Tender {
  id: string;
  title: string;
  reference: string;
  description: string;
  budget: string;
  department: string;
  category: string;
  publishDate: string;
  deadline: string;
  status: 'Draft' | 'Published' | 'Under Review' | 'Awarded' | 'Closed';
  submissions: number;
  requirements: string[];
  documents: {
    name: string;
    size: string;
    type: string;
    url: string;
  }[];
  eligibilityCriteria: string[];
}

export const tenderFilters = {
  status: ['All', 'Draft', 'Published', 'Under Review', 'Awarded', 'Closed'],
  category: ['All', 'IT Services', 'Construction', 'Consulting', 'Supplies', 'Equipment'],
  department: ['All', 'IT', 'Operations', 'Finance', 'HR', 'Marketing'],
};

export const tenderStats = [
  {
    label: 'Active Tenders',
    value: '8',
    icon: FileSpreadsheet,
    className: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Total Submissions',
    value: '156',
    icon: Users,
    className: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Awarded',
    value: '12',
    icon: CheckCircle2,
    className: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Closing Soon',
    value: '3',
    icon: Timer,
    className: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
];

export const tenders: Tender[] = [
  {
    id: '1',
    title: 'IT Infrastructure Upgrade',
    reference: 'TEN-2024-001',
    description: 'Seeking proposals for comprehensive IT infrastructure upgrade including network equipment, servers, and security systems.',
    budget: '$100,000 - $150,000',
    department: 'IT',
    category: 'IT Services',
    publishDate: '2024-02-01',
    deadline: '2024-03-15',
    status: 'Published',
    submissions: 12,
    requirements: [
      'Minimum 5 years experience in enterprise IT infrastructure',
      'Proven track record of similar projects',
      'Certified technical team',
      'Local presence required',
    ],
    documents: [
      {
        name: 'Technical Specifications',
        size: '2.4 MB',
        type: 'PDF',
        url: '/documents/tech-specs.pdf',
      },
      {
        name: 'Terms of Reference',
        size: '1.8 MB',
        type: 'PDF',
        url: '/documents/tor.pdf',
      },
    ],
    eligibilityCriteria: [
      'Registered business entity',
      'Valid tax clearance',
      'Industry certifications',
      'Financial stability proof',
    ],
  },
  {
    id: '2',
    title: 'Office Renovation Project',
    reference: 'TEN-2024-002',
    description: 'Complete renovation of 3-floor office space including interior design, furniture, and facilities upgrade.',
    budget: '$200,000 - $250,000',
    department: 'Operations',
    category: 'Construction',
    publishDate: '2024-02-05',
    deadline: '2024-03-20',
    status: 'Under Review',
    submissions: 8,
    requirements: [
      'Experience in commercial office renovation',
      'Architecture and interior design capabilities',
      'Project management expertise',
      'Safety compliance record',
    ],
    documents: [
      {
        name: 'Floor Plans',
        size: '5.2 MB',
        type: 'PDF',
        url: '/documents/floor-plans.pdf',
      },
      {
        name: 'Requirements Document',
        size: '3.1 MB',
        type: 'PDF',
        url: '/documents/requirements.pdf',
      },
    ],
    eligibilityCriteria: [
      'Licensed contractor',
      'Insurance coverage',
      'Previous similar projects',
      'Financial capacity',
    ],
  },
  {
    id: '3',
    title: 'Digital Marketing Services',
    reference: 'TEN-2024-003',
    description: 'Comprehensive digital marketing services including SEO, social media management, and content creation.',
    budget: '$50,000 - $75,000',
    department: 'Marketing',
    category: 'Consulting',
    publishDate: '2024-02-10',
    deadline: '2024-03-25',
    status: 'Draft',
    submissions: 0,
    requirements: [
      'Proven digital marketing expertise',
      'Content creation capabilities',
      'Analytics and reporting skills',
      'Industry knowledge',
    ],
    documents: [
      {
        name: 'Service Requirements',
        size: '1.5 MB',
        type: 'PDF',
        url: '/documents/marketing-requirements.pdf',
      },
    ],
    eligibilityCriteria: [
      'Portfolio of similar projects',
      'Qualified team',
      'Performance metrics',
      'Client references',
    ],
  },
  {
    id: '4',
    title: 'Office Equipment Supply',
    reference: 'TEN-2024-004',
    description: 'Supply and installation of office equipment including computers, printers, and communication systems.',
    budget: '$80,000 - $100,000',
    department: 'IT',
    category: 'Equipment',
    publishDate: '2024-02-15',
    deadline: '2024-03-30',
    status: 'Published',
    submissions: 5,
    requirements: [
      'Authorized equipment dealer',
      'Warranty and support services',
      'Installation capabilities',
      'After-sales support',
    ],
    documents: [
      {
        name: 'Equipment Specifications',
        size: '2.8 MB',
        type: 'PDF',
        url: '/documents/equipment-specs.pdf',
      },
    ],
    eligibilityCriteria: [
      'Manufacturer authorization',
      'Service center availability',
      'Technical support team',
      'Delivery capability',
    ],
  },
  {
    id: '5',
    title: 'HR Management System',
    reference: 'TEN-2024-005',
    description: 'Implementation of comprehensive HR management system including payroll, attendance, and performance management.',
    budget: '$120,000 - $150,000',
    department: 'HR',
    category: 'IT Services',
    publishDate: '2024-02-20',
    deadline: '2024-04-05',
    status: 'Closed',
    submissions: 15,
    requirements: [
      'HR software development experience',
      'System integration capabilities',
      'Training and support services',
      'Data migration expertise',
    ],
    documents: [
      {
        name: 'System Requirements',
        size: '3.2 MB',
        type: 'PDF',
        url: '/documents/hr-system-requirements.pdf',
      },
    ],
    eligibilityCriteria: [
      'Software development expertise',
      'Similar implementations',
      'Support infrastructure',
      'Security certifications',
    ],
  },
]; 
import { 
  Building2,
  Users,
  Globe2,
  MapPin,
  Phone,
  Mail,
  Link,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Clock,
} from 'lucide-react';

export interface CompanyProfile {
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  industry: string;
  companySize: string;
  founded: string;
  website: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    socialMedia: {
      facebook: string;
      twitter: string;
      linkedin: string;
      instagram: string;
    };
  };
  workingHours: string;
  benefits: {
    icon: string;
    title: string;
    description: string;
  }[];
  culture: {
    values: string[];
    description: string;
  };
  officePhotos: string[];
}

export const companyStats = [
  {
    label: 'Company Size',
    value: '50-100',
    icon: Users,
    className: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Founded',
    value: '2020',
    icon: Building2,
    className: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Locations',
    value: '3',
    icon: MapPin,
    className: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Open Positions',
    value: '12',
    icon: Clock,
    className: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
];

export const companyProfile: CompanyProfile = {
  name: 'TechCorp Solutions',
  logo: '/company-logo.png',
  coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
  description: 'TechCorp Solutions is a leading technology company specializing in innovative software solutions for businesses. We combine cutting-edge technology with exceptional talent to deliver outstanding results for our clients worldwide.',
  industry: 'Information Technology',
  companySize: '50-100 employees',
  founded: '2020',
  website: 'https://techcorp.com',
  location: {
    address: '123 Innovation Drive',
    city: 'Banjul',
    country: 'The Gambia',
  },
  contact: {
    email: 'contact@techcorp.com',
    phone: '+220 7123 4567',
    socialMedia: {
      facebook: 'https://facebook.com/techcorp',
      twitter: 'https://twitter.com/techcorp',
      linkedin: 'https://linkedin.com/company/techcorp',
      instagram: 'https://instagram.com/techcorp',
    },
  },
  workingHours: 'Monday - Friday, 9:00 AM - 5:00 PM',
  benefits: [
    {
      icon: '🏥',
      title: 'Health Insurance',
      description: 'Comprehensive health coverage for employees and their families',
    },
    {
      icon: '💻',
      title: 'Remote Work',
      description: 'Flexible work arrangements with remote options',
    },
    {
      icon: '📚',
      title: 'Learning & Development',
      description: 'Continuous learning opportunities and professional growth',
    },
    {
      icon: '🎯',
      title: 'Performance Bonus',
      description: 'Competitive bonus structure based on performance',
    },
    {
      icon: '🏖️',
      title: 'Paid Time Off',
      description: 'Generous vacation policy and paid holidays',
    },
    {
      icon: '🏋️',
      title: 'Wellness Programs',
      description: 'Access to fitness programs and wellness activities',
    },
  ],
  culture: {
    values: [
      'Innovation First',
      'Customer Success',
      'Team Collaboration',
      'Continuous Learning',
      'Work-Life Balance',
      'Diversity & Inclusion',
    ],
    description: 'We foster a culture of innovation and collaboration, where every team member is empowered to make a difference. Our workplace celebrates diversity and encourages continuous learning and growth.',
  },
  officePhotos: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c',
    'https://images.unsplash.com/photo-1497366412874-3415097a27e7',
    'https://images.unsplash.com/photo-1497366754035-5f381479c54f',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
  ],
}; 